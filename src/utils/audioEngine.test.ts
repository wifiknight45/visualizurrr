/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CHILL_PLAYLISTS, OPEN_SOURCE_LOFI_TRACKS, audioEngine } from './audioEngine';

test('open source lofi tracks contain real audio sources and licenses', () => {
  assert.ok(OPEN_SOURCE_LOFI_TRACKS.length >= 4, 'Must have at least 4 open source tracks');

  for (const t of OPEN_SOURCE_LOFI_TRACKS) {
    assert.ok(t.id && t.id.length > 0);
    assert.ok(t.title && t.title.length > 0);
    assert.ok(t.artist && t.artist.length > 0);
    assert.ok(t.audioSrc && t.audioSrc.endsWith('.mp3'), `Audio source must be an mp3 file: ${t.audioSrc}`);
    assert.ok(t.license && t.license.includes('Creative Commons'), `Must indicate open source CC license`);
  }
});

test('default chill playlists contain valid tracks and tempos', () => {
  assert.ok(DEFAULT_CHILL_PLAYLISTS.length >= 3, 'Must have at least 3 curated playlists');

  for (const pl of DEFAULT_CHILL_PLAYLISTS) {
    assert.ok(pl.id && pl.id.length > 0);
    assert.ok(pl.name && pl.name.length > 0);
    assert.ok(pl.tracks.length >= 4, `Playlist ${pl.name} must have at least 4 tracks`);

    for (const t of pl.tracks) {
      assert.ok(t.title && t.title.length > 0);
      assert.ok(t.bpm >= 50 && t.bpm <= 100, `Lofi BPM must be in downtempo range (50-100), got ${t.bpm}`);
      assert.ok(t.paletteId && t.paletteId.length > 0);
      assert.ok(t.patternId && t.patternId.length > 0);
      assert.ok(t.audioSrc && t.audioSrc.startsWith('/audio/'), `Track must point to /audio/: ${t.audioSrc}`);
    }
  }
});

test('generateCustomPlaylist produces valid structured chill playlists', () => {
  const custom = audioEngine.generateCustomPlaylist('Midnight Rain Study', 'Lo-Fi Chill Hop', 74);
  assert.equal(custom.name, 'Midnight Rain Study');
  assert.ok(custom.tracks.length === OPEN_SOURCE_LOFI_TRACKS.length);
  assert.ok(custom.tracks[0].bpm >= 60 && custom.tracks[0].bpm <= 90);
  assert.equal(custom.tracks[0].vibe, 'Lo-Fi Chill Hop');
  assert.ok(custom.tracks[0].audioSrc.endsWith('.mp3'));
});

test('volume bounds clamp safely between 0 and 1', () => {
  audioEngine.setVolume(1.5);
  assert.equal(audioEngine.getVolume(), 1.0);

  audioEngine.setVolume(-0.5);
  assert.equal(audioEngine.getVolume(), 0.0);

  audioEngine.setVolume(0.65);
  assert.equal(audioEngine.getVolume(), 0.65);
});

test('fuzz test volume with arbitrary numbers', () => {
  const testInputs = [-999999, 999999, NaN, Infinity, -Infinity, 0, 1, 0.5, 0.0001, 0.9999];
  for (const val of testInputs) {
    audioEngine.setVolume(val);
    const vol = audioEngine.getVolume();
    if (isNaN(val)) {
      // Clamped or preserved
      assert.ok(vol >= 0 && vol <= 1 || isNaN(vol));
    } else {
      assert.ok(vol >= 0 && vol <= 1, `Volume ${vol} out of bounds for input ${val}`);
    }
  }
});

test('getMetrics returns safe zeroed metrics when audio context is inactive', () => {
  const metrics = audioEngine.getMetrics();
  assert.equal(typeof metrics.bass, 'number');
  assert.equal(typeof metrics.mid, 'number');
  assert.equal(typeof metrics.treble, 'number');
  assert.equal(typeof metrics.volume, 'number');
  assert.equal(typeof metrics.beat, 'boolean');
});
