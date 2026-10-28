/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PatternDefinition } from '../../types/visualizer';

export const SPIROGRAPH_PATTERNS: PatternDefinition[] = [
  {
    id: 'hypotrochoid-spirograph',
    number: 9,
    name: 'Hypotrochoid Mechanical Spirograph',
    category: 'spirographs',
    subtitle: 'Internal rolling gear roulette curves',
    formula: 'x(θ) = (R - r)cos θ + d cos((R - r)θ / r),  y(θ) = (R - r)sin θ - d sin((R - r)θ / r)',
    description: 'Mechanical roulette curve traced by a fixed point inside a rolling circle inside another circle, producing intricate gear mandalas.',
    tags: ['Spirograph', 'Roulette', 'Sacred Geometry', 'Curves'],
    parameters: [
      { id: 'fixedR', name: 'Fixed Outer Radius (R)', min: 100, max: 300, step: 10, defaultValue: 200 },
      { id: 'movingR', name: 'Rolling Radius (r)', min: 30, max: 150, step: 2, defaultValue: 66 },
      { id: 'distanceD', name: 'Pen Offset (d)', min: 20, max: 200, step: 5, defaultValue: 110 },
      { id: 'rotations', name: 'Loop Multiplier', min: 4, max: 30, step: 2, defaultValue: 16 },
    ],
    defaultParameters: { fixedR: 200, movingR: 66, distanceD: 110, rotations: 16 },
    pythonCode: (params, paletteName) => `"""
Hypotrochoid Spirograph in Python
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

R = ${params.fixedR}
r = ${params.movingR}
d = ${params.distanceD}
revs = ${params.rotations}

theta = np.linspace(0, revs * 2 * np.pi, revs * 800)
x = (R - r) * np.cos(theta) + d * np.cos((R - r) * theta / r)
y = (R - r) * np.sin(theta) - d * np.sin((R - r) * theta / r)

plt.figure(figsize=(8, 8), facecolor='#090a15')
plt.plot(x, y, color='#00f0ff', lw=1.0)
plt.axis('equal')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const R = params.fixedR ?? 200;
      const r = params.movingR ?? 66;
      const d = params.distanceD ?? 110;
      const revs = params.rotations ?? 16;

      const scale = Math.min(width, height) / 600;
      const cx = width / 2;
      const cy = height / 2;

      const totalPoints = revs * 250;
      const rot = time * 0.15;

      c.lineWidth = 1.4;
      c.beginPath();

      for (let i = 0; i <= totalPoints; i++) {
        const theta = (i / totalPoints) * revs * Math.PI * 2 + rot;
        const x = (R - r) * Math.cos(theta) + d * Math.cos(((R - r) * theta) / r);
        const y = (R - r) * Math.sin(theta) - d * Math.sin(((R - r) * theta) / r);

        const px = cx + x * scale;
        const py = cy + y * scale;

        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);

        if (i % 80 === 0 || i === totalPoints) {
          c.strokeStyle = sampleColor((i / totalPoints + time * 0.08) % 1);
          c.stroke();
          c.beginPath();
          c.moveTo(px, py);
        }
      }
    },
  },
  {
    id: 'epitrochoid-flower',
    number: 10,
    name: 'Epitrochoid Petaled Roulette',
    category: 'spirographs',
    subtitle: 'Exterior rolling gear orbital flower',
    formula: 'x(θ) = (R + r)cos θ - d cos((R + r)θ / r),  y(θ) = (R + r)sin θ - d sin((R + r)θ / r)',
    description: 'An exterior roulette formed by rolling a circle around the outside of another fixed circle, forming expansive floral planetary rosettes.',
    tags: ['Epitrochoid', 'Florals', 'Planetary', 'Spirograph'],
    parameters: [
      { id: 'petals', name: 'Petal Ratio (k = R/r)', min: 2, max: 12, step: 1, defaultValue: 6 },
      { id: 'offset', name: 'Offset Radius', min: 30, max: 180, step: 5, defaultValue: 90 },
      { id: 'scale', name: 'Flower Scale', min: 0.5, max: 2, step: 0.1, defaultValue: 1.0 },
    ],
    defaultParameters: { petals: 6, offset: 90, scale: 1.0 },
    pythonCode: (params, paletteName) => `"""
Epitrochoid Floral Rosette
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

k = ${params.petals}
r = 25
R = k * r
d = ${params.offset}

theta = np.linspace(0, 2 * np.pi, 2000)
x = (R + r) * np.cos(theta) - d * np.cos((R + r) * theta / r)
y = (R + r) * np.sin(theta) - d * np.sin((R + r) * theta / r)

plt.figure(figsize=(8, 8), facecolor='#090a15')
plt.plot(x, y, color='#ff007f', lw=1.2)
plt.axis('equal')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const k = params.petals ?? 6;
      const r = 25;
      const R = k * r;
      const d = params.offset ?? 90;
      const baseScale = (params.scale ?? 1.0) * (Math.min(width, height) / 520);

      const cx = width / 2;
      const cy = height / 2;
      const totalPoints = 1800;
      const rot = time * 0.2;

      c.lineWidth = 1.6;
      c.beginPath();

      for (let i = 0; i <= totalPoints; i++) {
        const theta = (i / totalPoints) * Math.PI * 2 + rot;
        const x = (R + r) * Math.cos(theta) - d * Math.cos(((R + r) * theta) / r);
        const y = (R + r) * Math.sin(theta) - d * Math.sin(((R + r) * theta) / r);

        const px = cx + x * baseScale;
        const py = cy + y * baseScale;

        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);

        if (i % 70 === 0 || i === totalPoints) {
          c.strokeStyle = sampleColor((i / totalPoints + time * 0.1) % 1);
          c.stroke();
          c.beginPath();
          c.moveTo(px, py);
        }
      }
    },
  },
  {
    id: 'maurer-rose',
    number: 11,
    name: 'Maurer Rose Harmonic Lattice',
    category: 'spirographs',
    subtitle: 'Chords between polar rose nodal points',
    formula: 'r = sin(n·θ),  θ = d·k (degrees),  k ∈ [0, 360]',
    description: 'Introduced by Peter M. Maurer in 1987. Connects discrete sample points along a rhodonea polar rose with straight line chords.',
    tags: ['Maurer Rose', 'Polar', 'Harmonic', 'Chords'],
    parameters: [
      { id: 'n', name: 'Rose Petals (n)', min: 2, max: 12, step: 1, defaultValue: 6 },
      { id: 'd', name: 'Angular Chord Degree (d)', min: 29, max: 97, step: 2, defaultValue: 71 },
    ],
    defaultParameters: { n: 6, d: 71 },
    pythonCode: (params, paletteName) => `"""
Maurer Rose in Python
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

n = ${params.n}
d = ${params.d}

k = np.arange(361)
theta = np.radians(k * d)
r = np.sin(n * theta)

x = r * np.cos(theta)
y = r * np.sin(theta)

plt.figure(figsize=(8, 8), facecolor='#090a15')
plt.plot(x, y, color='#a855f7', lw=0.8)
plt.axis('equal')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const n = params.n ?? 6;
      const d = params.d ?? 71;

      const radius = Math.min(width, height) * 0.42;
      const cx = width / 2;
      const cy = height / 2;
      const rot = time * 0.1;

      c.lineWidth = 1.1;

      // Draw Maurer chords
      c.beginPath();
      for (let k = 0; k <= 360; k++) {
        const theta = ((k * d * Math.PI) / 180) + rot;
        const r = Math.sin(n * theta) * radius;
        const px = cx + r * Math.cos(theta);
        const py = cy + r * Math.sin(theta);

        if (k === 0) c.moveTo(px, py);
        else c.lineTo(px, py);

        if (k % 45 === 0 || k === 360) {
          c.strokeStyle = sampleColor((k / 360 + time * 0.05) % 1);
          c.stroke();
          c.beginPath();
          c.moveTo(px, py);
        }
      }

      // Draw underlying smooth rose outline in soft accent
      c.beginPath();
      c.lineWidth = 2.0;
      for (let theta = 0; theta <= Math.PI * 2; theta += 0.01) {
        const r = Math.sin(n * (theta + rot)) * radius;
        const px = cx + r * Math.cos(theta + rot);
        const py = cy + r * Math.sin(theta + rot);
        if (theta === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.strokeStyle = sampleColor(0.85);
      c.stroke();
    },
  },
  {
    id: 'lissajous-harmonograph',
    number: 12,
    name: 'Lissajous Multi-Harmonograph',
    category: 'spirographs',
    subtitle: 'Superposed orthogonal damped harmonic oscillators',
    formula: 'x(t) = A_1 sin(f_1 t + p_1)e^{-d_1 t},  y(t) = A_2 sin(f_2 t + p_2)e^{-d_2 t}',
    description: 'Models Victorian multi-pendulum harmonographs drawing resonant mechanical interference figures as swinging pendulums slowly decay.',
    tags: ['Harmonograph', 'Lissajous', 'Physics', 'Oscillator'],
    parameters: [
      { id: 'f1', name: 'Frequency 1 (f1)', min: 1, max: 7, step: 0.1, defaultValue: 3.01 },
      { id: 'f2', name: 'Frequency 2 (f2)', min: 1, max: 7, step: 0.1, defaultValue: 2.0 },
      { id: 'damping', name: 'Decay Constant', min: 0.0002, max: 0.003, step: 0.0002, defaultValue: 0.001 },
      { id: 'points', name: 'Harmonic Trace Steps', min: 1000, max: 4000, step: 500, defaultValue: 2500 },
    ],
    defaultParameters: { f1: 3.01, f2: 2.0, damping: 0.001, points: 2500 },
    pythonCode: (params, paletteName) => `"""
Dual Damped Harmonograph in Python
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

f1, f2 = ${params.f1}, ${params.f2}
d = ${params.damping}
t = np.linspace(0, 150, ${params.points})

x = np.sin(f1 * t) * np.exp(-d * t)
y = np.sin(f2 * t + np.pi/4) * np.exp(-d * t)

plt.figure(figsize=(8, 8), facecolor='#090a15')
plt.plot(x, y, color='#38bdf8', lw=0.7)
plt.axis('equal')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const f1 = params.f1 ?? 3.01;
      const f2 = params.f2 ?? 2.0;
      const d = params.damping ?? 0.001;
      const pts = params.points ?? 2500;

      const scale = Math.min(width, height) * 0.42;
      const cx = width / 2;
      const cy = height / 2;
      const p1 = time * 0.4;
      const p2 = time * 0.25 + Math.PI / 3;

      c.lineWidth = 1.3;
      c.beginPath();

      for (let i = 0; i < pts; i++) {
        const t = i * 0.08;
        const decay = Math.exp(-d * t);
        const x = Math.sin(f1 * t + p1) * decay * scale;
        const y = Math.sin(f2 * t + p2) * decay * scale;

        const px = cx + x;
        const py = cy + y;

        if (i === 0) c.moveTo(px, py);
        else c.lineTo(px, py);

        if (i % 80 === 0 || i === pts - 1) {
          c.strokeStyle = sampleColor((i / pts + time * 0.1) % 1);
          c.stroke();
          c.beginPath();
          c.moveTo(px, py);
        }
      }
    },
  },
  {
    id: 'phyllotaxis-sunflower',
    number: 13,
    name: 'Phyllotaxis Golden Spiral',
    category: 'spirographs',
    subtitle: 'Vogel model of golden angle packing',
    formula: 'θ = n × 137.507764°,  r = c \sqrt{n}',
    description: 'Helmut Vogel’s model for sunflower seed and pinecone packing. Uses the Golden Angle 137.5° to achieve mathematically optimal space packing.',
    tags: ['Golden Ratio', 'Fibonacci', 'Phyllotaxis', 'Nature'],
    parameters: [
      { id: 'count', name: 'Seed Count (n)', min: 300, max: 2000, step: 100, defaultValue: 1000 },
      { id: 'divergence', name: 'Divergence Angle (°)', min: 137.0, max: 138.0, step: 0.02, defaultValue: 137.51 },
      { id: 'seedSize', name: 'Seed Radius', min: 2, max: 8, step: 0.5, defaultValue: 4.5 },
    ],
    defaultParameters: { count: 1000, divergence: 137.51, seedSize: 4.5 },
    pythonCode: (params, paletteName) => `"""
Golden Ratio Phyllotaxis Sunflower
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

n = ${params.count}
angle = np.radians(${params.divergence})
indices = np.arange(n)

theta = indices * angle
r = np.sqrt(indices)

x = r * np.cos(theta)
y = r * np.sin(theta)

plt.figure(figsize=(8, 8), facecolor='#090a15')
plt.scatter(x, y, c=indices, cmap='viridis', s=15, edgecolors='none')
plt.axis('equal')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const count = params.count ?? 1000;
      const divergenceDeg = params.divergence ?? 137.51;
      const baseSeed = params.seedSize ?? 4.5;

      const goldenAngle = (divergenceDeg * Math.PI) / 180 + Math.sin(time * 0.2) * 0.002;
      const spacing = Math.min(width, height) * 0.013;
      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < count; i++) {
        const theta = i * goldenAngle;
        const r = Math.sqrt(i) * spacing;
        const px = cx + r * Math.cos(theta);
        const py = cy + r * Math.sin(theta);

        const tColor = (i / count + time * 0.08) % 1;
        c.fillStyle = sampleColor(tColor);
        c.beginPath();
        c.arc(px, py, Math.max(1.5, baseSeed * (0.4 + 0.6 * (i / count))), 0, Math.PI * 2);
        c.fill();
      }
    },
  },
  {
    id: 'metatrons-cube',
    number: 14,
    name: 'Metatron’s Cube Sacred Lattice',
    category: 'spirographs',
    subtitle: 'Thirteen fruit-of-life harmonic spheres',
    formula: 'V = {13 \\text{ sphere centers}},  E = \\text{all mutual chords}',
    description: 'An ancient sacred geometry symbol containing all 5 Platonic solids. Formed by interconnecting all centers of the 13 circles in the Fruit of Life.',
    tags: ['Sacred Geometry', 'Platonic Solids', 'Lattice', 'Mandala'],
    parameters: [
      { id: 'scale', name: 'Geometry Radius', min: 100, max: 260, step: 10, defaultValue: 180 },
      { id: 'pulsing', name: 'Harmonic Pulse', min: 0, max: 0.2, step: 0.02, defaultValue: 0.08 },
    ],
    defaultParameters: { scale: 180, pulsing: 0.08 },
    pythonCode: (params, paletteName) => `"""
Metatron's Cube Geometry
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

R = ${params.scale}
centers = [(0, 0)]
for ring, count in [(R/2, 6), (R, 6)]:
    for i in range(count):
        ang = i * np.pi / 3
        centers.append((ring * np.cos(ang), ring * np.sin(ang)))

fig, ax = plt.subplots(figsize=(8, 8), facecolor='#090a15')
for i in range(len(centers)):
    for j in range(i + 1, len(centers)):
        ax.plot([centers[i][0], centers[j][0]], [centers[i][1], centers[j][1]], color='#ec4899', lw=0.6)
ax.axis('equal')
ax.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const pulse = 1 + (params.pulsing ?? 0.08) * Math.sin(time * 2);
      const baseR = (params.scale ?? 180) * (Math.min(width, height) / 550) * pulse;
      const cx = width / 2;
      const cy = height / 2;

      const rot = time * 0.15;

      // 13 fruit of life centers
      const centers: { x: number; y: number }[] = [{ x: cx, y: cy }];

      // Inner ring of 6
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + rot;
        centers.push({ x: cx + (baseR * 0.5) * Math.cos(ang), y: cy + (baseR * 0.5) * Math.sin(ang) });
      }
      // Outer ring of 6
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + rot;
        centers.push({ x: cx + baseR * Math.cos(ang), y: cy + baseR * Math.sin(ang) });
      }

      // Draw all connecting lines
      c.lineWidth = 0.8;
      for (let i = 0; i < centers.length; i++) {
        for (let j = i + 1; j < centers.length; j++) {
          c.beginPath();
          c.moveTo(centers[i].x, centers[i].y);
          c.lineTo(centers[j].x, centers[j].y);
          c.strokeStyle = sampleColor((i * 13 + j * 7) / 100);
          c.stroke();
        }
      }

      // Draw circles at each center
      c.lineWidth = 1.4;
      for (let i = 0; i < centers.length; i++) {
        c.beginPath();
        c.arc(centers[i].x, centers[i].y, baseR * 0.25, 0, Math.PI * 2);
        c.strokeStyle = sampleColor((i / centers.length + time * 0.1) % 1);
        c.stroke();
      }
    },
  },
  {
    id: 'cardioid-caustic',
    number: 15,
    name: 'Modular Multiplication Cardioid Caustic',
    category: 'spirographs',
    subtitle: 'Modular times-table circular envelope',
    formula: 'P_i \\leftrightarrow P_{(i \\times m) \\pmod N},  P_k = (R \\cos \\theta_k, R \\sin \\theta_k)',
    description: 'Lines connecting points on a circle under modular multiplication. Yields cardioid (m=2), nephroid (m=3), and intricate caustics.',
    tags: ['Modular Arithmetic', 'Caustic', 'Cardioid', 'Geometry'],
    parameters: [
      { id: 'modulo', name: 'Node Count (N)', min: 100, max: 400, step: 20, defaultValue: 250 },
      { id: 'multiplier', name: 'Multiplier (m)', min: 2, max: 20, step: 0.1, defaultValue: 2.0 },
    ],
    defaultParameters: { modulo: 250, multiplier: 2.0 },
    pythonCode: (params, paletteName) => `"""
Modular Multiplication Cardioid Caustic
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

N = ${params.modulo}
m = ${params.multiplier}
theta = np.linspace(0, 2 * np.pi, N, endpoint=False)
pts = np.column_stack((np.cos(theta), np.sin(theta)))

fig, ax = plt.subplots(figsize=(8, 8), facecolor='#090a15')
for i in range(N):
    target = int((i * m) % N)
    ax.plot([pts[i, 0], pts[target, 0]], [pts[i, 1], pts[target, 1]], color='#ffd43b', lw=0.5)

ax.axis('equal')
ax.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const N = Math.floor(params.modulo ?? 250);
      const mult = (params.multiplier ?? 2.0) + Math.sin(time * 0.3) * 0.8;

      const R = Math.min(width, height) * 0.42;
      const cx = width / 2;
      const cy = height / 2;

      // Circle perimeter
      c.beginPath();
      c.arc(cx, cy, R, 0, Math.PI * 2);
      c.strokeStyle = sampleColor(0.2);
      c.lineWidth = 1.0;
      c.stroke();

      c.lineWidth = 0.7;
      for (let i = 0; i < N; i++) {
        const theta1 = (i * Math.PI * 2) / N;
        const target = (i * mult) % N;
        const theta2 = (target * Math.PI * 2) / N;

        const x1 = cx + R * Math.cos(theta1);
        const y1 = cy + R * Math.sin(theta1);
        const x2 = cx + R * Math.cos(theta2);
        const y2 = cy + R * Math.sin(theta2);

        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.strokeStyle = sampleColor((i / N + time * 0.08) % 1);
        c.stroke();
      }
    },
  },
  {
    id: 'archimedean-vortex',
    number: 16,
    name: 'Dual Fermat & Archimedean Vortex',
    category: 'spirographs',
    subtitle: 'Twin counter-rotating polar vortex ribbons',
    formula: 'r^2 = a^2 \\theta \\quad (\\text{Fermat}), \\quad r = a + b\\theta \\quad (\\text{Archimedes})',
    description: 'Dynamic double spiral vortex featuring counter-propagating harmonic wave ripples and continuous angular phase modulation.',
    tags: ['Spirals', 'Archimedes', 'Fermat', 'Vortex'],
    parameters: [
      { id: 'arms', name: 'Vortex Arms', min: 2, max: 12, step: 1, defaultValue: 6 },
      { id: 'tightness', name: 'Spiral Tightness', min: 2, max: 10, step: 0.5, defaultValue: 5.5 },
      { id: 'waveFreq', name: 'Wave Frequency', min: 1, max: 8, step: 0.5, defaultValue: 3 },
    ],
    defaultParameters: { arms: 6, tightness: 5.5, waveFreq: 3 },
    pythonCode: (params, paletteName) => `"""
Dual Archimedean Vortex
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

arms = ${params.arms}
b = ${params.tightness}
theta = np.linspace(0, 8 * np.pi, 1500)

plt.figure(figsize=(8, 8), facecolor='#090a15')
for arm in range(arms):
    offset = arm * 2 * np.pi / arms
    r = b * theta
    x = r * np.cos(theta + offset)
    y = r * np.sin(theta + offset)
    plt.plot(x, y, lw=0.9)

plt.axis('equal')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const arms = Math.floor(params.arms ?? 6);
      const b = params.tightness ?? 5.5;
      const freq = params.waveFreq ?? 3;

      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.min(width, height) * 0.44;

      c.lineWidth = 1.6;

      for (let arm = 0; arm < arms; arm++) {
        const armOffset = (arm * Math.PI * 2) / arms + time * 0.3;
        c.beginPath();

        const pts = 300;
        for (let i = 0; i < pts; i++) {
          const t = (i / pts) * (Math.PI * 6);
          const r = Math.min((t * b * 5), maxR) * (1 + 0.1 * Math.sin(t * freq - time * 3));
          const angle = t + armOffset;

          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);

          if (i === 0) c.moveTo(px, py);
          else c.lineTo(px, py);
        }

        c.strokeStyle = sampleColor((arm / arms + time * 0.1) % 1);
        c.stroke();
      }
    },
  },
];
