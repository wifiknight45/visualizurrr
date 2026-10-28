/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ALL_PATTERNS } from './data/patterns/index';
import { COLOR_PALETTES, DEFAULT_PALETTE } from './data/palettes';
import { PatternDefinition, ColorPalette, RenderMode } from './types/visualizer';
import { CanvasVisualizer } from './components/CanvasVisualizer';
import { HeaderBar } from './components/HeaderBar';
import { ControlDock } from './components/ControlDock';
import { PalettePickerModal } from './components/PalettePickerModal';
import { PatternGalleryModal } from './components/PatternGalleryModal';
import { PythonCodeDrawer } from './components/PythonCodeDrawer';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ChillMusicPlayer } from './components/ChillMusicPlayer';

export default function App() {
  const [patternIndex, setPatternIndex] = useState<number>(0);
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(DEFAULT_PALETTE);
  const [renderMode, setRenderMode] = useState<RenderMode>('curves');
  const [speed, setSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [glow, setGlow] = useState<boolean>(true);
  const [trails, setTrails] = useState<boolean>(true);
  const [isMorphEnabled, setIsMorphEnabled] = useState<boolean>(true);

  // Modals & Panels
  const [isPatternsOpen, setIsPatternsOpen] = useState<boolean>(false);
  const [isPalettesOpen, setIsPalettesOpen] = useState<boolean>(false);
  const [isCodeOpen, setIsCodeOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  const currentPattern = ALL_PATTERNS[patternIndex];
  const [patternParams, setPatternParams] = useState<Record<string, number>>(
    currentPattern.defaultParameters
  );

  // Sync parameters when switching patterns
  useEffect(() => {
    setPatternParams(currentPattern.defaultParameters);
  }, [currentPattern]);

  // Handle audio morph triggered by music bars / track changes
  const handleAudioMorph = useCallback((targetPatternId: string, targetPaletteId: string) => {
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
    setPatternIndex((prev) => (prev > 0 ? prev - 1 : ALL_PATTERNS.length - 1));
  }, []);

  const handleNextPattern = useCallback(() => {
    setPatternIndex((prev) => (prev < ALL_PATTERNS.length - 1 ? prev + 1 : 0));
  }, []);

  const handleCyclePalette = useCallback(() => {
    setCurrentPalette((prev) => {
      const idx = COLOR_PALETTES.findIndex((p) => p.id === prev.id);
      const nextIdx = (idx + 1) % COLOR_PALETTES.length;
      return COLOR_PALETTES[nextIdx];
    });
  }, []);

  const handleRandomize = useCallback(() => {
    const randomPatIdx = Math.floor(Math.random() * ALL_PATTERNS.length);
    const randomPalIdx = Math.floor(Math.random() * COLOR_PALETTES.length);
    setPatternIndex(randomPatIdx);
    setCurrentPalette(COLOR_PALETTES[randomPalIdx]);
  }, []);

  const handleCycleRenderMode = useCallback(() => {
    const modes: RenderMode[] = ['curves', 'particles', 'mesh', 'heatmap', 'neon'];
    setRenderMode((prev) => {
      const idx = modes.indexOf(prev);
      return modes[(idx + 1) % modes.length];
    });
  }, []);

  const handleParamChange = (key: string, value: number) => {
    setPatternParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetParams = () => {
    setPatternParams(currentPattern.defaultParameters);
  };

  const handleSnapshot = () => {
    const fn = (window as unknown as { exportVisualizerPng?: () => void }).exportVisualizerPng;
    if (fn) fn();
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
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
        case 'KeyO':
          setIsPatternsOpen((prev) => !prev);
          break;
        case 'KeyS':
          handleSnapshot();
          break;
        case 'Escape':
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
  }, [handlePrevPattern, handleNextPattern, handleCyclePalette, handleRandomize, handleCycleRenderMode]);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-zinc-950 text-white font-sans antialiased">
      {/* Top Header */}
      <HeaderBar
        currentPattern={currentPattern}
        currentPalette={currentPalette}
        onOpenPatterns={() => setIsPatternsOpen(true)}
        onOpenPalettes={() => setIsPalettesOpen(true)}
        onToggleCode={() => setIsCodeOpen((prev) => !prev)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        isCodeOpen={isCodeOpen}
      />

      {/* Main Canvas Visualizer */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <CanvasVisualizer
          pattern={currentPattern}
          palette={currentPalette}
          renderMode={renderMode}
          speed={speed}
          isPlaying={isPlaying}
          glow={glow}
          trails={trails}
          params={patternParams}
        />

        {/* Lofi Chill Music Player & Spectrum Engine */}
        <ChillMusicPlayer
          onMorphTriggered={handleAudioMorph}
          isMorphEnabled={isMorphEnabled}
          onToggleMorph={() => setIsMorphEnabled((prev) => !prev)}
        />

        {/* Floating Bottom Control Dock */}
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
          onOpenPalettes={() => setIsPalettesOpen(true)}
          onToggleParameters={() => setIsCodeOpen(true)}
          isParametersOpen={isCodeOpen}
        />
      </main>

      {/* Modals & Drawers */}
      <PalettePickerModal
        isOpen={isPalettesOpen}
        onClose={() => setIsPalettesOpen(false)}
        currentPalette={currentPalette}
        onSelectPalette={(pal) => setCurrentPalette(pal)}
      />

      <PatternGalleryModal
        isOpen={isPatternsOpen}
        onClose={() => setIsPatternsOpen(false)}
        currentPattern={currentPattern}
        onSelectPattern={(pat) => {
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
