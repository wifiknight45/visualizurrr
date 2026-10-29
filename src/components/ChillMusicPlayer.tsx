/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { audioEngine, DEFAULT_CHILL_PLAYLISTS } from '../utils/audioEngine';
import { ChillTrack, ChillPlaylist } from '../types/visualizer';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Disc,
  Radio,
  Sparkles,
  X,
  Plus,
} from 'lucide-react';

interface ChillMusicPlayerProps {
  onMorphTriggered?: (patternId: string, paletteId: string) => void;
  isMorphEnabled: boolean;
  onToggleMorph: () => void;
}

export const ChillMusicPlayer: React.FC<ChillMusicPlayerProps> = ({
  onMorphTriggered,
  isMorphEnabled,
  onToggleMorph,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<ChillTrack>(audioEngine.getCurrentTrack());
  const [currentPlaylist, setCurrentPlaylist] = useState<ChillPlaylist>(audioEngine.getCurrentPlaylist());
  const volume = 0.7;
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<ChillPlaylist[]>(DEFAULT_CHILL_PLAYLISTS);

  // New playlist creator state
  const [customName, setCustomName] = useState<string>('');
  const [customVibe, setCustomVibe] = useState<string>('Late Night Focus');
  const [customBpm, setCustomBpm] = useState<number>(72);

  // Spectrum meter animation
  const [spectrum, setSpectrum] = useState<number[]>([10, 20, 15, 30, 25, 18, 12, 5]);

  // Keep latest values in refs so the engine subscription registers once.
  const morphEnabledRef = useRef(isMorphEnabled);
  morphEnabledRef.current = isMorphEnabled;
  const onMorphRef = useRef(onMorphTriggered);
  onMorphRef.current = onMorphTriggered;

  // One subscription for the component's lifetime, cleaned up on unmount.
  // Morphing happens on track change only, and the engine fires this
  // exactly once per change, so morphs can neither leak nor double up.
  useEffect(() => {
    return audioEngine.onTrackChange((track) => {
      setCurrentTrack(track);
      if (morphEnabledRef.current) {
        onMorphRef.current?.(track.patternId, track.paletteId);
      }
    });
  }, []);

  // Spectrum animation loop. Throttled to ~20 updates/sec and only
  // calls setState when the bars actually changed, so a paused player
  // no longer re-renders 60 times a second forever.
  useEffect(() => {
    let animId: number;
    let last = 0;
    let lastKey = '';
    const updateSpectrum = (now: number) => {
      animId = requestAnimationFrame(updateSpectrum);
      if (now - last < 50) return;
      last = now;
      if (audioEngine.getIsPlaying()) {
        const metrics = audioEngine.getMetrics();
        if (metrics.frequencyData && metrics.frequencyData.length > 0) {
          const step = Math.floor(metrics.frequencyData.length / 8);
          const bars: number[] = [];
          for (let i = 0; i < 8; i++) {
            bars.push(Math.max(4, Math.round((metrics.frequencyData[i * step] / 255) * 32)));
          }
          const key = bars.join(',');
          if (key !== lastKey) {
            lastKey = key;
            setSpectrum(bars);
          }
        }
      } else if (lastKey !== 'flat') {
        lastKey = 'flat';
        setSpectrum([4, 4, 4, 4, 4, 4, 4, 4]);
      }
    };
    animId = requestAnimationFrame(updateSpectrum);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleTogglePlay = async () => {
    const active = await audioEngine.toggle();
    setIsPlaying(active);
    setCurrentTrack(audioEngine.getCurrentTrack());
  };

  const handleNext = () => {
    audioEngine.nextTrack();
  };

  const handlePrev = () => {
    audioEngine.prevTrack();
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume || 0.5);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  const handleSelectPlaylist = (pl: ChillPlaylist) => {
    audioEngine.setPlaylist(pl);
    setCurrentPlaylist(pl);
    setCurrentTrack(pl.tracks[0]);
    if (!isPlaying) {
      void audioEngine
        .play()
        .then(() => setIsPlaying(audioEngine.getIsPlaying()));
    }
    setIsPlaylistModalOpen(false);
  };

  const handleCreateCustomPlaylist = () => {
    const pl = audioEngine.generateCustomPlaylist(
      customName || 'Generative Chill Stream',
      customVibe,
      customBpm
    );
    setPlaylists((prev) => [pl, ...prev]);
    handleSelectPlaylist(pl);
    setCustomName('');
  };

  return (
    <>
      {/* Top-Right or Floating Compact Music Player Dock */}
      <div className="absolute top-16 right-4 z-20 flex items-center gap-2 p-2 bg-zinc-950/85 backdrop-blur-md rounded-2xl border border-zinc-800 shadow-xl select-none max-w-[90vw]">
        {/* Animated Spectrum Bars / Vinyl Icon */}
        <div className="flex items-center gap-1 px-1.5 py-1 bg-zinc-900/90 rounded-xl border border-zinc-800/80">
          <Disc
            className={`w-4 h-4 text-emerald-400 ${
              isPlaying ? 'animate-spin [animation-duration:4s]' : 'opacity-60'
            }`}
          />
          <div className="flex items-end gap-0.5 h-4 w-12 px-0.5">
            {spectrum.map((val, idx) => (
              <span
                key={idx}
                className="w-1 bg-emerald-400 rounded-t-sm transition-all duration-75"
                style={{ height: `${val}px` }}
              />
            ))}
          </div>
        </div>

        {/* Track Title & Artist */}
        <button
          onClick={() => setIsPlaylistModalOpen(true)}
          className="text-left px-2 py-0.5 max-w-[140px] sm:max-w-[180px] group cursor-pointer"
          title="Click to view and generate playlists"
        >
          <div className="text-xs font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
            {currentTrack.title}
          </div>
          <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1 font-mono">
            <span>{currentTrack.bpm} BPM</span>
            <span>·</span>
            <span>{currentTrack.key}</span>
          </div>
        </button>

        {/* Playback Controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Previous Chill Track"
            aria-label="Previous Track"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`p-2 rounded-xl text-white shadow-sm transition-all active:scale-95 ${
              isPlaying
                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
            title={isPlaying ? 'Pause Chill Music' : 'Play Lofi Chill Beats'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Next Chill Track"
            aria-label="Next Track"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Morph Toggle Button */}
        <button
          onClick={onToggleMorph}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-medium border transition-colors ${
            isMorphEnabled
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/10'
              : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 border-zinc-800'
          }`}
          title="Morph visuals with the music chords and rhythm"
        >
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span className="hidden sm:inline">Morph</span>
        </button>

        {/* Playlist Selector Button */}
        <button
          onClick={() => setIsPlaylistModalOpen(true)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Open Chill Playlists"
          aria-label="Open Playlists"
        >
          <Radio className="w-4 h-4 text-sky-400" />
        </button>

        {/* Volume Mute */}
        <button
          onClick={handleToggleMute}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label="Mute"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Playlist Generator & Selector Modal */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-label="Playlists">
          <div className="w-full max-w-2xl max-h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Lofi Chill Playlists & Audio Morph</h2>
                  <p className="text-xs text-zinc-400">
                    Open-source lofi chill beats that procedurally morph visual patterns with musical harmony
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPlaylistModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-5">
              {/* Generator Section */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Create Custom Playlist</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Bundled open-source tracks</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Session Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rainy Window Study"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Vibe & Mood</label>
                    <select
                      value={customVibe}
                      onChange={(e) => setCustomVibe(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Late Night Focus">Late Night Focus</option>
                      <option value="Cozy Vinyl Nostalgia">Cozy Vinyl Nostalgia</option>
                      <option value="Celestial Slumber">Celestial Slumber</option>
                      <option value="Downtempo Groove">Downtempo Groove</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Tempo ({customBpm} BPM)</label>
                    <input
                      type="range"
                      min="58"
                      max="85"
                      step="1"
                      value={customBpm}
                      onChange={(e) => setCustomBpm(parseInt(e.target.value))}
                      className="w-full accent-emerald-400 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer mt-2"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreateCustomPlaylist}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Playlist & Morph Visuals</span>
                </button>
              </div>

              {/* Playlists list */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Available Playlists ({playlists.length})
                </h3>

                <div className="space-y-2.5">
                  {playlists.map((pl) => {
                    const isSelected = pl.id === currentPlaylist.id;
                    return (
                      <div
                        key={pl.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-zinc-900/90 border-emerald-500 ring-1 ring-emerald-500/50'
                            : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                              {pl.name}
                              {isSelected && isPlaying && (
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              )}
                            </h4>
                            <p className="text-xs text-zinc-400">{pl.description}</p>
                          </div>

                          <button
                            onClick={() => handleSelectPlaylist(pl)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              isSelected && isPlaying
                                ? 'bg-emerald-500 text-zinc-950 font-bold'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                            }`}
                          >
                            {isSelected && isPlaying ? 'Playing' : 'Play Playlist'}
                          </button>
                        </div>

                        {/* Tracks list */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {pl.tracks.map((t, idx) => (
                            <div
                              key={t.id}
                              onClick={() => {
                                audioEngine.setPlaylist(pl);
                                audioEngine.setTrack(t);
                                setCurrentPlaylist(pl);
                                setCurrentTrack(t);
                                if (!isPlaying) {
                                  void audioEngine
                                    .play()
                                    .then(() =>
                                      setIsPlaying(audioEngine.getIsPlaying())
                                    );
                                }
                              }}
                              className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                currentTrack.id === t.id && isPlaying
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-black/30 text-zinc-300 hover:bg-zinc-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-[10px] font-mono text-zinc-500">
                                  {idx + 1}.
                                </span>
                                <span className="truncate font-medium">{t.title}</span>
                              </div>
                              <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                                {t.bpm} BPM
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Visuals pulse to bass, hue shifts to chord keys</span>
              <span>100% open source CC0 audio tracks</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
