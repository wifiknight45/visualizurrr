/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PatternDefinition } from '../../types/visualizer';
import { drawPath, fillCircle } from '../../utils/drawModes';

export const TURTLE_PATTERNS: PatternDefinition[] = [
  {
    id: 'koch-snowflake',
    number: 41,
    name: 'Koch Snowflake Island',
    category: 'turtle',
    subtitle: 'Infinite perimeter enclosing finite area',
    formula: 'L_n = 3 \\cdot s \\cdot (4/3)^n, \\quad A_n = A_0 \\left(1 + \\frac{1}{3}\\sum_{k=1}^n \\left(\\frac{4}{9}\\right)^k\\right)',
    description: 'Helge von Koch’s 1904 fractal curve. Starting from an equilateral triangle, each line segment is recursively replaced by an equilateral triangular bump.',
    tags: ['Koch', 'Turtle', 'Recursion', 'Fractal'],
    parameters: [
      { id: 'depth', name: 'Recursion Depth', min: 1, max: 5, step: 1, defaultValue: 4 },
      { id: 'scale', name: 'Geometry Radius', min: 100, max: 280, step: 10, defaultValue: 190 },
    ],
    defaultParameters: { depth: 4, scale: 190 },
    pythonCode: (params, palette) => `"""
Koch Snowflake in Python Turtle
Palette: ${palette.name}
"""
import turtle

def koch(t, order, size):
    if order == 0:
        t.forward(size)
    else:
        koch(t, order-1, size/3)
        t.left(60)
        koch(t, order-1, size/3)
        t.right(120)
        koch(t, order-1, size/3)
        t.left(60)
        koch(t, order-1, size/3)

t = turtle.Turtle()
t.speed(0)
for _ in range(3):
    koch(t, ${params.depth}, 200)
    t.right(120)
turtle.done()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const depth = Math.min(Math.floor(params.depth ?? 4), 5);
      const radius = (params.scale ?? 190) * (Math.min(width, height) / 520);
      const cx = width / 2;
      const cy = height / 2;
      const rot = time * 0.15;

      const pts: { x: number; y: number }[] = [];

      function kochLine(x1: number, y1: number, x2: number, y2: number, d: number) {
        if (d === 0) {
          pts.push({ x: x2, y: y2 });
          return;
        }
        const dx = (x2 - x1) / 3;
        const dy = (y2 - y1) / 3;

        const p1x = x1 + dx;
        const p1y = y1 + dy;
        const p2x = x2 - dx;
        const p2y = y2 - dy;

        // Peak point 60 deg rotation
        const sin60 = Math.sin(Math.PI / 3);
        const cos60 = Math.cos(Math.PI / 3);
        const peakX = p1x + dx * cos60 - dy * sin60;
        const peakY = p1y + dx * sin60 + dy * cos60;

        kochLine(x1, y1, p1x, p1y, d - 1);
        kochLine(p1x, p1y, peakX, peakY, d - 1);
        kochLine(peakX, peakY, p2x, p2y, d - 1);
        kochLine(p2x, p2y, x2, y2, d - 1);
      }

      const p0 = { x: cx + radius * Math.cos(-Math.PI / 2 + rot), y: cy + radius * Math.sin(-Math.PI / 2 + rot) };
      const p1 = { x: cx + radius * Math.cos(Math.PI / 6 + rot), y: cy + radius * Math.sin(Math.PI / 6 + rot) };
      const p2 = { x: cx + radius * Math.cos((5 * Math.PI) / 6 + rot), y: cy + radius * Math.sin((5 * Math.PI) / 6 + rot) };

      pts.push(p0);
      kochLine(p0.x, p0.y, p1.x, p1.y, depth);
      kochLine(p1.x, p1.y, p2.x, p2.y, depth);
      kochLine(p2.x, p2.y, p0.x, p0.y, depth);
      drawPath(c, pts, mode, () => sampleColor((time * 0.1) % 1), 1.3);
    },
  },
  {
    id: 'hilbert-curve',
    number: 42,
    name: 'Hilbert Space-Filling Curve',
    category: 'turtle',
    subtitle: 'Continuous surjective mapping of unit interval onto unit square',
    formula: 'f: [0, 1] \\twoheadrightarrow [0, 1]^2, \\quad \\text{Order } n \\implies 4^n \\text{ segments}',
    description: 'David Hilbert’s 1891 space-filling curve. A continuous fractal curve that visits every single cell in a 2D square lattice with locality preservation.',
    tags: ['Hilbert', 'Space-Filling', 'Locality', 'L-System'],
    parameters: [
      { id: 'order', name: 'Hilbert Order', min: 2, max: 6, step: 1, defaultValue: 4 },
    ],
    defaultParameters: { order: 4 },
    pythonCode: (params, palette) => `"""
Hilbert Curve in Python
Palette: ${palette.name}
"""
import turtle

def hilbert(t, order, angle, step):
    if order == 0:
        return
    t.right(angle)
    hilbert(t, order-1, -angle, step)
    t.forward(step)
    t.left(angle)
    hilbert(t, order-1, angle, step)
    t.forward(step)
    hilbert(t, order-1, angle, step)
    t.left(angle)
    t.forward(step)
    hilbert(t, order-1, -angle, step)
    t.right(angle)

t = turtle.Turtle()
t.speed(0)
hilbert(t, ${params.order}, 90, 10)
turtle.done()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const order = Math.min(Math.floor(params.order ?? 4), 6);
      const N = 1 << order;

      const size = Math.min(width, height) * 0.78;
      const cx = (width - size) / 2;
      const cy = (height - size) / 2;
      const step = size / N;

      function d2xy(n: number, d: number): { x: number; y: number } {
        let rx: number, ry: number, s: number, t = d;
        let x = 0, y = 0;
        for (s = 1; s < n; s *= 2) {
          rx = 1 & (t / 2);
          ry = 1 & (t ^ rx);
          if (ry === 0) {
            if (rx === 1) {
              x = s - 1 - x;
              y = s - 1 - y;
            }
            const tmp = x;
            x = y;
            y = tmp;
          }
          x += s * rx;
          y += s * ry;
          t = Math.floor(t / 4);
        }
        return { x, y };
      }

      const total = N * N;
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < total; i++) {
        const pt = d2xy(N, i);
        pts.push({ x: cx + (pt.x + 0.5) * step, y: cy + (pt.y + 0.5) * step });
      }
      drawPath(c, pts, mode, (t) => sampleColor((t + time * 0.1) % 1), 1.6);
    },
  },
  {
    id: 'gosper-flowsnake',
    number: 43,
    name: 'Gosper Hexagonal Flowsnake',
    category: 'turtle',
    subtitle: 'Hexagonal space-filling Peano curve',
    formula: 'A \\rightarrow A - B - - B + A + + A A - B +, \\quad B \\rightarrow + A - B B - - B - A + + A + B',
    description: 'Bill Gosper’s hexagonal fractal curve that fills the plane with a self-similar fractal boundary of dimension log(7)/log(sqrt(7)) = 2.',
    tags: ['Gosper', 'Flowsnake', 'Hexagonal', 'L-System'],
    parameters: [
      { id: 'depth', name: 'L-System Depth', min: 2, max: 4, step: 1, defaultValue: 3 },
    ],
    defaultParameters: { depth: 3 },
    pythonCode: (params, palette) => `"""
Gosper Flowsnake Curve
Palette: ${palette.name}
"""
import turtle

def flowsnake(level):
    rules = {
        'A': 'A-B--B+A++AA-B+',
        'B': '+A-BB--B-A++A+B'
    }
    s = 'A'
    for _ in range(level):
        s = ''.join(rules.get(c, c) for c in s)
    return s

cmds = flowsnake(${params.depth})
t = turtle.Turtle()
t.speed(0)
for c in cmds:
    if c in 'AB':
        t.forward(8)
    elif c == '+':
        t.left(60)
    elif c == '-':
        t.right(60)
turtle.done()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const depth = Math.min(Math.floor(params.depth ?? 3), 4);

      let s = 'A';
      for (let d = 0; d < depth; d++) {
        let next = '';
        for (let i = 0; i < s.length; i++) {
          const ch = s[i];
          if (ch === 'A') next += 'A-B--B+A++AA-B+';
          else if (ch === 'B') next += '+A-BB--B-A++A+B';
          else next += ch;
        }
        s = next;
      }

      let curX = width * 0.35;
      let curY = height * 0.35;
      let angle = time * 0.1;
      const step = Math.min(width, height) / (Math.pow(2.65, depth) * 5);

      const pts: { x: number; y: number }[] = [{ x: curX, y: curY }];
      for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === 'A' || ch === 'B') {
          curX += Math.cos(angle) * step;
          curY += Math.sin(angle) * step;
          pts.push({ x: curX, y: curY });
        } else if (ch === '+') {
          angle += Math.PI / 3;
        } else if (ch === '-') {
          angle -= Math.PI / 3;
        }
      }
      drawPath(c, pts, mode, (t) => sampleColor((t + time * 0.08) % 1), 1.3);
    },
  },
  {
    id: 'peano-curve',
    number: 44,
    name: 'Peano Grid Space-Filling Curve',
    category: 'turtle',
    subtitle: 'Original 1890 3x3 subdivision space-filler',
    formula: 'X \\rightarrow X F Y F X + F + Y F X F Y - F - X F Y F X',
    description: 'Giuseppe Peano’s historical first space-filling curve from 1890, proving mathematically that a 1D continuous line can map surjectively onto a 2D surface.',
    tags: ['Peano', 'Space Filling', 'Mathematics', 'Turtle'],
    parameters: [
      { id: 'depth', name: 'Peano Depth', min: 1, max: 3, step: 1, defaultValue: 2 },
    ],
    defaultParameters: { depth: 2 },
    pythonCode: (params, palette) => `"""
Peano Space-Filling Curve
Palette: ${palette.name}
"""
import turtle

def peano(order):
    s = "X"
    for _ in range(order):
        s = s.replace("X", "XFYFX+F+YFXFY-F-XFYFX").replace("Y", "YFXFY-F-XFYFX+F+YFXFY")
    return s

cmds = peano(${params.depth})
t = turtle.Turtle()
t.speed(0)
for ch in cmds:
    if ch == "F":
        t.forward(10)
    elif ch == "+":
        t.left(90)
    elif ch == "-":
        t.right(90)
turtle.done()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const depth = Math.min(Math.floor(params.depth ?? 2), 3);

      let s = 'X';
      for (let i = 0; i < depth; i++) {
        let next = '';
        for (let j = 0; j < s.length; j++) {
          if (s[j] === 'X') next += 'XFYFX+F+YFXFY-F-XFYFX';
          else if (s[j] === 'Y') next += 'YFXFY-F-XFYFX+F+YFXFY';
          else next += s[j];
        }
        s = next;
      }

      let curX = width * 0.25;
      let curY = height * 0.25;
      let angle = time * 0.1;
      const step = Math.min(width, height) / (Math.pow(3, depth) * 2.2);

      const pts: { x: number; y: number }[] = [{ x: curX, y: curY }];
      for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === 'F') {
          curX += Math.cos(angle) * step;
          curY += Math.sin(angle) * step;
          pts.push({ x: curX, y: curY });
        } else if (ch === '+') {
          angle += Math.PI / 2;
        } else if (ch === '-') {
          angle -= Math.PI / 2;
        }
      }
      drawPath(c, pts, mode, (t) => sampleColor((t + time * 0.08) % 1), 1.3);
    },
  },
  {
    id: 'lsystem-tree',
    number: 45,
    name: 'Lindenmayer Stochastic Botanic Tree',
    category: 'turtle',
    subtitle: 'Aristid Lindenmayer botanical morphogenesis',
    formula: '0 \\rightarrow 1[+0]-0, \\quad 1 \\rightarrow 11',
    description: 'An L-System botanical generator with dynamic wind sway and blooming floral tips modeled after Aristid Lindenmayer’s plant morphogenesis rules.',
    tags: ['L-System', 'Botany', 'Tree', 'Morphogenesis'],
    parameters: [
      { id: 'depth', name: 'Branching Generations', min: 3, max: 7, step: 1, defaultValue: 5 },
      { id: 'angle', name: 'Branch Angle (°)', min: 15, max: 35, step: 1, defaultValue: 24 },
      { id: 'wind', name: 'Wind Sway', min: 0, max: 0.2, step: 0.02, defaultValue: 0.06 },
    ],
    defaultParameters: { depth: 5, angle: 24, wind: 0.06 },
    pythonCode: (params, palette) => `"""
L-System Fractal Tree
Palette: ${palette.name}
"""
import turtle

def draw_branch(t, branch_len, angle):
    if branch_len > 5:
        t.forward(branch_len)
        t.right(angle)
        draw_branch(t, branch_len - 12, angle)
        t.left(angle * 2)
        draw_branch(t, branch_len - 12, angle)
        t.right(angle)
        t.backward(branch_len)

t = turtle.Turtle()
t.left(90)
t.speed(0)
draw_branch(t, 70, ${params.angle})
turtle.done()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const depth = Math.min(Math.floor(params.depth ?? 5), 7);
      const branchAngle = ((params.angle ?? 24) * Math.PI) / 180;
      const windSway = (params.wind ?? 0.06) * Math.sin(time * 2);

      const trunkLen = Math.min(width, height) * 0.22;
      const startX = width / 2;
      const startY = height * 0.92;

      function branch(x: number, y: number, len: number, ang: number, d: number) {
        if (d <= 0 || len < 3) return;

        const xEnd = x + Math.cos(ang) * len;
        const yEnd = y - Math.sin(ang) * len;

        const color = sampleColor((d / depth + time * 0.05) % 1);
        drawPath(c, [{ x, y }, { x: xEnd, y: yEnd }], mode, () => color, Math.max(1, d * 1.2));

        // Tip leaf
        if (d === 1) {
          fillCircle(c, xEnd, yEnd, 3, mode, sampleColor(0.9));
        }

        const leftAng = ang + branchAngle + windSway;
        const rightAng = ang - branchAngle + windSway;

        branch(xEnd, yEnd, len * 0.72, leftAng, d - 1);
        branch(xEnd, yEnd, len * 0.72, rightAng, d - 1);
      }

      branch(startX, startY, trunkLen, Math.PI / 2 + windSway, depth);
    },
  },
  {
    id: 'turtle-starburst',
    number: 46,
    name: 'Turtle Starburst Nebula',
    category: 'turtle',
    subtitle: 'Iterative geometric angular step explosion',
    formula: 'L_{k+1} = L_k + \\delta L, \\quad \\theta_{k+1} = \\theta_k + \\alpha',
    description: 'A classic Python turtle geometry pattern stepping outwards while rotating by non-rational angles to produce multi-pointed iridescent star nebulae.',
    tags: ['Turtle', 'Starburst', 'Geometry', 'Polygon'],
    parameters: [
      { id: 'steps', name: 'Step Loops', min: 100, max: 400, step: 20, defaultValue: 250 },
      { id: 'angle', name: 'Turn Angle (°)', min: 110, max: 175, step: 1, defaultValue: 144 },
    ],
    defaultParameters: { steps: 250, angle: 144 },
    pythonCode: (params, palette) => `"""
Turtle Starburst Nebula
Palette: ${palette.name}
"""
import turtle

t = turtle.Turtle()
t.speed(0)
for i in range(${params.steps}):
    t.forward(i * 1.5)
    t.left(${params.angle})
turtle.done()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const count = params.steps ?? 250;
      const deg = params.angle ?? 144;
      const turn = (deg * Math.PI) / 180;

      let x = width / 2;
      let y = height / 2;
      let dir = time * 0.2;

      const stepMul = (Math.min(width, height) / 800) * 0.9;

      const pts: { x: number; y: number }[] = [{ x, y }];
      for (let i = 0; i < count; i++) {
        const step = i * stepMul;
        x += Math.cos(dir) * step;
        y += Math.sin(dir) * step;
        dir += turn;
        pts.push({ x, y });
      }
      drawPath(c, pts, mode, (t) => sampleColor((t + time * 0.1) % 1), 1.2);
    },
  },
  {
    id: 'turtle-polygonal-web',
    number: 47,
    name: 'Rotating Polygonal Morph Web',
    category: 'turtle',
    subtitle: 'Continuous regular polygon phase twist',
    formula: 'V_k(t) = R(t) e^{i(2\\pi k/N + \\omega t)}',
    description: 'Nested concentric regular polygons with progressive rotational phase offsets forming crystalline geometric webs.',
    tags: ['Polygons', 'Web', 'Sacred', 'Turtle'],
    parameters: [
      { id: 'sides', name: 'Polygon Sides', min: 3, max: 10, step: 1, defaultValue: 6 },
      { id: 'rings', name: 'Nested Layers', min: 10, max: 40, step: 2, defaultValue: 24 },
    ],
    defaultParameters: { sides: 6, rings: 24 },
    pythonCode: (params, palette) => `"""
Polygonal Web in Python
Palette: ${palette.name}
"""
import numpy as np
import matplotlib.pyplot as plt

sides = ${params.sides}
rings = ${params.rings}
print("Drawing rotating polygonal web...")
`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const sides = Math.floor(params.sides ?? 6);
      const rings = Math.floor(params.rings ?? 24);

      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.min(width, height) * 0.42;

      for (let r = 1; r <= rings; r++) {
        const radius = (r / rings) * maxR;
        const rot = time * 0.3 + (r / rings) * Math.PI;
        const color = sampleColor((r / rings + time * 0.08) % 1);
        const pts: { x: number; y: number }[] = [];
        for (let i = 0; i <= sides; i++) {
          const ang = (i * Math.PI * 2) / sides + rot;
          pts.push({ x: cx + radius * Math.cos(ang), y: cy + radius * Math.sin(ang) });
        }
        drawPath(c, pts, mode, () => color, 1.4);
      }
    },
  },
  {
    id: 'cesaro-fractal',
    number: 48,
    name: 'Cesàro Torn Square Fractal Curve',
    category: 'turtle',
    subtitle: 'Iterative inward torn square sweep',
    formula: 'P \\rightarrow \\text{Tear inward at angle } \\alpha = 85^{\\circ}',
    description: 'Ernesto Cesàro’s variation of the Koch curve that tears inward to form intricate woven tapestry boundaries.',
    tags: ['Cesaro', 'Fractal', 'Turtle', 'Curves'],
    parameters: [
      { id: 'depth', name: 'Recursion Depth', min: 1, max: 4, step: 1, defaultValue: 3 },
      { id: 'angle', name: 'Tear Angle (°)', min: 70, max: 88, step: 1, defaultValue: 82 },
    ],
    defaultParameters: { depth: 3, angle: 82 },
    pythonCode: (params, palette) => `"""
Cesàro Fractal Curve
Palette: ${palette.name}
"""
import turtle

def cesaro(t, order, length):
    if order == 0:
        t.forward(length)
    else:
        cesaro(t, order-1, length/2.5)
        t.right(${params.angle})
        cesaro(t, order-1, length/2.5)
        t.left(${params.angle} * 2)
        cesaro(t, order-1, length/2.5)
        t.right(${params.angle})
        cesaro(t, order-1, length/2.5)

t = turtle.Turtle()
t.speed(0)
for _ in range(4):
    cesaro(t, ${params.depth}, 100)
    t.right(90)
turtle.done()`,
    render: (ctx) => {
      const { ctx: c, width, height, time, params, sampleColor, mode } = ctx;
      const depth = Math.min(Math.floor(params.depth ?? 3), 4);
      const tearDeg = params.angle ?? 82;
      const tearRad = (tearDeg * Math.PI) / 180;

      const size = Math.min(width, height) * 0.72;
      const cx = width / 2;
      const cy = height / 2;
      const rot = time * 0.1;

      const pts: { x: number; y: number }[] = [];

      function cesaroLine(x1: number, y1: number, x2: number, y2: number, d: number) {
        if (d === 0) {
          pts.push({ x: x2, y: y2 });
          return;
        }
        const dx = (x2 - x1) / 2;
        const dy = (y2 - y1) / 2;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const perpX = -dy * Math.tan(tearRad / 2);
        const perpY = dx * Math.tan(tearRad / 2);

        const tipX = midX + perpX;
        const tipY = midY + perpY;

        cesaroLine(x1, y1, tipX, tipY, d - 1);
        cesaroLine(tipX, tipY, x2, y2, d - 1);
      }

      // Draw 4 sides of torn square (rotation applied via canvas transform)
      const corners = [
        { x: cx - size / 2, y: cy - size / 2 },
        { x: cx + size / 2, y: cy - size / 2 },
        { x: cx + size / 2, y: cy + size / 2 },
        { x: cx - size / 2, y: cy + size / 2 },
      ];

      pts.push(corners[0]);
      for (let i = 0; i < 4; i++) {
        const next = (i + 1) % 4;
        cesaroLine(corners[i].x, corners[i].y, corners[next].x, corners[next].y, depth);
      }

      c.save();
      c.translate(cx, cy);
      c.rotate(rot);
      c.translate(-cx, -cy);
      drawPath(c, pts, mode, () => sampleColor((time * 0.1) % 1), 1.3);
      c.restore();
    },
  },
];
