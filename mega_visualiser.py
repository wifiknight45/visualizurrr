#!/usr/bin/env python3
"""
visualizurrr / mega_visualiser.py  —  v3

A visualiser that refuses to run out of options.

GRAPHICS
  * Real fractal detail: a tileable multi-octave noise texture is sampled,
    warped and layered — no more smooth blobby sine soup.
  * Fake 3D lighting: the field's gradient shades every mode like gloss.
  * Post FX: bloom/glow, saturation, gamma, vignette, neon edges,
    chromatic aberration (RGB shift), scanlines, film grain, pixelate,
    posterize, solarize, invert.
  * Stateful modes simulated live: flowfield (2,200 particles drawing
    trails) and reaction (Gray-Scott reaction-diffusion, 10 styles).

OPTIONS
  * 29 modes x 60 palettes = 1,740 base combinations.
  * Blend ANY two modes (mix / add / screen / difference) with a mix dial.
  * Global kaleidoscope fold that applies to ANY mode, plus pan / zoom,
    a re-rollable noise seed, and mouse interaction (hold to bend the
    field; in reaction mode, click/drag to seed new growth).
  * 30 named presets on TAB.
  * Live dials for detail, warp, glow, shading, saturation, gamma,
    speed, scale, symmetry, rotation, mirrors, trails, hue-spin,
    palette morphing and parameter oscillation.

Run (from bash):
    pip install numpy pygame pillow
    python mega_visualiser.py
    python mega_visualiser.py --preset hellfire
    python mega_visualiser.py --mode julia --palette plasma --seed 42

Headless (NumPy + Pillow only):
    python mega_visualiser.py --list
    python mega_visualiser.py --preview previews/contact_sheet.png
    python mega_visualiser.py --still out.png --mode nebula
    python mega_visualiser.py --gif out.gif --mode fluid --frames 48

Keys:
    SPACE / ← →   mode        P palette       TAB preset
    B blend op    N 2nd mode  Z / X blend mix
    D detail      W warp      G glow          L lighting/shading
    U saturation  V vignette  E rotation      1 / 2 mirror X / Y
    M morph       O oscillate H hue-spin      T trails
    ↑ / ↓ speed   [ / ] scale S symmetry      A auto-cycle
    K global kaleido fold     I invert        J pixelate
    3 posterize   4 solarize  5 RGB shift     6 scanlines
    7 grain       8 edges     9 next seed     ` reaction style
    , . pan X     ; ' pan Y   - / = zoom      0 reset view
    Y record GIF  R randomise C screenshot    F fullscreen
    ? help        ESC quit    Mouse: hold = warp well; drag in
                              reaction mode = seed new growth
"""

from __future__ import annotations

import argparse
import math
import sys
import time
from dataclasses import dataclass

import numpy as np

# ---------------------------------------------------------------------------
# Palettes — 60. Each bakes to a 256-colour LUT; morphing blends LUTs.
# ---------------------------------------------------------------------------

PALETTE_STOPS: dict[str, list[tuple[float, tuple[int, int, int]]]] = {
    "vicious":    [(0.0, (10, 0, 40)), (0.2, (150, 0, 200)), (0.4, (255, 0, 90)), (0.6, (255, 140, 0)), (0.8, (0, 255, 170)), (1.0, (60, 0, 255))],
    "meltdown":   [(0.0, (0, 0, 0)), (0.18, (120, 0, 255)), (0.36, (255, 0, 160)), (0.52, (255, 60, 0)), (0.68, (255, 220, 0)), (0.84, (60, 255, 120)), (1.0, (0, 200, 255))],
    "acid":       [(0.0, (0, 20, 0)), (0.3, (60, 160, 0)), (0.55, (180, 255, 0)), (0.8, (255, 255, 60)), (1.0, (255, 255, 230))],
    "prism":      [(0.0, (255, 0, 0)), (0.17, (255, 140, 0)), (0.34, (255, 240, 0)), (0.5, (0, 210, 80)), (0.67, (0, 120, 255)), (0.84, (140, 0, 255)), (1.0, (255, 0, 0))],
    "inferno":    [(0.0, (0, 0, 4)), (0.25, (87, 16, 110)), (0.5, (188, 55, 84)), (0.75, (249, 142, 9)), (1.0, (252, 255, 164))],
    "magma":      [(0.0, (0, 0, 4)), (0.25, (81, 18, 124)), (0.5, (183, 54, 121)), (0.75, (251, 136, 97)), (1.0, (252, 253, 191))],
    "plasma":     [(0.0, (13, 8, 135)), (0.25, (126, 3, 168)), (0.5, (204, 71, 120)), (0.75, (248, 149, 64)), (1.0, (240, 249, 33))],
    "viridis":    [(0.0, (68, 1, 84)), (0.25, (59, 82, 139)), (0.5, (33, 145, 140)), (0.75, (94, 201, 98)), (1.0, (253, 231, 37))],
    "turbo":      [(0.0, (48, 18, 59)), (0.2, (70, 107, 227)), (0.4, (26, 180, 180)), (0.6, (120, 220, 80)), (0.8, (250, 180, 40)), (1.0, (122, 4, 3))],
    "fire":       [(0.0, (0, 0, 0)), (0.25, (120, 0, 0)), (0.5, (230, 60, 0)), (0.75, (255, 170, 0)), (0.9, (255, 230, 120)), (1.0, (255, 255, 255))],
    "lava":       [(0.0, (10, 0, 0)), (0.3, (90, 10, 0)), (0.55, (200, 40, 0)), (0.8, (255, 120, 20)), (1.0, (255, 220, 80))],
    "blood":      [(0.0, (0, 0, 0)), (0.35, (70, 0, 8)), (0.6, (150, 5, 20)), (0.85, (230, 40, 50)), (1.0, (255, 190, 170))],
    "gold":       [(0.0, (12, 8, 0)), (0.3, (90, 60, 0)), (0.55, (190, 140, 20)), (0.8, (255, 210, 90)), (1.0, (255, 250, 210))],
    "copper":     [(0.0, (8, 4, 2)), (0.3, (100, 45, 20)), (0.55, (190, 100, 55)), (0.8, (245, 180, 130)), (1.0, (255, 240, 220))],
    "ice":        [(0.0, (2, 0, 20)), (0.3, (0, 40, 120)), (0.55, (0, 140, 220)), (0.8, (120, 230, 255)), (1.0, (255, 255, 255))],
    "ocean":      [(0.0, (0, 5, 30)), (0.3, (0, 50, 100)), (0.55, (0, 120, 160)), (0.8, (60, 210, 190)), (1.0, (220, 255, 240))],
    "abyss":      [(0.0, (0, 0, 6)), (0.35, (0, 10, 50)), (0.6, (0, 40, 90)), (0.85, (20, 110, 130)), (1.0, (150, 240, 230))],
    "midnight":   [(0.0, (2, 2, 14)), (0.35, (14, 16, 60)), (0.6, (40, 50, 130)), (0.85, (110, 130, 210)), (1.0, (220, 230, 255))],
    "aurora":     [(0.0, (0, 8, 20)), (0.3, (0, 70, 60)), (0.55, (30, 200, 120)), (0.8, (150, 255, 170)), (1.0, (240, 255, 230))],
    "sunset":     [(0.0, (20, 0, 50)), (0.3, (120, 20, 90)), (0.55, (230, 70, 60)), (0.8, (255, 160, 60)), (1.0, (255, 240, 170))],
    "desert":     [(0.0, (30, 16, 4)), (0.3, (110, 70, 25)), (0.55, (195, 140, 70)), (0.8, (240, 200, 140)), (1.0, (255, 245, 220))],
    "toxic":      [(0.0, (0, 15, 0)), (0.3, (20, 80, 0)), (0.55, (110, 200, 0)), (0.8, (200, 255, 40)), (1.0, (250, 255, 200))],
    "forest":     [(0.0, (2, 12, 4)), (0.3, (10, 60, 25)), (0.55, (40, 130, 60)), (0.8, (150, 210, 110)), (1.0, (240, 255, 200))],
    "neon":       [(0.0, (5, 0, 20)), (0.3, (90, 0, 180)), (0.55, (255, 0, 180)), (0.8, (0, 230, 255)), (1.0, (220, 255, 255))],
    "vapor":      [(0.0, (16, 8, 44)), (0.3, (90, 40, 150)), (0.55, (230, 90, 200)), (0.8, (255, 170, 210)), (1.0, (140, 240, 255))],
    "candy":      [(0.0, (60, 0, 80)), (0.25, (200, 60, 160)), (0.5, (255, 130, 180)), (0.75, (255, 200, 120)), (1.0, (255, 250, 220))],
    "sakura":     [(0.0, (40, 10, 30)), (0.3, (130, 50, 90)), (0.55, (220, 130, 170)), (0.8, (255, 200, 220)), (1.0, (255, 250, 248))],
    "ultraviolet": [(0.0, (0, 0, 0)), (0.3, (40, 0, 90)), (0.55, (110, 0, 220)), (0.8, (200, 80, 255)), (1.0, (255, 220, 255))],
    "electric":   [(0.0, (0, 0, 10)), (0.3, (0, 0, 160)), (0.55, (0, 120, 255)), (0.8, (120, 255, 255)), (1.0, (255, 255, 255))],
    "blueprint":  [(0.0, (4, 16, 44)), (0.4, (10, 50, 120)), (0.7, (40, 120, 200)), (1.0, (230, 245, 255))],
    "thermal":    [(0.0, (0, 0, 30)), (0.25, (0, 0, 160)), (0.45, (160, 0, 160)), (0.65, (255, 60, 0)), (0.85, (255, 200, 0)), (1.0, (255, 255, 255))],
    "wine":       [(0.0, (8, 0, 6)), (0.35, (70, 8, 40)), (0.6, (140, 25, 70)), (0.85, (210, 90, 120)), (1.0, (255, 220, 225))],
    "pastel":     [(0.0, (90, 80, 140)), (0.3, (150, 140, 210)), (0.55, (190, 180, 230)), (0.8, (230, 200, 220)), (1.0, (255, 245, 235))],
    "matrix":     [(0.0, (0, 0, 0)), (0.4, (0, 60, 10)), (0.7, (0, 170, 40)), (1.0, (170, 255, 190))],
    "chrome":     [(0.0, (10, 12, 20)), (0.2, (200, 215, 235)), (0.35, (40, 50, 80)), (0.55, (230, 240, 250)), (0.72, (70, 85, 120)), (0.9, (210, 225, 245)), (1.0, (20, 25, 40))],
    "mono":       [(0.0, (0, 0, 0)), (1.0, (255, 255, 255))],
    # --- v3 additions (36 -> 60 palettes) ---
    "berry":      [(0.0, (16, 0, 24)), (0.3, (90, 10, 80)), (0.55, (180, 30, 110)), (0.8, (240, 110, 150)), (1.0, (255, 225, 235))],
    "citrus":     [(0.0, (20, 30, 0)), (0.3, (90, 140, 0)), (0.55, (200, 210, 0)), (0.8, (255, 200, 40)), (1.0, (255, 250, 200))],
    "lagoon":     [(0.0, (0, 16, 24)), (0.3, (0, 80, 100)), (0.55, (0, 160, 170)), (0.8, (110, 230, 200)), (1.0, (235, 255, 250))],
    "ember":      [(0.0, (8, 2, 0)), (0.3, (70, 16, 0)), (0.55, (165, 55, 5)), (0.8, (240, 130, 30)), (1.0, (255, 235, 180))],
    "royal":      [(0.0, (8, 0, 28)), (0.3, (45, 10, 110)), (0.55, (100, 40, 190)), (0.8, (170, 120, 240)), (1.0, (240, 230, 255))],
    "oilslick":   [(0.0, (4, 4, 10)), (0.2, (30, 60, 70)), (0.4, (90, 40, 110)), (0.6, (40, 110, 90)), (0.8, (150, 130, 60)), (1.0, (210, 200, 170))],
    "bruise":     [(0.0, (10, 4, 16)), (0.3, (60, 20, 70)), (0.55, (120, 50, 90)), (0.8, (180, 120, 90)), (1.0, (230, 210, 170))],
    "swamp":      [(0.0, (4, 10, 4)), (0.3, (30, 55, 20)), (0.55, (80, 110, 40)), (0.8, (150, 170, 90)), (1.0, (225, 235, 190))],
    "reef":       [(0.0, (0, 20, 40)), (0.3, (0, 110, 130)), (0.55, (250, 110, 90)), (0.8, (255, 180, 110)), (1.0, (255, 245, 210))],
    "arctic":     [(0.0, (10, 20, 44)), (0.3, (60, 110, 160)), (0.55, (140, 190, 225)), (0.8, (210, 235, 250)), (1.0, (255, 255, 255))],
    "volcanic":   [(0.0, (0, 0, 0)), (0.28, (60, 8, 4)), (0.5, (150, 30, 5)), (0.72, (235, 95, 10)), (0.9, (255, 190, 60)), (1.0, (255, 255, 230))],
    "cyberpunk":  [(0.0, (8, 0, 24)), (0.3, (80, 0, 140)), (0.52, (255, 0, 110)), (0.74, (255, 220, 0)), (1.0, (0, 240, 255))],
    "retro":      [(0.0, (38, 22, 10)), (0.3, (140, 70, 30)), (0.55, (215, 130, 50)), (0.8, (240, 195, 110)), (1.0, (250, 240, 210))],
    "synthwave":  [(0.0, (10, 0, 36)), (0.3, (70, 10, 110)), (0.52, (200, 40, 140)), (0.74, (255, 120, 80)), (1.0, (255, 220, 130))],
    "peacock":    [(0.0, (0, 10, 26)), (0.3, (0, 70, 100)), (0.52, (0, 150, 130)), (0.74, (60, 190, 90)), (1.0, (200, 240, 160))],
    "orchid":     [(0.0, (22, 4, 30)), (0.3, (95, 25, 110)), (0.55, (185, 85, 180)), (0.8, (240, 170, 225)), (1.0, (255, 245, 252))],
    "rust":       [(0.0, (10, 4, 2)), (0.3, (80, 32, 12)), (0.55, (165, 75, 35)), (0.8, (220, 140, 85)), (1.0, (250, 225, 200))],
    "glacier":    [(0.0, (6, 14, 30)), (0.3, (30, 70, 120)), (0.55, (90, 160, 205)), (0.8, (180, 225, 245)), (1.0, (255, 255, 255))],
    "bubblegum":  [(0.0, (70, 10, 90)), (0.3, (190, 60, 170)), (0.55, (255, 130, 205)), (0.8, (255, 195, 230)), (1.0, (200, 245, 255))],
    "charcoal":   [(0.0, (0, 0, 0)), (0.4, (45, 45, 50)), (0.7, (110, 110, 118)), (1.0, (235, 235, 240))],
    "spectrum":   [(0.0, (120, 0, 160)), (0.2, (0, 60, 220)), (0.4, (0, 200, 160)), (0.6, (120, 230, 0)), (0.8, (255, 170, 0)), (1.0, (255, 0, 80))],
    "dusk":       [(0.0, (12, 8, 30)), (0.3, (60, 35, 80)), (0.55, (140, 70, 100)), (0.8, (225, 140, 110)), (1.0, (255, 225, 180))],
    "meadow":     [(0.0, (8, 24, 8)), (0.3, (40, 110, 40)), (0.55, (120, 195, 80)), (0.8, (210, 240, 140)), (1.0, (255, 255, 220))],
    "porcelain":  [(0.0, (30, 34, 52)), (0.3, (100, 115, 150)), (0.55, (175, 190, 215)), (0.8, (228, 234, 244)), (1.0, (255, 255, 255))],
}
PALETTE_NAMES = list(PALETTE_STOPS.keys())


def build_lut(stops):
    xs = np.array([s[0] for s in stops])
    cols = np.array([s[1] for s in stops], dtype=np.float64)
    t = np.linspace(0.0, 1.0, 256)
    lut = np.stack([np.interp(t, xs, cols[:, c]) for c in range(3)], axis=1)
    return np.clip(lut, 0, 255).astype(np.uint8)


LUTS = {name: build_lut(stops) for name, stops in PALETTE_STOPS.items()}

# ---------------------------------------------------------------------------
# Tileable fractal noise texture — the detail engine for v2.
# Built from periodic value-noise octaves, so it tiles seamlessly and can
# be scrolled / warped / layered at any scale.
# ---------------------------------------------------------------------------

def _tileable_octave(rng, grid, size):
    small = rng.random((grid, grid))
    # Bilinear upsample with wraparound.
    pos = np.linspace(0, grid, size, endpoint=False)
    i0 = np.floor(pos).astype(int) % grid
    i1 = (i0 + 1) % grid
    frac = pos - np.floor(pos)
    # Interpolate rows then columns.
    top = small[i0][:, i0] * (1 - frac[None, :]) + small[i0][:, i1] * frac[None, :]
    bot = small[i1][:, i0] * (1 - frac[None, :]) + small[i1][:, i1] * frac[None, :]
    return top * (1 - frac[:, None]) + bot * frac[:, None]


def _make_noise_texture(size=256, seed=9):
    rng = np.random.default_rng(seed)
    tex = np.zeros((size, size))
    amp, total = 1.0, 0.0
    for grid in (4, 8, 16, 32, 64, 128):
        tex += _tileable_octave(rng, grid, size) * amp
        total += amp
        amp *= 0.55
    tex /= total
    return (tex - tex.min()) / (tex.max() - tex.min() + 1e-9)


NOISE_TEX = _make_noise_texture()


def set_noise_seed(seed: int):
    """Regenerate the fractal detail texture — a whole new 'universe'."""
    global NOISE_TEX
    NOISE_TEX = _make_noise_texture(seed=seed)


def sample_tex(u, v, tex=None):
    """Bilinear sample of the tileable texture at float coords u, v (wrap)."""
    if tex is None:
        tex = NOISE_TEX
    size = tex.shape[0]
    fu, fv = np.mod(u, 1.0) * size, np.mod(v, 1.0) * size
    i0, j0 = np.floor(fu).astype(int) % size, np.floor(fv).astype(int) % size
    i1, j1 = (i0 + 1) % size, (j0 + 1) % size
    au, av = fu - np.floor(fu), fv - np.floor(fv)
    # tex is indexed [row=v, col=u]
    top = tex[j0, i0] * (1 - au) + tex[j0, i1] * au
    bot = tex[j1, i0] * (1 - au) + tex[j1, i1] * au
    return top * (1 - av) + bot * av


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

RD_STYLES = {
    "coral":   (0.0545, 0.062),
    "mitosis": (0.0367, 0.0649),
    "worms":   (0.0580, 0.0650),
    "solitons": (0.0200, 0.0560),
    "bacteria": (0.0370, 0.0600),
    "fingerprint": (0.0460, 0.0630),
    "spots":   (0.0350, 0.0650),
    "waves":   (0.0140, 0.0450),
    "chaos":   (0.0260, 0.0510),
    "holes":   (0.0390, 0.0580),
}
BLEND_OPS = ["off", "mix", "add", "screen", "difference"]


@dataclass
class Settings:
    mode: str = "fluid"
    palette: str = "vicious"
    speed: float = 1.0
    scale: float = 3.0
    symmetry: int = 6
    morph: bool = True
    morph_period: float = 14.0
    oscillate: bool = True
    hue_spin: bool = False
    trails: bool = False
    trail_amount: float = 0.65
    contrast: float = 1.0
    auto_cycle: bool = False
    auto_period: float = 20.0
    # v2 dials
    detail: float = 0.45     # fractal detail layer strength 0..1
    warp: float = 1.0        # domain-warp strength multiplier
    glow: float = 0.55       # bloom strength 0..1.5
    shading: float = 0.7     # gradient lighting strength 0..1.5
    saturation: float = 1.15
    gamma: float = 1.0
    vignette: bool = True
    rotation: float = 0.0    # radians/sec, 0 = off
    mirror_x: bool = False
    mirror_y: bool = False
    blend_op: str = "off"
    blend_mode2: str = "kaleidoscope"
    blend_mix: float = 0.5
    rd_style: str = "coral"
    # v3 dials
    seed: int = 9
    pan_x: float = 0.0
    pan_y: float = 0.0
    zoom: float = 1.0
    global_kaleido: int = 0      # 0 = off; else fold ALL modes into N segments
    pixelate: int = 0            # 0 = off; else block size in pixels
    posterize: int = 0           # 0 = off; else colour levels per channel field
    invert: bool = False
    solarize: float = 0.0        # 0 = off; else threshold 0..1
    rgb_shift: int = 0           # chromatic aberration, pixels
    scanlines: bool = False
    grain: float = 0.0           # film grain amount 0..1
    edge_glow: float = 0.0       # neon edge strength 0..1.5
    mouse_x: float = 0.0         # live mouse position, -1..1 (set by window)
    mouse_y: float = 0.0
    mouse_down: bool = False


# ---------------------------------------------------------------------------
# Modes — field functions return 0..1 fields.
# ---------------------------------------------------------------------------

def _warp(x, y, t, scale, amount=1.0):
    wx = x + amount * (0.55 * np.sin(y * scale * 1.7 + t * 0.9) + 0.25 * np.sin(y * scale * 3.9 - t * 1.7))
    wy = y + amount * (0.55 * np.cos(x * scale * 1.5 - t * 0.8) + 0.25 * np.cos(x * scale * 3.7 + t * 1.5))
    return wx, wy


def mode_plasma(x, y, r, th, t, s):
    v = (np.sin((x * s.scale + t) * 2.0) + np.sin((y * s.scale - t * 1.3) * 2.0)
         + np.sin(((x + y) * s.scale + t * 0.7) * 1.5) + np.sin((r * s.scale * 2.0 - t * 2.0))
         + 0.5 * np.sin((x - y) * s.scale * 4.3 + t * 2.2)
         + 0.25 * np.sin(r * s.scale * 7.0 - t * 3.1))
    return v / 4.75 + 0.5


def mode_fluid(x, y, r, th, t, s):
    # v2 fluid: coordinates warped by the fractal texture itself — marbled,
    # detailed flow instead of smooth sine blobs.
    u, v = (x * 0.5 + 0.5), (y * 0.5 + 0.5)
    w1 = sample_tex(u * 0.7 + t * 0.03, v * 0.7 - t * 0.02)
    w2 = sample_tex(u * 0.7 + 0.37 - t * 0.025, v * 0.7 + 0.61 + t * 0.03)
    wx = u + (w1 - 0.5) * 1.4 * s.warp
    wy = v + (w2 - 0.5) * 1.4 * s.warp
    base = sample_tex(wx * (0.6 + s.scale * 0.25) + t * 0.015, wy * (0.6 + s.scale * 0.25))
    fine = sample_tex(wx * 2.6 - t * 0.03, wy * 2.6 + t * 0.02)
    return np.clip(base * 0.75 + fine * 0.35, 0.0, 1.0)


def mode_nebula(x, y, r, th, t, s):
    u, v = (x * 0.5 + 0.5), (y * 0.5 + 0.5)
    w1 = sample_tex(u * 0.5 + t * 0.01, v * 0.5)
    w2 = sample_tex(u * 0.5 + 0.53, v * 0.5 + 0.21 - t * 0.008)
    wx = u + (w1 - 0.5) * 1.1 * s.warp
    wy = v + (w2 - 0.5) * 1.1 * s.warp
    clouds = (0.55 * sample_tex(wx * 1.1 + t * 0.006, wy * 1.1)
              + 0.30 * sample_tex(wx * 2.7 - t * 0.01, wy * 2.7)
              + 0.15 * sample_tex(wx * 6.0, wy * 6.0 + t * 0.012))
    clouds = np.clip((clouds - 0.28) * 1.9, 0.0, 1.0) ** 1.3
    # Pinpoint stars from a hashed cell grid, twinkling with time.
    cell = np.floor((x * 60).astype(np.float64)) * 12.9898 + np.floor((y * 60).astype(np.float64)) * 78.233
    star = np.mod(np.sin(cell) * 43758.5453, 1.0)
    stars = (star > 0.997) * (0.6 + 0.4 * np.sin(t * 3.0 + star * 40.0))
    return np.clip(clouds + stars * (0.4 + clouds), 0.0, 1.0)


def mode_fire(x, y, r, th, t, s):
    # v2 fire: detailed fractal noise stretched vertically, scrolling up,
    # shaped by a heat gradient — ragged flame tongues, not a smooth dome.
    u = x * (0.35 + s.scale * 0.08) + 0.5
    v = y * 0.16 - t * 0.22
    n = (0.6 * sample_tex(u, v) + 0.3 * sample_tex(u * 2.3, v * 2.3 - t * 0.15)
         + 0.15 * sample_tex(u * 5.1, v * 5.1 - t * 0.3))
    heat = (y + 1.0) / 2.0  # 0 top, 1 bottom (image y grows downward here)
    flame = heat * 1.15 + (n - 0.5) * 1.15 * (0.35 + heat) - 0.10 * (x ** 2)
    return np.clip(flame, 0.0, 1.0) ** 1.25


def _fold_theta(th, segments):
    seg = 2.0 * np.pi / max(1, segments)
    folded = np.mod(th, seg)
    return np.where(folded > seg / 2, seg - folded, folded)


def mode_kaleidoscope(x, y, r, th, t, s):
    fth = _fold_theta(th + t * 0.15, s.symmetry)
    kx, ky = r * np.cos(fth), r * np.sin(fth)
    wx, wy = _warp(kx, ky, t, s.scale, s.warp)
    v = np.sin(wx * s.scale * 4.0 + t) + np.sin(wy * s.scale * 4.0 - t * 1.2) + np.sin(r * s.scale * 6.0 - t * 2.0)
    return v / 3.0 + 0.5


def mode_voronoi(x, y, r, th, t, s):
    n = 14
    seeds = np.arange(n)
    px = np.sin(seeds * 12.9898 + t * (0.21 + 0.03 * seeds)) * 0.85
    py = np.cos(seeds * 78.233 + t * (0.17 + 0.025 * seeds)) * 0.85
    d1 = np.full(x.shape, 1e9); d2 = np.full(x.shape, 1e9); owner = np.zeros(x.shape)
    for i in range(n):
        d = (x - px[i]) ** 2 + (y - py[i]) ** 2
        closer = d < d1
        d2 = np.where(closer, d1, np.minimum(d2, d))
        owner = np.where(closer, i / n, owner)
        d1 = np.where(closer, d, d1)
    edge = np.sqrt(d2) - np.sqrt(d1)
    cells = owner + 0.25 * np.sin(t + owner * 20.0)
    return np.clip(cells * 0.8 + (edge < 0.045) * 0.6, 0.0, 1.0)


def mode_waves(x, y, r, th, t, s):
    v = np.zeros_like(x)
    for i in range(5):
        cx, cy = math.sin(t * 0.3 + i * 2.4) * 0.7, math.cos(t * 0.23 + i * 1.9) * 0.7
        d = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        v += np.sin(d * s.scale * 6.0 - t * 3.0) / (1.0 + d * 2.0)
    return v * 0.5 + 0.5


def mode_tunnel(x, y, r, th, t, s):
    depth = 1.0 / (r + 0.18)
    v = np.sin(depth * s.scale * 1.5 - t * 2.5) + np.sin(th * s.symmetry + t + depth)
    return v / 2.0 + 0.5


def mode_lava(x, y, r, th, t, s):
    acc = np.zeros_like(x)
    for i in range(7):
        cx = math.sin(t * (0.25 + 0.05 * i) + i * 1.7) * 0.65
        cy = math.cos(t * (0.2 + 0.04 * i) + i * 2.3) * 0.65
        acc += 0.09 / ((x - cx) ** 2 + (y - cy) ** 2 + 0.02)
    return np.clip((acc - 0.6) / 2.2, 0.0, 1.0)


def mode_coast(x, y, r, th, t, s):
    wx, wy = _warp(x, y, t * 0.25, 1.4, s.warp)
    h = np.sin(wx * 1.9) + np.sin(wy * 2.3 + 1.3) + 0.4 * np.sin((wx + wy) * 3.2 - t * 0.4)
    bands = np.abs(np.sin((h * 0.85 + y * 0.45) * math.pi))
    return np.clip(bands ** 0.8, 0.0, 1.0)


def mode_mandala(x, y, r, th, t, s):
    fth = _fold_theta(th - t * 0.2, s.symmetry)
    petals = np.sin(fth * s.symmetry + r * s.scale * 5.0 - t * 1.5)
    rings = np.sin(r * s.scale * 9.0 - t * 2.0)
    return (petals * rings) * 0.5 + 0.5


def mode_storm(x, y, r, th, t, s):
    swirl = np.sin(th * 2.0 + r * s.scale * 3.0 - t) * 0.6
    wx, wy = _warp(x + swirl * y, y - swirl * x, t, s.scale, s.warp)
    v = np.sin(wx * s.scale * 3.0 + t * 1.4) * np.cos(wy * s.scale * 3.0 - t)
    return v * 0.5 + 0.5


def mode_aurora(x, y, r, th, t, s):
    curtain = np.sin(x * s.scale * 2.5 + np.sin(y * 3.0 + t * 0.7) * 1.5 + t * 0.6)
    falloff = np.exp(-((y - curtain * 0.25) ** 2) * 2.5)
    shimmer = 0.7 + 0.3 * np.sin(x * s.scale * 9.0 + t * 3.0 + y * 6.0)
    return np.clip(falloff * shimmer, 0.0, 1.0)


def mode_galaxy(x, y, r, th, t, s):
    arm = np.sin(th * 2.0 - r * s.scale * 3.2 + t * 0.7)
    arm2 = np.sin(th * 2.0 - r * s.scale * 3.2 + math.pi + t * 0.7)
    spiral = np.clip((arm * 0.5 + 0.5) ** 3 + (arm2 * 0.5 + 0.5) ** 3, 0.0, 1.0)
    disk = np.exp(-r * 2.2)
    core = np.exp(-r * 7.0)
    dust = sample_tex(x * 0.4 + 0.5 + t * 0.01, y * 0.4 + 0.5)
    return np.clip(spiral * disk * (0.5 + dust) + core * 0.9, 0.0, 1.0)


_JULIA_POINTS = [(-0.7, 0.27015), (-0.835, -0.2321), (-0.8, 0.156),
                 (-0.4, 0.6), (0.285, 0.01), (-0.70176, -0.3842)]


def _julia_c(t):
    """Loop smoothly through famous connected Julia constants."""
    pos = (t * 0.05) % len(_JULIA_POINTS)
    i = int(pos)
    frac = pos - i
    frac = frac * frac * (3 - 2 * frac)  # smoothstep
    a = _JULIA_POINTS[i]
    b = _JULIA_POINTS[(i + 1) % len(_JULIA_POINTS)]
    return a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac


def mode_julia(x, y, r, th, t, s):
    cr, ci = _julia_c(t)
    zoom = (1.55 + 0.35 * math.sin(t * 0.21)) * (3.0 / max(1.5, s.scale))
    zx = x * zoom
    zy = y * zoom
    esc = np.full(x.shape, 90.0); alive = np.ones(x.shape, bool)
    with np.errstate(all="ignore"):
        for i in range(90):
            # Freeze escaped points so they can't overflow to inf/NaN.
            zx = np.where(alive, zx, 2.0); zy = np.where(alive, zy, 0.0)
            zx2, zy2 = zx * zx, zy * zy
            mag = np.sqrt(zx2 + zy2)
            done = alive & (zx2 + zy2 > 4.0)
            smooth = i + 1 - np.log2(np.maximum(np.log(np.maximum(mag, 1.0001)), 1e-6))
            esc = np.where(done, smooth, esc)
            alive = alive & ~done
            zy = 2.0 * zx * zy + ci
            zx = zx2 - zy2 + cr
            if not alive.any():
                break
    esc = np.nan_to_num(esc, nan=90.0, posinf=90.0, neginf=0.0)
    inside = esc >= 90.0
    # Root-compressed escape values + fine banding = rich fractal detail.
    field = np.sqrt(np.clip(esc / 36.0, 0.0, 1.0)) * 0.85 + 0.15 * np.sin(esc * 0.9 - t)
    return np.where(inside, 0.10 + 0.08 * np.sin(r * 9.0 - t), np.clip(field, 0.0, 1.0))


def mode_mandelbrot(x, y, r, th, t, s):
    cx = -0.65 + 0.25 * math.sin(t * 0.07)
    cy = 0.0 + 0.2 * math.cos(t * 0.09)
    zoom = (1.5 + 0.5 * math.sin(t * 0.15)) * (3.0 / max(1.5, s.scale))
    cr = x * zoom + cx
    ci = y * zoom + cy
    zx = np.zeros_like(x); zy = np.zeros_like(y)
    esc = np.full(x.shape, 90.0); alive = np.ones(x.shape, bool)
    with np.errstate(all="ignore"):
        for i in range(90):
            zx = np.where(alive, zx, 2.0); zy = np.where(alive, zy, 0.0)
            zx2, zy2 = zx * zx, zy * zy
            mag = np.sqrt(zx2 + zy2)
            done = alive & (zx2 + zy2 > 4.0)
            smooth = i + 1 - np.log2(np.maximum(np.log(np.maximum(mag, 1.0001)), 1e-6))
            esc = np.where(done, smooth, esc)
            alive = alive & ~done
            zy = 2.0 * zx * zy + ci
            zx = zx2 - zy2 + cr
            if not alive.any():
                break
    esc = np.nan_to_num(esc, nan=90.0, posinf=90.0, neginf=0.0)
    inside = esc >= 90.0
    field = np.sqrt(np.clip(esc / 36.0, 0.0, 1.0)) * 0.85 + 0.15 * np.sin(esc * 0.9 - t)
    return np.where(inside, 0.10 + 0.08 * np.sin(r * 9.0 - t), np.clip(field, 0.0, 1.0))


def mode_smoke(x, y, r, th, t, s):
    u, v = (x * 0.5 + 0.5), (y * 0.5 + 0.5)
    n = (0.55 * sample_tex(u * 0.8 - t * 0.008, v * 0.35 + t * 0.045)
         + 0.30 * sample_tex(u * 1.9 + 0.4 - t * 0.015, v * 0.9 + t * 0.08)
         + 0.15 * sample_tex(u * 4.2, v * 2.2 + t * 0.14))
    billow = np.clip((n - 0.25) * 1.7, 0.0, 1.0)
    return billow ** 0.85


def mode_silk(x, y, r, th, t, s):
    wx, wy = _warp(x, y, t, s.scale, s.warp * 1.3)
    ribbons = np.sin(wx * s.scale * 3.4 + np.sin(wy * s.scale * 2.2 + t * 0.8) * 2.4 + t)
    fine = np.sin((wx - wy) * s.scale * 9.0 - t * 1.7)
    field = (np.abs(ribbons) ** 0.55) * 0.8 + (np.abs(fine) ** 0.7) * 0.3
    return np.clip(field, 0.0, 1.0)


def mode_caustics(x, y, r, th, t, s):
    u, v = (x * 0.5 + 0.5), (y * 0.5 + 0.5)
    c1 = 1.0 - np.abs(2.0 * sample_tex(u * 1.3 + t * 0.02, v * 1.3 - t * 0.013) - 1.0)
    c2 = 1.0 - np.abs(2.0 * sample_tex(u * 2.1 + 0.37 - t * 0.017, v * 2.1 + 0.53 + t * 0.021) - 1.0)
    web = (c1 * c2) * 1.7
    return np.clip(web ** 2.2, 0.0, 1.0)


def mode_terrain(x, y, r, th, t, s):
    u, v = (x * 0.5 + 0.5), (y * 0.5 + 0.5)
    h = (0.7 * sample_tex(u * 0.9 + t * 0.008, v * 0.9)
         + 0.3 * sample_tex(u * 2.6 - t * 0.005, v * 2.6))
    lines = np.exp(-np.abs(np.sin(h * 22.0 + t * 0.35)) * 2.2)
    return np.clip(h * 0.82 + lines * 0.38, 0.0, 1.0)


def _hex_round(q, r_):
    cx_, cy_, cz_ = q, r_, -q - r_
    rx, ry, rz = np.round(cx_), np.round(cy_), np.round(cz_)
    dx, dy, dz = np.abs(rx - cx_), np.abs(ry - cy_), np.abs(rz - cz_)
    fix_x = (dx > dy) & (dx > dz)
    fix_y = (dy > dz) & ~fix_x
    rx = np.where(fix_x, -ry - rz, rx)
    ry = np.where(fix_y, -rx - rz, ry)
    rz = np.where(~fix_x & ~fix_y, -rx - ry, rz)
    return rx, ry, rz


def mode_hexgrid(x, y, r, th, t, s):
    freq = s.scale * 2.6
    X, Y = x * freq, y * freq
    # Pointy-top hex grid in axial coords (cell size 1).
    q = (math.sqrt(3) / 3 * X - 1 / 3 * Y)
    r_ = (2 / 3 * Y)
    rq, rr, _ = _hex_round(q, r_)
    cx = math.sqrt(3) * rq + math.sqrt(3) / 2 * rr
    cy = 1.5 * rr
    lx, ly = X - cx, Y - cy
    hexd = np.maximum(np.abs(lx) * 0.866 + np.abs(ly) * 0.5, np.abs(ly)) / 0.92
    cellhash = np.mod(np.sin(rq * 12.9898 + rr * 78.233) * 43758.5453, 1.0)
    pulse = 0.55 + 0.45 * np.sin(t * 2.0 + cellhash * 25.0)
    fill = cellhash * 0.75 * pulse
    edge = np.exp(-np.abs(hexd - 0.92) * 14.0)
    return np.clip(fill + edge * 0.85, 0.0, 1.0)


def mode_truchet(x, y, r, th, t, s):
    freq = s.scale * 1.6
    gx, gy = x * freq, y * freq
    cellx, celly = np.floor(gx), np.floor(gy)
    lx, ly = gx - cellx - 0.5, gy - celly - 0.5
    step_hash = np.floor(t * 0.25)
    hsh = np.mod(np.sin(cellx * 12.9898 + celly * 78.233 + step_hash * 4.7) * 43758.5453, 1.0)
    flip = hsh > 0.5
    # Arc centres at opposite corners, chosen by the flip.
    c1x = np.where(flip, -0.5, -0.5); c1y = np.where(flip, -0.5, 0.5)
    c2x = np.where(flip, 0.5, 0.5); c2y = np.where(flip, 0.5, -0.5)
    d = np.minimum(np.sqrt((lx - c1x) ** 2 + (ly - c1y) ** 2),
                   np.sqrt((lx - c2x) ** 2 + (ly - c2y) ** 2))
    band = np.exp(-((d - 0.5) * 7.0) ** 2)
    return np.clip(band * 0.95 + hsh * 0.12, 0.0, 1.0)


def mode_phyllotaxis(x, y, r, th, t, s):
    n = 150
    idx = np.arange(n)
    ang = idx * 2.39996 + t * 0.25
    rad = 0.078 * np.sqrt(idx) * (1.0 + 0.04 * math.sin(t * 0.7))
    px, py = rad * np.cos(ang), rad * np.sin(ang)
    dmin = np.full(x.shape, 1e9); owner = np.zeros(x.shape)
    for i in range(n):
        d = (x - px[i]) ** 2 + (y - py[i]) ** 2
        closer = d < dmin
        dmin = np.where(closer, d, dmin)
        owner = np.where(closer, i / n, owner)
    dots = np.exp(-np.sqrt(dmin) * 10.0)
    return np.clip(dots * (0.7 + 0.3 * np.sin(owner * 30.0 + t)) + owner * 0.38, 0.0, 1.0)


def mode_harmonograph(x, y, r, th, t, s):
    h, w = x.shape
    canvas = np.zeros((h, w))
    steps = 7000
    tt = np.linspace(0, 14 * math.pi, steps)
    f1 = 2.0 + 0.3 * math.sin(t * 0.11)
    f2 = 3.0 + 0.3 * math.cos(t * 0.09)
    px = np.sin(tt * f1 + t * 0.6) * np.exp(-tt * 0.04)
    py = np.sin(tt * f2 + math.pi / 2 + t * 0.4) * np.exp(-tt * 0.04)
    ix = ((px * 0.95 + 1) / 2 * (w - 1)).astype(int)
    iy = ((py * 0.95 + 1) / 2 * (h - 1)).astype(int)
    np.add.at(canvas.ravel(), iy * w + ix, 1.0)
    cross = (np.roll(canvas, 1, 0) + np.roll(canvas, -1, 0)
             + np.roll(canvas, 1, 1) + np.roll(canvas, -1, 1))
    diag = (np.roll(np.roll(canvas, 1, 0), 1, 1) + np.roll(np.roll(canvas, 1, 0), -1, 1)
            + np.roll(np.roll(canvas, -1, 0), 1, 1) + np.roll(np.roll(canvas, -1, 0), -1, 1))
    glow = (canvas + 0.5 * cross + 0.3 * diag) * 1.6
    return np.clip(glow, 0.0, 1.0)


def mode_starwarp(x, y, r, th, t, s):
    sector = np.floor((th + math.pi) / (2 * math.pi) * 72.0)
    hsh = np.mod(np.sin(sector * 78.233) * 43758.5453, 1.0)
    streaks = np.power(np.mod(r * 2.2 - t * (0.7 + hsh * 1.3) + hsh * 7.0, 1.0), 3.0)
    core = np.exp(-r * 4.5)
    return np.clip(streaks * (0.35 + hsh * 0.75) * np.clip(r * 1.6, 0, 1) + core, 0.0, 1.0)


def mode_lightning(x, y, r, th, t, s):
    u, v = (x * 0.5 + 0.5), (y * 0.5 + 0.5)
    n = sample_tex(u * 1.15 + t * 0.23, v * 2.8 - t * 0.05)
    ridge = 1.0 - np.abs(2.0 * n - 1.0)
    flicker = 0.72 + 0.28 * np.sin(t * 43.0) * np.sin(t * 7.3)
    bolts = np.power(ridge, 9.0) * 1.6 * flicker
    return np.clip(bolts + n * 0.16, 0.0, 1.0)


def mode_gridwarp(x, y, r, th, t, s):
    wx, wy = _warp(x, y, t, s.scale, s.warp)
    freq = s.scale * 2.2
    gx, gy = wx * freq, wy * freq
    check = np.mod(np.floor(gx) + np.floor(gy), 2.0)
    linex = np.exp(-np.abs(np.mod(gx, 1.0) - 0.5) * 9.0)
    liney = np.exp(-np.abs(np.mod(gy, 1.0) - 0.5) * 9.0)
    return np.clip(check * 0.5 + np.maximum(linex, liney) * 0.45 + 0.15 * np.sin(t + gx), 0.0, 1.0)


# --- Stateful modes: reaction-diffusion + particle flowfield --------------

def _laplacian(a):
    return (0.2 * (np.roll(a, 1, 0) + np.roll(a, -1, 0) + np.roll(a, 1, 1) + np.roll(a, -1, 1))
            + 0.05 * (np.roll(np.roll(a, 1, 0), 1, 1) + np.roll(np.roll(a, 1, 0), -1, 1)
                      + np.roll(np.roll(a, -1, 0), 1, 1) + np.roll(np.roll(a, -1, 0), -1, 1))
            - a)


class RDState:
    """Gray-Scott reaction-diffusion. Step it a few times per frame."""

    def __init__(self, w, h, style="coral", seed=9):
        self.w, self.h = w, h
        self.feed, self.kill = RD_STYLES[style]
        rng = np.random.default_rng(seed)
        self.U = np.ones((h, w)); self.V = np.zeros((h, w))
        # Many small *disk* seeds: square seeds grow into cross/flower
        # artefacts, and sparse seeds take forever to cover the field.
        yy, xx = np.mgrid[0:h, 0:w]
        for _ in range(40):
            cx, cy = rng.integers(8, w - 8), rng.integers(8, h - 8)
            rad = rng.integers(3, 6)
            disk = (xx - cx) ** 2 + (yy - cy) ** 2 <= rad * rad
            self.U[disk] = 0.5
            self.V[disk] = 0.25

    def paint(self, nx, ny, radius=6):
        """Stamp a V blob at normalised coords — click/drag to seed patterns."""
        cx, cy = int(nx * self.w), int(ny * self.h)
        y0, y1 = max(0, cy - radius), min(self.h, cy + radius)
        x0, x1 = max(0, cx - radius), min(self.w, cx + radius)
        self.U[y0:y1, x0:x1] = 0.5
        self.V[y0:y1, x0:x1] = 0.25

    def step(self, n=8):
        Du, Dv = 0.2097, 0.105  # standard Gray-Scott rates (0.16/0.08 stalls)
        for _ in range(n):
            lu, lv = _laplacian(self.U), _laplacian(self.V)
            uvv = self.U * self.V * self.V
            self.U += Du * lu - uvv + self.feed * (1.0 - self.U)
            self.V += Dv * lv + uvv - (self.feed + self.kill) * self.V
            np.clip(self.U, 0, 1, out=self.U); np.clip(self.V, 0, 1, out=self.V)

    def field(self):
        return np.clip(self.V * 3.2, 0.0, 1.0)


class ParticleState:
    """Particles advected through a swirling flow field, leaving trails."""

    def __init__(self, w, h, n=2200, seed=9):
        self.w, self.h, self.n = w, h, n
        rng = np.random.default_rng(seed)
        self.px = rng.random(n) * w; self.py = rng.random(n) * h
        self.canvas = np.zeros((h, w))

    def step(self, t, scale=3.0, substeps=2):
        self.canvas *= 0.965
        for _ in range(substeps):
            xn, yn = (self.px / self.w) * 2 - 1, (self.py / self.h) * 2 - 1
            ang = (np.sin(xn * scale + t * 0.7) + np.cos(yn * scale * 1.3 - t * 0.5)) * math.pi
            self.px += np.cos(ang) * 1.7; self.py += np.sin(ang) * 1.7
            out = (self.px < 0) | (self.px >= self.w) | (self.py < 0) | (self.py >= self.h)
            if out.any():
                rng = np.random.default_rng(int(t * 60) + 7)
                self.px[out] = rng.random(out.sum()) * self.w
                self.py[out] = rng.random(out.sum()) * self.h
            idx = (self.py.astype(int) * self.w + self.px.astype(int))
            np.add.at(self.canvas.ravel(), idx, 0.55)
        np.clip(self.canvas, 0, 1.4, out=self.canvas)

    def field(self):
        return np.clip(self.canvas, 0.0, 1.0)

    def attract(self, px_, py_, radius=None):
        """Pull particles toward a pixel-space point (mouse hold)."""
        radius = radius or self.w * 0.35
        dx, dy = px_ - self.px, py_ - self.py
        d = np.sqrt(dx * dx + dy * dy) + 1.0
        pull = np.clip(1.0 - d / radius, 0.0, 1.0) ** 2 * 0.12
        self.px += dx * pull
        self.py += dy * pull


def _resize_field(fld, w, h):
    if fld.shape == (h, w):
        return fld
    from PIL import Image
    img = Image.fromarray(fld.astype(np.float32), mode="F").resize((w, h), Image.BILINEAR)
    return np.asarray(img, dtype=np.float64)


def _reaction_field(w, h, t, s):
    # Always simulate at a fixed internal resolution: Gray-Scott growth is
    # measured in pixels/step, so simming at render size makes the pattern
    # sparser the bigger the window gets. Upscale the finished field.
    sim_w = 320
    sim_h = max(60, int(sim_w * h / w))
    sim = RDState(sim_w, sim_h, s.rd_style)
    sim.step(n=4000)
    return _resize_field(sim.field(), w, h)


def _flowfield_field(w, h, t, s):
    sim = ParticleState(w, h)
    for i in range(110):
        sim.step(t * 0.4 + i * 0.016, scale=s.scale)
    return sim.field()


FIELD_FUNCS = {
    "plasma": mode_plasma, "fluid": mode_fluid, "nebula": mode_nebula,
    "fire": mode_fire, "kaleidoscope": mode_kaleidoscope, "voronoi": mode_voronoi,
    "waves": mode_waves, "tunnel": mode_tunnel, "lava": mode_lava,
    "coast": mode_coast, "mandala": mode_mandala, "storm": mode_storm,
    "aurora": mode_aurora, "galaxy": mode_galaxy, "julia": mode_julia,
    "mandelbrot": mode_mandelbrot, "smoke": mode_smoke, "silk": mode_silk,
    "caustics": mode_caustics, "terrain": mode_terrain, "hexgrid": mode_hexgrid,
    "truchet": mode_truchet, "phyllotaxis": mode_phyllotaxis,
    "harmonograph": mode_harmonograph, "starwarp": mode_starwarp,
    "lightning": mode_lightning, "gridwarp": mode_gridwarp,
}
MODE_NAMES = list(FIELD_FUNCS.keys()) + ["flowfield", "reaction"]
STATEFUL = {"flowfield", "reaction"}


# ---------------------------------------------------------------------------
# Field computation + colour pipeline (palette, shading, post FX)
# ---------------------------------------------------------------------------

def compute_field(width, height, t, s: Settings, mode=None):
    mode = mode or s.mode
    ys, xs = np.mgrid[0:height, 0:width].astype(np.float64)
    x = (xs / width) * 2.0 - 1.0
    y = (ys / height) * 2.0 - 1.0
    x *= width / height
    # v3: zoom + pan, then optional global kaleidoscope fold for ANY mode.
    x = x * s.zoom + s.pan_x
    y = y * s.zoom + s.pan_y
    if s.mouse_down:
        # Held mouse = a warp well the field bends around.
        dx, dy = x - s.mouse_x, y - s.mouse_y
        d2 = dx * dx + dy * dy + 0.05
        pull = 0.35 / d2
        x = x - dx * pull * 0.3
        y = y - dy * pull * 0.3
    if s.global_kaleido and s.global_kaleido > 1:
        rr = np.sqrt(x ** 2 + y ** 2)
        fth = _fold_theta(np.arctan2(y, x), s.global_kaleido)
        x, y = rr * np.cos(fth), rr * np.sin(fth)
    if s.rotation:
        ang = s.rotation * t
        ca, sa = math.cos(ang), math.sin(ang)
        x, y = x * ca - y * sa, x * sa + y * ca
    if s.mirror_x:
        x = np.abs(x)  # fold left/right into mirrored halves
    if s.mirror_y:
        y = np.abs(y)  # fold top/bottom into mirrored halves
    r = np.sqrt(x ** 2 + y ** 2)
    th = np.arctan2(y, x)

    scale = s.scale * (1.0 + 0.35 * math.sin(t * 0.43)) if s.oscillate else s.scale
    orig = s.scale; s.scale = scale
    try:
        if mode == "reaction":
            fld = _reaction_field(width, height, t, s)
        elif mode == "flowfield":
            fld = _flowfield_field(width, height, t, s)
        else:
            fld = FIELD_FUNCS[mode](x, y, r, th, t * s.speed, s)
    finally:
        s.scale = orig

    fld = np.clip(fld, 0.0, 1.0)
    # Fractal detail layer (skips modes that are already detail-native).
    if s.detail > 0 and mode not in ("julia", "reaction", "flowfield", "voronoi"):
        det = sample_tex((x * 0.5 + 0.5) * (2.0 + s.scale), (y * 0.5 + 0.5) * (2.0 + s.scale) + t * 0.01)
        fld = np.clip(fld * (1 - s.detail * 0.4) + det * s.detail * 0.4, 0.0, 1.0)
    # Blend with a second mode.
    if s.blend_op != "off" and mode not in STATEFUL and s.blend_mode2 != mode:
        other = compute_field(width, height, t, Settings(
            mode=s.blend_mode2, palette=s.palette, speed=s.speed, scale=s.scale,
            symmetry=s.symmetry, warp=s.warp, detail=0.0, blend_op="off",
            oscillate=s.oscillate, rotation=s.rotation), mode=s.blend_mode2)
        m = s.blend_mix
        if s.blend_op == "mix":
            fld = fld * (1 - m) + other * m
        elif s.blend_op == "add":
            fld = np.clip(fld + other * m, 0.0, 1.0)
        elif s.blend_op == "screen":
            fld = 1 - (1 - fld) * (1 - other * m)
        elif s.blend_op == "difference":
            fld = np.clip(np.abs(fld - other) * (0.5 + m), 0.0, 1.0)
    if s.hue_spin:
        fld = np.mod(fld + t * 0.07, 1.0)
    # v3 field FX: pixelate, posterize, solarize, invert.
    if s.pixelate and s.pixelate > 1:
        from PIL import Image
        bw = max(2, width // s.pixelate); bh = max(2, height // s.pixelate)
        small = Image.fromarray(fld.astype(np.float32), mode="F").resize((bw, bh), Image.BILINEAR)
        fld = np.asarray(small.resize((width, height), Image.NEAREST), dtype=np.float64)
    if s.posterize and s.posterize > 1:
        lv = s.posterize
        fld = np.floor(np.clip(fld, 0, 0.999) * lv) / (lv - 1)
    if s.solarize > 0:
        fld = np.where(fld > s.solarize, 1.0 - fld, fld)
    if s.invert:
        fld = 1.0 - fld
    return np.clip((fld - 0.5) * s.contrast + 0.5, 0.0, 1.0)


def current_lut(s: Settings, t: float):
    base = LUTS[s.palette]
    if not s.morph:
        return base
    idx = PALETTE_NAMES.index(s.palette)
    nxt = LUTS[PALETTE_NAMES[(idx + 1) % len(PALETTE_NAMES)]]
    blend = 0.5 - 0.5 * math.cos(((t % s.morph_period) / s.morph_period) * 2 * math.pi)
    return np.clip(base.astype(np.float64) * (1 - blend) + nxt.astype(np.float64) * blend, 0, 255).astype(np.uint8)


def colorize(fld, s: Settings, t: float):
    """Field → RGB with gamma, palette, gradient lighting, saturation, bloom, vignette."""
    f = np.clip(fld, 0.0, 1.0) ** (1.0 / max(0.3, s.gamma))
    rgb = current_lut(s, t)[(f * 255.0).astype(np.uint8)].astype(np.float64) / 255.0
    if s.shading > 0:
        gy, gx = np.gradient(fld)
        light = (gx * 0.7 + gy * -0.7) * s.shading * 2.2
        rgb = np.clip(rgb * (1.0 + light[..., None]), 0.0, 1.0)
    if s.saturation != 1.0:
        lum = (rgb @ np.array([0.299, 0.587, 0.114]))[..., None]
        rgb = np.clip(lum + (rgb - lum) * s.saturation, 0.0, 1.0)
    if s.glow > 0:
        from PIL import Image, ImageFilter
        small = Image.fromarray((rgb * 255).astype(np.uint8)).resize(
            (max(2, rgb.shape[1] // 4), max(2, rgb.shape[0] // 4)))
        blur = np.asarray(small.filter(ImageFilter.GaussianBlur(6)).resize(
            (rgb.shape[1], rgb.shape[0])), dtype=np.float64) / 255.0
        bright = np.clip(rgb - 0.45, 0.0, 1.0)
        bsmall = Image.fromarray((bright * 255).astype(np.uint8)).resize(
            (max(2, rgb.shape[1] // 4), max(2, rgb.shape[0] // 4)))
        bblur = np.asarray(bsmall.filter(ImageFilter.GaussianBlur(8)).resize(
            (rgb.shape[1], rgb.shape[0])), dtype=np.float64) / 255.0
        rgb = np.clip(rgb + (blur * 0.25 + bblur * 1.4) * s.glow, 0.0, 1.0)
    if s.vignette:
        h, w = fld.shape
        yy, xx = np.mgrid[0:h, 0:w]
        d = np.sqrt(((xx / w - 0.5) * 2) ** 2 + ((yy / h - 0.5) * 2) ** 2)
        rgb *= np.clip(1.15 - d * 0.35, 0.55, 1.0)[..., None]
    # v3 RGB FX: neon edges, chromatic aberration, scanlines, grain.
    if s.edge_glow > 0:
        gy, gx = np.gradient(fld)
        edge = np.clip(np.sqrt(gx ** 2 + gy ** 2) * 6.0, 0.0, 1.0)
        rgb = np.clip(rgb + edge[..., None] * s.edge_glow * 0.8, 0.0, 1.0)
    if s.rgb_shift:
        sh = s.rgb_shift
        rgb[..., 0] = np.roll(rgb[..., 0], sh, axis=1)
        rgb[..., 2] = np.roll(rgb[..., 2], -sh, axis=1)
    if s.scanlines:
        rgb[::2] *= 0.82
    if s.grain > 0:
        rng = np.random.default_rng(int(t * 24) + 3)
        rgb = np.clip(rgb + (rng.random(fld.shape) - 0.5)[..., None] * s.grain * 0.35, 0.0, 1.0)
    return (rgb * 255).astype(np.uint8)


def render_frame(width, height, t, s: Settings):
    return colorize(compute_field(width, height, t, s), s, t)


# ---------------------------------------------------------------------------
# Presets — one keypress (TAB) loads a whole look.
# ---------------------------------------------------------------------------

PRESETS: dict[str, dict] = {
    "hellfire":    dict(mode="fire", palette="fire", detail=0.6, glow=0.9, shading=0.4, saturation=1.2),
    "acid trip":   dict(mode="fluid", palette="acid", detail=0.7, glow=0.7, warp=1.6, saturation=1.4),
    "vicious storm": dict(mode="storm", palette="vicious", detail=0.6, glow=0.8, shading=1.0, saturation=1.35),
    "deep ocean":  dict(mode="fluid", palette="ocean", detail=0.5, glow=0.4, shading=0.9, warp=0.8),
    "nebula drift": dict(mode="nebula", palette="ultraviolet", detail=0.3, glow=1.1, shading=0.2),
    "golden mandala": dict(mode="mandala", palette="gold", symmetry=8, glow=0.7, shading=0.8),
    "coral reef":  dict(mode="reaction", palette="turbo", rd_style="coral", glow=0.5, shading=0.6),
    "julia dreams": dict(mode="julia", palette="plasma", glow=0.6, shading=0.3, detail=0.0),
    "galaxy core": dict(mode="galaxy", palette="inferno", glow=1.2, shading=0.2, detail=0.3),
    "flow lines":  dict(mode="flowfield", palette="electric", glow=0.9, shading=0.0, detail=0.0),
    "kaleido melt": dict(mode="kaleidoscope", palette="meltdown", symmetry=12, glow=0.8, warp=1.4),
    "aurora sky":  dict(mode="aurora", palette="aurora", glow=0.8, shading=0.3),
    "chrome coast": dict(mode="coast", palette="chrome", glow=0.4, shading=1.2, detail=0.5),
    "toxic tunnel": dict(mode="tunnel", palette="toxic", symmetry=6, glow=0.7, saturation=1.3),
    # --- v3 presets (14 -> 30) ---
    "mandelbrot dive": dict(mode="mandelbrot", palette="electric", glow=0.6, shading=0.3, detail=0.0),
    "smoke signals": dict(mode="smoke", palette="charcoal", glow=0.3, shading=0.5, saturation=0.7),
    "silk road": dict(mode="silk", palette="royal", glow=0.7, shading=0.9, warp=1.5),
    "caustic pool": dict(mode="caustics", palette="lagoon", glow=1.0, shading=0.4),
    "terrain flight": dict(mode="terrain", palette="meadow", glow=0.3, shading=1.4, detail=0.2),
    "hex pulse": dict(mode="hexgrid", palette="cyberpunk", glow=0.8, shading=0.5),
    "truchet maze": dict(mode="truchet", palette="porcelain", glow=0.4, shading=0.6, saturation=0.9),
    "sunflower": dict(mode="phyllotaxis", palette="gold", glow=0.7, shading=0.5),
    "harmonograph dream": dict(mode="harmonograph", palette="orchid", glow=1.0, shading=0.0, detail=0.0),
    "warp speed": dict(mode="starwarp", palette="midnight", glow=0.9, shading=0.2),
    "lightning storm": dict(mode="lightning", palette="blueprint", glow=1.1, shading=0.3),
    "grid city": dict(mode="gridwarp", palette="synthwave", glow=0.7, warp=1.3),
    "glitch tape": dict(mode="fluid", palette="vapor", rgb_shift=3, scanlines=True, grain=0.5, glow=0.6),
    "noir": dict(mode="storm", palette="mono", posterize=5, grain=0.6, shading=1.0, saturation=0.4),
    "solar flare": dict(mode="nebula", palette="thermal", solarize=0.55, glow=0.9, saturation=1.3),
    "rainbow overload": dict(mode="kaleidoscope", palette="prism", hue_spin=True, symmetry=10, glow=0.8, saturation=1.5, blend_op="screen", blend_mode2="waves", blend_mix=0.4),
}
PRESET_NAMES = list(PRESETS.keys())


# FX/view fields a preset fully owns: reset to defaults first so switching
# presets never leaks the previous preset's glitch/FX settings.
_PRESET_RESET = ("blend_op", "blend_mix", "hue_spin", "mirror_x", "mirror_y",
                 "trails", "global_kaleido", "pixelate", "posterize",
                 "invert", "solarize", "rgb_shift", "scanlines", "grain",
                 "edge_glow", "pan_x", "pan_y", "zoom")


def apply_preset(s: Settings, name: str):
    fresh = Settings()
    for k in _PRESET_RESET:
        setattr(s, k, getattr(fresh, k))
    for k, v in PRESETS[name].items():
        setattr(s, k, v)


# ---------------------------------------------------------------------------
# Headless helpers
# ---------------------------------------------------------------------------

def make_contact_sheet(path, palettes=("vicious", "fire", "ocean")):
    from PIL import Image, ImageDraw
    w, h = 320, 180
    sheet = Image.new("RGB", (w * len(palettes), (h + 24) * len(MODE_NAMES)))
    draw = ImageDraw.Draw(sheet)
    for row, mode in enumerate(MODE_NAMES):
        base = Settings(mode=mode, palette=palettes[0], morph=False, oscillate=False)
        fld = compute_field(w, h, 2.7, base)
        for col, pal in enumerate(palettes):
            s = Settings(mode=mode, palette=pal, morph=False, oscillate=False)
            img = Image.fromarray(colorize(fld, s, 2.7))
            y0 = row * (h + 24)
            sheet.paste(img, (col * w, y0 + 24))
            draw.text((col * w + 8, y0 + 6), f"{mode} / {pal}", fill=(255, 255, 255))
    sheet.save(path)
    return path


def make_still(path, s: Settings, width=960, height=540, t=2.7):
    from PIL import Image
    Image.fromarray(render_frame(width, height, t, s)).save(path)
    return path


def make_gif(path, s: Settings, frames=48, fps=12, width=480, height=270):
    """Headless animated GIF. Stateful modes keep ONE persistent sim and
    step it between frames (re-simming from scratch per frame is both
    slower and visually static)."""
    from PIL import Image
    imgs = []
    rd = None
    particles = None
    if s.mode == "reaction":
        sim_w = min(width, 320)
        rd = RDState(sim_w, max(60, int(sim_w * height / width)), s.rd_style,
                     seed=s.seed)
        rd.step(n=1500)
    elif s.mode == "flowfield":
        particles = ParticleState(width, height, seed=s.seed)
    for i in range(frames):
        t = i / fps
        if rd is not None:
            rd.step(n=12)
            frame = colorize(_resize_field(rd.field(), width, height), s, t)
        elif particles is not None:
            particles.step(t, scale=s.scale)
            frame = colorize(particles.field(), s, t)
        else:
            frame = render_frame(width, height, t, s)
        imgs.append(Image.fromarray(frame))
    imgs[0].save(path, save_all=True, append_images=imgs[1:],
                 duration=int(1000 / fps), loop=0)
    return path


# ---------------------------------------------------------------------------
# Live window (pygame, imported lazily)
# ---------------------------------------------------------------------------

HELP_LINES = [
    "SPACE mode  P palette  TAB preset  B blend  N 2nd mode  Z/X mix",
    "D detail  W warp  G glow  L light  U satur.  V vignette  E rotate",
    "up/down speed  [ ] scale  S symmetry  1/2 mirrors  M morph  O osc.",
    "H hue-spin  T trails  A auto  R random  C shot  F full  ? help  ESC",
    "K kaleido-all  I invert  J pixelate  3 poster  4 solar  5 RGBshift",
    "6 scanlines  7 grain  8 edges  9 seed  ` RDstyle  ,.;' pan  -/= zoom",
    "0 reset view  Y GIF rec  mouse hold: warp well / seed reaction",
]


def run_live(s: Settings, width=960, height=540, fps=60, render_scale=0.5):
    try:
        import pygame
    except ImportError:
        print("pygame is not installed. Run:  pip install pygame")
        print("Headless options still work:  --list   --preview out.png")
        return 1
    import random
    pygame.init()
    screen = pygame.display.set_mode((width, height), pygame.RESIZABLE)
    pygame.display.set_caption("visualizurrr — mega visualiser v3")
    clock = pygame.time.Clock()
    font = pygame.font.SysFont(None, 22)
    show_help = True
    prev_surface = None
    start = time.time(); mode_started = start
    rd_state = None; particle_state = None; state_key = None
    gif_frames = None  # list while recording (Y toggles), None when idle

    def save_gif(frames):
        from PIL import Image
        name = f"visualiser_{int(time.time())}.gif"
        imgs = [Image.fromarray(f) for f in frames]
        imgs[0].save(name, save_all=True, append_images=imgs[1:],
                     duration=66, loop=0)
        print(f"Saved GIF: {name} ({len(imgs)} frames)")

    def cycle_opt(attr, opts):
        cur = getattr(s, attr)
        setattr(s, attr, opts[(opts.index(cur) + 1) % len(opts)] if cur in opts else opts[0])

    def cycle(names, current, step):
        return names[(names.index(current) + step) % len(names)]

    def dial(attr, factor, lo, hi):
        setattr(s, attr, float(np.clip(getattr(s, attr) * factor, lo, hi)))

    running = True
    while running:
        now = time.time(); t = now - start
        shift = False
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type in (pygame.MOUSEBUTTONDOWN, pygame.MOUSEBUTTONUP, pygame.MOUSEMOTION):
                w0, h0 = screen.get_size()
                mx, my = event.pos
                if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                    s.mouse_down = True
                elif event.type == pygame.MOUSEBUTTONUP and event.button == 1:
                    s.mouse_down = False
                # Match compute_field's space: x in [-aspect, aspect], y in [-1, 1].
                s.mouse_x = ((mx / max(1, w0)) * 2.0 - 1.0) * (w0 / max(1, h0))
                s.mouse_y = (my / max(1, h0)) * 2.0 - 1.0
                if s.mouse_down and s.mode == "reaction" and rd_state is not None:
                    rd_state.paint(mx / max(1, w0), my / max(1, h0))
            elif event.type == pygame.KEYDOWN:
                mods = pygame.key.get_mods(); shift = bool(mods & pygame.KMOD_SHIFT)
                k = event.key; step = -1 if shift else 1
                if k in (pygame.K_ESCAPE, pygame.K_q): running = False
                elif k == pygame.K_SPACE or k == pygame.K_RIGHT: s.mode = cycle(MODE_NAMES, s.mode, 1); mode_started = now
                elif k == pygame.K_LEFT: s.mode = cycle(MODE_NAMES, s.mode, -1); mode_started = now
                elif k == pygame.K_TAB:
                    nxt = cycle(PRESET_NAMES, getattr(s, "_preset", PRESET_NAMES[-1]), 1)
                    apply_preset(s, nxt); s._preset = nxt; mode_started = now
                elif k == pygame.K_p: s.palette = cycle(PALETTE_NAMES, s.palette, step)
                elif k == pygame.K_b: s.blend_op = cycle(BLEND_OPS, s.blend_op, step)
                elif k == pygame.K_n: s.blend_mode2 = cycle(MODE_NAMES, s.blend_mode2, step)
                elif k == pygame.K_z: s.blend_mix = float(np.clip(s.blend_mix - 0.1, 0, 1))
                elif k == pygame.K_x: s.blend_mix = float(np.clip(s.blend_mix + 0.1, 0, 1))
                elif k == pygame.K_d: s.detail = float(np.clip(s.detail + (-0.15 if shift else 0.15), 0.0, 1.0))
                elif k == pygame.K_w: s.warp = float(np.clip(s.warp + (-0.2 if shift else 0.2), 0.0, 2.5))
                elif k == pygame.K_g: s.glow = float(np.clip(s.glow + (-0.15 if shift else 0.15), 0.0, 1.5))
                elif k == pygame.K_l: s.shading = float(np.clip(s.shading + (-0.15 if shift else 0.15), 0.0, 1.5))
                elif k == pygame.K_u: s.saturation = float(np.clip(s.saturation + (-0.1 if shift else 0.1), 0.2, 2.0))
                elif k == pygame.K_e: s.rotation = 0.0 if s.rotation else 0.25
                elif k == pygame.K_v: s.vignette = not s.vignette
                elif k == pygame.K_1: s.mirror_x = not s.mirror_x
                elif k == pygame.K_2: s.mirror_y = not s.mirror_y
                elif k == pygame.K_m: s.morph = not s.morph
                elif k == pygame.K_o: s.oscillate = not s.oscillate
                elif k == pygame.K_h: s.hue_spin = not s.hue_spin
                elif k == pygame.K_t: s.trails = not s.trails
                elif k == pygame.K_a: s.auto_cycle = not s.auto_cycle
                elif k == pygame.K_UP: s.speed = min(4.0, s.speed * 1.2)
                elif k == pygame.K_DOWN: s.speed = max(0.1, s.speed / 1.2)
                elif k == pygame.K_RIGHTBRACKET: s.scale = min(9.0, s.scale * 1.2)
                elif k == pygame.K_LEFTBRACKET: s.scale = max(0.6, s.scale / 1.2)
                elif k == pygame.K_s:
                    opts = [1, 2, 4, 6, 8, 12]
                    s.symmetry = opts[(opts.index(s.symmetry) + 1) % len(opts)] if s.symmetry in opts else 6
                elif k == pygame.K_r:
                    s.mode = random.choice(MODE_NAMES); s.palette = random.choice(PALETTE_NAMES)
                    s.scale = random.uniform(1.2, 6.0); s.symmetry = random.choice([2, 4, 6, 8, 12])
                    s.glow = random.uniform(0.2, 1.2); s.detail = random.uniform(0.1, 0.9)
                    mode_started = now
                elif k == pygame.K_f: pygame.display.toggle_fullscreen()
                elif k == pygame.K_c: pygame.image.save(screen, f"screenshot_{int(now)}.png")
                elif k == pygame.K_SLASH: show_help = not show_help
                # --- v3 controls ---
                elif k == pygame.K_k: cycle_opt("global_kaleido", [0, 3, 4, 6, 8, 10, 12])
                elif k == pygame.K_i: s.invert = not s.invert
                elif k == pygame.K_j: cycle_opt("pixelate", [0, 2, 3, 4, 6, 8, 12])
                elif k == pygame.K_3: cycle_opt("posterize", [0, 3, 4, 5, 6, 8])
                elif k == pygame.K_4: cycle_opt("solarize", [0.0, 0.3, 0.5, 0.7])
                elif k == pygame.K_5: cycle_opt("rgb_shift", [0, 1, 2, 3, 5, 8])
                elif k == pygame.K_6: s.scanlines = not s.scanlines
                elif k == pygame.K_7: cycle_opt("grain", [0.0, 0.25, 0.5, 0.8])
                elif k == pygame.K_8: cycle_opt("edge_glow", [0.0, 0.4, 0.8, 1.2])
                elif k == pygame.K_9:
                    s.seed += (-1 if shift else 1); set_noise_seed(s.seed)
                elif k == pygame.K_BACKQUOTE: s.rd_style = cycle(list(RD_STYLES), s.rd_style, step)
                elif k == pygame.K_COMMA: s.pan_x = float(np.clip(s.pan_x - 0.15, -4, 4))
                elif k == pygame.K_PERIOD: s.pan_x = float(np.clip(s.pan_x + 0.15, -4, 4))
                elif k == pygame.K_SEMICOLON: s.pan_y = float(np.clip(s.pan_y - 0.15, -4, 4))
                elif k == pygame.K_QUOTE: s.pan_y = float(np.clip(s.pan_y + 0.15, -4, 4))
                elif k == pygame.K_MINUS: s.zoom = min(3.0, s.zoom * 1.15)
                elif k == pygame.K_EQUALS: s.zoom = max(0.4, s.zoom / 1.15)
                elif k == pygame.K_0: s.pan_x = 0.0; s.pan_y = 0.0; s.zoom = 1.0; s.global_kaleido = 0
                elif k == pygame.K_y:
                    if gif_frames is None:
                        gif_frames = []
                    else:
                        save_gif(gif_frames); gif_frames = None

        if s.auto_cycle and now - mode_started > s.auto_period:
            s.mode = cycle(MODE_NAMES, s.mode, 1); mode_started = now

        w, h = screen.get_size()
        rw, rh = max(80, int(w * render_scale)), max(60, int(h * render_scale))

        # Stateful modes keep persistent simulations in the live loop.
        key = (s.mode, rw, rh, s.rd_style)
        if s.mode == "reaction":
            if state_key != key or rd_state is None:
                sim_w = min(rw, 320)
                rd_state = RDState(sim_w, max(60, int(sim_w * rh / rw)), s.rd_style)
                state_key = key
            if s.mouse_down:
                rd_state.paint((s.mouse_x / max(0.01, w / h) + 1.0) / 2.0,
                               (s.mouse_y + 1.0) / 2.0)
            rd_state.step(n=10)
            frame = colorize(_resize_field(rd_state.field(), rw, rh), s, t)
        elif s.mode == "flowfield":
            if state_key != key or particle_state is None:
                particle_state = ParticleState(rw, rh); state_key = key
            if s.mouse_down:
                particle_state.attract((s.mouse_x / max(0.01, w / h) + 1.0) / 2.0 * rw,
                                       (s.mouse_y + 1.0) / 2.0 * rh)
            particle_state.step(t, scale=s.scale)
            frame = colorize(particle_state.field(), s, t)
        else:
            state_key = None
            frame = render_frame(rw, rh, t, s)

        if gif_frames is not None:
            gif_frames.append(frame.copy())
        surf = pygame.surfarray.make_surface(np.transpose(frame, (1, 0, 2)))
        surf = pygame.transform.smoothscale(surf, (w, h))
        if s.trails and prev_surface is not None and prev_surface.get_size() == (w, h):
            prev_surface.set_alpha(int(255 * s.trail_amount)); screen.blit(prev_surface, (0, 0))
        screen.blit(surf, (0, 0))
        prev_surface = screen.copy()

        if show_help:
            status = (f"{s.mode} | {s.palette}{'→morph' if s.morph else ''} | blend {s.blend_op}"
                      f"{'/' + s.blend_mode2 if s.blend_op != 'off' else ''} | det {s.detail:.2f} warp {s.warp:.1f} "
                      f"glow {s.glow:.2f} light {s.shading:.2f} sat {s.saturation:.1f} seed {s.seed}"
                      f"{' K' + str(s.global_kaleido) if s.global_kaleido else ''}"
                      f"{' REC' if gif_frames is not None else ''}")
            screen.blit(font.render(status, True, (255, 255, 255)), (10, 8))
            for i, line in enumerate(HELP_LINES):
                screen.blit(font.render(line, True, (200, 200, 200)), (10, h - 118 + i * 16))
        pygame.display.flip()
        clock.tick(fps)
    if gif_frames:
        save_gif(gif_frames)
    pygame.quit()
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(description="visualizurrr mega visualiser v3")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--preview", metavar="PNG")
    ap.add_argument("--still", metavar="PNG", help="render one frame to PNG and exit")
    ap.add_argument("--gif", metavar="GIF", help="render an animated GIF and exit")
    ap.add_argument("--frames", type=int, default=48, help="GIF frame count")
    ap.add_argument("--fps", type=int, default=12, help="GIF frames per second")
    ap.add_argument("--mode", choices=MODE_NAMES, default="fluid")
    ap.add_argument("--palette", choices=PALETTE_NAMES, default="vicious")
    ap.add_argument("--preset", choices=PRESET_NAMES)
    ap.add_argument("--rd-style", choices=list(RD_STYLES), default="coral")
    ap.add_argument("--seed", type=int, default=9, help="noise texture seed")
    ap.add_argument("--no-morph", action="store_true")
    ap.add_argument("--no-oscillate", action="store_true")
    args = ap.parse_args(argv)
    if args.list:
        print(f"Modes ({len(MODE_NAMES)}): {', '.join(MODE_NAMES)}")
        print(f"Palettes ({len(PALETTE_NAMES)}): {', '.join(PALETTE_NAMES)}")
        print(f"Presets ({len(PRESET_NAMES)}): {', '.join(PRESET_NAMES)}")
        print(f"Base combinations: {len(MODE_NAMES) * len(PALETTE_NAMES)} (before blending/presets/dials)")
        return 0
    set_noise_seed(args.seed)
    s = Settings(mode=args.mode, palette=args.palette, morph=not args.no_morph,
                 oscillate=not args.no_oscillate, rd_style=args.rd_style,
                 seed=args.seed)
    if args.preset:
        apply_preset(s, args.preset); s._preset = args.preset
    if args.preview:
        make_contact_sheet(args.preview)
        print(f"Wrote {args.preview}")
        return 0
    if args.still:
        make_still(args.still, s)
        print(f"Wrote {args.still}")
        return 0
    if args.gif:
        make_gif(args.gif, s, frames=args.frames, fps=args.fps)
        print(f"Wrote {args.gif}")
        return 0
    return run_live(s)


if __name__ == "__main__":
    sys.exit(main())
