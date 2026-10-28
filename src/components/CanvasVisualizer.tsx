/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PatternDefinition, ColorPalette, RenderMode, AudioMetrics } from '../types/visualizer';
import { samplePalette, samplePaletteRgba, hexToRgb } from '../utils/color';
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
  canvasRefOut?: React.RefObject<HTMLCanvasElement | null>;
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

  const mouseRef = useRef({
    x: 0,
    y: 0,
    isDown: false,
    hasInteracted: false,
  });

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

  // Handle canvas resizing
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    if (w <= 0 || h <= 0) return;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Main 60fps render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let isRunning = true;

    const loop = (now: number) => {
      if (!isRunning) return;

      const p = propsRef.current;
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Update FPS counter
      fpsCounterRef.current++;
      if (now - fpsTimerRef.current >= 1000) {
        setFps(fpsCounterRef.current);
        fpsCounterRef.current = 0;
        fpsTimerRef.current = now;
      }

      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width || 800;
      const height = rect?.height || 600;

      // Get real-time audio metrics
      const audioMetrics = p.audioReactive ? audioEngine.getMetrics() : undefined;
      const audioBoost = audioMetrics && audioMetrics.volume > 0.05 ? 1 + audioMetrics.bass * 0.4 : 1;

      if (p.isPlaying) {
        timeRef.current += dt * p.speed * audioBoost;
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
        const beatFlare = audioMetrics && audioMetrics.beat ? 18 : 12;
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
      if (audioMetrics && audioMetrics.bass > 0.1) {
        const cx = width / 2;
        const cy = height / 2;
        const scaleBounce = 1 + audioMetrics.bass * 0.06;
        ctx.translate(cx, cy);
        ctx.scale(scaleBounce, scaleBounce);
        ctx.translate(-cx, -cy);
      }

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
        console.error('Render error:', err);
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

  // Mouse event listeners for interactivity
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    mouseRef.current.hasInteracted = true;
  };

  const handleMouseDown = () => {
    mouseRef.current.isDown = true;
    mouseRef.current.hasInteracted = true;
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
  };

  // Expose export PNG helper via window
  useEffect(() => {
    (window as unknown as { exportVisualizerPng: () => void }).exportVisualizerPng = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `visualizerrr-${propsRef.current.pattern.id}.png`;
      a.click();
      if (onSnapshotReady) onSnapshotReady(dataUrl);
    };
  }, [onSnapshotReady]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex items-center justify-center select-none"
      style={{ backgroundColor: palette.background }}
    >
      <canvas
        ref={canvasRef}
        data-testid="visualizer-canvas"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="block w-full h-full cursor-crosshair transition-opacity duration-300"
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
        <span className="text-zinc-600">|</span>
        <span>SPEED {speed.toFixed(2)}x</span>
      </div>
    </div>
  );
};
