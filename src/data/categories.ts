/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PatternCategory } from '../types/visualizer';

export const PATTERN_CATEGORIES: PatternCategory[] = [
  {
    id: 'fractals',
    name: 'Fractals & Attractors',
    description: 'Chaotic dynamics, escape-time algorithms, and recursive geometry',
    iconName: 'Sparkles',
  },
  {
    id: 'spirographs',
    name: 'Sacred Spirographs',
    description: 'Harmonographs, roulette curves, polar roses, and phyllotaxis',
    iconName: 'Compass',
  },
  {
    id: 'cellular',
    name: 'Cellular Automata',
    description: 'Self-organizing discrete lattices, Wolfram rules, and emergent life',
    iconName: 'Grid3x3',
  },
  {
    id: 'physics',
    name: 'Waves & Harmonics',
    description: 'Cymatics, Lagrangian chaos, Fourier phasors, and quantum clouds',
    iconName: 'Activity',
  },
  {
    id: 'flows',
    name: 'Vector Fields & Fluids',
    description: 'Curl noise streams, strange attractors, and fluid vortices',
    iconName: 'Wind',
  },
  {
    id: 'turtle',
    name: 'Turtle & L-Systems',
    description: 'Algorithmic pen drawing, space-filling curves, and branching trees',
    iconName: 'Code2',
  },
  {
    id: 'optics',
    name: 'Computational Optics',
    description: 'Moiré fringes, Penrose aperiodic tiles, Voronoi, and 4D projections',
    iconName: 'Eye',
  },
  {
    id: 'nature',
    name: 'Organic Complex Systems',
    description: 'Reaction-diffusion, boid murmurations, and bio-inspired networks',
    iconName: 'Cpu',
  },
];
