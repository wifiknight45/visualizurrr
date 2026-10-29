/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ALL_PATTERNS } from './data/patterns/index';
import { COLOR_PALETTES, DEFAULT_PALETTE } from './data/palettes';
import { ColorPalette, RenderMode } from './types/visualizer';
import { CanvasVisualizer } from './components/CanvasVisualizer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HeaderBar } from './components/HeaderBar';
import { ControlDock } from './components/ControlDock';
import { PalettePickerModal } from './components/PalettePickerModal';
import { PatternGalleryModal } from './components/PatternGalleryModal';
import { PythonCodeDrawer } from './components/PythonCodeDrawer';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ChillMusicPlayer } from './components/ChillMusicPlayer';

const SETTINGS_KEY = 'visualizurrr.settings.v1';
const CUSTOM_PALETTES_KEY = 'visualizurrr.customPalettes.v1';
const ALL_RENDER_MODES: RenderMode[] = ['curves', 'particles', 'mesh', 'heatmap', 'neon', 'matrix'];

interface BootState {
  patternIndex: number;
  palette: ColorPalette;
  customPalettes: ColorPalette[];
  renderMode: RenderMode;
  speed: number;
  glow: boolean;
  trails: boolean;
  paramsByPattern: Record<string, Record<string, number>>;
}

function isValidPalette(value: unknown): value is ColorPalette {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.background === 'string' &&
    Array.isArray(v.colors) &&
    v.colors.every((c) => typeof c === 'string')
  );
}

// Initial state comes from localStorage; a URL hash permalink
// (#pattern=..&palette=..&mode=..&speed=..) overrides saved settings so
// links are shareable.
function computeBoot(): BootState {
  const bootState: BootState = {
    patternIndex: 0,
    palette: DEFAULT_PALETTE,
    customPalettes: [],
    renderMode: 'curves',
    speed: 1.0,
    glow: true,
    trails: true,
    paramsByPattern: {},
  };
  try {
    const customRaw = window.localStorage.getItem(CUSTOM_PALETTES_KEY);
    if (customRaw) {
      const parsed: unknown = JSON.parse(customRaw);
      if (Array.isArray(parsed)) {
        bootState.customPalettes = parsed.filter(isValidPalette);
      }
    }
    const allPalettes = [...COLOR_PALETTES, ...bootState.customPalettes];

    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, unknown>;
      if (typeof saved.patternId === 'string') {
        const idx = ALL_PATTERNS.findIndex((pat) => pat.id === saved.patternId);
        if (idx !== -1) bootState.patternIndex = idx;
      }
      if (typeof saved.paletteId === 'string') {
        const pal = allPalettes.find((pl) => pl.id === saved.paletteId);
        if (pal) bootState.palette = pal;
      }
      if (typeof saved.renderMode === 'string' && ALL_RENDER_MODES.includes(saved.renderMode as RenderMode)) {
        bootState.renderMode = saved.renderMode as RenderMode;
      }
      if (typeof saved.speed === 'number' && saved.speed >= 0.05 && saved.speed <= 6) {
        bootState.speed = saved.speed;
      }
      if (typeof saved.glow === 'boolean') bootState.glow = saved.glow;
      if (typeof saved.trails === 'boolean') bootState.trails = saved.trails;
      if (typeof saved.paramsByPattern === 'object' && saved.paramsByPattern !== null) {
        bootState.paramsByPattern = saved.paramsByPattern as Record<string, Record<string, number>>;
      }
    }

    if (window.location.hash.length > 1) {
      const q = new URLSearchParams(window.location.hash.slice(1));
      const patId = q.get('pattern');
      if (patId) {
        const idx = ALL_PATTERNS.findIndex((pat) => pat.id === patId);
        if (idx !== -1) bootState.patternIndex = idx;
      }
      const palId = q.get('palette');
      if (palId) {
        const pal = allPalettes.find((pl) => pl.id === palId);
        if (pal) bootState.palette = pal;
      }
      const mode = q.get('mode');
      if (mode && ALL_RENDER_MODES.includes(mode as RenderMode)) {
        bootState.renderMode = mode as RenderMode;
      }
      const speedRaw = q.get('speed');
      if (speedRaw) {
        const speedVal = Number(speedRaw);
        if (Number.isFinite(speedVal) && speedVal >= 0.05 && speedVal <= 6) {
          bootState.speed = speedVal;
        }
      }
    }
  } catch {
    // Storage or parsing unavailable — fall back to defaults.
  }
  return bootState;
}

let bootCache: BootState | null = null;
function boot(): BootState {
  if (!bootCache) bootCache = computeBoot();
  return bootCache;
}

export default function App() {
  const bootState = boot();
  const [patternIndex, setPatternIndex] = useState<number>(bootState.patternIndex);
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(bootState.palette);
  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>(bootState.customPalettes);
  const [renderMode, setRenderMode] = useState<RenderMode>(bootState.renderMode);
  const [speed, setSpeed] = useState<number>(bootState.speed);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [glow, setGlow] = useState<boolean>(bootState.glow);
  const [trails, setTrails] = useState<boolean>(bootState.trails);
  const [isMorphEnabled, setIsMorphEnabled] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [showPresentHint, setShowPresentHint] = useState<boolean>(false);

  const allPalettes = [...COLOR_PALETTES, ...customPalettes];

  // Modals & Panels
  const [isPatternsOpen, setIsPatternsOpen] = useState<boolean>(false);
  const [isPalettesOpen, setIsPalettesOpen] = useState<boolean>(false);
  const [isCodeOpen, setIsCodeOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  const currentPattern = ALL_PATTERNS[patternIndex];
  // Parameters are stored per pattern ID so tweaks survive switching away
  // and back. The current pattern's params are derived, never copied by an
  // effect, so the first render after a switch can never see the previous
  // pattern's parameters (which also leaked into the generated Python).
  const [paramsByPattern, setParamsByPattern] = useState<
    Record<string, Record<string, number>>
  >(bootState.paramsByPattern);
  const patternParams =
    paramsByPattern[currentPattern.id] ?? currentPattern.defaultParameters;

  // Morph yields to the user: after any manual pattern/palette selection,
  // audio morphing pauses for a cooldown window.
  const lastManualSelectionRef = useRef<number>(0);

  const MORPH_COOLDOWN_MS = 60_000;

  // Handle audio morph triggered by track changes (only when the user has
  // not made a manual selection recently)
  const handleAudioMorph = useCallback((targetPatternId: string, targetPaletteId: string) => {
    if (Date.now() - lastManualSelectionRef.current < MORPH_COOLDOWN_MS) {
      return;
    }
    const patIdx = ALL_PATTERNS.findIndex((p) => p.id === targetPatternId);
    if (patIdx !== -1) {
      setPatternIndex(patIdx);
    }
    const pal = COLOR_PALETTES.find((p) => p.id === targetPaletteId);
    if (pal) {
      setCurrentPalette(pal);
    }
  }, []);

  const handlePrevPattern = useCallback(() => {
    lastManualSelectionRef.current = Date.now();
    setPatternIndex((prev) => (prev > 0 ? prev - 1 : ALL_PATTERNS.length - 1));
  }, []);

  const handleNextPattern = useCallback(() => {
    lastManualSelectionRef.current = Date.now();
    setPatternIndex((prev) => (prev < ALL_PATTERNS.length - 1 ? prev + 1 : 0));
  }, []);

  const handleCyclePalette = useCallback(() => {
    lastManualSelectionRef.current = Date.now();
    setCurrentPalette((prev) => {
      const idx = allPalettes.findIndex((p) => p.id === prev.id);
      const nextIdx = (idx + 1) % allPalettes.length;
      return allPalettes[nextIdx];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customPalettes]);

  const handleRandomize = useCallback(() => {
    lastManualSelectionRef.current = Date.now();
    const randomPatIdx = Math.floor(Math.random() * ALL_PATTERNS.length);
    const randomPalIdx = Math.floor(Math.random() * allPalettes.length);
    setPatternIndex(randomPatIdx);
    setCurrentPalette(allPalettes[randomPalIdx]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customPalettes]);

  const handleCycleRenderMode = useCallback(() => {
    const modes: RenderMode[] = ['curves', 'particles', 'mesh', 'heatmap', 'neon', 'matrix'];
    setRenderMode((prev) => {
      const idx = modes.indexOf(prev);
      return modes[(idx + 1) % modes.length];
    });
  }, []);

  const handleParamChange = (key: string, value: number) => {
    setParamsByPattern((prev) => ({
      ...prev,
      [currentPattern.id]: {
        ...(prev[currentPattern.id] ?? currentPattern.defaultParameters),
        [key]: value,
      },
    }));
  };

  const handleResetParams = () => {
    setParamsByPattern((prev) => {
      const next = { ...prev };
      delete next[currentPattern.id];
      return next;
    });
  };

  const snapshotRef = useRef<(() => void) | null>(null);
  const handleSnapshot = () => {
    snapshotRef.current?.();
  };

  const recordRef = useRef<(() => void) | null>(null);
  const handleToggleRecord = () => {
    recordRef.current?.();
  };

  // Presentation mode: fullscreen, chrome hidden, patterns auto-advance.
  const togglePresent = useCallback(() => {
    setIsPresenting((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setIsPresenting(false);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isPresenting) return;
    setShowPresentHint(true);
    const hintTimer = setTimeout(() => setShowPresentHint(false), 4000);
    const advanceTimer = setInterval(() => {
      setPatternIndex((prev) => (prev < ALL_PATTERNS.length - 1 ? prev + 1 : 0));
    }, 18_000);
    return () => {
      clearTimeout(hintTimer);
      clearInterval(advanceTimer);
    };
  }, [isPresenting]);

  // Persist settings + custom palettes, and keep the URL hash permalink
  // in sync so the current view is shareable.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          patternId: currentPattern.id,
          paletteId: currentPalette.id,
          renderMode,
          speed,
          glow,
          trails,
          paramsByPattern,
        })
      );
    } catch {
      // Storage full/unavailable — persistence is best-effort.
    }
  }, [currentPattern, currentPalette, renderMode, speed, glow, trails, paramsByPattern]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify(customPalettes));
    } catch {
      // Best-effort.
    }
  }, [customPalettes]);

  useEffect(() => {
    const q = new URLSearchParams({
      pattern: currentPattern.id,
      palette: currentPalette.id,
      mode: renderMode,
      speed: String(speed),
    });
    window.history.replaceState(null, '', `#${q.toString()}`);
  }, [currentPattern, currentPalette, renderMode, speed]);

  const handleSaveCustomPalette = useCallback((palette: ColorPalette) => {
    setCustomPalettes((prev) => [...prev, palette]);
  }, []);

  const handleDeleteCustomPalette = (id: string) => {
    setCustomPalettes((prev) => prev.filter((pl) => pl.id !== id));
    if (currentPalette.id === id) {
      setCurrentPalette(DEFAULT_PALETTE);
    }
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Never hijack browser/OS shortcuts (Ctrl/Cmd+C, Cmd+R, Ctrl/Cmd+S...)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      // Ignore if the user is typing or editing
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevPattern();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNextPattern();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSpeed((prev) => Math.min(6.0, +(prev + 0.25).toFixed(2)));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSpeed((prev) => Math.max(0.05, +(prev - 0.25).toFixed(2)));
          break;
        case 'KeyC':
          handleCyclePalette();
          break;
        case 'KeyR':
          handleRandomize();
          break;
        case 'KeyM':
          handleCycleRenderMode();
          break;
        case 'KeyG':
          setGlow((prev) => !prev);
          break;
        case 'KeyT':
          setTrails((prev) => !prev);
          break;
        case 'KeyP':
          setIsCodeOpen((prev) => !prev);
          break;
        case 'KeyF':
          togglePresent();
          break;
        case 'KeyO':
          setIsPatternsOpen((prev) => !prev);
          break;
        case 'KeyS':
          handleSnapshot();
          break;
        case 'Escape':
          setIsPresenting(false);
          setIsPatternsOpen(false);
          setIsPalettesOpen(false);
          setIsCodeOpen(false);
          setIsShortcutsOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevPattern, handleNextPattern, handleCyclePalette, handleRandomize, handleCycleRenderMode, togglePresent]);

  return (
    <div className={`relative w-screen h-screen overflow-hidden flex flex-col bg-zinc-950 text-white font-sans antialiased ${isPresenting ? 'cursor-none' : ''}`}>
      {/* Top Header (hidden in presentation mode) */}
      <div className={isPresenting ? 'hidden' : undefined}>
      <HeaderBar
        currentPattern={currentPattern}
        currentPalette={currentPalette}
        onOpenPatterns={() => setIsPatternsOpen(true)}
        onOpenPalettes={() => setIsPalettesOpen(true)}
        onToggleCode={() => setIsCodeOpen((prev) => !prev)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isCodeOpen={isCodeOpen}
      />
      </div>

      {/* Main Canvas Visualizer */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <ErrorBoundary>
        <CanvasVisualizer
          pattern={currentPattern}
          palette={currentPalette}
          renderMode={renderMode}
          speed={speed}
          isPlaying={isPlaying}
          glow={glow}
          trails={trails}
          params={patternParams}
          snapshotRef={snapshotRef}
          recordRef={recordRef}
          onRecordingChange={setIsRecording}
        />
        </ErrorBoundary>

        {/* Presentation hint (fades after a few seconds) */}
        {isPresenting && showPresentHint && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-zinc-300 pointer-events-none">
            Presentation mode — press F or Esc to exit
          </div>
        )}

        {/* Lofi Chill Music Player & Spectrum Engine (kept mounted but
            hidden in presentation mode so playback continues) */}
        <div className={isPresenting ? 'hidden' : undefined}>
        <ChillMusicPlayer
          onMorphTriggered={handleAudioMorph}
          isMorphEnabled={isMorphEnabled}
          onToggleMorph={() => setIsMorphEnabled((prev) => !prev)}
        />
        </div>

        {/* Floating Bottom Control Dock (hidden in presentation mode) */}
        <div className={isPresenting ? 'hidden' : undefined}>
        <ControlDock
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((prev) => !prev)}
          onPrevPattern={handlePrevPattern}
          onNextPattern={handleNextPattern}
          onRandomPattern={handleRandomize}
          speed={speed}
          onSpeedChange={(val) => setSpeed(val)}
          renderMode={renderMode}
          onRenderModeChange={(mode) => setRenderMode(mode)}
          glow={glow}
          onToggleGlow={() => setGlow((prev) => !prev)}
          trails={trails}
          onToggleTrails={() => setTrails((prev) => !prev)}
          onSnapshot={handleSnapshot}
          isRecording={isRecording}
          onToggleRecord={handleToggleRecord}
          onTogglePresent={togglePresent}
          onOpenPalettes={() => setIsPalettesOpen(true)}
          onToggleParameters={() => setIsCodeOpen(true)}
          isParametersOpen={isCodeOpen}
        />
        </div>
      </main>

      {/* Modals & Drawers */}
      <PalettePickerModal
        isOpen={isPalettesOpen}
        onClose={() => setIsPalettesOpen(false)}
        currentPalette={currentPalette}
        palettes={allPalettes}
        onSaveCustomPalette={handleSaveCustomPalette}
        onDeleteCustomPalette={handleDeleteCustomPalette}
        onSelectPalette={(pal) => {
          lastManualSelectionRef.current = Date.now();
          setCurrentPalette(pal);
        }}
      />

      <PatternGalleryModal
        isOpen={isPatternsOpen}
        onClose={() => setIsPatternsOpen(false)}
        currentPattern={currentPattern}
        onSelectPattern={(pat) => {
          lastManualSelectionRef.current = Date.now();
          const idx = ALL_PATTERNS.findIndex((p) => p.id === pat.id);
          if (idx !== -1) setPatternIndex(idx);
        }}
      />

      <PythonCodeDrawer
        isOpen={isCodeOpen}
        onClose={() => setIsCodeOpen(false)}
        pattern={currentPattern}
        palette={currentPalette}
        params={patternParams}
        onParamChange={handleParamChange}
        onResetParams={handleResetParams}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
