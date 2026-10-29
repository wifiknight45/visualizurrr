/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PatternDefinition, ColorPalette, RenderMode } from '../types/visualizer';
import { samplePalette, samplePaletteRgba } from '../utils/color';
import { audioEngine } from '../utils/audioEngine';

interface CanvasVisualizerProps {
  pattern: PatternDefinition;
  palette: ColorPalette;
  renderMode: RenderMode;
  speed: number;
  isPlaying: boolean;
  glow: boolean;
  trails: boolean;
  params: Record<string, number>;
  audioReactive?: boolean;
  onSnapshotReady?: (dataUrl: string) => void;
  snapshotRef?: React.RefObject<(() => void) | null>;
  recordRef?: React.RefObject<(() => void) | null>;
  onRecordingChange?: (recording: boolean) => void;
}

export const CanvasVisualizer: React.FC<CanvasVisualizerProps> = ({
  pattern,
  palette,
  renderMode,
  speed,
  isPlaying,
  glow,
  trails,
  params,
  audioReactive = true,
  onSnapshotReady,
  snapshotRef,
  recordRef,
  onRecordingChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [fps, setFps] = useState<number>(60);
  const animationFrameRef = useRef<number | null>(null);

  // Simulation state refs (so 60fps loop doesn't re-trigger React renders)
  const timeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(performance.now());
  const fpsCounterRef = useRef<number>(0);

  // Adaptive quality: when the measured FPS stays low, the backing
  // store resolution steps down (0.75x, then 0.5x) so animation stays
  // smooth; it steps back up when there is headroom again.
  const qualityScaleRef = useRef<number>(1);
  const lowFpsStreakRef = useRef<number>(0);
  const highFpsStreakRef = useRef<number>(0);
  const [qualityScale, setQualityScale] = useState<number>(1);

  const mouseRef = useRef({
    x: 0,
    y: 0,
    isDown: false,
    hasInteracted: false,
  });

  // A pattern that throws is disabled (and logged once) instead of
  // throwing — and spamming the console — on every frame.
  const failedPatternRef = useRef<string | null>(null);

  // Respect prefers-reduced-motion: slower time advance, no beat
  // flares, no bass scale bounce.
  const reducedMotionRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const lastPatternIdRef = useRef<string>('');

  // Keep references to props so rAF has latest values without restarting
  const propsRef = useRef({
    pattern,
    palette,
    renderMode,
    speed,
    isPlaying,
    glow,
    trails,
    params,
    audioReactive,
  });

  useEffect(() => {
    propsRef.current = {
      pattern,
      palette,
      renderMode,
      speed,
      isPlaying,
      glow,
      trails,
      params,
      audioReactive,
    };
  }, [pattern, palette, renderMode, speed, isPlaying, glow, trails, params, audioReactive]);

  // The 2D context is created exactly once, with the attributes the
  // render loop wants ({ alpha: false }). If resize handling created it
  // first with default attributes, the loop's options would be silently
  // ignored — the first getContext call on a canvas always wins.
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2) * qualityScaleRef.current;
    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    if (w <= 0 || h <= 0) return;

    canvas.width = Math.max(2, Math.floor(w * dpr));
    canvas.height = Math.max(2, Math.floor(h * dpr));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { alpha: false });
    }
    ctxRef.current?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  // ResizeObserver catches container/layout resizes that window.resize
  // misses (drawers opening, rotation, window management).
  useEffect(() => {
    handleResize();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
    const observer = new ResizeObserver(() => handleResize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [handleResize]);

  // Main 60fps render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { alpha: false });
    }
    const ctx = ctxRef.current;
    if (!ctx) return;

    let isRunning = true;

    const loop = (now: number) => {
      if (!isRunning) return;

      const p = propsRef.current;
      // Clamp dt: returning from a hidden tab must not teleport the sim.
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      // Update FPS counter
      fpsCounterRef.current++;
      if (now - fpsTimerRef.current >= 1000) {
        const measured = fpsCounterRef.current;
        setFps(measured);
        fpsCounterRef.current = 0;
        fpsTimerRef.current = now;

        // Adaptive quality control (1s cadence, hysteresis via streaks)
        if (measured < 28) {
          lowFpsStreakRef.current++;
          highFpsStreakRef.current = 0;
        } else if (measured > 55) {
          highFpsStreakRef.current++;
          lowFpsStreakRef.current = 0;
        } else {
          lowFpsStreakRef.current = 0;
          highFpsStreakRef.current = 0;
        }
        if (lowFpsStreakRef.current >= 2 && qualityScaleRef.current > 0.5) {
          qualityScaleRef.current = qualityScaleRef.current > 0.75 ? 0.75 : 0.5;
          lowFpsStreakRef.current = 0;
          setQualityScale(qualityScaleRef.current);
          handleResize();
        } else if (highFpsStreakRef.current >= 4 && qualityScaleRef.current < 1) {
          qualityScaleRef.current = qualityScaleRef.current < 0.75 ? 0.75 : 1;
          highFpsStreakRef.current = 0;
          setQualityScale(qualityScaleRef.current);
          handleResize();
        }
      }

      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width || 800;
      const height = rect?.height || 600;

      // Get real-time audio metrics
      const audioMetrics = p.audioReactive ? audioEngine.getMetrics() : undefined;
      const audioBoost = audioMetrics && audioMetrics.volume > 0.05 ? 1 + audioMetrics.bass * 0.4 : 1;

      if (p.isPlaying) {
        const motionScale = reducedMotionRef.current ? 0.35 : 1;
        timeRef.current += dt * p.speed * audioBoost * motionScale;
        frameCountRef.current++;
      }

      // Clear or trail fade
      if (p.trails) {
        ctx.fillStyle = samplePaletteRgba(p.palette.colors, 0, 0.18);
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = p.palette.background;
        ctx.fillRect(0, 0, width, height);
      }

      // Configure Glow effect with beat reactive flare
      if (p.glow) {
        const beatFlare =
          audioMetrics && audioMetrics.beat && !reducedMotionRef.current ? 18 : 12;
        ctx.shadowBlur = beatFlare;
        ctx.shadowColor = p.palette.primary;
      } else {
        ctx.shadowBlur = 0;
      }

      // Color sampler function with audio reactive hue shift
      const sampleColor = (t: number) => {
        const audioHueShift = audioMetrics ? audioMetrics.mid * 0.2 : 0;
        return samplePalette(p.palette.colors, t + audioHueShift);
      };

      // Render the current pattern
      ctx.save();
      // Apply bass scale bounce around center if music is bumping
      if (audioMetrics && audioMetrics.bass > 0.1 && !reducedMotionRef.current) {
        const cx = width / 2;
        const cy = height / 2;
        const scaleBounce = 1 + audioMetrics.bass * 0.06;
        ctx.translate(cx, cy);
        ctx.scale(scaleBounce, scaleBounce);
        ctx.translate(-cx, -cy);
      }

      if (p.pattern.id !== lastPatternIdRef.current) {
        lastPatternIdRef.current = p.pattern.id;
        failedPatternRef.current = null;
        // Stateful patterns restart from a clean simulation on switch.
        p.pattern.reset?.();
      }
      if (failedPatternRef.current !== p.pattern.id) {
        try {
          p.pattern.render({
            ctx,
            width,
            height,
            time: timeRef.current,
            params: p.params,
            palette: p.palette,
            mode: p.renderMode,
            mouse: mouseRef.current,
            sampleColor,
            frameCount: frameCountRef.current,
            deltaTime: dt,
            audio: audioMetrics,
          });
        } catch (err) {
          failedPatternRef.current = p.pattern.id;
          console.error(
            `Pattern "${p.pattern.id}" threw and was disabled for this activation:`,
            err
          );
        }
      }
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Pointer Events unify mouse and touch. setPointerCapture means a
  // release outside the canvas still ends the drag, so isDown can no
  // longer get stuck on.
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    mouseRef.current.hasInteracted = true;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    canvasRef.current?.setPointerCapture?.(e.pointerId);
    mouseRef.current.isDown = true;
    mouseRef.current.hasInteracted = true;
    handlePointerMove(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    canvasRef.current?.releasePointerCapture?.(e.pointerId);
    mouseRef.current.isDown = false;
  };

  // WebM recording through a parent-owned ref, mirroring the snapshot
  // mechanism. Toggling starts/stops a MediaRecorder on the canvas
  // stream; stopping downloads the .webm (revoke delayed for Safari).
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const onRecordingChangeRef = useRef(onRecordingChange);
  useEffect(() => {
    onRecordingChangeRef.current = onRecordingChange;
  }, [onRecordingChange]);

  useEffect(() => {
    if (!recordRef) return;
    recordRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop();
        return;
      }
      if (typeof MediaRecorder === 'undefined' || typeof canvas.captureStream !== 'function') {
        return;
      }
      recordChunksRef.current = [];
      const stream = canvas.captureStream(60);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 12_000_000,
      });
      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) recordChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visualizurrr-${propsRef.current.pattern.id}.webm`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        recorderRef.current = null;
        onRecordingChangeRef.current?.(false);
      };
      recorder.start(250);
      recorderRef.current = recorder;
      onRecordingChangeRef.current?.(true);
    };
    return () => {
      recordRef.current = null;
    };
  }, [recordRef]);

  // Register the PNG export through a ref owned by the parent — no
  // window global. The canvas backing store runs at devicePixelRatio
  // (up to 2x), so the export is already higher resolution than CSS size.
  useEffect(() => {
    if (!snapshotRef) return;
    snapshotRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `visualizurrr-${propsRef.current.pattern.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (onSnapshotReady) onSnapshotReady(dataUrl);
    };
    return () => {
      snapshotRef.current = null;
    };
  }, [onSnapshotReady, snapshotRef]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex items-center justify-center select-none"
      style={{ backgroundColor: palette.background }}
    >
      <canvas
        ref={canvasRef}
        data-testid="visualizer-canvas"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="block w-full h-full cursor-crosshair transition-opacity duration-300 touch-none"
      />

      {/* Subtle overlay HUD in top-left showing stats */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-3 text-xs font-mono text-zinc-400 bg-zinc-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800/80 shadow-md">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: isPlaying ? '#10b981' : '#f59e0b' }}
          />
          {isPlaying ? 'RUNNING' : 'PAUSED'}
        </span>
        <span className="text-zinc-600">|</span>
        <span>{fps} FPS</span>
        {qualityScale < 1 && (
          <>
            <span className="text-zinc-600">|</span>
            <span>Q {Math.round(qualityScale * 100)}%</span>
          </>
        )}
        <span className="text-zinc-600">|</span>
        <span>SPEED {speed.toFixed(2)}x</span>
      </div>
    </div>
  );
};
