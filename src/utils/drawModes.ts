/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Shared render-mode drawing helpers.
 *
 * Every pattern receives the active RenderMode in its RenderContext, and
 * these helpers are how that mode changes the actual drawing:
 *  - curves:    plain per-segment polyline strokes / filled square cells
 *  - particles: dots / circles instead of connected lines or squares
 *  - mesh:      curves plus low-alpha chords (wireframe web)
 *  - heatmap:   thick, additive, translucent strokes / soft overlapping cells
 *  - neon:      a wide translucent halo pass under a thin bright core
 *  - matrix:    chunky separated squares instead of lines or full cells
 */

import type { RenderMode } from '../types/visualizer';

export interface PathPoint {
  x: number;
  y: number;
}

type Ctx2D = CanvasRenderingContext2D;

function strokeSegments(
  c: Ctx2D,
  points: PathPoint[],
  colorAt: (t: number) => string,
  lineWidth: number,
  alpha: number
): void {
  const n = points.length;
  c.save();
  c.globalAlpha = alpha;
  c.lineWidth = lineWidth;
  c.lineJoin = 'round';
  c.lineCap = 'round';
  for (let i = 1; i < n; i++) {
    c.beginPath();
    c.moveTo(points[i - 1].x, points[i - 1].y);
    c.lineTo(points[i].x, points[i].y);
    c.strokeStyle = colorAt(i / (n - 1));
    c.stroke();
  }
  c.restore();
}

/** Draw a polyline point sequence honoring the active render mode. */
export function drawPath(
  c: Ctx2D,
  points: PathPoint[],
  mode: RenderMode,
  colorAt: (t: number) => string,
  lineWidth = 1.2
): void {
  const n = points.length;
  if (n < 2) return;

  switch (mode) {
    case 'particles': {
      const step = Math.max(1, Math.floor(n / 4000));
      const r = Math.max(0.8, lineWidth * 0.9);
      for (let i = 0; i < n; i += step) {
        c.beginPath();
        c.arc(points[i].x, points[i].y, r, 0, Math.PI * 2);
        c.fillStyle = colorAt(i / (n - 1));
        c.fill();
      }
      return;
    }
    case 'matrix': {
      const step = Math.max(1, Math.floor(n / 5000));
      const s = lineWidth * 2.4;
      for (let i = 0; i < n; i += step) {
        c.fillStyle = colorAt(i / (n - 1));
        c.fillRect(points[i].x - s / 2, points[i].y - s / 2, s, s);
      }
      return;
    }
    case 'heatmap': {
      c.save();
      c.globalCompositeOperation = 'lighter';
      strokeSegments(c, points, colorAt, lineWidth * 5, 0.22);
      c.restore();
      return;
    }
    case 'neon': {
      strokeSegments(c, points, colorAt, lineWidth * 4.5, 0.28);
      strokeSegments(c, points, colorAt, lineWidth, 1);
      return;
    }
    case 'mesh': {
      strokeSegments(c, points, colorAt, lineWidth, 0.9);
      const stride = Math.max(2, Math.floor(n / 28));
      c.save();
      c.globalAlpha = 0.22;
      c.lineWidth = Math.max(0.5, lineWidth * 0.6);
      for (let i = 0; i + stride * 6 < n; i += stride) {
        c.beginPath();
        c.moveTo(points[i].x, points[i].y);
        c.lineTo(points[i + stride * 6].x, points[i + stride * 6].y);
        c.strokeStyle = colorAt(i / (n - 1));
        c.stroke();
      }
      c.restore();
      return;
    }
    case 'curves':
    default:
      strokeSegments(c, points, colorAt, lineWidth, 1);
  }
}

/** Fill one grid cell honoring the active render mode. */
export function fillCell(
  c: Ctx2D,
  x: number,
  y: number,
  size: number,
  mode: RenderMode,
  color: string
): void {
  c.fillStyle = color;
  switch (mode) {
    case 'particles': {
      c.beginPath();
      c.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      c.fill();
      return;
    }
    case 'mesh': {
      const inset = Math.min(1, size * 0.2);
      c.fillRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
      return;
    }
    case 'heatmap': {
      c.save();
      c.globalAlpha = 0.4;
      c.fillRect(x - size / 2, y - size / 2, size * 2, size * 2);
      c.restore();
      c.fillStyle = color;
      return;
    }
    case 'neon': {
      c.fillRect(x, y, size, size);
      c.fillStyle = 'rgba(255,255,255,0.5)';
      const inset = size * 0.32;
      c.fillRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
      c.fillStyle = color;
      return;
    }
    case 'matrix': {
      const inset = size * 0.18;
      c.fillRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
      return;
    }
    case 'curves':
    default:
      c.fillRect(x, y, size, size);
  }
}

/** Stroke one circle honoring the active render mode. */
export function strokeCircle(
  c: Ctx2D,
  x: number,
  y: number,
  r: number,
  mode: RenderMode,
  color: string,
  lineWidth: number
): void {
  c.strokeStyle = color;
  c.lineWidth = lineWidth;
  switch (mode) {
    case 'particles': {
      c.save();
      c.setLineDash([0.1, Math.max(4, r * 0.22)]);
      c.lineCap = 'round';
      c.lineWidth = lineWidth * 2;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.stroke();
      c.restore();
      return;
    }
    case 'mesh': {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.stroke();
      c.save();
      c.globalAlpha = 0.45;
      c.beginPath();
      c.moveTo(x - r, y);
      c.lineTo(x + r, y);
      c.moveTo(x, y - r);
      c.lineTo(x, y + r);
      c.stroke();
      c.restore();
      return;
    }
    case 'heatmap': {
      c.save();
      c.globalAlpha = 0.16;
      c.fillStyle = color;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
      c.restore();
      return;
    }
    case 'neon': {
      c.save();
      c.globalAlpha = 0.3;
      c.lineWidth = lineWidth * 4;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.stroke();
      c.restore();
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.stroke();
      return;
    }
    case 'matrix': {
      c.strokeRect(x - r, y - r, r * 2, r * 2);
      return;
    }
    case 'curves':
    default: {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.stroke();
    }
  }
}

/** Fill one circle honoring the active render mode. */
export function fillCircle(
  c: Ctx2D,
  x: number,
  y: number,
  r: number,
  mode: RenderMode,
  color: string
): void {
  c.fillStyle = color;
  switch (mode) {
    case 'matrix': {
      c.fillRect(x - r, y - r, r * 2, r * 2);
      return;
    }
    case 'heatmap': {
      c.save();
      c.globalAlpha = 0.35;
      c.beginPath();
      c.arc(x, y, r * 1.7, 0, Math.PI * 2);
      c.fill();
      c.restore();
      c.fillStyle = color;
      return;
    }
    case 'neon': {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.55)';
      c.beginPath();
      c.arc(x, y, r * 0.45, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = color;
      return;
    }
    case 'mesh': {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
      c.save();
      c.strokeStyle = color;
      c.globalAlpha = 0.6;
      c.beginPath();
      c.moveTo(x - r, y);
      c.lineTo(x + r, y);
      c.moveTo(x, y - r);
      c.lineTo(x, y + r);
      c.stroke();
      c.restore();
      return;
    }
    case 'particles':
    case 'curves':
    default: {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }
  }
}
