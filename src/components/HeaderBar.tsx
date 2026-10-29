/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PatternDefinition, ColorPalette } from '../types/visualizer';
import { Layers, Palette, Code, HelpCircle, Github, Sparkles } from 'lucide-react';

interface HeaderBarProps {
  currentPattern: PatternDefinition;
  currentPalette: ColorPalette;
  onOpenPatterns: () => void;
  onOpenPalettes: () => void;
  onToggleCode: () => void;
  onOpenShortcuts: () => void;
  isCodeOpen: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentPattern,
  currentPalette,
  onOpenPatterns,
  onOpenPalettes,
  onToggleCode,
  onOpenShortcuts,
  isCodeOpen,
}) => {
  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & GitHub link */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3776ab] to-[#ffd43b] flex items-center justify-center text-zinc-950 font-black shadow-inner text-sm">
            py
          </div>
          <span className="font-bold tracking-tight text-white text-base font-mono">
            visualizurrr
          </span>
        </div>

        <a
          href="https://github.com/wifiknight45/visualizurrr"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-900 border border-zinc-800 transition-colors"
          title="View on GitHub"
        >
          <Github className="w-3.5 h-3.5" />
          <span>wifiknight45/visualizurrr</span>
        </a>
      </div>

      {/* Middle status badges (interactive) */}
      <div className="flex items-center gap-2">
        {/* Pattern badge */}
        <button
          onClick={onOpenPatterns}
          className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-200 transition-all cursor-pointer group"
          title="Browse 68 Patterns"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="text-zinc-500 font-bold">#{String(currentPattern.number).padStart(2, '0')}</span>
          <span className="max-w-[120px] md:max-w-[200px] truncate text-white font-medium">
            {currentPattern.name}
          </span>
        </button>

        {/* Palette badge */}
        <button
          onClick={onOpenPalettes}
          className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-200 transition-all cursor-pointer group"
          title="Select from 26 Predefined Palettes"
        >
          <div className="flex items-center -space-x-1">
            {currentPalette.colors.slice(0, 4).map((c, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full border border-black/40"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <span className="max-w-[100px] md:max-w-[150px] truncate text-white font-medium">
            {currentPalette.name}
          </span>
        </button>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenPatterns}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors"
          title="Open Patterns Catalog (68 Options)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Patterns (68)</span>
        </button>

        <button
          onClick={onOpenPalettes}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors"
          title="Open Palettes Selector (26 Palettes)"
        >
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden md:inline">Palettes (26)</span>
        </button>

        <button
          onClick={onToggleCode}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
            isCodeOpen
              ? 'bg-sky-500/10 text-sky-400 border-sky-500/40'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900 border-zinc-800'
          }`}
          title="View runnable Python code"
        >
          <Code className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Python Code</span>
        </button>

        <button
          onClick={onOpenShortcuts}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors"
          title="Keyboard and Button Commands Guide"
          aria-label="Commands and shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
