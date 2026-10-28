/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PatternDefinition } from '../../types/visualizer';

export const OPTICS_PATTERNS: PatternDefinition[] = [
  {
    id: 'moire-interference',
    number: 49,
    name: 'Moiré Angular Interference Grating',
    category: 'optics',
    subtitle: 'Superimposed rotating optical beat frequencies',
    formula: 'I(x, y) = \\frac{1}{2}\\left(1 + \\cos(\\mathbf{k}_1 \\cdot \\mathbf{r})\\cos(\\mathbf{k}_2 \\cdot \\mathbf{r})\\right)',
    description: 'Optical phenomenon where overlapping periodic line lattices rotate relative to each other, producing large-scale macroscopic beat frequency fringes.',
    tags: ['Moire', 'Interference', 'Optics', 'Beats'],
    parameters: [
      { id: 'lines', name: 'Grating Line Density', min: 20, max: 80, step: 5, defaultValue: 45 },
      { id: 'rotSpeed', name: 'Angular Beat Velocity', min: 0.1, max: 1.5, step: 0.1, defaultValue: 0.4 },
    ],
    defaultParameters: { lines: 45, rotSpeed: 0.4 },
    pythonCode: (params, paletteName) => `"""
Moiré Pattern Interference
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

lines = ${params.lines}
x = np.linspace(-1, 1, 500)
y = np.linspace(-1, 1, 500)
X, Y = np.meshgrid(x, y)

angle = np.radians(8.5)
g1 = np.sin(lines * X)
g2 = np.sin(lines * (X * np.cos(angle) + Y * np.sin(angle)))
moire = g1 * g2

plt.imshow(moire, cmap='gray')
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const count = params.lines ?? 45;
      const rate = (params.rotSpeed ?? 0.4) * 0.2;

      const cx = width / 2;
      const cy = height / 2;
      const maxDim = Math.max(width, height) * 1.2;

      c.lineWidth = 1.6;

      // Base layer
      c.strokeStyle = sampleColor(0.2);
      for (let i = -count; i <= count; i++) {
        const x = cx + (i * maxDim) / (count * 2);
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, height);
        c.stroke();
      }

      // Overlapping rotating layer
      const rot = time * rate;
      c.save();
      c.translate(cx, cy);
      c.rotate(rot);
      c.strokeStyle = sampleColor(0.85);

      for (let i = -count; i <= count; i++) {
        const x = (i * maxDim) / (count * 2);
        c.beginPath();
        c.moveTo(x, -maxDim / 2);
        c.lineTo(x, maxDim / 2);
        c.stroke();
      }
      c.restore();
    },
  },
  {
    id: 'penrose-tiling',
    number: 50,
    name: 'Penrose P3 Aperiodic Quasi-Crystal',
    category: 'optics',
    subtitle: '5-fold non-periodic dart and kite quasicrystal',
    formula: '\\phi = \\frac{1 + \\sqrt{5}}{2} \\approx 1.6180339887...',
    description: 'Sir Roger Penrose’s 1974 discovery of aperiodic tiling. Exhibits 5-fold rotational symmetry without translational repetition, matching quasicrystals.',
    tags: ['Penrose', 'Aperiodic', 'Quasicrystal', 'Phi'],
    parameters: [
      { id: 'generations', name: 'Subdivision Depth', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParameters: { generations: 3 },
    pythonCode: (params, paletteName) => `"""
Penrose P3 Tiling
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

phi = (1 + np.sqrt(5)) / 2
print("Subdividing golden triangles into Penrose darts and kites...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const gen = Math.min(Math.floor(params.generations ?? 3), 4);
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.44;
      const rot = time * 0.05;

      const phi = (1 + Math.sqrt(5)) / 2;

      interface Triangle {
        type: 0 | 1; // 0=thin (golden), 1=thick
        a: { x: number; y: number };
        b: { x: number; y: number };
        c: { x: number; y: number };
      }

      let triangles: Triangle[] = [];
      // Initial wheel of 10 triangles
      for (let i = 0; i < 10; i++) {
        const bAng = ((2 * i - 1) * Math.PI) / 10 + rot;
        const cAng = ((2 * i + 1) * Math.PI) / 10 + rot;
        const bPt = { x: cx + radius * Math.cos(bAng), y: cy + radius * Math.sin(bAng) };
        const cPt = { x: cx + radius * Math.cos(cAng), y: cy + radius * Math.sin(cAng) };
        if (i % 2 === 0) {
          triangles.push({ type: 0, a: { x: cx, y: cy }, b: bPt, c: cPt });
        } else {
          triangles.push({ type: 0, a: { x: cx, y: cy }, b: cPt, c: bPt });
        }
      }

      for (let g = 0; g < gen; g++) {
        const next: Triangle[] = [];
        for (const t of triangles) {
          if (t.type === 0) {
            const p = {
              x: t.a.x + (t.b.x - t.a.x) / phi,
              y: t.a.y + (t.b.y - t.a.y) / phi,
            };
            next.push({ type: 0, a: t.c, b: p, c: t.b });
            next.push({ type: 1, a: p, b: t.c, c: t.a });
          } else {
            const q = {
              x: t.b.x + (t.a.x - t.b.x) / phi,
              y: t.b.y + (t.a.y - t.b.y) / phi,
            };
            const r = {
              x: t.b.x + (t.c.x - t.b.x) / phi,
              y: t.b.y + (t.c.y - t.b.y) / phi,
            };
            next.push({ type: 1, a: r, b: t.c, c: t.a });
            next.push({ type: 1, a: q, b: r, c: t.b });
            next.push({ type: 0, a: r, b: q, c: t.a });
          }
        }
        triangles = next;
      }

      c.lineWidth = 1.0;
      for (let i = 0; i < triangles.length; i++) {
        const t = triangles[i];
        c.beginPath();
        c.moveTo(t.a.x, t.a.y);
        c.lineTo(t.b.x, t.b.y);
        c.lineTo(t.c.x, t.c.y);
        c.closePath();

        c.fillStyle = sampleColor(t.type === 0 ? 0.35 : 0.85);
        c.fill();
        c.strokeStyle = sampleColor(0.15);
        c.stroke();
      }
    },
  },
  {
    id: 'voronoi-cells',
    number: 51,
    name: 'Voronoi Organic Cellular Partition',
    category: 'optics',
    subtitle: 'Dirichlet proximity tessellation',
    formula: 'V(P_i) = \\{x \\in X \\mid d(x, P_i) \\le d(x, P_j) \\; \\forall j \\neq i\\}',
    description: 'Georgy Voronoy’s space partitioning based on nearest generator distance. Models giraffe coat patterns, dragonfly wings, and cellular tissue structures.',
    tags: ['Voronoi', 'Dirichlet', 'Biology', 'Tessellation'],
    parameters: [
      { id: 'seeds', name: 'Seed Points', min: 15, max: 50, step: 5, defaultValue: 28 },
    ],
    defaultParameters: { seeds: 28 },
    pythonCode: (params, paletteName) => `"""
Voronoi Diagram in Python
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt
from scipy.spatial import Voronoi, voronoi_plot_2d

points = np.random.rand(${params.seeds}, 2)
vor = Voronoi(points)
fig = voronoi_plot_2d(vor, show_vertices=False, line_colors='#00f0ff', line_width=1.5)
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const count = params.seeds ?? 28;

      // Deterministic dynamic seeds
      const seeds: { x: number; y: number }[] = [];
      for (let i = 0; i < count; i++) {
        const ang = i * 2.39996 + time * 0.2;
        const rad = (Math.sin(i * 1.5 + time * 0.3) * 0.4 + 0.5) * Math.min(width, height) * 0.42;
        seeds.push({
          x: width / 2 + Math.cos(ang) * rad,
          y: height / 2 + Math.sin(ang) * rad,
        });
      }

      // Fast render by Voronoi cell circles & borders
      c.lineWidth = 1.4;
      for (let i = 0; i < seeds.length; i++) {
        for (let j = i + 1; j < seeds.length; j++) {
          const dx = seeds[i].x - seeds[j].x;
          const dy = seeds[i].y - seeds[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const midX = (seeds[i].x + seeds[j].x) / 2;
            const midY = (seeds[i].y + seeds[j].y) / 2;

            // Perpendicular bisector
            const perpX = -dy / dist;
            const perpY = dx / dist;

            c.beginPath();
            c.moveTo(midX - perpX * 40, midY - perpY * 40);
            c.lineTo(midX + perpX * 40, midY + perpY * 40);
            c.strokeStyle = sampleColor((i / count + time * 0.05) % 1);
            c.stroke();
          }
        }

        // Draw seed nucleus
        c.fillStyle = sampleColor(0.95);
        c.beginPath();
        c.arc(seeds[i].x, seeds[i].y, 3.5, 0, Math.PI * 2);
        c.fill();
      }
    },
  },
  {
    id: 'delaunay-network',
    number: 52,
    name: 'Delaunay Dual Constrained Mesh',
    category: 'optics',
    subtitle: 'Circumcircle-free optimal triangulation',
    formula: '\\text{No point } P_k \\text{ inside circumcircle of } \\triangle(P_i, P_j, P_m)',
    description: 'Boris Delaunay’s 1934 mathematical triangulation dual to Voronoi diagrams. Maximizes minimum angles to avoid skinny triangles.',
    tags: ['Delaunay', 'Mesh', 'Triangulation', 'Network'],
    parameters: [
      { id: 'nodes', name: 'Network Nodes', min: 20, max: 60, step: 5, defaultValue: 35 },
    ],
    defaultParameters: { nodes: 35 },
    pythonCode: (params, paletteName) => `"""
Delaunay Triangulation
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt
from scipy.spatial import Delaunay

points = np.random.rand(${params.nodes}, 2)
tri = Delaunay(points)
plt.triplot(points[:,0], points[:,1], tri.simplices, color='#ff2a85', lw=1.2)
plt.axis('off')
plt.show()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const count = params.nodes ?? 35;

      const nodes: { x: number; y: number }[] = [];
      for (let i = 0; i < count; i++) {
        const ang = i * 2.39996 + time * 0.25;
        const rad = (Math.cos(i * 1.8 + time * 0.2) * 0.35 + 0.45) * Math.min(width, height) * 0.4;
        nodes.push({
          x: width / 2 + Math.cos(ang) * rad,
          y: height / 2 + Math.sin(ang) * rad,
        });
      }

      c.lineWidth = 1.2;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < 160) {
            c.beginPath();
            c.moveTo(nodes[i].x, nodes[i].y);
            c.lineTo(nodes[j].x, nodes[j].y);
            c.strokeStyle = sampleColor((1 - d / 160) * 0.8 + 0.2);
            c.stroke();
          }
        }

        c.fillStyle = sampleColor(0.95);
        c.beginPath();
        c.arc(nodes[i].x, nodes[i].y, 3, 0, Math.PI * 2);
        c.fill();
      }
    },
  },
  {
    id: 'op-art-sphere',
    number: 53,
    name: 'Op-Art 3D Sphere Bulge Distortion',
    category: 'optics',
    subtitle: 'Victor Vasarely optical kinetic deformation',
    formula: 'z = \\sqrt{R^2 - r^2}, \\quad (x\', y\') = (x, y) \\times \\left(1 + \\frac{z}{R}\\right)',
    description: 'Inspired by Victor Vasarely’s Op-Art kinetic illusions. A planar Cartesian coordinate checkerboard deformed outward by a virtual 3D sphere.',
    tags: ['Op-Art', 'Vasarely', 'Illusion', 'Optics'],
    parameters: [
      { id: 'gridLines', name: 'Grid Lines', min: 16, max: 40, step: 2, defaultValue: 26 },
      { id: 'bulge', name: 'Bulge Radius', min: 100, max: 250, step: 10, defaultValue: 170 },
    ],
    defaultParameters: { gridLines: 26, bulge: 170 },
    pythonCode: (params, paletteName) => `"""
Op-Art Bulge Illusion
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

print("Generating Victor Vasarely Op-Art spherical deformation...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const lines = params.gridLines ?? 26;
      const R = params.bulge ?? 170;

      const cx = width / 2;
      const cy = height / 2;
      const maxDim = Math.min(width, height) * 0.75;

      c.lineWidth = 1.3;

      // Horizontal warped lines
      for (let i = 0; i <= lines; i++) {
        const yNorm = (i / lines - 0.5) * maxDim;
        c.beginPath();

        for (let x = -maxDim / 2; x <= maxDim / 2; x += 4) {
          const r = Math.sqrt(x * x + yNorm * yNorm);
          let dz = 0;
          if (r < R) {
            dz = Math.sqrt(R * R - r * r) * (0.6 + 0.3 * Math.sin(time * 2));
          }
          const px = cx + x * (1 + dz / R * 0.3);
          const py = cy + (yNorm - dz * 0.5);

          if (x === -maxDim / 2) c.moveTo(px, py);
          else c.lineTo(px, py);
        }
        c.strokeStyle = sampleColor((i / lines + time * 0.05) % 1);
        c.stroke();
      }

      // Vertical warped lines
      for (let i = 0; i <= lines; i++) {
        const xNorm = (i / lines - 0.5) * maxDim;
        c.beginPath();

        for (let y = -maxDim / 2; y <= maxDim / 2; y += 4) {
          const r = Math.sqrt(xNorm * xNorm + y * y);
          let dz = 0;
          if (r < R) {
            dz = Math.sqrt(R * R - r * r) * (0.6 + 0.3 * Math.sin(time * 2));
          }
          const px = cx + (xNorm + dz * 0.5);
          const py = cy + y * (1 + dz / R * 0.3);

          if (y === -maxDim / 2) c.moveTo(px, py);
          else c.lineTo(px, py);
        }
        c.strokeStyle = sampleColor((i / lines + time * 0.05) % 1);
        c.stroke();
      }
    },
  },
  {
    id: 'tunnel-vortex',
    number: 54,
    name: 'Anamorphic Infinite Tunnel Vortex',
    category: 'optics',
    subtitle: 'Logarithmic perspective spacetime corridor',
    formula: 'r_k = r_0 e^{-k \\cdot \\lambda}, \\quad \\theta_k = \\theta_0 + k \\cdot \\Delta \\theta',
    description: 'Anamorphic infinite perspective tunnel creating deep illusions of flying through a twisting mathematical wormhole.',
    tags: ['Tunnel', 'Wormhole', 'Perspective', 'Optics'],
    parameters: [
      { id: 'rings', name: 'Tunnel Depth Rings', min: 15, max: 45, step: 5, defaultValue: 28 },
      { id: 'twist', name: 'Twist Frequency', min: 2, max: 8, step: 1, defaultValue: 4 },
    ],
    defaultParameters: { rings: 28, twist: 4 },
    pythonCode: (params, paletteName) => `"""
Infinite Tunnel Vortex
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

rings = ${params.rings}
print(f"Rendering {rings}-ring perspective tunnel corridor...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const rings = params.rings ?? 28;
      const twist = params.twist ?? 4;

      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.max(width, height) * 0.65;

      c.lineWidth = 1.5;

      for (let i = 0; i < rings; i++) {
        // Continuous moving depth
        const depth = ((i / rings + time * 0.3) % 1);
        const r = maxR * Math.pow(depth, 2.2);
        const rot = time * 0.5 + depth * twist;

        c.beginPath();
        const segments = 8;
        for (let s = 0; s <= segments; s++) {
          const ang = (s * Math.PI * 2) / segments + rot;
          const px = cx + r * Math.cos(ang);
          const py = cy + r * Math.sin(ang);
          if (s === 0) c.moveTo(px, py);
          else c.lineTo(px, py);
        }
        c.strokeStyle = sampleColor((depth + time * 0.1) % 1);
        c.stroke();
      }
    },
  },
  {
    id: 'tesseract-4d',
    number: 55,
    name: '4D Hypercube Tesseract Wireframe',
    category: 'optics',
    subtitle: 'Orthogonal 4D rotation into 2D canvas shadow',
    formula: 'x, y, z, w \\in \\{-1, 1\\}^4, \\quad R_{xw}(\\theta), R_{zw}(\\phi)',
    description: 'Charles Howard Hinton’s 4D hypercube projected stereographically onto the 2D plane as it undergoes double orthogonal rotations in 4D Euclidean space.',
    tags: ['4D', 'Tesseract', 'Hypercube', 'Geometry'],
    parameters: [
      { id: 'rotSpeed', name: '4D Rotation Rate', min: 0.2, max: 2, step: 0.1, defaultValue: 0.8 },
      { id: 'scale', name: 'Projection Size', min: 100, max: 260, step: 10, defaultValue: 180 },
    ],
    defaultParameters: { rotSpeed: 0.8, scale: 180 },
    pythonCode: (params, paletteName) => `"""
4D Tesseract Wireframe Projection
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

# 16 vertices of 4D hypercube
vertices = np.array([[x, y, z, w]
    for x in (-1, 1) for y in (-1, 1)
    for z in (-1, 1) for w in (-1, 1)])
print("Projecting 16 vertices and 32 edges of 4D Tesseract...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const speed = (params.rotSpeed ?? 0.8) * 0.7;
      const size = (params.scale ?? 180) * (Math.min(width, height) / 520);

      const cx = width / 2;
      const cy = height / 2;

      const theta = time * speed;
      const phi = time * speed * 0.618;

      // 16 4D vertices
      const verts: number[][] = [];
      for (let x of [-1, 1]) {
        for (let y of [-1, 1]) {
          for (let z of [-1, 1]) {
            for (let w of [-1, 1]) {
              verts.push([x, y, z, w]);
            }
          }
        }
      }

      // Rotate in 4D and project to 2D
      const proj: { x: number; y: number }[] = [];
      for (let v of verts) {
        let [x, y, z, w] = v;

        // XW rotation
        const cosT = Math.cos(theta), sinT = Math.sin(theta);
        const x1 = x * cosT - w * sinT;
        const w1 = x * sinT + w * cosT;

        // YZ rotation
        const cosP = Math.cos(phi), sinP = Math.sin(phi);
        const y1 = y * cosP - z * sinP;
        const z1 = y * sinP + z * cosP;

        // 4D perspective divide
        const dist = 2.4;
        const wFactor = 1 / (dist - w1 * 0.5);
        const px3 = x1 * wFactor;
        const py3 = y1 * wFactor;
        const pz3 = z1 * wFactor;

        // 3D perspective divide
        const zDist = 2.5;
        const zFactor = 1 / (zDist - pz3 * 0.5);
        proj.push({
          x: cx + px3 * zFactor * size,
          y: cy + py3 * zFactor * size,
        });
      }

      // 32 edges (connect vertices that differ by exactly 1 coordinate)
      c.lineWidth = 1.4;
      for (let i = 0; i < 16; i++) {
        for (let j = i + 1; j < 16; j++) {
          let diff = 0;
          for (let k = 0; k < 4; k++) {
            if (verts[i][k] !== verts[j][k]) diff++;
          }
          if (diff === 1) {
            c.beginPath();
            c.moveTo(proj[i].x, proj[i].y);
            c.lineTo(proj[j].x, proj[j].y);
            c.strokeStyle = sampleColor((i / 16 + time * 0.1) % 1);
            c.stroke();
          }
        }

        // Draw vertex
        c.fillStyle = sampleColor(0.95);
        c.beginPath();
        c.arc(proj[i].x, proj[i].y, 3.5, 0, Math.PI * 2);
        c.fill();
      }
    },
  },
  {
    id: 'geodesic-dome',
    number: 56,
    name: 'Geodesic Icosahedron Spherical Dome',
    category: 'optics',
    subtitle: 'Buckminster Fuller triangular spherical lattice',
    formula: 'V - E + F = 2, \\quad \\text{Normalized icosahedral subdivision}',
    description: 'Buckminster Fuller’s geodesic dome formed by subdividing spherical icosahedron faces into triangular networks with maximum volume-to-surface efficiency.',
    tags: ['Geodesic', 'Fuller', 'Icosahedron', '3D Polyhedra'],
    parameters: [
      { id: 'rotSpeed', name: 'Rotation Rate', min: 0.1, max: 1.5, step: 0.1, defaultValue: 0.5 },
      { id: 'radius', name: 'Sphere Radius', min: 100, max: 260, step: 10, defaultValue: 180 },
    ],
    defaultParameters: { rotSpeed: 0.5, radius: 180 },
    pythonCode: (params, paletteName) => `"""
Geodesic Icosahedral Dome
Palette: ${paletteName}
"""
import numpy as np
import matplotlib.pyplot as plt

phi = (1 + np.sqrt(5)) / 2
print("Projecting 12 golden-ratio vertices of regular icosahedron...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor } = ctx;
      const rot = time * (params.rotSpeed ?? 0.5);
      const R = (params.radius ?? 180) * (Math.min(width, height) / 520);
      const cx = width / 2;
      const cy = height / 2;

      const phi = (1 + Math.sqrt(5)) / 2;
      const rawVerts: number[][] = [
        [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
        [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
        [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
      ];

      // Normalize to unit sphere
      const verts = rawVerts.map(v => {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return [v[0] / len, v[1] / len, v[2] / len];
      });

      const cosY = Math.cos(rot), sinY = Math.sin(rot);
      const cosX = Math.cos(rot * 0.7), sinX = Math.sin(rot * 0.7);

      const proj = verts.map(v => {
        const x1 = v[0] * cosY - v[2] * sinY;
        const z1 = v[0] * sinY + v[2] * cosY;
        const y1 = v[1] * cosX - z1 * sinX;
        const z2 = v[1] * sinX + z1 * cosX;

        return {
          x: cx + x1 * R,
          y: cy + y1 * R,
          z: z2,
        };
      });

      c.lineWidth = 1.3;
      // Connect adjacent vertices (dist ~ 1.05)
      for (let i = 0; i < verts.length; i++) {
        for (let j = i + 1; j < verts.length; j++) {
          const dx = verts[i][0] - verts[j][0];
          const dy = verts[i][1] - verts[j][1];
          const dz = verts[i][2] - verts[j][2];
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (d < 1.1) {
            c.beginPath();
            c.moveTo(proj[i].x, proj[i].y);
            c.lineTo(proj[j].x, proj[j].y);
            c.strokeStyle = sampleColor((i / verts.length + time * 0.08) % 1);
            c.stroke();
          }
        }

        c.fillStyle = sampleColor(0.95);
        c.beginPath();
        c.arc(proj[i].x, proj[i].y, 4, 0, Math.PI * 2);
        c.fill();
      }
    },
  },
];
