/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryId =
  | 'fractals'
  | 'spirographs'
  | 'cellular'
  | 'physics'
  | 'flows'
  | 'turtle'
  | 'optics'
  | 'nature';

export interface PatternCategory {
  id: CategoryId;
  name: string;
  description: string;
  iconName: string;
}

export interface PatternParameter {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  category: 'Python & Scientific' | 'Cyber & Neon' | 'Nature & Celestial' | 'Editorial & Minimal';
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  colors: string[];
}

export type RenderMode = 'curves' | 'particles' | 'mesh' | 'heatmap' | 'neon' | 'matrix';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
  params: Record<string, number>;
  palette: ColorPalette;
  mode: RenderMode;
  mouse: { x: number; y: number; isDown: boolean; hasInteracted: boolean };
  sampleColor: (t: number) => string;
  frameCount: number;
  deltaTime: number;
}

export interface PatternDefinition {
  id: string;
  number: number;
  name: string;
  category: CategoryId;
  subtitle: string;
  formula: string;
  description: string;
  tags: string[];
  parameters: PatternParameter[];
  defaultParameters: Record<string, number>;
  pythonCode: (params: Record<string, number>, paletteName: string) => string;
  render: (ctx: RenderContext) => void;
  reset?: () => void;
}

export interface VisualizerSettings {
  isPlaying: boolean;
  speed: number;
  glow: boolean;
  trails: boolean;
  trailStrength: number;
  renderMode: RenderMode;
  zoom: number;
  showFps: boolean;
  autoRotate: boolean;
}
