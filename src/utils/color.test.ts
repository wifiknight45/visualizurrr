/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { hexToRgb, rgbToHex, lerpColor, samplePalette, toRgbaString } from './color';

test('hexToRgb correctly parses 6-digit hex values', () => {
  const rgb = hexToRgb('#ff8800');
  assert.equal(rgb.r, 255);
  assert.equal(rgb.g, 136);
  assert.equal(rgb.b, 0);
});

test('hexToRgb correctly parses 3-digit shorthand hex', () => {
  const rgb = hexToRgb('#f80');
  assert.equal(rgb.r, 255);
  assert.equal(rgb.g, 136);
  assert.equal(rgb.b, 0);
});

test('rgbToHex correctly converts bounds and values', () => {
  assert.equal(rgbToHex(255, 0, 128), '#ff0080');
  assert.equal(rgbToHex(0, 0, 0), '#000000');
  assert.equal(rgbToHex(300, -10, 255), '#ff00ff');
});

test('lerpColor smoothly blends midpoints', () => {
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 255, g: 255, b: 255 };
  const mid = lerpColor(black, white, 0.5);
  assert.equal(Math.round(mid.r), 128);
  assert.equal(Math.round(mid.g), 128);
  assert.equal(Math.round(mid.b), 128);
});

test('samplePalette wraps and samples accurately', () => {
  const palette = ['#000000', '#ffffff'];
  assert.equal(samplePalette(palette, 0), '#000000');
  assert.equal(samplePalette(palette, 1), '#000000'); // wrapped
  assert.equal(samplePalette(palette, 0.5), '#808080');
});

test('toRgbaString outputs valid CSS string', () => {
  const str = toRgbaString({ r: 50, g: 100, b: 200 }, 0.85);
  assert.equal(str, 'rgba(50, 100, 200, 0.850)');
});
