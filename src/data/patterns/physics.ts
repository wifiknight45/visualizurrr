/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PatternDefinition, RenderContext } from '../../types/visualizer';
import { drawPath, fillCell, fillCircle, strokeCircle } from '../../utils/drawModes';

export const PHYSICS_PATTERNS: PatternDefinition[] = [
  {
    id: 'chladni-plate',
    number: 25,
    name: 'Chladni Cymatics Acoustic Plate',
    category: 'physics',
    subtitle: 'Nodal standing wave plate resonance',
    formula: 'w(x, y) = a \\sin(n \\pi x/L)\\sin(m \\pi y/L) - b \\sin(m \\pi x/L)\\sin(n \\pi y/L) = 0',
    description: 'Ernst Chladni’s acoustic resonance technique showing sand grains settling along nodal zero-vibration lines of a vibrating plate.',
    tags: ['Cymatics', 'Acoustics', 'Harmonics', 'Standing Waves'],
    parameters: [
      { id: 'n', name: 'Mode Parameter n', min: 1, max: 8, step: 1, defaultValue: 3 },
      { id: 'm', name: 'Mode Parameter m', min: 1, max: 8, step: 1, defaultValue: 5 },
      { id: 'particles', name: 'Sand Particle Count', min: 1000, max: 6000, step: 500, defaultValue: 3000 },
    ],
    defaultParameters: { n: 3, m: 5, particles: 3000 },
    pythonCode: (params, palette) => `"""
Chladni Cymatics Plate in Python
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

n, m = ${params.n}, ${params.m}
x = np.linspace(-1, 1, 400)
y = np.linspace(-1, 1, 400)
X, Y = np.meshgrid(x, y)

# Chladni 2D wave function
Z = np.sin(n * np.pi * X) * np.sin(m * np.pi * Y) - np.sin(m * np.pi * X) * np.sin(n * np.pi * Y)

plt.figure(figsize=(8, 8), facecolor='${palette.background}')
plt.contour(X, Y, np.abs(Z), levels=[0.05], colors='${palette.primary}', linewidths=1.5)
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const n = params.n ?? 3;
      const m = params.m ?? 5;
      const count = params.particles ?? 3000;

      const size = Math.min(width, height) * 0.82;
      const cx = width / 2;
      const cy = height / 2;

      // Draw subtle boundary frame
      c.strokeStyle = sampleColor(0.2);
      c.lineWidth = 1;
      c.strokeRect(cx - size / 2, cy - size / 2, size, size);

      // Sand simulation
      for (let i = 0; i < count; i++) {
        const u = (Math.sin(i * 12.9898 + time * 0.1) * 43758.5453) % 1;
        const v = (Math.cos(i * 78.233 + time * 0.1) * 43758.5453) % 1;

        const x = (u - 0.5) * 2;
        const y = (v - 0.5) * 2;

        const chladni =
          Math.sin(n * Math.PI * x) * Math.sin(m * Math.PI * y) -
          Math.sin(m * Math.PI * x) * Math.sin(n * Math.PI * y);

        const distToNode = Math.abs(chladni);
        if (distToNode < 0.25) {
          const px = cx + x * (size / 2);
          const py = cy + y * (size / 2);
          fillCell(c, px, py, 1.8, mode, sampleColor(1 - distToNode * 3.5));
        }
      }
    },
  },
  {
    id: 'double-pendulum',
    number: 26,
    name: 'Double Pendulum Chaotic Trajectory',
    category: 'physics',
    subtitle: 'Coupled Lagrangian chaotic mechanics',
    formula: '\\mathcal{L} = T - V, \\quad \\frac{d}{dt}\\left(\\frac{\\partial \\mathcal{L}}{\\partial \\dot{\\theta}_i}\\right) - \\frac{\\partial \\mathcal{L}}{\\partial \\theta_i} = 0',
    description: 'A physical compound pendulum consisting of two pendulums connected end to end. Illustrates extreme sensitivity to initial conditions.',
    tags: ['Physics', 'Chaos', 'Lagrangian', 'Mechanics'],
    parameters: [
      { id: 'gravity', name: 'Gravity (g)', min: 5, max: 20, step: 1, defaultValue: 9.81 },
      { id: 'trailLen', name: 'Trail Persistence', min: 200, max: 1500, step: 100, defaultValue: 800 },
    ],
    defaultParameters: { gravity: 9.81, trailLen: 800 },
    pythonCode: (params, palette) => `"""
Double Pendulum Simulation
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint

g = ${params.gravity}
L1, L2 = 1.0, 1.0
m1, m2 = 1.0, 1.0

def derivs(state, t):
    th1, w1, th2, w2 = state
    dth1 = w1
    dth2 = w2
    delta = th1 - th2
    den1 = (m1 + m2) * L1 - m2 * L1 * np.cos(delta)**2
    dw1 = (m2 * L1 * w1**2 * np.sin(delta) * np.cos(delta) +
           m2 * g * np.sin(th2) * np.cos(delta) +
           m2 * L2 * w2**2 * np.sin(delta) -
           (m1 + m2) * g * np.sin(th1)) / den1
    den2 = (L2 / L1) * den1
    dw2 = (-m2 * L2 * w2**2 * np.sin(delta) * np.cos(delta) +
           (m1 + m2) * g * np.sin(th1) * np.cos(delta) -
           (m1 + m2) * L1 * w1**2 * np.sin(delta) -
           (m1 + m2) * g * np.sin(th2)) / den2
    return [dth1, dw1, dth2, dw2]

t = np.linspace(0, 30, ${params.trailLen})
sol = odeint(derivs, [np.pi/2, 0, np.pi/2, 0], t)
x2 = L1 * np.sin(sol[:, 0]) + L2 * np.sin(sol[:, 2])
y2 = -L1 * np.cos(sol[:, 0]) - L2 * np.cos(sol[:, 2])

plt.plot(x2, y2, color='${palette.accent}', lw=0.8)
plt.axis('off')
plt.show()`,
    ...(() => {
      let th1 = Math.PI / 2, w1 = 0;
      let th2 = Math.PI / 2 + 0.1, w2 = 0;
      const trail: { x: number; y: number }[] = [];

      const render = (ctx: RenderContext) => {
        const { ctx: c, width, height, params, sampleColor, mode } = ctx;
        const g = (params.gravity ?? 9.81) * 0.05;
        const maxTrail = params.trailLen ?? 800;

        const L1 = Math.min(width, height) * 0.22;
        const L2 = Math.min(width, height) * 0.22;
        const cx = width / 2;
        const cy = height * 0.38;

        // Run multiple sub-steps for Euler-Cromer stability
        for (let step = 0; step < 5; step++) {
          const dt = 0.04;
          const delta = th1 - th2;
          const den = 2 - Math.cos(2 * th1 - 2 * th2);

          const num1 = -g * 3 * Math.sin(th1) - g * Math.sin(th1 - 2 * th2) - 2 * Math.sin(delta) * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(delta));
          const num2 = 2 * Math.sin(delta) * (w1 * w1 * L1 * 2 + g * 2 * Math.cos(th1) + w2 * w2 * L2 * Math.cos(delta));

          const a1 = num1 / (L1 * den);
          const a2 = num2 / (L2 * den);

          w1 += a1 * dt;
          w2 += a2 * dt;
          w1 *= 0.9999;
          w2 *= 0.9999;
          th1 += w1 * dt;
          th2 += w2 * dt;
        }

        const x1 = cx + L1 * Math.sin(th1);
        const y1 = cy + L1 * Math.cos(th1);
        const x2 = x1 + L2 * Math.sin(th2);
        const y2 = y1 + L2 * Math.cos(th2);

        trail.push({ x: x2, y: y2 });
        if (trail.length > maxTrail) trail.shift();

        // Draw trail, arms and bobs through the render-mode helpers
        drawPath(c, trail, mode, (t) => sampleColor(t), 1.3);
        drawPath(c, [{ x: cx, y: cy }, { x: x1, y: y1 }, { x: x2, y: y2 }], mode, () => sampleColor(0.8), 2.5);
        fillCircle(c, x1, y1, 6, mode, sampleColor(0.95));
        fillCircle(c, x2, y2, 8, mode, sampleColor(0.95));
      };
      const reset = () => { th1 = Math.PI / 2; w1 = 0; th2 = Math.PI / 2 + 0.1; w2 = 0; trail.length = 0; };
      return { render, reset };
    })(),
  },
  {
    id: 'fourier-epicycles',
    number: 27,
    name: 'Fourier Series Epicycle Synthesizer',
    category: 'physics',
    subtitle: 'Harmonic decomposition of rotating phasors',
    formula: 'f(t) = \\sum_{k=-N}^{N} c_k e^{i k \\omega t}',
    description: 'Illustrates Joseph Fourier’s theorem: any periodic closed path can be reconstructed via nested rotating phasor circles of varying radii and frequencies.',
    tags: ['Fourier', 'Epicycles', 'Signal Processing', 'Phasors'],
    parameters: [
      { id: 'harmonics', name: 'Harmonic Circles', min: 3, max: 21, step: 2, defaultValue: 9 },
      { id: 'speed', name: 'Rotation Rate', min: 0.2, max: 2, step: 0.1, defaultValue: 0.8 },
    ],
    defaultParameters: { harmonics: 9, speed: 0.8 },
    pythonCode: (params, palette) => `"""
Fourier Epicycles in Python
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

N = ${params.harmonics}
t = np.linspace(0, 2*np.pi, 500)
# Square wave harmonic series
signal = np.zeros_like(t)
for k in range(1, N*2, 2):
    signal += (4 / (k * np.pi)) * np.sin(k * t)

plt.figure(figsize=(10, 5), facecolor='${palette.background}')
plt.plot(t, signal, color='${palette.primary}', lw=2)
plt.axis('off')
plt.show()`,
    ...(() => {
      const pathHistory: number[] = [];

      const render = (ctx: RenderContext) => {
        const { ctx: c, width, height, time, params, sampleColor, mode, audio } = ctx;
        const harmonics = Math.floor(params.harmonics ?? 9);
        // Bass gently pushes the rotation rate while music plays
        const rate = (params.speed ?? 0.8) * 1.5 * (1 + (audio?.bass ?? 0) * 0.25);

        const baseR = Math.min(width, height) * 0.18;
        const cx = width * 0.3;
        const cy = height / 2;

        let x = cx;
        let y = cy;

        c.lineWidth = 1.0;

        for (let i = 0; i < harmonics; i++) {
          const n = i * 2 + 1;
          const radius = baseR * (4 / (n * Math.PI));
          const prevX = x;
          const prevY = y;

          const angle = n * time * rate;
          x += radius * Math.cos(angle);
          y += radius * Math.sin(angle);

          // Draw circle + radius line through the render-mode helpers
          strokeCircle(c, prevX, prevY, radius, mode, sampleColor(i / harmonics), 1.0);
          drawPath(c, [{ x: prevX, y: prevY }, { x, y }], mode, () => sampleColor(0.85), 1.0);
        }

        pathHistory.unshift(y);
        if (pathHistory.length > width * 0.5) pathHistory.pop();

        // Line connecting tip to wave + wave history
        const waveStartX = width * 0.52;
        drawPath(c, [{ x, y }, { x: waveStartX, y }], mode, () => sampleColor(0.9), 1.0);
        const wavePts = pathHistory.map((py, i) => ({ x: waveStartX + i, y: py }));
        drawPath(c, wavePts, mode, () => sampleColor(0.95), 2.0);
      };
      const reset = () => { pathHistory.length = 0; };
      return { render, reset };
    })(),
  },
  {
    id: 'wave-interference',
    number: 28,
    name: 'Wave Interference & Phase Ripple',
    category: 'physics',
    subtitle: 'Multi-slit Young diffraction field',
    formula: '\\psi(\\mathbf{r}, t) = \\sum_{j} \\frac{A_j}{\\sqrt{r_j}} \\cos(k r_j - \\omega t + \\phi_j)',
    description: 'Superposition of coherent harmonic circular wavefronts from multiple wave sources, demonstrating constructive and destructive interference fringes.',
    tags: ['Diffraction', 'Interference', 'Waves', 'Optics'],
    parameters: [
      { id: 'sources', name: 'Wave Sources', min: 2, max: 6, step: 1, defaultValue: 3 },
      { id: 'wavelength', name: 'Wavelength (λ)', min: 15, max: 50, step: 2, defaultValue: 28 },
    ],
    defaultParameters: { sources: 3, wavelength: 28 },
    pythonCode: (params, palette) => `"""
Wave Interference Ripple
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

w, h = 400, 400
x = np.linspace(-10, 10, w)
y = np.linspace(-10, 10, h)
X, Y = np.meshgrid(x, y)

sources = [(-3, 0), (3, 0), (0, 3)]
k = 2 * np.pi / ${params.wavelength}
Z = np.zeros_like(X)

for sx, sy in sources:
    r = np.sqrt((X - sx)**2 + (Y - sy)**2)
    Z += np.cos(k * r)

plt.imshow(Z, cmap='viridis')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const srcCount = Math.floor(params.sources ?? 3);
      const lambda = params.wavelength ?? 28;
      const k = (Math.PI * 2) / lambda;

      const step = 6;
      const cols = Math.floor(width / step);
      const rows = Math.floor(height / step);

      // Generate circular source orbits
      const sources: { x: number; y: number }[] = [];
      const cx = width / 2;
      const cy = height / 2;
      const orbitR = Math.min(width, height) * 0.25;

      for (let i = 0; i < srcCount; i++) {
        const ang = (i * Math.PI * 2) / srcCount + time * 0.5;
        sources.push({ x: cx + Math.cos(ang) * orbitR, y: cy + Math.sin(ang) * orbitR });
      }

      for (let y = 0; y < rows; y++) {
        const py = y * step;
        for (let x = 0; x < cols; x++) {
          const px = x * step;
          let amp = 0;

          for (let s = 0; s < srcCount; s++) {
            const dx = px - sources[s].x;
            const dy = py - sources[s].y;
            const r = Math.sqrt(dx * dx + dy * dy);
            amp += Math.cos(k * r - time * 6);
          }

          const norm = (amp / srcCount + 1) * 0.5;
          fillCell(c, px, py, step, mode, sampleColor(norm));
        }
      }
    },
  },
  {
    id: 'quantum-harmonic',
    number: 29,
    name: 'Quantum Harmonic Oscillator Probability Cloud',
    category: 'physics',
    subtitle: 'Schrödinger stationary wave probability density',
    formula: '\\psi_n(x) = \\frac{1}{\\sqrt{2^n n! \\sqrt{\\pi}}} H_n(x) e^{-x^2/2}, \\quad P(x) = |\\psi(x)|^2',
    description: 'Quantum superposition of Hermite-Gaussian eigenstates in a parabolic harmonic well. Shows probability wave packet breathing.',
    tags: ['Quantum', 'Schrodinger', 'Hermite', 'Probability'],
    parameters: [
      { id: 'nState', name: 'Max Quantum Level n', min: 2, max: 8, step: 1, defaultValue: 4 },
      { id: 'wellWidth', name: 'Potential Well Scale', min: 100, max: 300, step: 20, defaultValue: 180 },
    ],
    defaultParameters: { nState: 4, wellWidth: 180 },
    pythonCode: (params, palette) => `"""
Quantum Harmonic Wavefunctions
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt
from scipy.special import hermite

x = np.linspace(-4, 4, 1000)
n = ${params.nState}
Hn = hermite(n)
psi = (1 / np.sqrt(2**n * np.math.factorial(n) * np.sqrt(np.pi))) * Hn(x) * np.exp(-x**2 / 2)
prob = psi**2

plt.plot(x, prob, color='${palette.accent}', lw=2)
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const nMax = params.nState ?? 4;
      const well = params.wellWidth ?? 180;

      const cx = width / 2;
      const cy = height / 2;

      for (let n = 0; n < nMax; n++) {
        const pts: { x: number; y: number }[] = [];
        const divisions = 200;
        for (let i = 0; i <= divisions; i++) {
          const xNorm = ((i / divisions) - 0.5) * 6;
          // Approximated Hermite wave packet envelope
          const env = Math.exp(-(xNorm * xNorm) / 2);
          const oscillation = Math.cos(n * xNorm - time * (n + 1) * 1.5);
          const yVal = env * oscillation * (well * 0.5);

          pts.push({ x: cx + xNorm * (well * 0.35), y: cy - yVal - (n - nMax / 2) * 50 });
        }
        drawPath(c, pts, mode, () => sampleColor(n / nMax), 2.0);
      }
    },
  },
  {
    id: 'coupled-soliton',
    number: 30,
    name: 'Coupled Lattice Non-Linear Soliton',
    category: 'physics',
    subtitle: 'Korteweg-de Vries traveling localized wave packet',
    formula: 'u_t + 6 u u_x + u_{xxx} = 0, \\quad u(x, t) = \\frac{c}{2} \\operatorname{sech}^2\\left(\\frac{\\sqrt{c}}{2}(x - ct)\\right)',
    description: 'Solitons are non-dispersive solitary wave packets that maintain their shape while traveling at constant speed by balancing non-linearity and dispersion.',
    tags: ['Soliton', 'KdV', 'Non-linear Waves', 'Hydrodynamics'],
    parameters: [
      { id: 'amplitude', name: 'Soliton Amplitude (c)', min: 20, max: 100, step: 5, defaultValue: 60 },
      { id: 'speed', name: 'Propagation Velocity', min: 0.5, max: 3, step: 0.2, defaultValue: 1.5 },
    ],
    defaultParameters: { amplitude: 60, speed: 1.5 },
    pythonCode: (params, palette) => `"""
KdV Soliton Wave
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-20, 20, 500)
c_speed = ${params.speed}
sech = 1 / np.cosh(0.5 * np.sqrt(c_speed) * x)
u = (c_speed / 2) * sech**2

plt.plot(x, u, color='${palette.primary}', lw=2)
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const amp = params.amplitude ?? 60;
      const v = (params.speed ?? 1.5) * 80;

      const lines = 12;
      const cx = width / 2;
      const cy = height / 2;

      for (let l = 0; l < lines; l++) {
        const offset = (l - lines / 2) * 22;
        const pts: { x: number; y: number }[] = [];
        for (let x = 0; x < width; x += 3) {
          const dist = ((x - (time * v + l * 40)) % width + width) % width - cx;
          const sech = 1 / Math.cosh(dist * 0.025);
          pts.push({ x, y: cy + offset - amp * (sech * sech) * Math.cos(l * 0.3) });
        }
        drawPath(c, pts, mode, () => sampleColor(l / lines), 1.6);
      }
    },
  },
  {
    id: 'magnetic-pendulum',
    number: 31,
    name: 'Magnetic Pendulum Fractal Basins',
    category: 'physics',
    subtitle: 'Multi-magnet chaotic basin boundary',
    formula: '\\ddot{\\mathbf{r}} + \\gamma \\dot{\\mathbf{r}} + \\omega_0^2 \\mathbf{r} = \\sum_{i=1}^3 \\frac{\\mathbf{r}_i - \\mathbf{r}}{|\\mathbf{r}_i - \\mathbf{r}|^3}',
    description: 'A physical pendulum swinging over three magnetic attractors. The boundary separating which magnet catches the pendulum forms a fractal boundary.',
    tags: ['Fractal Basin', 'Magnets', 'Chaos', 'Physics'],
    parameters: [
      { id: 'drag', name: 'Air Damping (γ)', min: 0.1, max: 0.8, step: 0.05, defaultValue: 0.35 },
    ],
    defaultParameters: { drag: 0.35 },
    pythonCode: (palette) => `"""
Magnetic Pendulum Basins
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

# 3 magnets in equilateral triangle
magnets = [np.array([np.cos(a), np.sin(a)]) for a in [0, 2*np.pi/3, 4*np.pi/3]]
print("Simulating 3-magnet fractal attractor...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, sampleColor, mode } = ctx;
      const scale = Math.min(width, height) * 0.35;
      const cx = width / 2;
      const cy = height / 2;

      const magnets = [
        { x: cx + scale * Math.cos(time * 0.1), y: cy + scale * Math.sin(time * 0.1) },
        { x: cx + scale * Math.cos(time * 0.1 + (2 * Math.PI) / 3), y: cy + scale * Math.sin(time * 0.1 + (2 * Math.PI) / 3) },
        { x: cx + scale * Math.cos(time * 0.1 + (4 * Math.PI) / 3), y: cy + scale * Math.sin(time * 0.1 + (4 * Math.PI) / 3) },
      ];

      // Draw magnets
      magnets.forEach((m, idx) => {
        fillCircle(c, m.x, m.y, 12, mode, sampleColor(idx / 3));
      });

      // Swarm of trajectories
      const ptsCount = 80;
      for (let i = 0; i < ptsCount; i++) {
        let x = cx + Math.cos(i) * scale * 0.8;
        let y = cy + Math.sin(i) * scale * 0.8;
        let vx = -Math.sin(i) * 2;
        let vy = Math.cos(i) * 2;

        const traj: { x: number; y: number }[] = [{ x, y }];
        for (let step = 0; step < 40; step++) {
          let fx = -0.15 * (x - cx);
          let fy = -0.15 * (y - cy);

          for (const m of magnets) {
            const dx = m.x - x;
            const dy = m.y - y;
            const d = Math.sqrt(dx * dx + dy * dy + 400);
            const force = 1200 / (d * d * d);
            fx += dx * force;
            fy += dy * force;
          }

          vx = (vx + fx * 0.1) * 0.96;
          vy = (vy + fy * 0.1) * 0.96;
          x += vx;
          y += vy;
          traj.push({ x, y });
        }
        const color = sampleColor((i / ptsCount + time * 0.05) % 1);
        drawPath(c, traj, mode, () => color, 1.0);
      }
    },
  },
  {
    id: 'n-body-gravity',
    number: 32,
    name: 'Gravitational N-Body Orbital Ballet',
    category: 'physics',
    subtitle: 'Newtonian gravitational choreographies',
    formula: '\\mathbf{F}_{i} = \\sum_{j \\neq i} G \\frac{m_i m_j}{|\\mathbf{r}_j - \\mathbf{r}_i|^3} (\\mathbf{r}_j - \\mathbf{r}_i)',
    description: 'Newtonian gravitational n-body celestial mechanics with stable three-body figure-8 choreographies and planetary accretion rings.',
    tags: ['Gravity', 'Orbit', 'N-Body', 'Astrophysics'],
    parameters: [
      { id: 'bodies', name: 'Celestial Bodies', min: 3, max: 7, step: 1, defaultValue: 4 },
      { id: 'gravity', name: 'Gravitational Constant (G)', min: 100, max: 800, step: 50, defaultValue: 400 },
    ],
    defaultParameters: { bodies: 4, gravity: 400 },
    pythonCode: (params, palette) => `"""
N-Body Gravitational Ballet
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

G = ${params.gravity}
N = ${params.bodies}
print(f"Integrating {N}-body celestial orbits with G={G}...")
`,
    ...(() => {
      interface Body {
        x: number;
        y: number;
        vx: number;
        vy: number;
        mass: number;
        trail: { x: number; y: number }[];
      }
      let bodies: Body[] = [];

      const render = (ctx: RenderContext) => {
        const { ctx: c, width, height, params, sampleColor, mode } = ctx;
        const count = Math.floor(params.bodies ?? 4);
        const G = params.gravity ?? 400;

        const cx = width / 2;
        const cy = height / 2;

        if (bodies.length !== count) {
          bodies = [];
          for (let i = 0; i < count; i++) {
            const ang = (i * Math.PI * 2) / count;
            const dist = 120 + i * 20;
            const speed = Math.sqrt((G * 30) / dist);
            bodies.push({
              x: cx + Math.cos(ang) * dist,
              y: cy + Math.sin(ang) * dist,
              vx: -Math.sin(ang) * speed,
              vy: Math.cos(ang) * speed,
              mass: 20 + i * 15,
              trail: [],
            });
          }
        }

        // Gravitational integration
        const dt = 0.08;
        for (let i = 0; i < bodies.length; i++) {
          let fx = 0;
          let fy = 0;
          for (let j = 0; j < bodies.length; j++) {
            if (i === j) continue;
            const dx = bodies[j].x - bodies[i].x;
            const dy = bodies[j].y - bodies[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 20;
            const f = (G * bodies[j].mass) / (dist * dist);
            fx += (dx / dist) * f;
            fy += (dy / dist) * f;
          }
          bodies[i].vx += fx * dt;
          bodies[i].vy += fy * dt;
        }

        for (let i = 0; i < bodies.length; i++) {
          bodies[i].x += bodies[i].vx * dt;
          bodies[i].y += bodies[i].vy * dt;
          bodies[i].trail.push({ x: bodies[i].x, y: bodies[i].y });
          if (bodies[i].trail.length > 250) bodies[i].trail.shift();

          // Draw trail + body through the render-mode helpers
          drawPath(c, bodies[i].trail, mode, () => sampleColor(i / bodies.length), 1.2);
          fillCircle(c, bodies[i].x, bodies[i].y, Math.sqrt(bodies[i].mass) * 1.5, mode, sampleColor(0.95));
        }
      };
      const reset = () => { bodies = []; };
      return { render, reset };
    })(),
  },
];
