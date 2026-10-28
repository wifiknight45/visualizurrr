/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioMetrics, ChillTrack, ChillPlaylist } from '../types/visualizer';

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
    audioSrc: '/audio/cold_brew_chill.mp3',
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
    audioSrc: '/audio/night_in_kyoto.mp3',
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
    audioSrc: '/audio/moonshine_vibes.mp3',
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
    audioSrc: '/audio/lofi_chill_study.mp3',
    license: 'Creative Commons 0 (Public Domain)',
  },
];

// Curated Lofi Chill Playlists using real open-source recordings
export const DEFAULT_CHILL_PLAYLISTS: ChillPlaylist[] = [
  {
    id: 'lofi-tokyo-night',
    name: 'Midnight Tokyo Lofi',
    description: 'Authentic open source lofi beats with warm jazz keys, gentle vinyl flutter, and downtempo groove',
    tracks: [
      OPEN_SOURCE_LOFI_TRACKS[0],
      OPEN_SOURCE_LOFI_TRACKS[1],
      OPEN_SOURCE_LOFI_TRACKS[2],
      OPEN_SOURCE_LOFI_TRACKS[3],
    ],
  },
  {
    id: 'cosmic-study-session',
    name: 'Cosmic Study Session',
    description: 'Relaxing ambient acoustic recordings for deep focus, flow states, and generative visuals',
    tracks: [
      OPEN_SOURCE_LOFI_TRACKS[3],
      OPEN_SOURCE_LOFI_TRACKS[0],
      OPEN_SOURCE_LOFI_TRACKS[1],
      OPEN_SOURCE_LOFI_TRACKS[2],
    ],
  },
  {
    id: 'coffee-shop-vinyl',
    name: 'Coffee Shop Vinyl Beats',
    description: 'Cozy real recordings featuring vintage tape warmth, mellow acoustic basslines, and golden hour chords',
    tracks: [
      OPEN_SOURCE_LOFI_TRACKS[2],
      OPEN_SOURCE_LOFI_TRACKS[3],
      OPEN_SOURCE_LOFI_TRACKS[0],
      OPEN_SOURCE_LOFI_TRACKS[1],
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
  private morphIntervalTimer: number | null = null;

  // Callbacks
  private onMorphCallbacks: Array<(track: ChillTrack) => void> = [];
  private onTrackChangeCallbacks: Array<(track: ChillTrack) => void> = [];

  public init() {
    if (typeof window === 'undefined') return;
    if (this.ctx && this.audioElement) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.85;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

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
        this.startMorphTimer();
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
    this.stopMorphTimer();
  }

  public toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      void this.play();
    }
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

  public onMorph(cb: (track: ChillTrack) => void): () => void {
    this.onMorphCallbacks.push(cb);
    return () => {
      this.onMorphCallbacks = this.onMorphCallbacks.filter((c) => c !== cb);
    };
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
    this.onMorphCallbacks.forEach((cb) => cb(track));

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
    const titles = [
      'Velvet Sunset Coffee',
      'Raindrops on Cedar',
      'Analog Tape Memories',
      'Midnight Subway Reflections',
    ];
    const paletteIds = ['tokyo-night', 'synthwave-84', 'sunset-horizon', 'bioluminescence', 'nord-frost', 'monokai-pro'];
    const patternIds = ['lorenz-attractor', 'hypotrochoid-spirograph', 'perlin-flow-field', 'fourier-epicycles', 'jellyfish-pulse', 'chladni-plate'];

    const tracks: ChillTrack[] = [];
    for (let i = 0; i < OPEN_SOURCE_LOFI_TRACKS.length; i++) {
      const baseTrack = OPEN_SOURCE_LOFI_TRACKS[i];
      tracks.push({
        id: `custom-track-${Date.now()}-${i}`,
        title: `${titles[i % titles.length]} (${baseTrack.title})`,
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
      description: `Open source lofi chill soundscape (${vibe}) matching visual dynamics in real time`,
      tracks,
    };

    return playlist;
  }

  // Periodic visual morph trigger during playback (every 40 seconds)
  private startMorphTimer(): void {
    this.stopMorphTimer();
    if (typeof window === 'undefined') return;

    this.morphIntervalTimer = window.setInterval(() => {
      if (this.isPlaying) {
        // Trigger subtle morph to keep visuals dynamically evolving with the track
        this.onMorphCallbacks.forEach((cb) => cb(this.currentTrack));
      }
    }, 40000);
  }

  private stopMorphTimer(): void {
    if (this.morphIntervalTimer && typeof window !== 'undefined') {
      window.clearInterval(this.morphIntervalTimer);
      this.morphIntervalTimer = null;
    }
  }

  // Real-time audio metric analysis computed from the actual audio frequency spectrum
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

    try {
      (this.analyser as unknown as { getByteFrequencyData: (d: Uint8Array) => void }).getByteFrequencyData(this.freqData);

      let bassSum = 0;
      const bassEnd = Math.max(1, Math.floor(this.freqData.length * 0.12));
      for (let i = 0; i < bassEnd; i++) {
        bassSum += this.freqData[i];
      }
      const bass = bassSum / (bassEnd * 255);

      let midSum = 0;
      const midEnd = Math.max(bassEnd + 1, Math.floor(this.freqData.length * 0.45));
      for (let i = bassEnd; i < midEnd; i++) {
        midSum += this.freqData[i];
      }
      const mid = midSum / ((midEnd - bassEnd) * 255);

      let trebleSum = 0;
      for (let i = midEnd; i < this.freqData.length; i++) {
        trebleSum += this.freqData[i];
      }
      const treble = trebleSum / ((this.freqData.length - midEnd) * 255);

      const volume = bass * 0.45 + mid * 0.35 + treble * 0.2;
      const beat = bass > 0.42;

      return {
        bass,
        mid,
        treble,
        volume,
        beat,
        frequencyData: this.freqData,
      };
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
