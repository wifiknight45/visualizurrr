/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

/**
 * Parse hex string (#RGB, #RRGGBB) to RGB object
 */
export function hexToRgb(hex: string): RGB {
  let cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) {
    return { r: 255, g: 255, b: 255 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const hex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/**
 * Linear interpolation between two RGB colors
 */
export function lerpColor(c1: RGB, c2: RGB, t: number): RGB {
  const clampedT = Math.max(0, Math.min(1, t));
  return {
    r: c1.r + (c2.r - c1.r) * clampedT,
    g: c1.g + (c2.g - c1.g) * clampedT,
    b: c1.b + (c2.b - c1.b) * clampedT,
  };
}

/**
 * Format RGB into rgba() string with alpha
 */
export function toRgbaString(rgb: RGB, alpha: number = 1): string {
  const clampedA = Math.max(0, Math.min(1, alpha));
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${clampedA.toFixed(3)})`;
}

/**
 * Samples a continuous normalized position t in [0, 1] across an array of hex colors.
 */
export function samplePalette(colors: string[], t: number): string {
  if (!colors || colors.length === 0) return '#ffffff';
  if (colors.length === 1) return colors[0];

  // Wrap or clamp t
  const safeT = ((t % 1) + 1) % 1;
  const numSegments = colors.length - 1;
  const pos = safeT * numSegments;
  const index = Math.floor(pos);
  const frac = pos - index;

  const c1 = hexToRgb(colors[index]);
  const c2 = hexToRgb(colors[Math.min(index + 1, colors.length - 1)]);

  const blended = lerpColor(c1, c2, frac);
  return rgbToHex(blended.r, blended.g, blended.b);
}

/**
 * Samples palette returning an RGBA string with alpha
 */
export function samplePaletteRgba(colors: string[], t: number, alpha: number = 1): string {
  if (!colors || colors.length === 0) return `rgba(255,255,255,${alpha})`;
  if (colors.length === 1) {
    const rgb = hexToRgb(colors[0]);
    return toRgbaString(rgb, alpha);
  }

  const safeT = ((t % 1) + 1) % 1;
  const numSegments = colors.length - 1;
  const pos = safeT * numSegments;
  const index = Math.floor(pos);
  const frac = pos - index;

  const c1 = hexToRgb(colors[index]);
  const c2 = hexToRgb(colors[Math.min(index + 1, colors.length - 1)]);

  const blended = lerpColor(c1, c2, frac);
  return toRgbaString(blended, alpha);
}
