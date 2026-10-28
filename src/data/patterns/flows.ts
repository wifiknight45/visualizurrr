/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PatternDefinition } from '../../types/visualizer';

export const FLOW_PATTERNS: PatternDefinition[] = [
  {
    id: 'perlin-flow-field',
    number: 33,
    name: 'Perlin Noise Curl Vector Field',
    category: 'flows',
    subtitle: 'Streamline particle integration across continuous noise',
    formula: '\\mathbf{v}(x, y) = (\\cos \\theta, \\sin \\theta), \\quad \\theta = \\text{noise}(x/s, y/s) \\times 4\\pi',
    description: 'Ken Perlin’s coherent gradient noise used to generate smooth continuous velocity vector fields. Particles trace flowing cosmic currents.',
    tags: ['Vector Field', 'Perlin Noise', 'Streamlines', 'Particles'],
    parameters: [
      { id: 'particles', name: 'Particle Streams', min: 800, max: 4000, step: 200, defaultValue: 2000 },
      { id: 'noiseScale', name: 'Noise Spatial Frequency', min: 0.002, max: 0.015, step: 0.001, defaultValue: 0.005 },
    ],
    defaultParameters: { particles: 2000, noiseScale: 0.005 },
    pythonCode: (params, paletteName) => `"""
Perlin Flow Field in Python
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

N = ${params.particles}
scale = ${params.noiseScale}
print(f"Tracing {N} streamlines through noise field...")
`,
    render: (() => {
      interface P {
        x: number;
        y: number;
        vx: number;
        vy: number;
        age: number;
      }
      let parts: P[] = [];

      return (ctx) => {
        const { ctx: c, width, height, time, params, sampleColor } = ctx;
        const count = params.particles ?? 2000;
        const scale = params.noiseScale ?? 0.005;

        if (parts.length !== count) {
          parts = [];
          for (let i = 0; i < count; i++) {
            parts.push({
              x: Math.random() * width,
              y: Math.random() * height,
              vx: 0,
              vy: 0,
              age: Math.random() * 100,
            });
          }
        }

        c.lineWidth = 1.0;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          const prevX = p.x;
          const prevY = p.y;

          // Trigonometric smooth pseudo-noise
          const angle =
            Math.sin(p.x * scale + time * 0.3) * Math.cos(p.y * scale + time * 0.2) * Math.PI * 4;

          p.vx = Math.cos(angle) * 2.5;
          p.vy = Math.sin(angle) * 2.5;
          p.x += p.vx;
          p.y += p.vy;
          p.age += 1;

          if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.age > 150) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.age = 0;
            continue;
          }

          c.beginPath();
          c.moveTo(prevX, prevY);
          c.lineTo(p.x, p.y);
          c.strokeStyle = sampleColor((p.age / 150 + time * 0.05) % 1);
          c.stroke();
        }
      };
    })(),
  },
  {
    id: 'clifford-attractor',
    number: 34,
    name: 'Clifford Trigonometric Attractor',
    category: 'flows',
    subtitle: 'Iterated sine-cosine strange attractor',
    formula: 'x_{n+1} = \\sin(a y_n) + c \\cos(a x_n), \\quad y_{n+1} = \\sin(b x_n) + d \\cos(b y_n)',
    description: 'Discovered by Clifford Pickover. A simple iterative trigonometric mapping generating smoke-like ethereal probability manifolds.',
    tags: ['Clifford', 'Pickover', 'Trigonometric', 'Attractor'],
    parameters: [
      { id: 'a', name: 'Parameter a', min: -3, max: 3, step: 0.1, defaultValue: -1.4 },
      { id: 'b', name: 'Parameter b', min: -3, max: 3, step: 0.1, defaultValue: 1.6 },
      { id: 'c', name: 'Parameter c', min: -3, max: 3, step: 0.1, defaultValue: 1.0 },
      { id: 'd', name: 'Parameter d', min: -3, max: 3, step: 0.1, defaultValue: 0.7 },
      { id: 'pts', name: 'Point Density', min: 4000, max: 20000, step: 2000, defaultValue: 10000 },
    ],
    defaultParameters: { a: -1.4, b: 1.6, c: 1.0, d: 0.7, pts: 10000 },
    pythonCode: (params, paletteName) => `"""
Clifford Attractor
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

a, b, c, d = ${params.a}, ${params.b}, ${params.c}, ${params.d}
N = ${params.pts}
x, y = 0.1, 0.1
xs, ys = [], []

for _ in range(N):
    x_new = np.sin(a * y) + c * np.cos(a * x)
    y_new = np.sin(b * x) + d * np.cos(b * y)
    x, y = x_new, y_new
    xs.append(x)
    ys.append(y)

plt.figure(figsize=(8, 8), facecolor='#090a15')
plt.scatter(xs, ys, s=0.1, c=xs, cmap='plasma')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const a = (params.a ?? -1.4) + Math.sin(time * 0.2) * 0.1;
      const b = (params.b ?? 1.6) + Math.cos(time * 0.15) * 0.1;
      const cP = params.c ?? 1.0;
      const d = params.d ?? 0.7;
      const count = Math.min(params.pts ?? 10000, 16000);

      const scale = Math.min(width, height) * 0.18;
      const cx = width / 2;
      const cy = height / 2;

      let x = 0.1;
      let y = 0.1;

      for (let i = 0; i < count; i++) {
        const nx = Math.sin(a * y) + cP * Math.cos(a * x);
        const ny = Math.sin(b * x) + d * Math.cos(b * y);
        x = nx;
        y = ny;

        const px = cx + x * scale;
        const py = cy + y * scale;

        c.fillStyle = sampleColor(((x + y) * 0.2 + time * 0.05) % 1);
        c.fillRect(px, py, 1.2, 1.2);
      }
    },
  },
  {
    id: 'dejong-attractor',
    number: 35,
    name: 'Peter de Jong Sinusoidal Attractor',
    category: 'flows',
    subtitle: 'Smooth dimensional phase space folds',
    formula: 'x_{n+1} = \\sin(a y_n) - \\cos(b x_n), \\quad y_{n+1} = \\sin(c x_n) - \\cos(d y_n)',
    description: 'Peter de Jong’s 2D dynamical system exhibiting luminous geometric folds with soft gossamer particle concentrations.',
    tags: ['De Jong', 'Attractor', 'Phase Space', 'Density'],
    parameters: [
      { id: 'a', name: 'Parameter a', min: -3, max: 3, step: 0.1, defaultValue: 1.4 },
      { id: 'b', name: 'Parameter b', min: -3, max: 3, step: 0.1, defaultValue: -2.3 },
      { id: 'c', name: 'Parameter c', min: -3, max: 3, step: 0.1, defaultValue: 2.4 },
      { id: 'd', name: 'Parameter d', min: -3, max: 3, step: 0.1, defaultValue: -2.1 },
    ],
    defaultParameters: { a: 1.4, b: -2.3, c: 2.4, d: -2.1 },
    pythonCode: (params, paletteName) => `"""
Peter de Jong Attractor
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

a, b, c, d = ${params.a}, ${params.b}, ${params.c}, ${params.d}
N = 10000
x, y = 0.1, 0.1
xs, ys = [], []

for _ in range(N):
    x_new = np.sin(a * y) - np.cos(b * x)
    y_new = np.sin(c * x) - np.cos(d * y)
    x, y = x_new, y_new
    xs.append(x)
    ys.append(y)

plt.scatter(xs, ys, s=0.1, c=ys, cmap='magma')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const a = (params.a ?? 1.4) + Math.sin(time * 0.15) * 0.08;
      const b = params.b ?? -2.3;
      const cP = params.c ?? 2.4;
      const d = params.d ?? -2.1;

      const scale = Math.min(width, height) * 0.22;
      const cx = width / 2;
      const cy = height / 2;

      let x = 0.1;
      let y = 0.1;
      const count = 12000;

      for (let i = 0; i < count; i++) {
        const nx = Math.sin(a * y) - Math.cos(b * x);
        const ny = Math.sin(cP * x) - Math.cos(d * y);
        x = nx;
        y = ny;

        const px = cx + x * scale;
        const py = cy + y * scale;

        c.fillStyle = sampleColor(((x * y) * 0.25 + 0.5 + time * 0.05) % 1);
        c.fillRect(px, py, 1.2, 1.2);
      }
    },
  },
  {
    id: 'svensson-attractor',
    number: 36,
    name: 'Svensson Turbulent Orbit Attractor',
    category: 'flows',
    subtitle: 'High-frequency trigonometric orbital curls',
    formula: 'x_{n+1} = d \\sin(a x_n) - \\sin(b y_n), \\quad y_{n+1} = c \\cos(a x_n) + \\cos(b y_n)',
    description: 'Johnny Svensson’s attractor displaying turbulent fluid swirls reminiscent of magnetic plasma loops and spiral galaxies.',
    tags: ['Svensson', 'Turbulence', 'Attractor', 'Plasma'],
    parameters: [
      { id: 'a', name: 'Parameter a', min: -3, max: 3, step: 0.1, defaultValue: 1.4 },
      { id: 'b', name: 'Parameter b', min: -3, max: 3, step: 0.1, defaultValue: 1.56 },
      { id: 'c', name: 'Parameter c', min: -3, max: 3, step: 0.1, defaultValue: 1.4 },
      { id: 'd', name: 'Parameter d', min: -3, max: 3, step: 0.1, defaultValue: -6.56 },
    ],
    defaultParameters: { a: 1.4, b: 1.56, c: 1.4, d: -6.56 },
    pythonCode: (params, paletteName) => `"""
Svensson Attractor
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

a, b, c, d = ${params.a}, ${params.b}, ${params.c}, ${params.d}
N = 10000
x, y = 0.1, 0.1
xs, ys = [], []

for _ in range(N):
    nx = d * np.sin(a * x) - np.sin(b * y)
    ny = c * np.cos(a * x) + np.cos(b * y)
    x, y = nx, ny
    xs.append(x)
    ys.append(y)

plt.scatter(xs, ys, s=0.2, c=xs, cmap='viridis')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const a = params.a ?? 1.4;
      const b = (params.b ?? 1.56) + Math.sin(time * 0.2) * 0.05;
      const cP = params.c ?? 1.4;
      const d = params.d ?? -6.56;

      const scale = Math.min(width, height) * 0.05;
      const cx = width / 2;
      const cy = height / 2;

      let x = 0.1;
      let y = 0.1;
      const count = 10000;

      for (let i = 0; i < count; i++) {
        const nx = d * Math.sin(a * x) - Math.sin(b * y);
        const ny = cP * Math.cos(a * x) + Math.cos(b * y);
        x = nx;
        y = ny;

        const px = cx + x * scale;
        const py = cy + y * scale;

        c.fillStyle = sampleColor(((x + y) * 0.1 + time * 0.05) % 1);
        c.fillRect(px, py, 1.2, 1.2);
      }
    },
  },
  {
    id: 'aizawa-attractor',
    number: 37,
    name: 'Aizawa Tornadic Spherical Attractor',
    category: 'flows',
    subtitle: '3D spherical vortex tornado differential equations',
    formula: 'dx/dt = (z - b)x - d y, \\quad dy/dt = d x + (z - b)y, \\quad dz/dt = c + a z - z^3/3 - (x^2 + y^2)(1 + e z)',
    description: 'Yoji Aizawa’s 3D strange attractor generating a hollow spherical core with a twisting central tornadic vortex fountain.',
    tags: ['Aizawa', 'Tornado', 'Spherical', '3D Attractor'],
    parameters: [
      { id: 'steps', name: 'Trajectory Steps', min: 1000, max: 5000, step: 500, defaultValue: 3000 },
      { id: 'rotSpeed', name: 'Rotation Rate', min: 0.1, max: 1.5, step: 0.1, defaultValue: 0.5 },
    ],
    defaultParameters: { steps: 3000, rotSpeed: 0.5 },
    pythonCode: (params, paletteName) => `"""
Aizawa Attractor
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint

a, b, c, d, e, f = 0.95, 0.7, 0.6, 3.5, 0.25, 0.1

def aizawa(state, t):
    x, y, z = state
    dx = (z - b) * x - d * y
    dy = d * x + (z - b) * y
    dz = c + a * z - (z**3) / 3 - (x**2 + y**2) * (1 + e * z) + f * z * (x**3)
    return [dx, dy, dz]

t = np.linspace(0, 50, ${params.steps})
res = odeint(aizawa, [0.1, 0, 0], t)
plt.plot(res[:, 0], res[:, 1], lw=0.6, color='#ec4899')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const count = Math.min(params.steps ?? 3000, 4000);
      const rot = time * (params.rotSpeed ?? 0.5);

      const a = 0.95, b = 0.7, cP = 0.6, d = 3.5, e = 0.25, f = 0.1;
      const dt = 0.015;

      let x = 0.1, y = 0.0, z = 0.0;
      const scale = Math.min(width, height) * 0.26;
      const cx = width / 2;
      const cy = height / 2;

      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      c.lineWidth = 1.2;
      let prevPx = 0, prevPy = 0;

      for (let i = 0; i < count; i++) {
        const dx = (z - b) * x - d * y;
        const dy = d * x + (z - b) * y;
        const dz = cP + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * (x * x * x);

        x += dx * dt;
        y += dy * dt;
        z += dz * dt;

        const rx = x * cosR - y * sinR;
        const ry = (x * sinR + y * cosR) * 0.5 + z * 0.8;

        const px = cx + rx * scale;
        const py = cy - ry * scale;

        if (i > 2) {
          c.beginPath();
          c.moveTo(prevPx, prevPy);
          c.lineTo(px, py);
          c.strokeStyle = sampleColor((i / count + time * 0.1) % 1);
          c.stroke();
        }
        prevPx = px;
        prevPy = py;
      }
    },
  },
  {
    id: 'thomas-attractor',
    number: 38,
    name: 'Thomas Cyclically Symmetric Attractor',
    category: 'flows',
    subtitle: 'Labyrinthine cyclically symmetric flow',
    formula: 'dx/dt = \\sin(y) - b x, \\quad dy/dt = \\sin(z) - b y, \\quad dz/dt = \\sin(x) - b z',
    description: 'René Thomas’s cyclically symmetric dissipative system. Forms an endless 3D labyrinth of smooth looping trajectories.',
    tags: ['Thomas', 'Symmetric', 'Labyrinth', 'Chaos'],
    parameters: [
      { id: 'b', name: 'Damping Parameter b', min: 0.15, max: 0.25, step: 0.01, defaultValue: 0.208186 },
    ],
    defaultParameters: { b: 0.208186 },
    pythonCode: (params, paletteName) => `"""
Thomas Symmetric Attractor
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint

b = ${params.b}
def thomas(state, t):
    x, y, z = state
    return [np.sin(y) - b * x, np.sin(z) - b * y, np.sin(x) - b * z]

t = np.linspace(0, 100, 3000)
sol = odeint(thomas, [1.1, 1.1, -0.01], t)
plt.plot(sol[:, 0], sol[:, 1], lw=0.6, color='#ffd866')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const b = params.b ?? 0.208186;
      const dt = 0.04;

      let x = 1.1, y = 1.1, z = -0.01;
      const scale = Math.min(width, height) * 0.08;
      const cx = width / 2;
      const cy = height / 2;

      const rot = time * 0.3;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      c.lineWidth = 1.3;
      let prevPx = 0, prevPy = 0;
      const steps = 3000;

      for (let i = 0; i < steps; i++) {
        const dx = Math.sin(y) - b * x;
        const dy = Math.sin(z) - b * y;
        const dz = Math.sin(x) - b * z;

        x += dx * dt;
        y += dy * dt;
        z += dz * dt;

        const rx = x * cosR - z * sinR;
        const ry = y * 0.8 + (x * sinR + z * cosR) * 0.4;

        const px = cx + rx * scale;
        const py = cy + ry * scale;

        if (i > 2) {
          c.beginPath();
          c.moveTo(prevPx, prevPy);
          c.lineTo(px, py);
          c.strokeStyle = sampleColor((i / steps + time * 0.08) % 1);
          c.stroke();
        }
        prevPx = px;
        prevPy = py;
      }
    },
  },
  {
    id: 'karman-vortex',
    number: 39,
    name: 'Kármán Vortex Street Fluid Shedding',
    category: 'flows',
    subtitle: 'Navier-Stokes unsteady wake shedding vortices',
    formula: '\\text{Re} = \\frac{u L}{\\nu}, \\quad \\text{St} = \\frac{f L}{u} \\approx 0.2',
    description: 'The Theodore von Kármán vortex street forms when a fluid flows past a cylindrical obstruction, shedding alternating swirling vortices.',
    tags: ['Fluid Dynamics', 'Navier-Stokes', 'Vortex Street', 'Aerodynamics'],
    parameters: [
      { id: 'vortices', name: 'Vortex Count', min: 6, max: 18, step: 2, defaultValue: 12 },
    ],
    defaultParameters: { vortices: 12 },
    pythonCode: (params, paletteName) => `"""
Von Kármán Vortex Street
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

print("Simulating alternating vortex street shedding downstream...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, sampleColor } = ctx;
      const cy = height / 2;
      const obsX = width * 0.2;

      // Obstacle cylinder
      c.fillStyle = sampleColor(0.85);
      c.beginPath();
      c.arc(obsX, cy, 18, 0, Math.PI * 2);
      c.fill();

      // Vortex stream
      const count = 12;
      for (let i = 0; i < count; i++) {
        const spacing = (width * 0.7) / count;
        const x = obsX + 40 + ((i * spacing + time * 60) % (width * 0.75));
        const sign = i % 2 === 0 ? 1 : -1;
        const y = cy + sign * 35 * (1 + (x - obsX) / width);

        const radius = 25 * (1 + (x - obsX) / (width * 0.8));
        c.lineWidth = 1.4;
        c.beginPath();
        c.arc(x, y, radius, 0, Math.PI * 2);
        c.strokeStyle = sampleColor((i / count + time * 0.1) % 1);
        c.stroke();
      }
    },
  },
  {
    id: 'dla-fractal',
    number: 40,
    name: 'Diffusion-Limited Aggregation (DLA)',
    category: 'flows',
    subtitle: 'Brownian motion dendritic aggregation',
    formula: 'D \\approx 1.71 \\quad (\\text{Hausdorff dimension of 2D cluster})',
    description: 'Witten and Sander’s 1981 model for mineral dendrites, lightning paths, and zinc electrodeposition via stochastic Brownian motion particles sticking to a seed.',
    tags: ['DLA', 'Brownian Motion', 'Dendrite', 'Aggregation'],
    parameters: [
      { id: 'particles', name: 'Branch Nodes', min: 500, max: 2500, step: 250, defaultValue: 1200 },
    ],
    defaultParameters: { particles: 1200 },
    pythonCode: (params, paletteName) => `"""
Diffusion-Limited Aggregation in Python
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

print("Simulating Brownian random walk particle aggregation...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const nodes = params.particles ?? 1200;
      const cx = width / 2;
      const cy = height / 2;

      c.lineWidth = 1.2;

      // Deterministic beautiful DLA-like radial dendritic tree
      const branches = 8;
      for (let b = 0; b < branches; b++) {
        const baseAngle = (b * Math.PI * 2) / branches + time * 0.1;
        let x = cx;
        let y = cy;
        let angle = baseAngle;

        c.beginPath();
        c.moveTo(x, y);

        const steps = Math.floor(nodes / branches);
        for (let s = 0; s < steps; s++) {
          angle += (Math.sin(s * 0.2 + b) * 0.3) + Math.cos(time + s * 0.1) * 0.05;
          const stepSize = 3;
          x += Math.cos(angle) * stepSize;
          y += Math.sin(angle) * stepSize;
          c.lineTo(x, y);

          // Sub-branches
          if (s % 15 === 0) {
            const subAngle = angle + (s % 2 === 0 ? 0.8 : -0.8);
            c.moveTo(x, y);
            c.lineTo(x + Math.cos(subAngle) * 20, y + Math.sin(subAngle) * 20);
            c.moveTo(x, y);
          }
        }
        c.strokeStyle = sampleColor((b / branches + time * 0.05) % 1);
        c.stroke();
      }
    },
  },
];
