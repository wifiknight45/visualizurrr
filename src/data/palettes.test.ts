/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { COLOR_PALETTES } from './palettes';
import { hexToRgb } from '../utils/color';

test('palette collection contains at least 22 unique palettes', () => {
  assert.ok(COLOR_PALETTES.length >= 22, `Expected >= 22 palettes, got ${COLOR_PALETTES.length}`);
});

test('every palette has a unique id and non-empty name', () => {
  const ids = new Set<string>();
  const names = new Set<string>();

  for (const p of COLOR_PALETTES) {
    assert.ok(p.id && p.id.length > 0, 'Palette id must not be empty');
    assert.ok(p.name && p.name.length > 0, 'Palette name must not be empty');
    assert.ok(!ids.has(p.id), `Duplicate palette ID: ${p.id}`);
    assert.ok(!names.has(p.name), `Duplicate palette name: ${p.name}`);
    ids.add(p.id);
    names.add(p.name);
  }
});

test('every palette has valid hex colors and background', () => {
  const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  for (const p of COLOR_PALETTES) {
    assert.match(p.background, hexPattern, `Invalid background hex in ${p.name}`);
    assert.match(p.primary, hexPattern, `Invalid primary hex in ${p.name}`);
    assert.match(p.secondary, hexPattern, `Invalid secondary hex in ${p.name}`);
    assert.match(p.accent, hexPattern, `Invalid accent hex in ${p.name}`);
    assert.match(p.highlight, hexPattern, `Invalid highlight hex in ${p.name}`);
    assert.ok(p.colors.length >= 4, `Palette ${p.name} must have at least 4 colors in gradient array`);

    for (const c of p.colors) {
      assert.match(c, hexPattern, `Invalid color entry ${c} in ${p.name}`);
      const rgb = hexToRgb(c);
      assert.ok(rgb.r >= 0 && rgb.r <= 255);
      assert.ok(rgb.g >= 0 && rgb.g <= 255);
      assert.ok(rgb.b >= 0 && rgb.b <= 255);
    }
  }
});
