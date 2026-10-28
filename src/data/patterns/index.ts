/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PatternDefinition } from '../../types/visualizer';
import { FRACTAL_PATTERNS } from './fractals';
import { SPIROGRAPH_PATTERNS } from './spirographs';
import { CELLULAR_PATTERNS } from './cellular';
import { PHYSICS_PATTERNS } from './physics';
import { FLOW_PATTERNS } from './flows';
import { TURTLE_PATTERNS } from './turtle';
import { OPTICS_PATTERNS } from './optics';
import { NATURE_PATTERNS } from './nature';

export const ALL_PATTERNS: PatternDefinition[] = [
  ...FRACTAL_PATTERNS,
  ...SPIROGRAPH_PATTERNS,
  ...CELLULAR_PATTERNS,
  ...PHYSICS_PATTERNS,
  ...FLOW_PATTERNS,
  ...TURTLE_PATTERNS,
  ...OPTICS_PATTERNS,
  ...NATURE_PATTERNS,
];

export const PATTERN_MAP = new Map<string, PatternDefinition>(
  ALL_PATTERNS.map((p) => [p.id, p])
);

export function getPatternById(id: string): PatternDefinition {
  return PATTERN_MAP.get(id) || ALL_PATTERNS[0];
}

export function getPatternByIndex(index: number): PatternDefinition {
  const safeIdx = ((index % ALL_PATTERNS.length) + ALL_PATTERNS.length) % ALL_PATTERNS.length;
  return ALL_PATTERNS[safeIdx];
}
