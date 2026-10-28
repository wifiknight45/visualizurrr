/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PatternDefinition } from '../../types/visualizer';

export const CELLULAR_PATTERNS: PatternDefinition[] = [
  {
    id: 'game-of-life',
    number: 17,
    name: 'Conway’s Game of Life',
    category: 'cellular',
    subtitle: 'Zero-player cellular life simulator',
    formula: 'B3/S23 (Born on 3 neighbors, Survives on 2 or 3)',
    description: 'John Conway’s 1970 invention showing how complex emergent structures (gliders, pulsars, oscillators) arise from four simple local rules.',
    tags: ['Emergence', 'Turing Complete', 'Simulation', 'Cellular Automata'],
    parameters: [
      { id: 'density', name: 'Initial Seed Density', min: 0.1, max: 0.6, step: 0.05, defaultValue: 0.25 },
      { id: 'cellSize', name: 'Cell Pixel Size', min: 4, max: 16, step: 2, defaultValue: 8 },
    ],
    defaultParameters: { density: 0.25, cellSize: 8 },
    pythonCode: (params, paletteName) => `"""
Conway's Game of Life in Python
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

N = 100
grid = np.random.choice([0, 1], size=(N, N), p=[${1 - params.density}, ${params.density}])

def update(frameNum, img, grid, N):
    newGrid = grid.copy()
    for i in range(N):
        for j in range(N):
            total = int((grid[i, (j-1)%N] + grid[i, (j+1)%N] +
                         grid[(i-1)%N, j] + grid[(i+1)%N, j] +
                         grid[(i-1)%N, (j-1)%N] + grid[(i-1)%N, (j+1)%N] +
                         grid[(i+1)%N, (j-1)%N] + grid[(i+1)%N, (j+1)%N]))
            if grid[i, j] == 1:
                if (total < 2) or (total > 3):
                    newGrid[i, j] = 0
            else:
                if total == 3:
                    newGrid[i, j] = 1
    img.set_data(newGrid)
    grid[:] = newGrid[:]
    return img,

fig, ax = plt.subplots(facecolor='#090a15')
img = ax.imshow(grid, cmap='viridis', interpolation='nearest')
plt.axis('off')
plt.show()`,
    render: (() => {
      let grid: Uint8Array | null = null;
      let ageGrid: Uint8Array | null = null;
      let gW = 0, gH = 0;
      let lastStepTime = 0;

      return (ctx) => {
        const { ctx: c, width, height, time, params, sampleColor, mouse } = ctx;
        const cellSize = Math.floor(params.cellSize ?? 8);
        const density = params.density ?? 0.25;

        const cols = Math.floor(width / cellSize);
        const rows = Math.floor(height / cellSize);

        if (!grid || gW !== cols || gH !== rows) {
          gW = cols;
          gH = rows;
          grid = new Uint8Array(gW * gH);
          ageGrid = new Uint8Array(gW * gH);
          for (let i = 0; i < grid.length; i++) {
            if (Math.random() < density) {
              grid[i] = 1;
              ageGrid[i] = 1;
            }
          }
        }

        // Mouse inject
        if (mouse.isDown && mouse.x > 0 && mouse.y > 0) {
          const mx = Math.floor(mouse.x / cellSize);
          const my = Math.floor(mouse.y / cellSize);
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const nx = (mx + dx + gW) % gW;
              const ny = (my + dy + gH) % gH;
              grid[ny * gW + nx] = 1;
            }
          }
        }

        // Step simulation every 60ms
        if (time - lastStepTime > 0.06) {
          lastStepTime = time;
          const next = new Uint8Array(gW * gH);
          for (let y = 0; y < gH; y++) {
            for (let x = 0; x < gW; x++) {
              let neighbors = 0;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = (x + dx + gW) % gW;
                  const ny = (y + dy + gH) % gH;
                  neighbors += grid[ny * gW + nx];
                }
              }

              const idx = y * gW + x;
              const alive = grid[idx];
              if (alive && (neighbors === 2 || neighbors === 3)) {
                next[idx] = 1;
                if (ageGrid![idx] < 50) ageGrid![idx]++;
              } else if (!alive && neighbors === 3) {
                next[idx] = 1;
                ageGrid![idx] = 1;
              } else {
                next[idx] = 0;
                ageGrid![idx] = 0;
              }
            }
          }
          grid = next;
        }

        // Render cells
        for (let y = 0; y < gH; y++) {
          for (let x = 0; x < gW; x++) {
            const idx = y * gW + x;
            if (grid[idx]) {
              const age = ageGrid ? ageGrid[idx] : 1;
              c.fillStyle = sampleColor(Math.min(1, age / 30));
              c.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
            }
          }
        }
      };
    })(),
  },
  {
    id: 'wolfram-rule-30',
    number: 18,
    name: 'Wolfram Rule 30 Chaos Automaton',
    category: 'cellular',
    subtitle: 'Aperiodic pseudorandom pyramid',
    formula: 'c_{i}^{t+1} = p \\oplus (q \\lor r), \\quad \\text{Rule 30 binary } (00011110_2)',
    description: 'Stephen Wolfram’s foundational Rule 30 elementary automaton generating irreducible chaos and randomness from a single active seed cell.',
    tags: ['Wolfram', 'Chaos', 'Pseudorandom', 'Elementary CA'],
    parameters: [
      { id: 'scale', name: 'Pixel Resolution', min: 2, max: 8, step: 1, defaultValue: 3 },
    ],
    defaultParameters: { scale: 3 },
    pythonCode: (params, paletteName) => `"""
Wolfram Rule 30 in Python
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

rule = 30
steps = 200
width = 2 * steps + 1
ca = np.zeros((steps, width), dtype=int)
ca[0, width // 2] = 1

for t in range(1, steps):
    for i in range(1, width - 1):
        triplet = (ca[t-1, i-1] << 2) | (ca[t-1, i] << 1) | ca[t-1, i+1]
        ca[t, i] = (rule >> triplet) & 1

plt.figure(figsize=(10, 6), facecolor='#090a15')
plt.imshow(ca, cmap='binary', interpolation='nearest')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const s = Math.max(2, Math.floor(params.scale ?? 3));
      const cols = Math.floor(width / s);
      const rows = Math.floor(height / s);

      const rule = 30;
      let row = new Uint8Array(cols);
      row[Math.floor(cols / 2)] = 1;

      for (let y = 0; y < rows; y++) {
        const next = new Uint8Array(cols);
        for (let x = 0; x < cols; x++) {
          if (row[x]) {
            c.fillStyle = sampleColor((y / rows + time * 0.05) % 1);
            c.fillRect(x * s, y * s, s, s);
          }
          const left = x > 0 ? row[x - 1] : 0;
          const self = row[x];
          const right = x < cols - 1 ? row[x + 1] : 0;
          const pattern = (left << 2) | (self << 1) | right;
          next[x] = (rule >> pattern) & 1;
        }
        row = next;
      }
    },
  },
  {
    id: 'wolfram-rule-90',
    number: 19,
    name: 'Wolfram Rule 90 Sierpinski CA',
    category: 'cellular',
    subtitle: 'Elementary XOR Sierpinski triangle',
    formula: 'c_i^{t+1} = c_{i-1}^t \\oplus c_{i+1}^t, \\quad \\text{Rule 90 binary } (01011010_2)',
    description: 'Rule 90 acts as a pure binary XOR sum of neighboring cells, recursively reproducing the exact Pascal / Sierpinski fractal lattice.',
    tags: ['Wolfram', 'XOR', 'Sierpinski', 'Fractal'],
    parameters: [
      { id: 'scale', name: 'Cell Resolution', min: 2, max: 8, step: 1, defaultValue: 3 },
    ],
    defaultParameters: { scale: 3 },
    pythonCode: (params, paletteName) => `"""
Wolfram Rule 90 (Sierpinski)
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

steps = 250
width = 2 * steps + 1
ca = np.zeros((steps, width), dtype=int)
ca[0, width // 2] = 1

for t in range(1, steps):
    ca[t, 1:-1] = np.bitwise_xor(ca[t-1, :-2], ca[t-1, 2:])

plt.figure(figsize=(10, 6), facecolor='#090a15')
plt.imshow(ca, cmap='magma', interpolation='nearest')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const s = Math.max(2, Math.floor(params.scale ?? 3));
      const cols = Math.floor(width / s);
      const rows = Math.floor(height / s);

      const rule = 90;
      let row = new Uint8Array(cols);
      row[Math.floor(cols / 2)] = 1;

      for (let y = 0; y < rows; y++) {
        const next = new Uint8Array(cols);
        for (let x = 0; x < cols; x++) {
          if (row[x]) {
            c.fillStyle = sampleColor((y / rows + time * 0.08) % 1);
            c.fillRect(x * s, y * s, s, s);
          }
          const left = x > 0 ? row[x - 1] : 0;
          const self = row[x];
          const right = x < cols - 1 ? row[x + 1] : 0;
          const pattern = (left << 2) | (self << 1) | right;
          next[x] = (rule >> pattern) & 1;
        }
        row = next;
      }
    },
  },
  {
    id: 'wolfram-rule-110',
    number: 20,
    name: 'Wolfram Rule 110 Universal Computer',
    category: 'cellular',
    subtitle: 'Proven Turing-complete 1D discrete universe',
    formula: 'c_i^{t+1} = \\text{Rule 110 binary } (01101110_2)',
    description: 'Proved by Matthew Cook to be Turing complete. Glider collisions and localized particle wave packets enable universal computation.',
    tags: ['Wolfram', 'Turing Complete', 'Computation', 'Cellular Automata'],
    parameters: [
      { id: 'scale', name: 'Cell Resolution', min: 2, max: 6, step: 1, defaultValue: 3 },
    ],
    defaultParameters: { scale: 3 },
    pythonCode: (params, paletteName) => `"""
Wolfram Rule 110 (Turing Complete)
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

rule = 110
steps = 200
width = steps * 2
ca = np.zeros((steps, width), dtype=int)
ca[0, width - 10] = 1

for t in range(1, steps):
    for i in range(1, width - 1):
        triplet = (ca[t-1, i-1] << 2) | (ca[t-1, i] << 1) | ca[t-1, i+1]
        ca[t, i] = (rule >> triplet) & 1

plt.imshow(ca, cmap='plasma')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const s = Math.max(2, Math.floor(params.scale ?? 3));
      const cols = Math.floor(width / s);
      const rows = Math.floor(height / s);

      const rule = 110;
      let row = new Uint8Array(cols);
      row[cols - 5] = 1;

      for (let y = 0; y < rows; y++) {
        const next = new Uint8Array(cols);
        for (let x = 0; x < cols; x++) {
          if (row[x]) {
            c.fillStyle = sampleColor((y / rows + time * 0.05) % 1);
            c.fillRect(x * s, y * s, s, s);
          }
          const left = x > 0 ? row[x - 1] : 0;
          const self = row[x];
          const right = x < cols - 1 ? row[x + 1] : 0;
          const pattern = (left << 2) | (self << 1) | right;
          next[x] = (rule >> pattern) & 1;
        }
        row = next;
      }
    },
  },
  {
    id: 'langtons-ant',
    number: 21,
    name: 'Langton’s Ant Emergent Highway',
    category: 'cellular',
    subtitle: 'Turing machine building diagonal highway',
    formula: '\\text{White cell: turn 90° right, invert cell} \\quad | \\quad \\text{Black: turn 90° left, invert}',
    description: 'Christopher Langton’s 2D universal Turing machine. Exhibits apparent chaotic pseudo-randomness for ~10,000 steps before suddenly forming a recurring diagonal highway.',
    tags: ['Turing Machine', 'Emergence', 'Highway', 'Simulation'],
    parameters: [
      { id: 'stepsPerFrame', name: 'Steps Per Frame', min: 50, max: 500, step: 50, defaultValue: 200 },
      { id: 'gridScale', name: 'Grid Resolution', min: 3, max: 8, step: 1, defaultValue: 4 },
    ],
    defaultParameters: { stepsPerFrame: 200, gridScale: 4 },
    pythonCode: (params, paletteName) => `"""
Langton's Ant Simulation
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

N = 120
grid = np.zeros((N, N), dtype=int)
x, y = N // 2, N // 2
dx, dy = 0, -1

for _ in range(11000):
    if grid[y, x] == 0:
        grid[y, x] = 1
        dx, dy = -dy, dx # Turn right
    else:
        grid[y, x] = 0
        dx, dy = dy, -dx # Turn left
    x = (x + dx) % N
    y = (y + dy) % N

plt.imshow(grid, cmap='viridis')
plt.axis('off')
plt.show()`,
    render: (() => {
      let grid: Uint8Array | null = null;
      let antX = 0, antY = 0, antDir = 0; // 0=N, 1=E, 2=S, 3=W
      let gW = 0, gH = 0;

      return (ctx) => {
        const { ctx: c, width, height, time, params, sampleColor } = ctx;
        const s = Math.max(2, Math.floor(params.gridScale ?? 4));
        const steps = Math.min(params.stepsPerFrame ?? 200, 600);
        const cols = Math.floor(width / s);
        const rows = Math.floor(height / s);

        if (!grid || gW !== cols || gH !== rows) {
          gW = cols;
          gH = rows;
          grid = new Uint8Array(gW * gH);
          antX = Math.floor(gW / 2);
          antY = Math.floor(gH / 2);
          antDir = 0;
        }

        const dirs = [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ];

        // Step simulation
        for (let i = 0; i < steps; i++) {
          const idx = antY * gW + antX;
          const state = grid[idx];
          if (state === 0) {
            antDir = (antDir + 1) % 4; // Turn right
            grid[idx] = 1;
          } else {
            antDir = (antDir + 3) % 4; // Turn left
            grid[idx] = 0;
          }
          antX = (antX + dirs[antDir][0] + gW) % gW;
          antY = (antY + dirs[antDir][1] + gH) % gH;
        }

        // Render active cells
        for (let y = 0; y < gH; y++) {
          for (let x = 0; x < gW; x++) {
            if (grid[y * gW + x] === 1) {
              const dist = Math.sqrt((x - gW / 2) ** 2 + (y - gH / 2) ** 2);
              c.fillStyle = sampleColor((dist / (gW * 0.5) + time * 0.05) % 1);
              c.fillRect(x * s, y * s, s, s);
            }
          }
        }

        // Draw ant position marker
        c.fillStyle = sampleColor(0.95);
        c.fillRect(antX * s, antY * s, s + 2, s + 2);
      };
    })(),
  },
  {
    id: 'forest-fire',
    number: 22,
    name: 'Drossel-Schwabl Forest Fire Percolation',
    category: 'cellular',
    subtitle: 'Self-organized criticality percolation',
    formula: 'p = \\text{growth prob}, \\quad f = \\text{lightning strike prob}',
    description: 'A classic model of self-organized criticality. Trees grow, fire propagates to immediate neighbors, and sporadic lightning strikes initiate dynamic fractal burning waves.',
    tags: ['Percolation', 'Criticality', 'Physics', 'Simulation'],
    parameters: [
      { id: 'treeGrowth', name: 'Tree Growth Rate (p)', min: 0.005, max: 0.04, step: 0.005, defaultValue: 0.015 },
      { id: 'lightning', name: 'Lightning Rate (f)', min: 0.0001, max: 0.001, step: 0.0001, defaultValue: 0.0003 },
    ],
    defaultParameters: { treeGrowth: 0.015, lightning: 0.0003 },
    pythonCode: (params, paletteName) => `"""
Forest Fire Percolation Model
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

EMPTY, TREE, BURNING = 0, 1, 2
N = 100
grid = np.random.choice([EMPTY, TREE], size=(N, N), p=[0.4, 0.6])
p = ${params.treeGrowth}
f = ${params.lightning}

# Simulation step
new_grid = grid.copy()
for i in range(N):
    for j in range(N):
        if grid[i, j] == BURNING:
            new_grid[i, j] = EMPTY
        elif grid[i, j] == TREE:
            if BURNING in [grid[(i+1)%N, j], grid[(i-1)%N, j], grid[i, (j+1)%N], grid[i, (j-1)%N]]:
                new_grid[i, j] = BURNING
            elif np.random.rand() < f:
                new_grid[i, j] = BURNING
        elif grid[i, j] == EMPTY and np.random.rand() < p:
            new_grid[i, j] = TREE

plt.imshow(grid, cmap='inferno')
plt.axis('off')
plt.show()`,
    render: (() => {
      let grid: Uint8Array | null = null;
      let gW = 0, gH = 0;
      const s = 4;

      return (ctx) => {
        const { ctx: c, width, height, params, sampleColor } = ctx;
        const p = params.treeGrowth ?? 0.015;
        const f = params.lightning ?? 0.0003;
        const cols = Math.floor(width / s);
        const rows = Math.floor(height / s);

        if (!grid || gW !== cols || gH !== rows) {
          gW = cols;
          gH = rows;
          grid = new Uint8Array(gW * gH);
          for (let i = 0; i < grid.length; i++) {
            grid[i] = Math.random() < 0.5 ? 1 : 0; // 0=empty, 1=tree, 2=burning
          }
        }

        const next = new Uint8Array(gW * gH);
        for (let y = 0; y < gH; y++) {
          for (let x = 0; x < gW; x++) {
            const idx = y * gW + x;
            const state = grid[idx];

            if (state === 2) {
              next[idx] = 0; // burn to ashes
            } else if (state === 1) {
              // check if neighbor is burning
              let fire = false;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = (x + dx + gW) % gW;
                  const ny = (y + dy + gH) % gH;
                  if (grid[ny * gW + nx] === 2) {
                    fire = true;
                    break;
                  }
                }
                if (fire) break;
              }
              if (fire || Math.random() < f) {
                next[idx] = 2; // ignite
              } else {
                next[idx] = 1;
              }
            } else {
              // empty
              next[idx] = Math.random() < p ? 1 : 0;
            }
          }
        }
        grid = next;

        // Render
        for (let y = 0; y < gH; y++) {
          for (let x = 0; x < gW; x++) {
            const state = grid[y * gW + x];
            if (state === 1) {
              c.fillStyle = sampleColor(0.35); // tree
              c.fillRect(x * s, y * s, s, s);
            } else if (state === 2) {
              c.fillStyle = sampleColor(0.85); // fire
              c.fillRect(x * s, y * s, s, s);
            }
          }
        }
      };
    })(),
  },
  {
    id: 'brians-brain',
    number: 23,
    name: 'Brian’s Brain Excitable Lattice',
    category: 'cellular',
    subtitle: '3-state neural pulse oscillator',
    formula: 'Ready \\xrightarrow{\\text{2 active neighbors}} Active \\rightarrow Dying \\rightarrow Ready',
    description: 'Brian Silverman’s 1989 cellular automaton simulating neural action potentials. Gliders and explosive spark wavefronts proliferate continuously.',
    tags: ['Neural', 'Excitable Medium', 'Oscillator', 'Cellular'],
    parameters: [
      { id: 'scale', name: 'Grid Resolution', min: 3, max: 8, step: 1, defaultValue: 5 },
    ],
    defaultParameters: { scale: 5 },
    pythonCode: (params, paletteName) => `"""
Brian's Brain Neural CA
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

READY, ACTIVE, DYING = 0, 1, 2
N = 100
grid = np.random.choice([READY, ACTIVE], size=(N, N), p=[0.8, 0.2])

new_grid = grid.copy()
for i in range(N):
    for j in range(N):
        if grid[i, j] == ACTIVE:
            new_grid[i, j] = DYING
        elif grid[i, j] == DYING:
            new_grid[i, j] = READY
        else: # READY
            active_nbrs = sum(grid[(i+di)%N, (j+dj)%N] == ACTIVE for di in (-1,0,1) for dj in (-1,0,1) if (di,dj)!=(0,0))
            if active_nbrs == 2:
                new_grid[i, j] = ACTIVE

plt.imshow(grid, cmap='cool')
plt.axis('off')
plt.show()`,
    render: (() => {
      let grid: Uint8Array | null = null;
      let gW = 0, gH = 0;

      return (ctx) => {
        const { ctx: c, width, height, params, sampleColor } = ctx;
        const s = Math.max(3, Math.floor(params.scale ?? 5));
        const cols = Math.floor(width / s);
        const rows = Math.floor(height / s);

        if (!grid || gW !== cols || gH !== rows) {
          gW = cols;
          gH = rows;
          grid = new Uint8Array(gW * gH);
          for (let i = 0; i < grid.length; i++) {
            grid[i] = Math.random() < 0.15 ? 1 : 0;
          }
        }

        const next = new Uint8Array(gW * gH);
        for (let y = 0; y < gH; y++) {
          for (let x = 0; x < gW; x++) {
            const idx = y * gW + x;
            const state = grid[idx];
            if (state === 1) {
              next[idx] = 2; // active -> dying
            } else if (state === 2) {
              next[idx] = 0; // dying -> ready
            } else {
              // ready: activates if exactly 2 neighbors are active
              let activeNbrs = 0;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  if (dx === 0 && dy === 0) continue;
                  const nx = (x + dx + gW) % gW;
                  const ny = (y + dy + gH) % gH;
                  if (grid[ny * gW + nx] === 1) activeNbrs++;
                }
              }
              next[idx] = activeNbrs === 2 ? 1 : 0;
            }
          }
        }
        grid = next;

        for (let y = 0; y < gH; y++) {
          for (let x = 0; x < gW; x++) {
            const st = grid[y * gW + x];
            if (st === 1) {
              c.fillStyle = sampleColor(0.85); // active flash
              c.fillRect(x * s, y * s, s, s);
            } else if (st === 2) {
              c.fillStyle = sampleColor(0.3); // dying afterglow
              c.fillRect(x * s, y * s, s, s);
            }
          }
        }
      };
    })(),
  },
  {
    id: 'cyclic-ca',
    number: 24,
    name: 'Cyclic Cellular Automaton (David Griffeath)',
    category: 'cellular',
    subtitle: 'Self-organizing spiraling crystal wavefronts',
    formula: 's_{i,j}^{t+1} = (s_{i,j} + 1) \\pmod K \\quad \\text{if } (s_{i,j} + 1) \\pmod K \\in \\text{neighborhood}',
    description: 'Invented by David Griffeath. Multiple states chase each other in a cyclic ring, precipitating hypnotic rotating spiral pinwheels across the lattice.',
    tags: ['Cyclic CA', 'Spiral Wave', 'Crystallization', 'Automata'],
    parameters: [
      { id: 'states', name: 'Color States (K)', min: 6, max: 16, step: 1, defaultValue: 10 },
      { id: 'threshold', name: 'Consensus Threshold', min: 1, max: 3, step: 1, defaultValue: 1 },
    ],
    defaultParameters: { states: 10, threshold: 1 },
    pythonCode: (params, paletteName) => `"""
Cyclic Cellular Automaton
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

K = ${params.states}
N = 100
grid = np.random.randint(0, K, size=(N, N))

def step(grid):
    next_grid = grid.copy()
    for y in range(N):
        for x in range(N):
            target = (grid[y, x] + 1) % K
            nbrs = [grid[(y+dy)%N, (x+dx)%N] for dy in (-1,0,1) for dx in (-1,0,1) if (dx,dy)!=(0,0)]
            if nbrs.count(target) >= ${params.threshold}:
                next_grid[y, x] = target
    return next_grid

plt.imshow(grid, cmap='hsv')
plt.axis('off')
plt.show()`,
    render: (() => {
      let grid: Uint8Array | null = null;
      let gW = 0, gH = 0;
      const s = 4;

      return (ctx) => {
        const { ctx: c, width, height, params, sampleColor } = ctx;
        const K = Math.floor(params.states ?? 10);
        const threshold = Math.floor(params.threshold ?? 1);
        const cols = Math.floor(width / s);
        const rows = Math.floor(height / s);

        if (!grid || gW !== cols || gH !== rows) {
          gW = cols;
          gH = rows;
          grid = new Uint8Array(gW * gH);
          for (let i = 0; i < grid.length; i++) {
            grid[i] = Math.floor(Math.random() * K);
          }
        }

        const next = new Uint8Array(gW * gH);
        for (let y = 0; y < gH; y++) {
          for (let x = 0; x < gW; x++) {
            const idx = y * gW + x;
            const current = grid[idx];
            const target = (current + 1) % K;

            let count = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = (x + dx + gW) % gW;
                const ny = (y + dy + gH) % gH;
                if (grid[ny * gW + nx] === target) {
                  count++;
                }
              }
            }

            next[idx] = count >= threshold ? target : current;
          }
        }
        grid = next;

        for (let y = 0; y < gH; y++) {
          for (let x = 0; x < gW; x++) {
            const state = grid[y * gW + x];
            c.fillStyle = sampleColor(state / K);
            c.fillRect(x * s, y * s, s, s);
          }
        }
      };
    })(),
  },
];
