/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RenderMode } from '../types/visualizer';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Camera,
  Flame,
  Activity,
  Layers,
  Sparkles,
  Gauge,
  Sliders,
} from 'lucide-react';

interface ControlDockProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevPattern: () => void;
  onNextPattern: () => void;
  onRandomPattern: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  renderMode: RenderMode;
  onRenderModeChange: (mode: RenderMode) => void;
  glow: boolean;
  onToggleGlow: () => void;
  trails: boolean;
  onToggleTrails: () => void;
  onSnapshot: () => void;
  onOpenPalettes: () => void;
  onToggleParameters: () => void;
  isParametersOpen: boolean;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  isPlaying,
  onTogglePlay,
  onPrevPattern,
  onNextPattern,
  onRandomPattern,
  speed,
  onSpeedChange,
  renderMode,
  onRenderModeChange,
  glow,
  onToggleGlow,
  trails,
  onToggleTrails,
  onSnapshot,
  onOpenPalettes,
  onToggleParameters,
  isParametersOpen,
}) => {
  const modes: { id: RenderMode; label: string }[] = [
    { id: 'curves', label: 'Curves' },
    { id: 'particles', label: 'Particles' },
    { id: 'mesh', label: 'Wireframe' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'neon', label: 'Neon' },
  ];

  const speedPresets = [0.25, 0.5, 1.0, 2.0, 4.0];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-[95vw] z-30">
      <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-2 bg-zinc-950/85 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-2xl">
        {/* Navigation & Play controls */}
        <div className="flex items-center gap-1 pr-2 border-r border-zinc-800">
          <button
            onClick={onPrevPattern}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors"
            title="Previous Pattern (Left Arrow)"
            aria-label="Previous Pattern"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium shadow-md shadow-sky-500/20 transition-all active:scale-95"
            title={isPlaying ? 'Pause Animation (Space)' : 'Play Animation (Space)'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={onNextPattern}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors"
            title="Next Pattern (Right Arrow)"
            aria-label="Next Pattern"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={onRandomPattern}
            className="p-2 rounded-xl text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/80 transition-colors"
            title="Randomize Pattern & Palette (R)"
            aria-label="Randomize"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Slider Control */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Speed</span>
          </div>

          <input
            type="range"
            min="0.05"
            max="6.0"
            step="0.05"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-20 md:w-28 accent-sky-400 cursor-pointer h-1.5 bg-zinc-700 rounded-lg appearance-none"
            title={`Speed: ${speed.toFixed(2)}x (Very slow 0.05x to very fast 6.0x)`}
            aria-label="Animation Speed Slider"
          />

          <span className="w-10 text-right text-xs font-mono font-medium text-white">
            {speed.toFixed(1)}x
          </span>

          {/* Quick presets */}
          <div className="hidden lg:flex items-center gap-0.5 ml-1">
            {speedPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => onSpeedChange(preset)}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                  Math.abs(speed - preset) < 0.08
                    ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={`Set speed to ${preset}x`}
              >
                {preset}x
              </button>
            ))}
          </div>
        </div>

        {/* Render Modes Tabs */}
        <div className="hidden sm:flex items-center gap-1 px-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => onRenderModeChange(m.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                renderMode === m.id
                  ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Toggles: Glow, Trails, Parameters, Snapshot */}
        <div className="flex items-center gap-1 pl-1">
          <button
            onClick={onToggleGlow}
            className={`p-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              glow
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/10'
                : 'text-zinc-400 hover:text-white bg-zinc-900/90 border-zinc-800'
            }`}
            title="Toggle Bloom Glow Effect (G)"
            aria-label="Toggle Glow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Glow</span>
          </button>

          <button
            onClick={onToggleTrails}
            className={`p-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              trails
                ? 'bg-purple-500/15 text-purple-400 border-purple-500/40 shadow-sm shadow-purple-500/10'
                : 'text-zinc-400 hover:text-white bg-zinc-900/90 border-zinc-800'
            }`}
            title="Toggle Trail Fade Persistence (T)"
            aria-label="Toggle Trails"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Trails</span>
          </button>

          <button
            onClick={onToggleParameters}
            className={`p-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              isParametersOpen
                ? 'bg-sky-500/15 text-sky-400 border-sky-500/40'
                : 'text-zinc-400 hover:text-white bg-zinc-900/90 border-zinc-800'
            }`}
            title="Customize Math Parameters"
            aria-label="Customize Parameters"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tweak</span>
          </button>

          <button
            onClick={onSnapshot}
            className="p-2 rounded-xl text-zinc-400 hover:text-emerald-400 bg-zinc-900/90 hover:bg-zinc-800/80 border border-zinc-800 transition-colors"
            title="Take High-Resolution Snapshot PNG (S)"
            aria-label="Export PNG Snapshot"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
