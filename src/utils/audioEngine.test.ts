/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CHILL_PLAYLISTS, audioEngine } from './audioEngine';

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
    }
  }
});

test('generateCustomPlaylist produces valid structured chill playlists', () => {
  const custom = audioEngine.generateCustomPlaylist('Midnight Rain Study', 'Lo-Fi Chill Hop', 74);
  assert.equal(custom.name, 'Midnight Rain Study');
  assert.ok(custom.tracks.length === 4);
  assert.ok(custom.tracks[0].bpm >= 60 && custom.tracks[0].bpm <= 90);
  assert.equal(custom.tracks[0].vibe, 'Lo-Fi Chill Hop');
});

test('volume bounds clamp safely between 0 and 1', () => {
  audioEngine.setVolume(1.5);
  assert.equal(audioEngine.getVolume(), 1.0);

  audioEngine.setVolume(-0.5);
  assert.equal(audioEngine.getVolume(), 0.0);

  audioEngine.setVolume(0.65);
  assert.equal(audioEngine.getVolume(), 0.65);
});

test('getMetrics returns safe zeroed metrics when audio context is inactive', () => {
  const metrics = audioEngine.getMetrics();
  assert.equal(typeof metrics.bass, 'number');
  assert.equal(typeof metrics.mid, 'number');
  assert.equal(typeof metrics.treble, 'number');
  assert.equal(typeof metrics.volume, 'number');
  assert.equal(typeof metrics.beat, 'boolean');
});
