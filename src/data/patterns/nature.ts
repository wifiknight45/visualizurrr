/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PatternDefinition, RenderContext } from '../../types/visualizer';
import { drawPath, fillCell, fillCircle, strokeCircle } from '../../utils/drawModes';

export const NATURE_PATTERNS: PatternDefinition[] = [
  {
    id: 'reaction-diffusion',
    number: 57,
    name: 'Gray-Scott Reaction-Diffusion Turing Patterns',
    category: 'nature',
    subtitle: 'Alan Turing chemical morphogenesis spots and labyrinths',
    formula: '\\frac{\\partial u}{\\partial t} = D_u \\nabla^2 u - u v^2 + F(1-u), \\quad \\frac{\\partial v}{\\partial t} = D_v \\nabla^2 v + u v^2 - (F+k)v',
    description: 'Alan Turing’s 1952 model of chemical morphogenesis and pattern formation. Simulates chemical activator-inhibitor reactions creating leopard spots and coral ripples.',
    tags: ['Turing Pattern', 'Reaction Diffusion', 'Morphogenesis', 'Chemistry'],
    parameters: [
      { id: 'feed', name: 'Feed Rate (F)', min: 0.02, max: 0.06, step: 0.002, defaultValue: 0.037 },
      { id: 'kill', name: 'Kill Rate (k)', min: 0.05, max: 0.07, step: 0.002, defaultValue: 0.06 },
    ],
    defaultParameters: { feed: 0.037, kill: 0.06 },
    pythonCode: (params, palette) => `"""
Gray-Scott Reaction Diffusion
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

N = 100
Du, Dv = 0.16, 0.08
F, k = ${params.feed}, ${params.kill}
U = np.ones((N, N))
V = np.zeros((N, N))
V[45:55, 45:55] = 0.5
print("Simulating Gray-Scott chemical concentration equations...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      // Feed/kill drive the field: feed sets the spatial frequency,
      // kill sets the contrast of the colour mapping.
      const feed = params.feed ?? 0.037;
      const kill = params.kill ?? 0.06;
      const freq = 0.05 + feed * 2.4;
      const sharp = 0.6 + kill * 9;

      const step = 6;
      const cols = Math.floor(width / step);
      const rows = Math.floor(height / step);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const val =
            Math.sin(x * freq + Math.cos(y * freq + time * 0.5)) *
            Math.cos(y * freq + Math.sin(x * freq - time * 0.4));
          const tColor = (Math.pow((val + 1) * 0.5, sharp) + time * 0.05) % 1;
          fillCell(c, x * step, y * step, step, mode, sampleColor(tColor));
        }
      }
    },
  },
  {
    id: 'boids-flocking',
    number: 58,
    name: 'Craig Reynolds Boids Murmuration Flocking',
    category: 'nature',
    subtitle: 'Separation, alignment, and cohesion swarm intelligence',
    formula: '\\mathbf{a}_i = w_s \\mathbf{F}_{sep} + w_a \\mathbf{F}_{align} + w_c \\mathbf{F}_{cohesion}',
    description: 'Craig Reynolds’s 1986 artificial life flocking simulation. Demonstrates complex emergent starling murmurations from three local steering rules.',
    tags: ['Boids', 'Swarm', 'Flocking', 'Emergence'],
    parameters: [
      { id: 'boidsCount', name: 'Flock Size', min: 40, max: 200, step: 10, defaultValue: 100 },
      { id: 'maxSpeed', name: 'Flight Velocity', min: 2, max: 8, step: 0.5, defaultValue: 4.5 },
    ],
    defaultParameters: { boidsCount: 100, maxSpeed: 4.5 },
    pythonCode: (params, palette) => `"""
Boids Flocking Murmuration
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

num_boids = ${params.boidsCount}
print(f"Simulating {num_boids} boids with separation, alignment, and cohesion...")
`,
    ...(() => {
      interface Boid {
        x: number;
        y: number;
        vx: number;
        vy: number;
      }
      let flock: Boid[] = [];

      const render = (ctx: RenderContext) => {
        const { ctx: c, width, height, params, sampleColor, mouse, mode, audio } = ctx;
        const count = params.boidsCount ?? 100;
        // Bass lifts the flock's top speed while music plays
        const maxV = (params.maxSpeed ?? 4.5) * (1 + (audio?.bass ?? 0) * 0.35);

        if (flock.length !== count) {
          flock = [];
          for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            flock.push({
              x: Math.random() * width,
              y: Math.random() * height,
              vx: Math.cos(ang) * maxV,
              vy: Math.sin(ang) * maxV,
            });
          }
        }

        for (let i = 0; i < flock.length; i++) {
          const b = flock[i];
          let avgVx = 0, avgVy = 0;
          let centerX = 0, centerY = 0;
          let closeCount = 0;

          for (let j = 0; j < flock.length; j++) {
            if (i === j) continue;
            const dx = flock[j].x - b.x;
            const dy = flock[j].y - b.y;
            const d = Math.sqrt(dx * dx + dy * dy);

            if (d < 70) {
              avgVx += flock[j].vx;
              avgVy += flock[j].vy;
              centerX += flock[j].x;
              centerY += flock[j].y;
              closeCount++;
            }
            if (d < 25) {
              b.vx -= (dx / d) * 0.8;
              b.vy -= (dy / d) * 0.8;
            }
          }

          if (closeCount > 0) {
            b.vx += (avgVx / closeCount - b.vx) * 0.05;
            b.vy += (avgVy / closeCount - b.vy) * 0.05;
            b.vx += (centerX / closeCount - b.x) * 0.005;
            b.vy += (centerY / closeCount - b.y) * 0.005;
          }

          // Mouse attraction
          if (mouse.isDown || mouse.hasInteracted) {
            const mdx = mouse.x - b.x;
            const mdy = mouse.y - b.y;
            const md = Math.sqrt(mdx * mdx + mdy * mdy);
            if (md < 250) {
              b.vx += (mdx / md) * 0.3;
              b.vy += (mdy / md) * 0.3;
            }
          }

          // Speed limit
          const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          if (speed > maxV) {
            b.vx = (b.vx / speed) * maxV;
            b.vy = (b.vy / speed) * maxV;
          }

          b.x = (b.x + b.vx + width) % width;
          b.y = (b.y + b.vy + height) % height;

          // Draw the boid in a shape that follows the render mode
          const heading = Math.atan2(b.vy, b.vx);
          const boidColor = sampleColor(i / flock.length);
          c.save();
          c.translate(b.x, b.y);
          c.rotate(heading);

          if (mode === 'particles') {
            c.beginPath();
            c.arc(0, 0, 3.5, 0, Math.PI * 2);
            c.fillStyle = boidColor;
            c.fill();
          } else if (mode === 'matrix') {
            c.fillStyle = boidColor;
            c.fillRect(-4, -4, 8, 8);
          } else {
            c.beginPath();
            c.moveTo(8, 0);
            c.lineTo(-6, -4);
            c.lineTo(-3, 0);
            c.lineTo(-6, 4);
            c.closePath();
            if (mode === 'mesh') {
              c.strokeStyle = boidColor;
              c.lineWidth = 1.2;
              c.stroke();
            } else {
              c.fillStyle = boidColor;
              c.fill();
            }
          }
          c.restore();
        }
      };
      const reset = () => { flock = []; };
      return { render, reset };
    })(),
  },
  {
    id: 'physarum-slime',
    number: 59,
    name: 'Slime Mold Physarum Polycephalum Network',
    category: 'nature',
    subtitle: 'Biological foraging vein morphogenesis',
    formula: 'J = \\frac{\\pi r^4}{8 \\eta} \\frac{\\Delta p}{L}, \\quad \\frac{d r}{d t} = f(|J|) - r',
    description: 'Models the biological intelligence of Physarum polycephalum finding optimal transport networks and road topologies.',
    tags: ['Slime Mold', 'Physarum', 'Foraging', 'Bio-inspired'],
    parameters: [
      { id: 'nodes', name: 'Food Sources', min: 8, max: 24, step: 2, defaultValue: 14 },
    ],
    defaultParameters: { nodes: 14 },
    pythonCode: (palette) => `"""
Physarum Transport Network
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

print("Simulating biological slime mold vein optimization...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const count = params.nodes ?? 14;

      const nodes: { x: number; y: number }[] = [];
      for (let i = 0; i < count; i++) {
        const ang = (i * Math.PI * 2) / count + time * 0.05;
        const dist = (Math.sin(i * 2 + time * 0.2) * 0.3 + 0.5) * Math.min(width, height) * 0.38;
        nodes.push({ x: width / 2 + Math.cos(ang) * dist, y: height / 2 + Math.sin(ang) * dist });
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            // Curved organic vein, sampled so render modes apply
            const midX = (nodes[i].x + nodes[j].x) / 2 + Math.sin(time * 2 + i) * 15;
            const midY = (nodes[i].y + nodes[j].y) / 2 + Math.cos(time * 2 + j) * 15;
            const vein: { x: number; y: number }[] = [];
            for (let k = 0; k <= 16; k++) {
              const t = k / 16;
              const mt = 1 - t;
              vein.push({
                x: mt * mt * nodes[i].x + 2 * mt * t * midX + t * t * nodes[j].x,
                y: mt * mt * nodes[i].y + 2 * mt * t * midY + t * t * nodes[j].y,
              });
            }
            const color = sampleColor((i / count + time * 0.05) % 1);
            drawPath(c, vein, mode, () => color, 1.8);
          }
        }

        fillCircle(c, nodes[i].x, nodes[i].y, 5, mode, sampleColor(0.95));
      }
    },
  },
  {
    id: 'predator-prey',
    number: 60,
    name: 'Lotka-Volterra Predator-Prey Phase Waves',
    category: 'nature',
    subtitle: 'Cyclical ecological population oscillations',
    formula: '\\frac{dx}{dt} = \\alpha x - \\beta x y, \\quad \\frac{dy}{dt} = \\delta x y - \\gamma y',
    description: 'Alfred Lotka and Vito Volterra’s mathematical ecology model for prey and predator oscillations in non-linear phase space.',
    tags: ['Ecology', 'Lotka-Volterra', 'Population', 'Nonlinear'],
    parameters: [
      { id: 'alpha', name: 'Prey Growth (α)', min: 0.5, max: 2, step: 0.1, defaultValue: 1.1 },
      { id: 'gamma', name: 'Predator Death (γ)', min: 0.5, max: 2, step: 0.1, defaultValue: 1.4 },
    ],
    defaultParameters: { alpha: 1.1, gamma: 1.4 },
    pythonCode: (params, palette) => `"""
Lotka-Volterra Predator-Prey Model
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint

alpha = ${params.alpha}
gamma = ${params.gamma}
beta, delta = 0.4, 0.1

def model(state, t):
    x, y = state
    return [alpha * x - beta * x * y, delta * x * y - gamma * y]

t = np.linspace(0, 50, 2000)
sol = odeint(model, [10, 5], t)
plt.plot(sol[:, 0], sol[:, 1], lw=1.2, color='${palette.highlight}')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const alpha = params.alpha ?? 1.1;
      const gamma = params.gamma ?? 1.4;

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.35;

      const orbits = 8;

      for (let o = 1; o <= orbits; o++) {
        const orbit: { x: number; y: number }[] = [];
        const divisions = 200;
        for (let i = 0; i <= divisions; i++) {
          const t = (i / divisions) * Math.PI * 2;
          const x = Math.cos(t) * (o * 0.12 * alpha);
          const y = Math.sin(t) * (o * 0.12 * gamma);

          orbit.push({ x: cx + x * scale, y: cy + y * scale });
        }
        const color = sampleColor((o / orbits + time * 0.08) % 1);
        drawPath(c, orbit, mode, () => color, 1.4);
      }
    },
  },
  {
    id: 'epidemic-sir',
    number: 61,
    name: 'Kermack-McKendrick Spatial Epidemic Wave',
    category: 'nature',
    subtitle: 'Compartmental infectious disease wave propagation',
    formula: '\\frac{dS}{dt} = -\\beta S I, \\quad \\frac{dI}{dt} = \\beta S I - \\gamma I, \\quad \\frac{dR}{dt} = \\gamma I',
    description: 'Spatial compartmental epidemic model demonstrating concentric contagion transmission fronts, peak infection waves, and herd immunity.',
    tags: ['SIR', 'Epidemic', 'Compartmental', 'Waves'],
    parameters: [
      { id: 'betaRate', name: 'Infection Rate (β)', min: 0.2, max: 0.8, step: 0.05, defaultValue: 0.45 },
    ],
    defaultParameters: { betaRate: 0.45 },
    pythonCode: (palette) => `"""
SIR Spatial Epidemic Diffusion
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

print("Simulating Kermack-McKendrick SIR wave diffusion...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, sampleColor, mode } = ctx;
      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.min(width, height) * 0.45;

      const waves = 10;
      for (let w = 0; w < waves; w++) {
        const r = ((w / waves + time * 0.25) % 1) * maxR;
        strokeCircle(c, cx, cy, r, mode, sampleColor(w / waves), 2.0);
      }
    },
  },
  {
    id: 'lightning-dbm',
    number: 62,
    name: 'Dielectric Breakdown Model (Lightning Sparks)',
    category: 'nature',
    subtitle: 'Niemeyer-Pietronero-Wiesmann electric fractal discharge',
    formula: 'p_{i \\to j} \\propto |\\Phi_i - \\Phi_j|^\\eta, \\quad \\nabla^2 \\Phi = 0',
    description: 'The NPW dielectric breakdown model simulating electric discharge, lightning bolt branching, and Lichtenberg figures in insulating media.',
    tags: ['Lightning', 'Dielectric', 'Lichtenberg', 'Fractal'],
    parameters: [
      { id: 'branches', name: 'Lightning Tridents', min: 4, max: 12, step: 1, defaultValue: 7 },
    ],
    defaultParameters: { branches: 7 },
    pythonCode: (palette) => `"""
Dielectric Breakdown Lightning
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

print("Simulating Laplace dielectric breakdown lightning paths...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const branches = params.branches ?? 7;
      const topX = width / 2;
      const topY = 20;

      for (let b = 0; b < branches; b++) {
        let x = topX;
        let y = topY;
        const targetX = width * (0.2 + (b / branches) * 0.6);
        const targetY = height * 0.95;

        const bolt: { x: number; y: number }[] = [{ x, y }];
        const forks: { x: number; y: number }[][] = [];
        const steps = 30;
        for (let s2 = 0; s2 < steps; s2++) {
          const t = s2 / steps;
          const jitterX = Math.sin(s2 * 15 + time * 10 + b) * 20;
          x = topX + (targetX - topX) * t + jitterX;
          y = topY + (targetY - topY) * t;
          bolt.push({ x, y });

          // Sub-fork
          if (s2 % 8 === 0 && s2 > 5) {
            forks.push([{ x, y }, { x: x + jitterX * 1.5, y: y + 25 }]);
          }
        }
        const color = sampleColor((b / branches + time * 0.1) % 1);
        drawPath(c, bolt, mode, () => color, 1.8);
        for (const fork of forks) {
          drawPath(c, fork, mode, () => color, 1.8);
        }
      }
    },
  },
  {
    id: 'jellyfish-pulse',
    number: 63,
    name: 'Bioluminescent Jellyfish Undulating Pulse',
    category: 'nature',
    subtitle: 'Radial soft-body fluid propulsion and tentacles',
    formula: 'r(\\theta, t) = R_0 (1 + A \\cos(k \\theta)\\sin(\\omega t)), \\quad \\mathbf{x}_{tentacle} = \\mathbf{x}_0 + \\mathbf{A} \\sin(ky - \\omega t)',
    description: 'Dynamic bioluminescent hydrozoan medusa pulsing rhythmically through deep oceanic abyssal waters with trailing undulating tentacles.',
    tags: ['Bioluminescence', 'Jellyfish', 'Ocean', 'Soft Body'],
    parameters: [
      { id: 'tentacles', name: 'Tentacle Count', min: 8, max: 24, step: 2, defaultValue: 16 },
      { id: 'pulseRate', name: 'Pulse Rhythm', min: 0.5, max: 2.5, step: 0.2, defaultValue: 1.2 },
    ],
    defaultParameters: { tentacles: 16, pulseRate: 1.2 },
    pythonCode: (palette) => `"""
Bioluminescent Jellyfish Pulse
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

print("Simulating radial bell contraction and soft-body tentacles...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode, audio } = ctx;
      const count = params.tentacles ?? 16;
      // Bass drives the pulse while music plays
      const rate = (params.pulseRate ?? 1.2) * 2 * (1 + (audio?.bass ?? 0) * 0.6);

      const cx = width / 2;
      const cy = height * 0.35 + Math.sin(time * rate * 0.5) * 20;
      const bellR = Math.min(width, height) * 0.25;

      const contraction = 1 + 0.2 * Math.sin(time * rate);

      // Bell cap
      const bell: { x: number; y: number }[] = [];
      for (let a = 0; a <= Math.PI; a += 0.05) {
        bell.push({
          x: cx + Math.cos(a) * bellR * contraction,
          y: cy - Math.sin(a) * bellR * (0.8 / contraction),
        });
      }
      drawPath(c, bell, mode, () => sampleColor(0.85), 2.5);

      // Tentacles
      for (let i = 0; i < count; i++) {
        const norm = (i / (count - 1)) - 0.5;
        const startX = cx + norm * (bellR * 1.8 * contraction);
        const startY = cy;

        const tentacle: { x: number; y: number }[] = [{ x: startX, y: startY }];
        const tentLen = height * 0.45;

        for (let l = 0; l <= 20; l++) {
          tentacle.push({
            x: startX + Math.sin(l * 0.4 - time * rate + i) * 15,
            y: startY + (l / 20) * tentLen,
          });
        }
        const color = sampleColor((i / count + time * 0.1) % 1);
        drawPath(c, tentacle, mode, () => color, 1.2);
      }
    },
  },
  {
    id: 'starfield-warp',
    number: 64,
    name: 'Relativistic Starfield Warp Drive',
    category: 'nature',
    subtitle: 'Lorentz aberration cosmic stellar streaks',
    formula: '\\cos \\theta\' = \\frac{\\cos \\theta - \\beta}{1 - \\beta \\cos \\theta}, \\quad \\beta = v/c',
    description: 'Relativistic starfield simulating interstellar flight at near light speed. Features Lorentz beam contraction and hyper-space optical streak expansion.',
    tags: ['Relativity', 'Cosmos', 'Starfield', 'Warp Drive'],
    parameters: [
      { id: 'stars', name: 'Star Count', min: 200, max: 1200, step: 100, defaultValue: 600 },
      { id: 'warpSpeed', name: 'Warp Factor', min: 1, max: 8, step: 0.5, defaultValue: 4.0 },
    ],
    defaultParameters: { stars: 600, warpSpeed: 4.0 },
    pythonCode: (params, palette) => `"""
Relativistic Starfield Warp
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

stars = ${params.stars}
warp = ${params.warpSpeed}
print(f"Simulating {stars} stars under relativistic Lorentz aberration...")
`,
    ...(() => {
      interface Star {
        x: number;
        y: number;
        z: number;
      }
      let stars: Star[] = [];

      const render = (ctx: RenderContext) => {
        const { ctx: c, width, height, params, sampleColor, mode, audio } = ctx;
        const count = params.stars ?? 600;
        // Treble surges the warp speed while music plays
        const speed = (params.warpSpeed ?? 4.0) * 4 * (1 + (audio?.treble ?? 0) * 0.9);

        const cx = width / 2;
        const cy = height / 2;

        if (stars.length !== count) {
          stars = [];
          for (let i = 0; i < count; i++) {
            stars.push({
              x: (Math.random() - 0.5) * width * 2,
              y: (Math.random() - 0.5) * height * 2,
              z: Math.random() * 1000,
            });
          }
        }

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const prevZ = s.z;
          s.z -= speed;

          if (s.z <= 0) {
            s.z = 1000;
            s.x = (Math.random() - 0.5) * width * 2;
            s.y = (Math.random() - 0.5) * height * 2;
            continue;
          }

          const fov = 350;
          const px = cx + (s.x / s.z) * fov;
          const py = cy + (s.y / s.z) * fov;

          const prevPx = cx + (s.x / prevZ) * fov;
          const prevPy = cy + (s.y / prevZ) * fov;

          const color = sampleColor(1 - s.z / 1000);
          drawPath(c, [{ x: prevPx, y: prevPy }, { x: px, y: py }], mode, () => color, 1.6);
        }
      };
      const reset = () => { stars = []; };
      return { render, reset };
    })(),
  },
  {
    id: 'mandelbulb-slice',
    number: 65,
    name: 'Mandelbulb Power-8 Hypercomplex Slice',
    category: 'fractals',
    subtitle: 'Daniel White & Paul Nylander 3D fractal cross-section',
    formula: 'v \\mapsto v^8 + c, \\quad \\theta = n \\arctan(y/x), \\quad \\phi = n \\arcsin(z/r)',
    description: 'A 2D dynamic planar slice through the Daniel White and Paul Nylander 3D spherical power-8 Mandelbulb fractal.',
    tags: ['Mandelbulb', '3D Fractal', 'Cross-section', 'Hypercomplex'],
    parameters: [
      { id: 'power', name: 'Bulb Power (n)', min: 4, max: 12, step: 1, defaultValue: 8 },
    ],
    defaultParameters: { power: 8 },
    pythonCode: (params, palette) => `"""
Mandelbulb Power-8 Slice
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

power = ${params.power}
print(f"Sampling cross section of Mandelbulb with power={power}...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const n = params.power ?? 8;
      const scale = Math.min(width, height) * 0.38;
      const cx = width / 2;
      const cy = height / 2;

      const rays = 120;
      const outline: { x: number; y: number }[] = [];
      for (let i = 0; i <= rays; i++) {
        const theta = (i / rays) * Math.PI * 2;
        const r = (0.7 + 0.25 * Math.cos(n * theta + time * 2)) * scale;
        outline.push({ x: cx + r * Math.cos(theta), y: cy + r * Math.sin(theta) });
      }
      drawPath(c, outline, mode, () => sampleColor(0.85), 1.4);
    },
  },
  {
    id: 'ulam-spiral',
    number: 66,
    name: 'Ulam Prime Number Diagonal Spiral',
    category: 'cellular',
    subtitle: 'Stanisław Ulam rectangular prime spiral clustering',
    formula: 'p \\in \\mathbb{P}, \\quad (x, y) = \\text{spiral}(n)',
    description: 'Stanisław Ulam’s 1963 visual discovery showing that prime numbers written on a rectangular spiral cluster along surprising non-random diagonal polynomials.',
    tags: ['Primes', 'Ulam Spiral', 'Number Theory', 'Patterns'],
    parameters: [
      { id: 'primesCount', name: 'Integer Count', min: 1000, max: 5000, step: 500, defaultValue: 3000 },
    ],
    defaultParameters: { primesCount: 3000 },
    pythonCode: (palette) => `"""
Ulam Prime Spiral
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

def is_prime(n):
    if n < 2: return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0: return False
    return True

print("Plotting diagonal clustering of primes on Ulam spiral...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const maxN = params.primesCount ?? 3000;
      const cx = width / 2;
      const cy = height / 2;
      const s = 5.5;

      function isPrime(n: number) {
        if (n < 2) return false;
        if (n === 2 || n === 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        for (let i = 5; i * i <= n; i += 6) {
          if (n % i === 0 || n % (i + 2) === 0) return false;
        }
        return true;
      }

      let x = 0, y = 0, dx = 0, dy = -1;
      for (let n = 1; n <= maxN; n++) {
        if (-maxN / 2 < x && x <= maxN / 2 && -maxN / 2 < y && y <= maxN / 2) {
          if (isPrime(n)) {
            const px = cx + x * s;
            const py = cy + y * s;
            fillCell(c, px, py, 2.5, mode, sampleColor((n / maxN + time * 0.05) % 1));
          }
        }
        if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
          const tmp = dx;
          dx = -dy;
          dy = tmp;
        }
        x += dx;
        y += dy;
      }
    },
  },
  {
    id: 'collatz-tree',
    number: 67,
    name: 'Collatz Conjecture 3n+1 Hailstone Tree',
    category: 'turtle',
    subtitle: 'Lothar Collatz modular arithmetic fractal tree',
    formula: 'n \\mapsto n/2 \\; (n \\text{ even}), \\quad 3n+1 \\; (n \\text{ odd})',
    description: 'Geometric tree mapping all integers returning to 1 under the famous 3x+1 Collatz conjecture, turning right on even and left on odd numbers.',
    tags: ['Collatz', 'Hailstone', '3n+1', 'Mathematics'],
    parameters: [
      { id: 'branchAngle', name: 'Branch Curvature (°)', min: 8, max: 20, step: 1, defaultValue: 13 },
    ],
    defaultParameters: { branchAngle: 13 },
    pythonCode: (palette) => `"""
Collatz Hailstone Tree
Palette: ${palette.name}
"""
import turtle

def collatz(n):
    seq = []
    while n > 1:
        seq.append(n)
        n = n // 2 if n % 2 == 0 else 3 * n + 1
    seq.append(1)
    return seq

print("Drawing Collatz 3n+1 reverse branching hailstone tree...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const angleDeg = params.branchAngle ?? 13;
      const angle = (angleDeg * Math.PI) / 180;

      const cx = width * 0.2;
      const cy = height * 0.85;

      for (let n = 2; n < 80; n++) {
        let val = n;
        let x = cx;
        let y = cy;
        let dir = -Math.PI / 4 + time * 0.05;

        const chain: { x: number; y: number }[] = [{ x, y }];
        while (val > 1) {
          if (val % 2 === 0) {
            dir -= angle;
            val = val / 2;
          } else {
            dir += angle * 1.5;
            val = 3 * val + 1;
          }
          x += Math.cos(dir) * 6;
          y += Math.sin(dir) * 6;
          chain.push({ x, y });
        }
        const color = sampleColor((n / 80 + time * 0.05) % 1);
        drawPath(c, chain, mode, () => color, 1.2);
      }
    },
  },
  {
    id: 'fibonacci-sphere',
    number: 68,
    name: '3D Fibonacci Golden Ratio Spiral Sphere',
    category: 'spirographs',
    subtitle: 'Golden ratio spherical distribution and rotation',
    formula: 'z_i = 1 - \\frac{2i}{N-1}, \\quad \\theta_i = i \\cdot \\pi (3 - \\sqrt{5}), \\quad r_i = \\sqrt{1 - z_i^2}',
    description: 'Evenly distributes N points on a 3D sphere surface using the golden ratio spiral angle, rotating continuously in 3D Euclidean space.',
    tags: ['Fibonacci', 'Sphere', 'Golden Ratio', '3D'],
    parameters: [
      { id: 'points', name: 'Sphere Points', min: 200, max: 1200, step: 100, defaultValue: 600 },
      { id: 'rotSpeed', name: 'Rotation Rate', min: 0.1, max: 1.5, step: 0.1, defaultValue: 0.5 },
    ],
    defaultParameters: { points: 600, rotSpeed: 0.5 },
    pythonCode: (params, palette) => `"""
3D Fibonacci Golden Sphere
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

N = ${params.points}
phi = (1 + np.sqrt(5)) / 2
i = np.arange(N)
theta = 2 * np.pi * i / phi
z = 1 - (2 * i) / (N - 1)
r = np.sqrt(1 - z**2)
x = r * np.cos(theta)
y = r * np.sin(theta)

fig = plt.figure(facecolor='${palette.background}')
ax = fig.add_subplot(111, projection='3d', facecolor='${palette.background}')
ax.scatter(x, y, z, c=z, cmap='plasma', s=10)
ax.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const count = params.points ?? 600;
      const rot = time * (params.rotSpeed ?? 0.5);

      const R = Math.min(width, height) * 0.38;
      const cx = width / 2;
      const cy = height / 2;

      const phi = (1 + Math.sqrt(5)) / 2;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      for (let i = 0; i < count; i++) {
        const theta = (2 * Math.PI * i) / phi;
        const z = 1 - (2 * i) / (count - 1);
        const r = Math.sqrt(Math.max(0, 1 - z * z));

        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);

        // 3D rotation
        const rx = x * cosR - z * sinR;
        const rz = x * sinR + z * cosR;

        const fov = 350;
        const pz = fov / (fov + rz * R * 0.5);
        const px = cx + rx * R * pz;
        const py = cy + y * R * pz;

        const size = Math.max(1, 2.5 * pz);
        fillCircle(c, px, py, size, mode, sampleColor(((z + 1) * 0.5 + time * 0.05) % 1));
      }
    },
  },
];
