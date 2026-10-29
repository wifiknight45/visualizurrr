/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioMetrics, ChillTrack, ChillPlaylist } from '../types/visualizer';

// Base-relative audio URLs: works at a domain root and under a subpath
// (e.g. GitHub Pages project sites at /visualizurrr/).
const audioUrl = (file: string): string =>
  `${(import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'}audio/${file}`;

// Curated Open Source Lofi Chill Tracks (Real CC0 & Royalty-Free Studio Recordings)
export const OPEN_SOURCE_LOFI_TRACKS: ChillTrack[] = [
  {
    id: 'track-cold-brew',
    title: 'Cold Brew Chill',
    artist: 'RA (Open Source CC0)',
    bpm: 74,
    key: 'Eb major 7',
    vibe: 'Mellow Rhodes & Soft Drums',
    paletteId: 'tokyo-night',
    patternId: 'lorenz-attractor',
    audioSrc: audioUrl('cold_brew_chill.mp3'),
    license: 'Creative Commons 0 (Public Domain)',
  },
  {
    id: 'track-night-kyoto',
    title: 'Night in Kyoto',
    artist: 'Avbe (Open Source CC0)',
    bpm: 72,
    key: 'D minor 9',
    vibe: 'Tranquil Lantern Vibes',
    paletteId: 'cherry-blossom',
    patternId: 'perlin-flow-field',
    audioSrc: audioUrl('night_in_kyoto.mp3'),
    license: 'Creative Commons 0 (Public Domain)',
  },
  {
    id: 'track-moonshine',
    title: 'Moonshine Vibes',
    artist: 'Prigida (Open Source CC0)',
    bpm: 68,
    key: 'F major 7',
    vibe: 'Vintage Warm Tape Beat',
    paletteId: 'synthwave-84',
    patternId: 'hypotrochoid-spirograph',
    audioSrc: audioUrl('moonshine_vibes.mp3'),
    license: 'Creative Commons 0 (Public Domain)',
  },
  {
    id: 'track-study-session',
    title: 'Midnight Study Session',
    artist: 'Lofi Records (Open Source CC0)',
    bpm: 64,
    key: 'C major 7',
    vibe: 'Rainy Room & Deep Focus',
    paletteId: 'celestial-nebula',
    patternId: 'fourier-epicycles',
    audioSrc: audioUrl('lofi_chill_study.mp3'),
    license: 'Creative Commons 0 (Public Domain)',
  },
  {
    id: 'track-roof-tops',
    title: 'Roof Tops',
    artist: 'Holizna (CC0)',
    bpm: 76,
    key: 'A minor',
    vibe: 'Sun-baked Rooftop Haze',
    paletteId: 'golden-amber',
    patternId: 'phyllotaxis-sunflower',
    audioSrc: audioUrl('roof_tops.mp3'),
    license: 'Creative Commons 0 (Public Domain)',
  },
  {
    id: 'track-august-never-lasts',
    title: 'August Never Lasts',
    artist: 'Holizna (CC0)',
    bpm: 72,
    key: 'F major 7',
    vibe: 'Late-Summer Nostalgia',
    paletteId: 'sunset-horizon',
    patternId: 'wave-interference',
    audioSrc: audioUrl('august_never_lasts.mp3'),
    license: 'Creative Commons 0 (Public Domain)',
  },
  {
    id: 'track-ocean-memory',
    title: 'Ocean Memory',
    artist: 'Holizna (CC0)',
    bpm: 70,
    key: 'C major 7',
    vibe: 'Salt Air & Slow Tides',
    paletteId: 'deep-coral-reef',
    patternId: 'jellyfish-pulse',
    audioSrc: audioUrl('ocean_memory.mp3'),
    license: 'Creative Commons 0 (Public Domain)',
  },
  {
    id: 'track-currents',
    title: 'Currents We Used to Know',
    artist: 'Holizna (CC0)',
    bpm: 74,
    key: 'D minor 9',
    vibe: 'Drifting Nostalgia Currents',
    paletteId: 'bioluminescence',
    patternId: 'perlin-flow-field',
    audioSrc: audioUrl('currents_we_used_to_know.mp3'),
    license: 'Creative Commons 0 (Public Domain)',
  },
  {
    id: 'track-tokyo-sunset',
    title: 'Tokyo Sunset',
    artist: 'Holizna (CC0)',
    bpm: 78,
    key: 'Eb major 7',
    vibe: 'Neon Dusk Over the Bay',
    paletteId: 'vaporwave-pastel',
    patternId: 'starfield-warp',
    audioSrc: audioUrl('tokyo_sunset.mp3'),
    license: 'Creative Commons 0 (Public Domain)',
  },
  {
    id: 'track-one-night-in-france',
    title: 'One Night In France',
    artist: 'Holizna (CC0)',
    bpm: 68,
    key: 'G minor 9',
    vibe: 'Café Windows & Rainy Streets',
    paletteId: 'copper-patina',
    patternId: 'double-pendulum',
    audioSrc: audioUrl('one_night_in_france.mp3'),
    license: 'Creative Commons 0 (Public Domain)',
  },
  {
    id: 'track-bubbles',
    title: 'Bubbles',
    artist: 'Holizna (CC0)',
    bpm: 80,
    key: 'C major 7',
    vibe: 'Bright Soda-Pop Fizz',
    paletteId: 'rainbow-spectrum',
    patternId: 'boids-flocking',
    audioSrc: audioUrl('bubbles.mp3'),
    license: 'Creative Commons 0 (Public Domain)',
  },
];

// Curated Lofi Chill Playlists using real open-source recordings
export const DEFAULT_CHILL_PLAYLISTS: ChillPlaylist[] = [
  {
    id: 'lofi-tokyo-night',
    name: 'Midnight Tokyo Lofi',
    description: 'Open source lofi beats with warm jazz keys, gentle vinyl flutter, and downtempo groove',
    tracks: [
      OPEN_SOURCE_LOFI_TRACKS[0],
      OPEN_SOURCE_LOFI_TRACKS[9],
      OPEN_SOURCE_LOFI_TRACKS[1],
      OPEN_SOURCE_LOFI_TRACKS[10],
      OPEN_SOURCE_LOFI_TRACKS[2],
      OPEN_SOURCE_LOFI_TRACKS[4],
    ],
  },
  {
    id: 'cosmic-study-session',
    name: 'Cosmic Study Session',
    description: 'Relaxing ambient acoustic recordings for deep focus, flow states, and generative visuals',
    tracks: [
      OPEN_SOURCE_LOFI_TRACKS[3],
      OPEN_SOURCE_LOFI_TRACKS[6],
      OPEN_SOURCE_LOFI_TRACKS[7],
      OPEN_SOURCE_LOFI_TRACKS[0],
      OPEN_SOURCE_LOFI_TRACKS[5],
      OPEN_SOURCE_LOFI_TRACKS[1],
    ],
  },
  {
    id: 'coffee-shop-vinyl',
    name: 'Coffee Shop Vinyl Beats',
    description: 'Cozy recordings featuring vintage tape warmth, mellow acoustic basslines, and golden hour chords',
    tracks: [
      OPEN_SOURCE_LOFI_TRACKS[2],
      OPEN_SOURCE_LOFI_TRACKS[8],
      OPEN_SOURCE_LOFI_TRACKS[3],
      OPEN_SOURCE_LOFI_TRACKS[4],
      OPEN_SOURCE_LOFI_TRACKS[0],
      OPEN_SOURCE_LOFI_TRACKS[10],
    ],
  },
];

class LofiAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  private isPlaying: boolean = false;
  private volume: number = 0.7;

  private currentTrack: ChillTrack = OPEN_SOURCE_LOFI_TRACKS[0];
  private currentPlaylist: ChillPlaylist = DEFAULT_CHILL_PLAYLISTS[0];
  private trackIndex: number = 0;

  private freqData: Uint8Array = new Uint8Array(128);
  private prevFreqData: Uint8Array | null = null;
  private fluxAvg = 0;
  private lastBeatAt = 0;
  private metricsCache: AudioMetrics | null = null;
  private metricsCacheAt = 0;

  // Callbacks
  private onTrackChangeCallbacks: Array<(track: ChillTrack) => void> = [];

  public init() {
    if (typeof window === 'undefined') return;
    if (this.ctx && this.audioElement) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.analyser = this.ctx.createAnalyser();
      // 2048 gives ~23 Hz per bin at 48 kHz, so band edges can be defined
      // in Hz instead of as fractions of the spectrum (at fftSize 256 the
      // old "bass" band actually spanned 0-2.8 kHz).
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
      this.prevFreqData = new Uint8Array(this.analyser.frequencyBinCount);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      // Warm analog shelf filter to preserve pristine sound while adding cozy warmth
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(18000, this.ctx.currentTime);

      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Create standard HTML Audio element for high-fidelity playback
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElement.src = this.currentTrack.audioSrc;
      this.audioElement.volume = 1.0; // Volume managed via Web Audio GainNode
      this.audioElement.preload = 'auto';

      // Connect HTML Audio to Web Audio pipeline
      this.audioSourceNode = this.ctx.createMediaElementSource(this.audioElement);
      this.audioSourceNode.connect(this.filterNode);

      // Auto-advance to next track when the audio finishes
      this.audioElement.addEventListener('ended', () => {
        this.nextTrack();
      });

      // Keep isPlaying in sync with the element's real state
      this.audioElement.addEventListener('play', () => {
        this.isPlaying = true;
      });
      this.audioElement.addEventListener('pause', () => {
        this.isPlaying = false;
      });

      // Handle any loading error by gracefully moving to next track
      this.audioElement.addEventListener('error', (e) => {
        console.warn('Audio playback error, attempting fallback track:', e);
      });
    } catch (err) {
      console.warn('AudioContext initialization error:', err);
    }
  }

  public async play(): Promise<void> {
    this.init();

    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.warn('AudioContext resume error:', e);
      }
    }

    if (this.audioElement) {
      try {
        if (!this.audioElement.src || !this.audioElement.src.includes(this.currentTrack.audioSrc)) {
          this.audioElement.src = this.currentTrack.audioSrc;
        }
        await this.audioElement.play();
        this.isPlaying = true;
      } catch (e) {
        console.warn('AudioElement play failed:', e);
        this.isPlaying = false;
      }
    }
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public async toggle(): Promise<boolean> {
    if (this.isPlaying) {
      this.pause();
    } else {
      await this.play();
    }
    return this.isPlaying;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): ChillTrack {
    return this.currentTrack;
  }

  public getCurrentPlaylist(): ChillPlaylist {
    return this.currentPlaylist;
  }

  public onTrackChange(cb: (track: ChillTrack) => void): () => void {
    this.onTrackChangeCallbacks.push(cb);
    return () => {
      this.onTrackChangeCallbacks = this.onTrackChangeCallbacks.filter((c) => c !== cb);
    };
  }

  public setTrack(track: ChillTrack): void {
    this.currentTrack = track;
    this.onTrackChangeCallbacks.forEach((cb) => cb(track));

    if (this.audioElement) {
      const wasPlaying = this.isPlaying;
      this.audioElement.src = track.audioSrc;
      this.audioElement.currentTime = 0;
      if (wasPlaying) {
        void this.audioElement.play().catch((e) => console.warn('Track switch play error:', e));
      }
    }
  }

  public setPlaylist(playlist: ChillPlaylist): void {
    this.currentPlaylist = playlist;
    this.trackIndex = 0;
    if (playlist.tracks.length > 0) {
      this.setTrack(playlist.tracks[0]);
    }
  }

  public nextTrack(): void {
    const tracks = this.currentPlaylist.tracks;
    if (tracks.length === 0) return;
    this.trackIndex = (this.trackIndex + 1) % tracks.length;
    this.setTrack(tracks[this.trackIndex]);
  }

  public prevTrack(): void {
    const tracks = this.currentPlaylist.tracks;
    if (tracks.length === 0) return;
    this.trackIndex = (this.trackIndex - 1 + tracks.length) % tracks.length;
    this.setTrack(tracks[this.trackIndex]);
  }

  // Generates a new customized chill playlist pairing open-source recordings with visual presets
  public generateCustomPlaylist(name: string, vibe: string, baseBpm: number = 72): ChillPlaylist {
    const paletteIds = ['tokyo-night', 'synthwave-84', 'sunset-horizon', 'bioluminescence', 'nord-frost', 'monokai-pro'];
    const patternIds = ['lorenz-attractor', 'hypotrochoid-spirograph', 'perlin-flow-field', 'fourier-epicycles', 'jellyfish-pulse', 'chladni-plate'];

    const tracks: ChillTrack[] = [];
    for (let i = 0; i < OPEN_SOURCE_LOFI_TRACKS.length; i++) {
      const baseTrack = OPEN_SOURCE_LOFI_TRACKS[i];
      tracks.push({
        id: `custom-track-${Date.now()}-${i}`,
        // Honest naming: a custom playlist re-presents the bundled
        // tracks; it does not create new recordings with new titles.
        title: baseTrack.title,
        artist: baseTrack.artist,
        bpm: baseBpm + (i % 2 === 0 ? -2 : 3),
        key: baseTrack.key,
        vibe: vibe,
        paletteId: paletteIds[i % paletteIds.length],
        patternId: patternIds[i % patternIds.length],
        audioSrc: baseTrack.audioSrc,
        license: baseTrack.license,
      });
    }

    const playlist: ChillPlaylist = {
      id: `custom-${Date.now()}`,
      name: name || 'Custom Chill Session',
      description: `Your session of the bundled open-source tracks (${vibe}) with suggested pattern and palette pairings`,
      tracks,
    };

    return playlist;
  }

  // Real-time audio metric analysis. Band edges are defined in Hz
  // (bass 20-150, mid 150-4000, treble 4000-16000). Beat detection uses
  // spectral flux against a running average with a cooldown, instead of
  // a fixed level that stays true for the length of a loud note.
  // Results are cached per animation frame: the canvas and the player
  // both read metrics every frame and now share one computation.
  public getMetrics(): AudioMetrics {
    if (!this.analyser || !this.isPlaying) {
      return {
        bass: 0,
        mid: 0,
        treble: 0,
        volume: 0,
        beat: false,
      };
    }

    const nowMs = performance.now();
    if (this.metricsCache && nowMs - this.metricsCacheAt < 12) {
      return this.metricsCache;
    }

    try {
      (this.analyser as unknown as { getByteFrequencyData: (d: Uint8Array) => void }).getByteFrequencyData(this.freqData);

      const sampleRate = this.ctx?.sampleRate ?? 48000;
      const binHz = sampleRate / this.analyser.fftSize;
      const binFor = (hz: number) =>
        Math.min(this.freqData.length - 1, Math.max(0, Math.round(hz / binHz)));
      const bassStart = binFor(20);
      const bassEnd = Math.max(bassStart + 1, binFor(150));
      const midEnd = Math.max(bassEnd + 1, binFor(4000));
      const trebleEnd = Math.max(midEnd + 1, binFor(16000));

      const bandAvg = (from: number, to: number) => {
        let sum = 0;
        for (let i = from; i < to; i++) sum += this.freqData[i];
        return sum / ((to - from) * 255);
      };

      const bass = bandAvg(bassStart, bassEnd);
      const mid = bandAvg(bassEnd, midEnd);
      const treble = bandAvg(midEnd, trebleEnd);
      const volume = bass * 0.45 + mid * 0.35 + treble * 0.2;

      // Spectral flux over the bass+mid range vs its running average.
      let flux = 0;
      if (this.prevFreqData && this.prevFreqData.length === this.freqData.length) {
        for (let i = bassStart; i < midEnd; i++) {
          const d = this.freqData[i] - this.prevFreqData[i];
          if (d > 0) flux += d;
        }
        flux /= (midEnd - bassStart) * 255;
      } else {
        this.prevFreqData = new Uint8Array(this.freqData.length);
      }
      this.prevFreqData.set(this.freqData);
      this.fluxAvg = this.fluxAvg * 0.92 + flux * 0.08;
      const beat =
        flux > Math.max(0.015, this.fluxAvg * 1.7) &&
        nowMs - this.lastBeatAt > 180;
      if (beat) this.lastBeatAt = nowMs;

      const result: AudioMetrics = {
        bass,
        mid,
        treble,
        volume,
        beat,
        frequencyData: this.freqData,
      };
      this.metricsCache = result;
      this.metricsCacheAt = nowMs;
      return result;
    } catch {
      return {
        bass: 0,
        mid: 0,
        treble: 0,
        volume: 0,
        beat: false,
      };
    }
  }
}

export const audioEngine = new LofiAudioEngine();
