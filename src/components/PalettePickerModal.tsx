/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ColorPalette } from '../types/visualizer';
import { COLOR_PALETTES } from '../data/palettes';
import { X, Check, Search, Palette } from 'lucide-react';

interface PalettePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPalette: ColorPalette;
  onSelectPalette: (palette: ColorPalette) => void;
}

export const PalettePickerModal: React.FC<PalettePickerModalProps> = ({
  isOpen,
  onClose,
  currentPalette,
  onSelectPalette,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Python & Scientific', 'Cyber & Neon', 'Nature & Celestial', 'Editorial & Minimal'];

  const filteredPalettes = COLOR_PALETTES.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Predefined Color Palettes</h2>
              <p className="text-xs text-zinc-400">
                Choose from {COLOR_PALETTES.length} curated aesthetic palettes (Scientific, Neon, Celestial, Minimal)
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

        {/* Filter Bar & Search */}
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/40">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search palette names..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Palettes Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredPalettes.map((pal) => {
            const isSelected = pal.id === currentPalette.id;
            return (
              <button
                key={pal.id}
                onClick={() => {
                  onSelectPalette(pal);
                  onClose();
                }}
                className={`group p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900/90 border-sky-500 ring-1 ring-sky-500/50 shadow-lg'
                    : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                {/* Palette Name - Prominently Displayed */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                      {pal.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400">{pal.category}</p>
                  </div>
                  {isSelected && (
                    <span className="p-1 rounded-full bg-sky-500 text-white shadow-sm">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Gradient Strip */}
                <div
                  className="w-full h-3.5 rounded-md shadow-inner border border-black/30"
                  style={{
                    background: `linear-gradient(to right, ${pal.colors.join(', ')})`,
                  }}
                />

                {/* Individual Color Swatches */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  {pal.colors.map((c, idx) => (
                    <span
                      key={idx}
                      className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  <span className="text-[10px] font-mono text-zinc-500 ml-auto uppercase">
                    {pal.highlight}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>{filteredPalettes.length} palettes listed</span>
          <span>Press 'C' key in canvas to quick-cycle</span>
        </div>
      </div>
    </div>
  );
};
