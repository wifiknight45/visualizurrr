/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PatternDefinition } from '../../types/visualizer';
import { samplePaletteRgba } from '../../utils/color';

export const FRACTAL_PATTERNS: PatternDefinition[] = [
  {
    id: 'lorenz-attractor',
    number: 1,
    name: 'Lorenz Strange Attractor',
    category: 'fractals',
    subtitle: 'Chaotic atmospheric convection butterfly',
    formula: 'dx/dt = σ(y - x),  dy/dt = x(ρ - z) - y,  dz/dt = xy - βz',
    description: 'The canonical 3D strange attractor discovered by Edward Lorenz in 1963. Demonstrates deterministic chaos and the butterfly effect.',
    tags: ['Chaos', 'Differential Equations', '3D Projection', 'Attractor'],
    parameters: [
      { id: 'sigma', name: 'Prandtl Number (σ)', min: 5, max: 20, step: 0.5, defaultValue: 10 },
      { id: 'rho', name: 'Rayleigh Number (ρ)', min: 15, max: 45, step: 0.5, defaultValue: 28 },
      { id: 'beta', name: 'Geometric Factor (β)', min: 1, max: 5, step: 0.1, defaultValue: 2.667 },
      { id: 'stepCount', name: 'Trajectory Points', min: 1000, max: 6000, step: 500, defaultValue: 3500 },
    ],
    defaultParameters: { sigma: 10, rho: 28, beta: 2.667, stepCount: 3500 },
    pythonCode: (params, paletteName) => `"""
Lorenz Strange Attractor Visualizer
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint

sigma = ${params.sigma}
rho = ${params.rho}
beta = ${params.beta}

def lorenz(state, t):
    x, y, z = state
    dx = sigma * (y - x)
    dy = x * (rho - z) - y
    dz = x * y - beta * z
    return [dx, dy, dz]

t = np.linspace(0, 40, ${params.stepCount})
state0 = [0.1, 0.0, 0.0]
states = odeint(lorenz, state0, t)

fig = plt.figure(figsize=(10, 8), facecolor='#090a15')
ax = fig.add_subplot(111, projection='3d', facecolor='#090a15')
ax.plot(states[:, 0], states[:, 1], states[:, 2], lw=0.6, color='#00f0ff')
ax.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mouse } = ctx;
      const sigma = params.sigma ?? 10;
      const rho = params.rho ?? 28;
      const beta = params.beta ?? 2.667;
      const stepCount = Math.min(params.stepCount ?? 3500, 4500);

      const rotY = time * 0.4 + (mouse.hasInteracted ? (mouse.x / width - 0.5) * 4 : 0);
      const rotX = 0.35 + (mouse.hasInteracted ? (mouse.y / height - 0.5) * 2 : 0);

      const dt = 0.009;
      let x = 0.1;
      let y = 1.0;
      let z = 1.0;

      const scale = Math.min(width, height) * 0.017;
      const cx = width / 2;
      const cy = height / 2 + scale * 18;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      c.lineWidth = 1.2;

      let prevPx = 0;
      let prevPy = 0;

      for (let i = 0; i < stepCount; i++) {
        const dx = sigma * (y - x) * dt;
        const dy = (x * (rho - z) - y) * dt;
        const dz = (x * y - beta * z) * dt;
        x += dx;
        y += dy;
        z += dz;

        // 3D rotation
        const rx = x * cosY - y * sinY;
        const ry = (x * sinY + y * cosY) * cosX - (z - 25) * sinX;
        const rz = (x * sinY + y * cosY) * sinX + (z - 25) * cosX;

        const fov = 350;
        const pz = fov / (fov + rz * scale);
        const px = cx + rx * scale * pz;
        const py = cy - ry * scale * pz;

        if (i > 1) {
          c.beginPath();
          c.moveTo(prevPx, prevPy);
          c.lineTo(px, py);
          const tColor = (i / stepCount + time * 0.05) % 1;
          c.strokeStyle = sampleColor(tColor);
          c.stroke();
        }
        prevPx = px;
        prevPy = py;
      }
    },
  },
  {
    id: 'mandelbrot-set',
    number: 2,
    name: 'Mandelbrot Boundary Explorer',
    category: 'fractals',
    subtitle: 'Escape-time quadratic polynomial mapping',
    formula: 'z_{n+1} = z_n^2 + c,  |z| ≤ 2',
    description: 'The hallmark fractal discovered by Benoît Mandelbrot. Renders escape-time contours with dynamic zoom and continuous harmonic coloring.',
    tags: ['Fractal', 'Complex Numbers', 'Escape Time'],
    parameters: [
      { id: 'maxIter', name: 'Max Iterations', min: 20, max: 120, step: 5, defaultValue: 60 },
      { id: 'zoomLevel', name: 'Zoom Depth', min: 0.5, max: 4, step: 0.1, defaultValue: 1.2 },
      { id: 'colorCycle', name: 'Color Frequency', min: 1, max: 8, step: 0.5, defaultValue: 3 },
    ],
    defaultParameters: { maxIter: 60, zoomLevel: 1.2, colorCycle: 3 },
    pythonCode: (params, paletteName) => `"""
Mandelbrot Fractal Generator
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

w, h = 800, 600
max_iter = ${params.maxIter}
zoom = ${params.zoomLevel}

x = np.linspace(-2.0 / zoom - 0.5, 0.8 / zoom - 0.5, w)
y = np.linspace(-1.2 / zoom, 1.2 / zoom, h)
X, Y = np.meshgrid(x, y)
C = X + 1j * Y
Z = np.zeros_like(C)
fractal = np.zeros(C.shape, dtype=int)

for i in range(max_iter):
    mask = np.abs(Z) <= 2
    Z[mask] = Z[mask]**2 + C[mask]
    fractal += mask

plt.figure(figsize=(10, 7), facecolor='#090a15')
plt.imshow(fractal, cmap='plasma', extent=[-2, 1, -1.2, 1.2])
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const maxIter = Math.floor(params.maxIter ?? 60);
      const zoom = (params.zoomLevel ?? 1.2) * (1 + 0.3 * Math.sin(time * 0.4));
      const freq = params.colorCycle ?? 3;

      const step = 4; // grid step for performance
      const cols = Math.floor(width / step);
      const rows = Math.floor(height / step);

      const targetX = -0.743643887037158704752191506114774;
      const targetY = 0.131825904205311970493132056385139;
      const baseZoom = 1.8 / zoom;

      for (let y = 0; y < rows; y++) {
        const cy0 = ((y - rows / 2) / (rows / 2)) * baseZoom + (1 - 1 / zoom) * targetY;
        for (let x = 0; x < cols; x++) {
          const cx0 = ((x - cols / 2) / (cols / 2)) * baseZoom + (1 - 1 / zoom) * targetX;

          let zx = 0;
          let zy = 0;
          let iter = 0;

          while (zx * zx + zy * zy <= 4 && iter < maxIter) {
            const tmp = zx * zx - zy * zy + cx0;
            zy = 2 * zx * zy + cy0;
            zx = tmp;
            iter++;
          }

          if (iter < maxIter) {
            const nu = Math.log(Math.log(zx * zx + zy * zy) / 2) / Math.log(2);
            const smoothIter = iter + 1 - nu;
            const tColor = ((smoothIter * freq * 0.02) + time * 0.1) % 1;
            c.fillStyle = sampleColor(tColor);
            c.fillRect(x * step, y * step, step, step);
          }
        }
      }
    },
  },
  {
    id: 'julia-set',
    number: 3,
    name: 'Dynamic Julia Set Morph',
    category: 'fractals',
    subtitle: 'Holomorphic dynamic invariant set',
    formula: 'z_{n+1} = z_n^2 + c,  c = c_r + i·c_i (continuous orbital orbit)',
    description: 'A continuous Julia set animated through complex parameter space. Creates mesmerizing swirling cosmic dendrites.',
    tags: ['Fractal', 'Complex Dynamics', 'Morphing'],
    parameters: [
      { id: 'maxIter', name: 'Max Iterations', min: 20, max: 100, step: 5, defaultValue: 50 },
      { id: 'radius', name: 'Orbit Radius', min: 0.4, max: 0.9, step: 0.05, defaultValue: 0.7885 },
      { id: 'speed', name: 'Orbit Frequency', min: 0.2, max: 2, step: 0.1, defaultValue: 0.8 },
    ],
    defaultParameters: { maxIter: 50, radius: 0.7885, speed: 0.8 },
    pythonCode: (params, paletteName) => `"""
Animated Julia Set in Python
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

max_iter = ${params.maxIter}
r = ${params.radius}
t = 0.5
c_const = complex(r * np.cos(t), r * np.sin(t))

w, h = 600, 600
x = np.linspace(-1.5, 1.5, w)
y = np.linspace(-1.5, 1.5, h)
X, Y = np.meshgrid(x, y)
Z = X + 1j * Y
julia = np.zeros(Z.shape, dtype=int)

for i in range(max_iter):
    mask = np.abs(Z) <= 2
    Z[mask] = Z[mask]**2 + c_const
    julia += mask

plt.imshow(julia, cmap='inferno')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mouse } = ctx;
      const maxIter = Math.floor(params.maxIter ?? 50);
      const rad = params.radius ?? 0.7885;
      const orbitSpeed = (params.speed ?? 0.8) * 0.3;

      const angle = time * orbitSpeed + (mouse.hasInteracted ? (mouse.x / width) * Math.PI : 0);
      const cr = rad * Math.cos(angle);
      const ci = rad * Math.sin(angle);

      const step = 4;
      const cols = Math.floor(width / step);
      const rows = Math.floor(height / step);

      for (let y = 0; y < rows; y++) {
        const zy0 = ((y - rows / 2) / (rows / 2)) * 1.5;
        for (let x = 0; x < cols; x++) {
          let zx = ((x - cols / 2) / (cols / 2)) * 1.5;
          let zy = zy0;
          let iter = 0;

          while (zx * zx + zy * zy <= 4 && iter < maxIter) {
            const tmp = zx * zx - zy * zy + cr;
            zy = 2 * zx * zy + ci;
            zx = tmp;
            iter++;
          }

          if (iter < maxIter) {
            const tColor = (iter / maxIter * 2.5 + time * 0.05) % 1;
            c.fillStyle = sampleColor(tColor);
            c.fillRect(x * step, y * step, step, step);
          }
        }
      }
    },
  },
  {
    id: 'barnsley-fern',
    number: 4,
    name: 'Barnsley Fractal Fern',
    category: 'fractals',
    subtitle: 'Self-affine Iterated Function System (IFS)',
    formula: 'x_{n+1} = a x_n + b y_n + e,  y_{n+1} = c x_n + d y_n + f',
    description: 'Michael Barnsley’s self-affine fern generated with four affine stochastic transformations mimicking natural plant morphogenesis.',
    tags: ['IFS', 'Morphogenesis', 'Botany', 'Fractals'],
    parameters: [
      { id: 'points', name: 'Fern Points', min: 2000, max: 20000, step: 2000, defaultValue: 10000 },
      { id: 'curl', name: 'Wind Wave Curl', min: -0.15, max: 0.15, step: 0.01, defaultValue: 0.04 },
    ],
    defaultParameters: { points: 10000, curl: 0.04 },
    pythonCode: (params, paletteName) => `"""
Barnsley Fern IFS in Python
Palette: ${paletteName}
"""
import random
import matplotlib.pyplot as plt

n = ${params.points}
x, y = 0.0, 0.0
pts_x, pts_y = [], []

for _ in range(n):
    r = random.random()
    if r < 0.01:
        x, y = 0.0, 0.16 * y
    elif r < 0.86:
        x, y = 0.85 * x + 0.04 * y, -0.04 * x + 0.85 * y + 1.6
    elif r < 0.93:
        x, y = 0.2 * x - 0.26 * y, 0.23 * x + 0.22 * y + 1.6
    else:
        x, y = -0.15 * x + 0.28 * y, 0.26 * x + 0.24 * y + 0.44
    pts_x.append(x)
    pts_y.append(y)

plt.figure(figsize=(8, 10), facecolor='#090a15')
plt.scatter(pts_x, pts_y, s=0.2, c=pts_y, cmap='viridis')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const count = Math.min(params.points ?? 10000, 16000);
      const wind = (params.curl ?? 0.04) * Math.sin(time * 2);

      let x = 0;
      let y = 0;

      const scale = Math.min(width, height) * 0.085;
      const cx = width / 2;
      const cy = height * 0.95;

      for (let i = 0; i < count; i++) {
        const r = Math.random();
        let nx: number, ny: number;

        if (r < 0.01) {
          nx = 0;
          ny = 0.16 * y;
        } else if (r < 0.86) {
          nx = 0.85 * x + (0.04 + wind) * y;
          ny = -0.04 * x + 0.85 * y + 1.6;
        } else if (r < 0.93) {
          nx = 0.2 * x - 0.26 * y;
          ny = 0.23 * x + 0.22 * y + 1.6;
        } else {
          nx = -0.15 * x + 0.28 * y;
          ny = 0.26 * x + 0.24 * y + 0.44;
        }

        x = nx;
        y = ny;

        const px = cx + x * scale;
        const py = cy - y * scale;

        c.fillStyle = sampleColor(y / 10);
        c.fillRect(px, py, 1.5, 1.5);
      }
    },
  },
  {
    id: 'sierpinski-carpet',
    number: 5,
    name: 'Sierpinski Recursive Matrix',
    category: 'fractals',
    subtitle: 'Iterative Hausdorff self-similar subdivision',
    formula: 'N(r) = 8^k,  D = log(8)/log(3) ≈ 1.8928',
    description: 'Sierpinski recursive fractal showing dynamic geometric nesting, harmonic scaling, and dimensional self-similarity.',
    tags: ['Fractal', 'Recursion', 'Hausdorff Dimension'],
    parameters: [
      { id: 'depth', name: 'Recursion Depth', min: 2, max: 5, step: 1, defaultValue: 4 },
      { id: 'rotSpeed', name: 'Rotation Speed', min: 0, max: 2, step: 0.1, defaultValue: 0.3 },
    ],
    defaultParameters: { depth: 4, rotSpeed: 0.3 },
    pythonCode: (params, paletteName) => `"""
Sierpinski Carpet Generator
Palette: ${paletteName}
"""
import matplotlib.pyplot as plt
import matplotlib.patches as patches

depth = ${params.depth}
fig, ax = plt.subplots(figsize=(8, 8), facecolor='#090a15')

def carpet(x, y, size, d):
    if d == 0:
        return
    s = size / 3.0
    rect = patches.Rectangle((x + s, y + s), s, s, color='#38bdf8')
    ax.add_patch(rect)
    for i in range(3):
        for j in range(3):
            if i != 1 or j != 1:
                carpet(x + i*s, y + j*s, s, d - 1)

carpet(0, 0, 1, depth)
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const depth = Math.min(Math.floor(params.depth ?? 4), 5);
      const rot = time * (params.rotSpeed ?? 0.3);

      const size = Math.min(width, height) * 0.75;
      const cx = width / 2;
      const cy = height / 2;

      c.save();
      c.translate(cx, cy);
      c.rotate(rot);

      function drawCarpet(x: number, y: number, s: number, d: number) {
        if (d === 0) return;
        const sub = s / 3;
        // Central hole
        c.fillStyle = sampleColor(d / depth);
        c.fillRect(x + sub - s / 2, y + sub - s / 2, sub, sub);

        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            if (i !== 1 || j !== 1) {
              drawCarpet(x + i * sub, y + j * sub, sub, d - 1);
            }
          }
        }
      }

      c.strokeStyle = sampleColor(0.9);
      c.strokeRect(-size / 2, -size / 2, size, size);
      drawCarpet(0, 0, size, depth);
      c.restore();
    },
  },
  {
    id: 'rossler-attractor',
    number: 6,
    name: 'Rössler Spiral Ribbon',
    category: 'fractals',
    subtitle: 'Continuous-time spiral chaos band',
    formula: 'dx/dt = -y - z,  dy/dt = x + a·y,  dz/dt = b + z(x - c)',
    description: 'Otto Rössler designed this attractor in 1976 for simpler mathematical analysis of chaotic dynamics. Forms a folded spiral ribbon.',
    tags: ['Attractor', 'Chaos', 'Ribbon', 'Differential Equations'],
    parameters: [
      { id: 'a', name: 'Parameter a', min: 0.1, max: 0.3, step: 0.01, defaultValue: 0.2 },
      { id: 'b', name: 'Parameter b', min: 0.1, max: 0.4, step: 0.01, defaultValue: 0.2 },
      { id: 'c', name: 'Parameter c', min: 4.0, max: 8.0, step: 0.2, defaultValue: 5.7 },
      { id: 'steps', name: 'Ribbon Steps', min: 1000, max: 5000, step: 500, defaultValue: 3000 },
    ],
    defaultParameters: { a: 0.2, b: 0.2, c: 5.7, steps: 3000 },
    pythonCode: (params, paletteName) => `"""
Rössler Chaotic Attractor
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint

a = ${params.a}
b = ${params.b}
c_val = ${params.c}

def rossler(state, t):
    x, y, z = state
    return [-y - z, x + a * y, b + z * (x - c_val)]

t = np.linspace(0, 100, ${params.steps})
states = odeint(rossler, [0.1, 0.0, 0.0], t)

plt.figure(figsize=(9, 9), facecolor='#090a15')
plt.plot(states[:, 0], states[:, 1], lw=0.6, color='#ff0080')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const a = params.a ?? 0.2;
      const b = params.b ?? 0.2;
      const cVal = params.c ?? 5.7;
      const steps = Math.min(params.steps ?? 3000, 4000);

      const dt = 0.025;
      let x = 0.1;
      let y = 0.0;
      let z = 0.0;

      const scale = Math.min(width, height) * 0.028;
      const cx = width / 2;
      const cy = height / 2;

      const rot = time * 0.5;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      c.lineWidth = 1.3;
      let prevPx = 0, prevPy = 0;

      for (let i = 0; i < steps; i++) {
        const dx = (-y - z) * dt;
        const dy = (x + a * y) * dt;
        const dz = (b + z * (x - cVal)) * dt;
        x += dx;
        y += dy;
        z += dz;

        const rx = x * cosR - y * sinR;
        const ry = (x * sinR + y * cosR) * 0.8 - z * 0.3;

        const px = cx + rx * scale;
        const py = cy + ry * scale;

        if (i > 2) {
          c.beginPath();
          c.moveTo(prevPx, prevPy);
          c.lineTo(px, py);
          c.strokeStyle = sampleColor((i / steps + time * 0.1) % 1);
          c.stroke();
        }
        prevPx = px;
        prevPy = py;
      }
    },
  },
  {
    id: 'dragon-curve',
    number: 7,
    name: 'Heighway Dragon Fractal',
    category: 'fractals',
    subtitle: 'Recursive paper-folding boundary',
    formula: 'f_1(z) = (1+i)z/2,  f_2(z) = 1 - (1-i)z/2',
    description: 'The iconic Heighway dragon curve generated by recursively folding paper strips in half and unfolding at 90-degree angles.',
    tags: ['Paper Fold', 'Fractal', 'Boundary', 'Recursion'],
    parameters: [
      { id: 'iterations', name: 'Folding Iterations', min: 8, max: 14, step: 1, defaultValue: 12 },
      { id: 'scale', name: 'Display Scale', min: 1, max: 5, step: 0.2, defaultValue: 3.2 },
    ],
    defaultParameters: { iterations: 12, scale: 3.2 },
    pythonCode: (params, paletteName) => `"""
Heighway Dragon Curve in Python
Palette: ${paletteName}
"""
import turtle

def dragon(level):
    seq = [1]
    for _ in range(level - 1):
        seq = seq + [1] + [-x for x in reversed(seq)]
    return seq

seq = dragon(${params.iterations})
t = turtle.Turtle()
t.speed(0)
for turn in seq:
    t.forward(4)
    t.right(turn * 90)
turtle.done()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const iters = Math.min(Math.floor(params.iterations ?? 12), 13);
      const stepLen = (params.scale ?? 3.2) * 1.5;

      // Build turn sequence
      let turns: number[] = [1];
      for (let i = 1; i < iters; i++) {
        const rev = turns.slice().reverse().map(t => -t);
        turns = turns.concat([1], rev);
      }

      let curX = width * 0.35;
      let curY = height * 0.45;
      let dir = (time * 0.2) % (Math.PI * 2);

      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(curX, curY);

      for (let i = 0; i < turns.length; i++) {
        dir += (turns[i] * Math.PI) / 2;
        curX += Math.cos(dir) * stepLen;
        curY += Math.sin(dir) * stepLen;
        c.lineTo(curX, curY);

        if (i % 60 === 0 || i === turns.length - 1) {
          c.strokeStyle = sampleColor((i / turns.length + time * 0.1) % 1);
          c.stroke();
          c.beginPath();
          c.moveTo(curX, curY);
        }
      }
    },
  },
  {
    id: 'apollonian-gasket',
    number: 8,
    name: 'Apollonian Kissing Circles',
    category: 'fractals',
    subtitle: 'Descartes osculating circle theorem',
    formula: '(k_1 + k_2 + k_3 + k_4)^2 = 2(k_1^2 + k_2^2 + k_3^2 + k_4^2)',
    description: 'A fractal packing of mutually tangent osculating circles, satisfying Descartes theorem on reciprocal radii curvatures.',
    tags: ['Circles', 'Descartes Theorem', 'Geometry', 'Fractal'],
    parameters: [
      { id: 'depth', name: 'Packing Generations', min: 2, max: 5, step: 1, defaultValue: 4 },
      { id: 'pulsing', name: 'Breathing Amplitude', min: 0, max: 0.3, step: 0.05, defaultValue: 0.12 },
    ],
    defaultParameters: { depth: 4, pulsing: 0.12 },
    pythonCode: (params, paletteName) => `"""
Apollonian Circle Packing
Palette: ${paletteName}
"""
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 8), facecolor='#090a15')
# Curvature k = 1/r
def draw_circle(x, y, r, color):
    c = plt.Circle((x, y), r, fill=False, color=color, lw=1.2)
    ax.add_patch(c)

draw_circle(0, 0, 1.0, '#38bdf8')
draw_circle(0, 0.5, 0.5, '#ec4899')
draw_circle(0, -0.5, 0.5, '#ec4899')
ax.set_xlim(-1.1, 1.1)
ax.set_ylim(-1.1, 1.1)
ax.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const depth = Math.min(Math.floor(params.depth ?? 4), 5);
      const pulse = (params.pulsing ?? 0.12) * Math.sin(time * 2);

      const R = Math.min(width, height) * 0.42 * (1 + pulse);
      const cx = width / 2;
      const cy = height / 2;

      function drawApollonian(x: number, y: number, r: number, d: number) {
        if (d <= 0 || r < 3) return;
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.strokeStyle = sampleColor(d / depth);
        c.lineWidth = Math.max(1, d * 0.6);
        c.stroke();

        // 3 interior tangent circles
        const subR = r / (1 + 2 / Math.sqrt(3));
        const dist = r - subR;
        for (let i = 0; i < 3; i++) {
          const ang = (i * Math.PI * 2) / 3 + time * 0.2;
          const sx = x + Math.cos(ang) * dist;
          const sy = y + Math.sin(ang) * dist;
          drawApollonian(sx, sy, subR, d - 1);
        }
      }

      drawApollonian(cx, cy, R, depth);
    },
  },
];
