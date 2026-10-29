/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause canvas animation' },
    { key: '→ / ←', desc: 'Next / Previous aesthetic pattern (1 to 68)' },
    { key: '↑ / ↓', desc: 'Increase / Decrease animation speed' },
    { key: 'C', desc: 'Cycle predefined color palettes (1 to 26)' },
    { key: 'R', desc: 'Randomize pattern and palette combination' },
    { key: 'M', desc: 'Cycle render mode (Curves, Particles, Wireframe, Heatmap, Neon, Matrix)' },
    { key: 'G', desc: 'Toggle Bloom / Neon glow effect' },
    { key: 'T', desc: 'Toggle trail fade persistence' },
    { key: 'P', desc: 'Open Python Code drawer' },
    { key: 'F', desc: 'Presentation mode (fullscreen, auto-advancing patterns)' },
    { key: 'O', desc: 'Open 68 Pattern Gallery' },
    { key: 'S', desc: 'Export high-resolution PNG snapshot' },
    { key: 'Esc', desc: 'Close any active modal or drawer' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Simple Button & Keyboard Commands</h2>
              <p className="text-xs text-zinc-400">Tactile controls to navigate visualizurrr</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-4 overflow-y-auto space-y-2">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs"
            >
              <span className="text-zinc-300 font-medium">{sc.desc}</span>
              <kbd className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sky-400 font-mono font-semibold shadow-inner">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/40 text-center text-xs text-zinc-400 font-mono space-y-1">
          <div>All commands also work via the on-screen tactile buttons</div>
          <div className="text-zinc-500">
            Photosensitivity: patterns can flash and pulse. If your system
            requests reduced motion, animation slows and beat flares are disabled.
          </div>
        </div>
      </div>
    </div>
  );
};
