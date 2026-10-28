/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PatternDefinition, CategoryId } from '../types/visualizer';
import { ALL_PATTERNS } from '../data/patterns/index';
import { PATTERN_CATEGORIES } from '../data/categories';
import { X, Search, Check, Layers } from 'lucide-react';

interface PatternGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPattern: PatternDefinition;
  onSelectPattern: (pattern: PatternDefinition) => void;
}

export const PatternGalleryModal: React.FC<PatternGalleryModalProps> = ({
  isOpen,
  onClose,
  currentPattern,
  onSelectPattern,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = ALL_PATTERNS.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.formula.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[88vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Aesthetic Pattern Explorer ({ALL_PATTERNS.length} Unique Options)
              </h2>
              <p className="text-xs text-zinc-400">
                Mathematical fractals, sacred spirographs, cellular automata, wave harmonics, and flow fields
              </p>
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

        {/* Filter bar */}
        <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row gap-3 items-center justify-between bg-zinc-900/40">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 68 patterns, formulas, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              All (68)
            </button>
            {PATTERN_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((p) => {
            const isSelected = p.id === currentPattern.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectPattern(p);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2 cursor-pointer group ${
                  isSelected
                    ? 'bg-zinc-900/90 border-sky-500 ring-1 ring-sky-500/50 shadow-lg'
                    : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                      #{String(p.number).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                      {p.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                    {p.subtitle}
                  </p>
                </div>

                {/* Math snippet */}
                <div className="text-[10px] font-mono text-zinc-400 bg-black/40 px-2 py-1 rounded border border-zinc-800/80 truncate">
                  {p.formula}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {p.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-[10px] text-zinc-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>Showing {filtered.length} of {ALL_PATTERNS.length} patterns</span>
          <span>Use Left/Right arrows to cycle in canvas</span>
        </div>
      </div>
    </div>
  );
};
