/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { ALL_PATTERNS } from './index';
import type { RenderMode } from '../../types/visualizer';

const MODES: RenderMode[] = ['curves', 'particles', 'mesh', 'heatmap', 'neon', 'matrix'];

test('every pattern default is inside its slider range and matches defaultParameters', () => {
  for (const p of ALL_PATTERNS) {
    const seen = new Set<string>();
    for (const par of p.parameters) {
      assert.ok(
        par.defaultValue >= par.min && par.defaultValue <= par.max,
        `${p.id}: ${par.id} default ${par.defaultValue} outside [${par.min}, ${par.max}]`
      );
      assert.ok(!seen.has(par.id), `${p.id}: duplicate parameter ${par.id}`);
      seen.add(par.id);
      assert.equal(
        p.defaultParameters[par.id],
        par.defaultValue,
        `${p.id}: defaultParameters.${par.id} disagrees with the parameter default`
      );
    }
    for (const key of Object.keys(p.defaultParameters)) {
      assert.ok(seen.has(key), `${p.id}: defaultParameters has unknown key ${key}`);
    }
  }
});

/** A no-op canvas 2D context good enough to execute render functions. */
function makeStubCtx(): CanvasRenderingContext2D {
  const gradient = { addColorStop: () => {} };
  const target: Record<string, unknown> = {
    canvas: { width: 800, height: 600 },
    measureText: () => ({ width: 0 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    createPattern: () => null,
    getImageData: (_x: number, _y: number, w: number, h: number) => ({
      data: new Uint8ClampedArray(Math.max(0, w * h * 4)),
      width: w,
      height: h,
    }),
  };
  return new Proxy(target, {
    get(t, prop) {
      if (prop in t) return t[prop as string];
      return () => {};
    },
    set(t, prop, value) {
      t[prop as string] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
}

test('every pattern renders without throwing, in every render mode', () => {
  for (const p of ALL_PATTERNS) {
    for (const mode of MODES) {
      const ctx = makeStubCtx();
      for (const time of [0, 1.5]) {
        assert.doesNotThrow(() => {
          p.render({
            ctx,
            width: 800,
            height: 600,
            time,
            params: { ...p.defaultParameters },
            palette: {
              id: 'test',
              name: 'Test',
              colors: ['#000000', '#38bdf8', '#e879f9', '#ffffff'],
              background: '#050508',
              primary: '#38bdf8',
              secondary: '#818cf8',
              accent: '#e879f9',
              highlight: '#ffffff',
              category: 'Cyber & Neon',
            },
            mode,
            mouse: { x: 0, y: 0, isDown: false, hasInteracted: false },
            sampleColor: () => '#ffffff',
            frameCount: Math.round(time * 60),
            deltaTime: 1 / 60,
            audio: { bass: 0, mid: 0, treble: 0, volume: 0, beat: false },
          });
        }, `${p.id} threw in mode ${mode} at t=${time}`);
      }
    }
  }
});
