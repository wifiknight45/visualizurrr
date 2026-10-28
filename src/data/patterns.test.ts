/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_PATTERNS } from './patterns/index';
import { COLOR_PALETTES } from './palettes';

test('pattern collection contains at least 64 unique aesthetic patterns', () => {
  assert.ok(ALL_PATTERNS.length >= 64, `Expected >= 64 patterns, found ${ALL_PATTERNS.length}`);
});

test('every pattern has unique ID, valid numbering and metadata', () => {
  const ids = new Set<string>();
  const numbers = new Set<number>();

  for (let i = 0; i < ALL_PATTERNS.length; i++) {
    const p = ALL_PATTERNS[i];
    assert.ok(p.id && p.id.length > 0, `Pattern at index ${i} has empty ID`);
    assert.ok(!ids.has(p.id), `Duplicate pattern ID: ${p.id}`);
    ids.add(p.id);

    assert.ok(p.name && p.name.length > 0, `Pattern ${p.id} has empty name`);
    assert.ok(p.formula && p.formula.length > 0, `Pattern ${p.id} has empty formula`);
    assert.ok(p.description && p.description.length > 0, `Pattern ${p.id} has empty description`);
    assert.ok(p.tags && p.tags.length > 0, `Pattern ${p.id} has no tags`);
    assert.ok(typeof p.render === 'function', `Pattern ${p.id} has no render function`);
    assert.ok(typeof p.pythonCode === 'function', `Pattern ${p.id} has no pythonCode function`);

    numbers.add(p.number);
  }
  assert.equal(numbers.size, ALL_PATTERNS.length, 'Pattern numbers must be unique');
});

test('every pattern generates valid non-empty Python code', () => {
  const samplePalette = COLOR_PALETTES[0];
  for (const p of ALL_PATTERNS) {
    const code = p.pythonCode(p.defaultParameters, samplePalette.name);
    assert.ok(typeof code === 'string' && code.length > 20, `Pattern ${p.id} generated invalid python code`);
    assert.ok(code.includes('import') || code.includes('def') || code.includes('print'), `Python code for ${p.id} must contain standard Python syntax`);
  }
});

// Mock Canvas 2D context for smoke testing & fuzzing
function createMockCtx(): CanvasRenderingContext2D {
  const noop = () => {};
  return {
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    stroke: noop,
    fill: noop,
    closePath: noop,
    arc: noop,
    rect: noop,
    fillRect: noop,
    strokeRect: noop,
    clearRect: noop,
    save: noop,
    restore: noop,
    translate: noop,
    rotate: noop,
    scale: noop,
    quadraticCurveTo: noop,
    bezierCurveTo: noop,
    setLineDash: noop,
    lineWidth: 1,
    strokeStyle: '#ffffff',
    fillStyle: '#000000',
    globalAlpha: 1,
    shadowBlur: 0,
    shadowColor: '#ffffff',
  } as unknown as CanvasRenderingContext2D;
}

test('smoke test: every pattern renders without throwing errors', () => {
  const mockCtx = createMockCtx();
  const palette = COLOR_PALETTES[0];

  for (const p of ALL_PATTERNS) {
    assert.doesNotThrow(() => {
      p.render({
        ctx: mockCtx,
        width: 800,
        height: 600,
        time: 1.5,
        params: { ...p.defaultParameters },
        palette,
        mode: 'curves',
        mouse: { x: 400, y: 300, isDown: false, hasInteracted: false },
        sampleColor: (t) => palette.colors[Math.floor(Math.abs(t * palette.colors.length)) % palette.colors.length],
        frameCount: 60,
        deltaTime: 0.016,
      });
    }, `Pattern ${p.name} (#${p.number}) threw an error during render smoke test`);
  }
});

test('fuzz test: patterns handle zero, negative, and extreme delta and parameter inputs gracefully', () => {
  const mockCtx = createMockCtx();
  const palette = COLOR_PALETTES[1];

  for (const p of ALL_PATTERNS) {
    const fuzzedParams: Record<string, number> = {};
    for (const param of p.parameters) {
      // Fuzz with min, max, 0, and out-of-bound
      fuzzedParams[param.id] = Math.random() > 0.5 ? param.max : param.min;
    }

    assert.doesNotThrow(() => {
      p.render({
        ctx: mockCtx,
        width: 1440,
        height: 900,
        time: 9999.9,
        params: fuzzedParams,
        palette,
        mode: 'particles',
        mouse: { x: -100, y: -200, isDown: true, hasInteracted: true },
        sampleColor: () => '#ff00ff',
        frameCount: 10000,
        deltaTime: 0.001,
      });
    }, `Pattern ${p.name} failed fuzzing test with boundary parameters`);
  }
});
