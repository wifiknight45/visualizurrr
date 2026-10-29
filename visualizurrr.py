#!/usr/bin/env python3
"""
visualizurrr — terminal algorithmic art visualizer (pure Python stdlib).

68 patterns, each with its own real evaluator: escape-time fractals,
integrated chaotic attractors, cellular automata, L-system curves,
wireframe projections and analytic fields — rendered in the terminal
with 24-bit ANSI truecolor half-block graphics (each character cell
shows two vertical pixels, doubling vertical resolution).

Usage:
    ./visualizurrr.py [--pattern ID|NUM] [--palette ID] [--speed X] [--duration S]
    ./visualizurrr.py list-patterns
    ./visualizurrr.py list-palettes
    ./visualizurrr.py export FILE [--pattern ID|NUM] [--palette ID]

Run with --help for all options. Rendering requires a terminal;
list/export work anywhere.
"""

import argparse
import inspect
import math
import random
import shutil
import sys
import time

PALETTES = [
    {"id": "python-classic", "name": "Python Classic", "colors": ["#101726", "#3776ab", "#4b8bbe", "#ffd43b", "#ffe873"]},
    {"id": "cyberpunk-neon", "name": "Cyberpunk Neon", "colors": ["#090a15", "#00f0ff", "#ff0055", "#ffe600", "#b026ff"]},
    {"id": "synthwave-84", "name": "Synthwave 84", "colors": ["#120b24", "#ff2a85", "#05d9e8", "#ff7700", "#e4ff1a"]},
    {"id": "viridis", "name": "Viridis", "colors": ["#0d0826", "#440154", "#31688e", "#35b779", "#fde725"]},
    {"id": "plasma", "name": "Plasma", "colors": ["#0c0721", "#4b03a1", "#a20199", "#e75263", "#faba39"]},
    {"id": "magma", "name": "Magma", "colors": ["#05021a", "#3b0f70", "#8c2981", "#de4968", "#fe9f6d"]},
    {"id": "inferno", "name": "Inferno", "colors": ["#000004", "#57106e", "#bb3754", "#f98e09", "#fcffa4"]},
    {"id": "bioluminescence", "name": "Bioluminescence", "colors": ["#02131b", "#005f73", "#0a9396", "#94d2bd", "#52ffb8"]},
    {"id": "monokai-pro", "name": "Monokai Pro", "colors": ["#19181a", "#ffd866", "#fc9867", "#ff6188", "#78dce8"]},
    {"id": "nord-frost", "name": "Nord Frost & Aurora", "colors": ["#161922", "#88c0d0", "#81a1c1", "#a3be8c", "#ebcb8b"]},
    {"id": "solarized-dark", "name": "Solarized Dark", "colors": ["#002b36", "#268bd2", "#2aa198", "#b58900", "#cb4b16"]},
    {"id": "dracula-vampire", "name": "Dracula Vampire", "colors": ["#181528", "#bd93f9", "#ff79c6", "#50fa7b", "#8be9fd"]},
    {"id": "tokyo-night", "name": "Tokyo Night", "colors": ["#13141f", "#7aa2f7", "#bb9af7", "#7dcfff", "#ff9e64"]},
    {"id": "sunset-horizon", "name": "Sunset Horizon", "colors": ["#120d24", "#e63946", "#f77f00", "#fcbf49", "#ffeedb"]},
    {"id": "emerald-forest", "name": "Emerald Forest", "colors": ["#08170e", "#2d6a4f", "#40916c", "#74c69d", "#b7e4c7"]},
    {"id": "celestial-nebula", "name": "Celestial Nebula", "colors": ["#09081a", "#6b2cf5", "#a855f7", "#ec4899", "#38bdf8"]},
    {"id": "golden-amber", "name": "Golden Amber & Obsidian", "colors": ["#12100e", "#d97706", "#f59e0b", "#fbbf24", "#fef3c7"]},
    {"id": "cherry-blossom", "name": "Cherry Blossom", "colors": ["#1a1016", "#db2777", "#f472b6", "#fbcfe8", "#fff1f2"]},
    {"id": "electric-ultraviolet", "name": "Electric Ultraviolet", "colors": ["#0c051f", "#7928ca", "#ff0080", "#00dfd8", "#ffffff"]},
    {"id": "vaporwave-pastel", "name": "Vaporwave Pastel", "colors": ["#17142b", "#c084fc", "#67e8f9", "#fda4af", "#fef08a"]},
    {"id": "laser-matrix", "name": "Laser Matrix", "colors": ["#031206", "#008f11", "#00ff41", "#70ff90", "#caffd0"]},
    {"id": "deep-coral-reef", "name": "Deep Coral Reef", "colors": ["#07161f", "#ff6b6b", "#4ecdc4", "#ffe66d", "#f7fff7"]},
    {"id": "blueprint-technical", "name": "Blueprint Technical", "colors": ["#0a192f", "#172a45", "#303c55", "#64ffda", "#ffffff"]},
    {"id": "copper-patina", "name": "Copper & Patina", "colors": ["#141110", "#2a9d8f", "#e76f51", "#f4a261", "#e9c46a"]},
    {"id": "rainbow-spectrum", "name": "Rainbow Spectrum", "colors": ["#08080c", "#ff3366", "#ff9933", "#33cc66", "#3399ff", "#cc33ff"]},
    {"id": "monochrome-velvet", "name": "Monochrome Velvet", "colors": ["#0a0a0c", "#27272a", "#71717a", "#d4d4d8", "#ffffff"]},
]

PATTERNS = [
    {"num": 1, "id": "lorenz", "name": "Lorenz Strange Attractor", "cat": "Fractals"},
    {"num": 2, "id": "mandelbrot", "name": "Mandelbrot Boundary Explorer", "cat": "Fractals"},
    {"num": 3, "id": "julia", "name": "Dynamic Julia Set Morph", "cat": "Fractals"},
    {"num": 4, "id": "barnsley", "name": "Barnsley Fractal Fern", "cat": "Fractals"},
    {"num": 5, "id": "sierpinski", "name": "Sierpinski Recursive Matrix", "cat": "Fractals"},
    {"num": 6, "id": "rossler", "name": "Rössler Spiral Ribbon", "cat": "Fractals"},
    {"num": 7, "id": "dragon", "name": "Heighway Dragon Fractal", "cat": "Fractals"},
    {"num": 8, "id": "apollonian", "name": "Apollonian Kissing Circles", "cat": "Fractals"},
    {"num": 9, "id": "spirograph", "name": "Hypotrochoid Mechanical Spirograph", "cat": "Spirographs"},
    {"num": 10, "id": "epitrochoid", "name": "Epitrochoid Petaled Roulette", "cat": "Spirographs"},
    {"num": 11, "id": "maurer", "name": "Maurer Rose Harmonic Lattice", "cat": "Spirographs"},
    {"num": 12, "id": "lissajous", "name": "Lissajous Multi-Harmonograph", "cat": "Spirographs"},
    {"num": 13, "id": "phyllotaxis", "name": "Phyllotaxis Golden Spiral", "cat": "Spirographs"},
    {"num": 14, "id": "metatron", "name": "Metatron’s Cube Sacred Lattice", "cat": "Spirographs"},
    {"num": 15, "id": "cardioid", "name": "Modular Multiplication Cardioid Caustic", "cat": "Spirographs"},
    {"num": 16, "id": "vortex", "name": "Dual Fermat & Archimedean Vortex", "cat": "Spirographs"},
    {"num": 17, "id": "life", "name": "Conway’s Game of Life", "cat": "Cellular"},
    {"num": 18, "id": "rule30", "name": "Wolfram Rule 30 Chaos Automaton", "cat": "Cellular"},
    {"num": 19, "id": "rule90", "name": "Wolfram Rule 90 Sierpinski CA", "cat": "Cellular"},
    {"num": 20, "id": "rule110", "name": "Wolfram Rule 110 Universal Computer", "cat": "Cellular"},
    {"num": 21, "id": "langton", "name": "Langton’s Ant Emergent Highway", "cat": "Cellular"},
    {"num": 22, "id": "forestfire", "name": "Drossel-Schwabl Forest Fire Percolation", "cat": "Cellular"},
    {"num": 23, "id": "brian", "name": "Brian’s Brain Excitable Lattice", "cat": "Cellular"},
    {"num": 24, "id": "cyclic", "name": "Cyclic Cellular Automaton (David Griffeath)", "cat": "Cellular"},
    {"num": 25, "id": "chladni", "name": "Chladni Cymatics Acoustic Plate", "cat": "Physics"},
    {"num": 26, "id": "pendulum", "name": "Double Pendulum Chaotic Trajectory", "cat": "Physics"},
    {"num": 27, "id": "fourier", "name": "Fourier Series Epicycle Synthesizer", "cat": "Physics"},
    {"num": 28, "id": "interference", "name": "Wave Interference & Phase Ripple", "cat": "Physics"},
    {"num": 29, "id": "quantum", "name": "Quantum Harmonic Oscillator Probability Cloud", "cat": "Physics"},
    {"num": 30, "id": "soliton", "name": "Coupled Lattice Non-Linear Soliton", "cat": "Physics"},
    {"num": 31, "id": "magnetic", "name": "Magnetic Pendulum Fractal Basins", "cat": "Physics"},
    {"num": 32, "id": "nbody", "name": "Gravitational N-Body Orbital Ballet", "cat": "Physics"},
    {"num": 33, "id": "perlin", "name": "Perlin Noise Curl Vector Field", "cat": "Flows"},
    {"num": 34, "id": "clifford", "name": "Clifford Trigonometric Attractor", "cat": "Flows"},
    {"num": 35, "id": "dejong", "name": "Peter de Jong Sinusoidal Attractor", "cat": "Flows"},
    {"num": 36, "id": "svensson", "name": "Svensson Turbulent Orbit Attractor", "cat": "Flows"},
    {"num": 37, "id": "aizawa", "name": "Aizawa Tornadic Spherical Attractor", "cat": "Flows"},
    {"num": 38, "id": "thomas", "name": "Thomas Cyclically Symmetric Attractor", "cat": "Flows"},
    {"num": 39, "id": "karman", "name": "Kármán Vortex Street Fluid Shedding", "cat": "Flows"},
    {"num": 40, "id": "dla", "name": "Diffusion-Limited Aggregation (DLA)", "cat": "Flows"},
    {"num": 41, "id": "koch", "name": "Koch Snowflake Island", "cat": "Turtle"},
    {"num": 42, "id": "hilbert", "name": "Hilbert Space-Filling Curve", "cat": "Turtle"},
    {"num": 43, "id": "gosper", "name": "Gosper Hexagonal Flowsnake", "cat": "Turtle"},
    {"num": 44, "id": "peano", "name": "Peano Grid Space-Filling Curve", "cat": "Turtle"},
    {"num": 45, "id": "lsystem", "name": "Lindenmayer Stochastic Botanic Tree", "cat": "Turtle"},
    {"num": 46, "id": "starburst", "name": "Turtle Starburst Nebula", "cat": "Turtle"},
    {"num": 47, "id": "polyweb", "name": "Rotating Polygonal Morph Web", "cat": "Turtle"},
    {"num": 48, "id": "cesaro", "name": "Cesàro Torn Square Fractal Curve", "cat": "Turtle"},
    {"num": 49, "id": "moire", "name": "Moiré Angular Interference Grating", "cat": "Optics"},
    {"num": 50, "id": "penrose", "name": "Penrose P3 Aperiodic Quasi-Crystal", "cat": "Optics"},
    {"num": 51, "id": "voronoi", "name": "Voronoi Organic Cellular Partition", "cat": "Optics"},
    {"num": 52, "id": "delaunay", "name": "Delaunay Dual Constrained Mesh", "cat": "Optics"},
    {"num": 53, "id": "opart", "name": "Op-Art 3D Sphere Bulge Distortion", "cat": "Optics"},
    {"num": 54, "id": "tunnel", "name": "Anamorphic Infinite Tunnel Vortex", "cat": "Optics"},
    {"num": 55, "id": "tesseract", "name": "4D Hypercube Tesseract Wireframe", "cat": "Optics"},
    {"num": 56, "id": "geodesic", "name": "Geodesic Icosahedron Spherical Dome", "cat": "Optics"},
    {"num": 57, "id": "reaction", "name": "Gray-Scott Reaction-Diffusion Turing Patterns", "cat": "Nature"},
    {"num": 58, "id": "boids", "name": "Craig Reynolds Boids Murmuration Flocking", "cat": "Nature"},
    {"num": 59, "id": "physarum", "name": "Slime Mold Physarum Polycephalum Network", "cat": "Nature"},
    {"num": 60, "id": "predator", "name": "Lotka-Volterra Predator-Prey Phase Waves", "cat": "Nature"},
    {"num": 61, "id": "epidemic", "name": "Kermack-McKendrick Spatial Epidemic Wave", "cat": "Nature"},
    {"num": 62, "id": "lightning", "name": "Dielectric Breakdown Model (Lightning Sparks)", "cat": "Nature"},
    {"num": 63, "id": "jellyfish", "name": "Bioluminescent Jellyfish Undulating Pulse", "cat": "Nature"},
    {"num": 64, "id": "starfield", "name": "Relativistic Starfield Warp Drive", "cat": "Nature"},
    {"num": 65, "id": "mandelbulb", "name": "Mandelbulb Power-8 Hypercomplex Slice", "cat": "Fractals"},
    {"num": 66, "id": "ulam", "name": "Ulam Prime Number Diagonal Spiral", "cat": "Cellular"},
    {"num": 67, "id": "collatz", "name": "Collatz Conjecture 3n+1 Hailstone Tree", "cat": "Turtle"},
    {"num": 68, "id": "fibonacci", "name": "3D Fibonacci Golden Ratio Spiral Sphere", "cat": "Spirographs"},
]

# The web app's long pattern ids, accepted as aliases so commands
# copied from the web UI (and its pattern numbering) work verbatim.
WEB_ID_ALIASES = {'lorenz-attractor': 'lorenz', 'mandelbrot-set': 'mandelbrot', 'julia-set': 'julia', 'barnsley-fern': 'barnsley', 'sierpinski-carpet': 'sierpinski', 'rossler-attractor': 'rossler', 'dragon-curve': 'dragon', 'apollonian-gasket': 'apollonian', 'hypotrochoid-spirograph': 'spirograph', 'epitrochoid-flower': 'epitrochoid', 'maurer-rose': 'maurer', 'lissajous-harmonograph': 'lissajous', 'phyllotaxis-sunflower': 'phyllotaxis', 'metatrons-cube': 'metatron', 'cardioid-caustic': 'cardioid', 'archimedean-vortex': 'vortex', 'game-of-life': 'life', 'wolfram-rule-30': 'rule30', 'wolfram-rule-90': 'rule90', 'wolfram-rule-110': 'rule110', 'langtons-ant': 'langton', 'forest-fire': 'forestfire', 'brians-brain': 'brian', 'cyclic-ca': 'cyclic', 'chladni-plate': 'chladni', 'double-pendulum': 'pendulum', 'fourier-epicycles': 'fourier', 'wave-interference': 'interference', 'quantum-harmonic': 'quantum', 'coupled-soliton': 'soliton', 'magnetic-pendulum': 'magnetic', 'n-body-gravity': 'nbody', 'perlin-flow-field': 'perlin', 'clifford-attractor': 'clifford', 'dejong-attractor': 'dejong', 'svensson-attractor': 'svensson', 'aizawa-attractor': 'aizawa', 'thomas-attractor': 'thomas', 'karman-vortex': 'karman', 'dla-fractal': 'dla', 'koch-snowflake': 'koch', 'hilbert-curve': 'hilbert', 'gosper-flowsnake': 'gosper', 'peano-curve': 'peano', 'lsystem-tree': 'lsystem', 'turtle-starburst': 'starburst', 'turtle-polygonal-web': 'polyweb', 'cesaro-fractal': 'cesaro', 'moire-interference': 'moire', 'penrose-tiling': 'penrose', 'voronoi-cells': 'voronoi', 'delaunay-network': 'delaunay', 'op-art-sphere': 'opart', 'tunnel-vortex': 'tunnel', 'tesseract-4d': 'tesseract', 'geodesic-dome': 'geodesic', 'reaction-diffusion': 'reaction', 'boids-flocking': 'boids', 'physarum-slime': 'physarum', 'predator-prey': 'predator', 'epidemic-sir': 'epidemic', 'lightning-dbm': 'lightning', 'jellyfish-pulse': 'jellyfish', 'starfield-warp': 'starfield', 'mandelbulb-slice': 'mandelbulb', 'ulam-spiral': 'ulam', 'collatz-tree': 'collatz', 'fibonacci-sphere': 'fibonacci'}

# ---------------------------------------------------------------------------
# Color helpers
# ---------------------------------------------------------------------------

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join(c * 2 for c in hex_str)
    return tuple(int(hex_str[i:i + 2], 16) for i in (0, 2, 4))


def sample_palette(palette, t):
    colors = [hex_to_rgb(c) for c in palette["colors"]]
    t = t % 1.0
    num_seg = len(colors) - 1
    pos = t * num_seg
    idx = int(pos)
    frac = pos - idx
    c1 = colors[idx]
    c2 = colors[min(idx + 1, len(colors) - 1)]
    return tuple(int(c1[k] + (c2[k] - c1[k]) * frac) for k in range(3))


# ---------------------------------------------------------------------------
# Shared math helpers (also embedded into exported scripts)
# ---------------------------------------------------------------------------

def _hash2(ix, iy):
    """Deterministic 2D integer hash -> [0, 1)."""
    n = (ix * 374761393 + iy * 668265263) & 0xFFFFFFFF
    n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((n ^ (n >> 16)) & 0xFFFF) / 65536.0


def _vnoise(x, y):
    """Smooth value noise, one octave."""
    ix, iy = math.floor(x), math.floor(y)
    fx, fy = x - ix, y - iy
    sx = fx * fx * (3 - 2 * fx)
    sy = fy * fy * (3 - 2 * fy)
    a = _hash2(ix, iy)
    b = _hash2(ix + 1, iy)
    c = _hash2(ix, iy + 1)
    d = _hash2(ix + 1, iy + 1)
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy


def _fbm(x, y, octaves=3):
    total, amp, freq, norm = 0.0, 0.5, 1.0, 0.0
    for _ in range(octaves):
        total += amp * _vnoise(x * freq, y * freq)
        norm += amp
        amp *= 0.5
        freq *= 2.03
    return total / norm


def make_buf(w, h):
    return [[0.0] * w for _ in range(h)]


def to_px(x, y, w, h, aspect):
    """Map pattern coords (x in [-aspect, aspect], y in [-1, 1]) to pixels."""
    px = int((x / aspect + 1.0) * 0.5 * (w - 1))
    py = int((y + 1.0) * 0.5 * (h - 1))
    return px, py


def splat(buf, w, h, px, py, val, radius=0):
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            xx, yy = px + dx, py + dy
            if 0 <= xx < w and 0 <= yy < h:
                fall = 1.0 - 0.35 * max(abs(dx), abs(dy))
                if val * fall > buf[yy][xx]:
                    buf[yy][xx] = val * fall


def splat_line(buf, w, h, x0, y0, x1, y1, val, aspect, radius=0):
    steps = max(2, int(max(abs(x1 - x0), abs(y1 - y0)) * w * 0.75))
    for i in range(steps + 1):
        f = i / steps
        px, py = to_px(x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, w, h, aspect)
        splat(buf, w, h, px, py, val, radius)


_STATE = {}


def state_for(pattern_id):
    return _STATE.setdefault(pattern_id, {})


def aspect_of(w, h):
    # Half-block pixels are ~square: one char wide, half a char tall.
    return w / max(1, h)


def pattern_xy(px, py, w, h):
    aspect = aspect_of(w, h)
    x = (px / max(1, w - 1)) * 2 - 1
    y = (py / max(1, h - 1)) * 2 - 1
    return x * aspect, y, aspect


# ---------------------------------------------------------------------------
# Analytic field evaluators: f(x, y, t) -> density in [0, 1]
# x is aspect-corrected (roughly [-aspect, aspect]), y in [-1, 1].
# ---------------------------------------------------------------------------

def f_mandelbrot(x, y, t):
    cx, cy = x * 0.9 - 0.4, y * 0.9
    zx = zy = 0.0
    it = 0
    while zx * zx + zy * zy <= 4 and it < 40:
        zx, zy = zx * zx - zy * zy + cx, 2 * zx * zy + cy
        it += 1
    if it >= 40:
        return 0.0
    return 0.25 + 0.75 * ((it + 1 - math.log2(max(1e-9, math.log(zx * zx + zy * zy)))) / 40)


def f_julia(x, y, t):
    cx = -0.7 + 0.25 * math.cos(t * 0.4)
    cy = 0.27015 + 0.25 * math.sin(t * 0.4)
    zx, zy = x * 1.2, y * 1.2
    it = 0
    while zx * zx + zy * zy <= 4 and it < 40:
        zx, zy = zx * zx - zy * zy + cx, 2 * zx * zy + cy
        it += 1
    return it / 40 if it < 40 else 0.0


def f_mandelbulb(x, y, t):
    # Power-8 Mandelbulb iteration on a rotating 2D slice (z = slice offset).
    slice_z = 0.35 * math.sin(t * 0.3)
    px, py, pz = x * 1.1, y * 1.1, slice_z
    # Orbit starts at the point itself (z0 = c); starting at the origin
    # makes the first radius 0 and every point would 'escape' instantly.
    zx, zy, zz = px, py, pz
    it = 0
    while zx * zx + zy * zy + zz * zz <= 4 and it < 14:
        r = math.sqrt(zx * zx + zy * zy + zz * zz)
        if r < 1e-9:
            break
        theta = math.acos(zz / r) * 8
        phi = math.atan2(zy, zx) * 8
        r8 = r ** 8
        zx = r8 * math.sin(theta) * math.cos(phi) + px
        zy = r8 * math.sin(theta) * math.sin(phi) + py
        zz = r8 * math.cos(theta) + pz
        it += 1
    return it / 14 if it < 14 else 0.05


def f_chladni(x, y, t):
    # (n, m) mode pair, always distinct — n == m makes the field
    # identically zero (a flat white frame).
    n, m = [(3, 5), (2, 4), (3, 4), (2, 5), (4, 6)][int(t * 0.5) % 5]
    val = math.sin(n * math.pi * x * 0.6) * math.sin(m * math.pi * y) - math.sin(m * math.pi * x * 0.6) * math.sin(n * math.pi * y)
    return math.exp(-abs(val) * 5.0) ** 1.3


def f_interference(x, y, t):
    d1 = math.hypot(x - 0.5 * math.cos(t * 0.7), y - 0.4 * math.sin(t * 0.7))
    d2 = math.hypot(x + 0.5 * math.cos(t * 0.5), y + 0.4 * math.sin(t * 0.5))
    ring = math.sin(d1 * 28 - t * 3) * math.sin(d2 * 28 + t * 3)
    return (ring + 1) * 0.5


def f_quantum(x, y, t):
    # |psi|^2 of a 2D harmonic-oscillator superposition (n=2, m=1 modes).
    def ho(n, q):
        if n == 0:
            return math.exp(-q * q * 0.5)
        if n == 1:
            return math.sqrt(2) * q * math.exp(-q * q * 0.5)
        return (2 * q * q - 1) * math.exp(-q * q * 0.5)
    psi = ho(2, x * 1.6) * ho(1, y * 1.6) * math.cos(t) + ho(1, x * 1.6) * ho(2, y * 1.6) * math.sin(t)
    return min(1.0, psi * psi * 1.6)


def f_soliton(x, y, t):
    def sech2(z):
        c = math.cosh(max(-20.0, min(20.0, z)))
        return 1.0 / (c * c)
    p1 = sech2((x - (-0.9 + (t * 0.35) % 1.8)) * 7 + y * 0.6)
    p2 = sech2((x - (0.9 - (t * 0.22) % 1.8)) * 9 - y * 0.4)
    lattice = 0.15 * math.sin(x * 22 + p1 * 4) * math.sin(y * 22 + p2 * 4)
    return max(0.0, min(1.0, p1 + p2 * 0.8 + lattice * (p1 + p2)))


def f_perlin(x, y, t):
    warp = _fbm(x * 1.5 + 7.3, y * 1.5 - 2.1)
    n = _fbm(x * 2.2 + warp * 1.8 + t * 0.15, y * 2.2 - warp * 1.8)
    return max(0.0, min(1.0, n * 1.15))


def f_karman(x, y, t):
    # Alternating vortex blobs shed behind a cylinder at the left.
    if x < -0.55:
        d = math.hypot((x + 0.75) * 1.4, y)
        return max(0.0, 1.0 - d * 2.2) * 0.9
    val = 0.0
    for i in range(6):
        vx = -0.45 + i * 0.34 + (t * 0.45 % 0.34)
        vy = (0.16 if i % 2 == 0 else -0.16) * (0.7 + 0.3 * math.sin(t + i))
        d = math.hypot(x - vx, y - vy)
        sign = 1 if i % 2 == 0 else -1
        val += sign * math.exp(-d * d * 22) * math.cos(math.atan2(y - vy, x - vx) * 1.0)
    streak = 0.2 * math.sin(y * 30 + x * 4 - t * 2)
    return max(0.0, min(1.0, 0.5 + val * 0.75 + streak * math.exp(-abs(y) * 2)))


def f_moire(x, y, t):
    a = 0.12 + 0.1 * math.sin(t * 0.6)
    g1 = math.sin((x * math.cos(a) - y * math.sin(a)) * 42)
    g2 = math.sin((x * math.cos(-a) - y * math.sin(-a)) * 42)
    rings = math.sin(math.hypot(x, y) * 46 - t * 2)
    return (g1 * g2 * 0.5 + 0.5) * 0.75 + max(0.0, rings) * 0.25


def f_penrose(x, y, t):
    # Five-fold grating superposition: the classic quasicrystal field.
    total = 0.0
    for k in range(5):
        ang = k * math.pi / 5 + t * 0.05
        total += math.cos((math.cos(ang) * x + math.sin(ang) * y) * 9 + (t * 0.4 if k == 0 else 0))
    return max(0.0, min(1.0, (total / 5 + 1) * 0.5)) ** 1.6


def f_opart(x, y, t):
    r = math.hypot(x, y)
    bulge = 1.0 / (1.0 + r * r * (1.6 + 0.5 * math.sin(t)))
    bx, by = x * bulge * 6, y * bulge * 6
    checker = 1.0 if (int(math.floor(bx * 3)) + int(math.floor(by * 3))) % 2 == 0 else 0.0
    return 0.25 + 0.75 * checker * min(1.0, r * 2)


def f_tunnel(x, y, t):
    r = math.hypot(x, y) + 1e-6
    ang = math.atan2(y, x)
    depth = (1.6 / r + t * 1.4) % 1.0
    seg = (ang * 4 / math.pi + depth * 3) % 1.0
    ring = 0.5 + 0.5 * math.sin(depth * math.pi * 2)
    return max(0.0, min(1.0, ring * 0.8 + (0.2 if seg < 0.5 else 0.0))) * min(1.0, r * 2.5)


def f_vortex(x, y, t):
    r = math.hypot(x, y)
    ang = math.atan2(y, x)
    fermat = math.sin(r * r * 26 - ang * 3 - t * 2.5)
    arch = math.sin(r * 18 + ang * 5 + t * 2)
    return (fermat * arch + 1) * 0.5


def f_predator(x, y, t):
    # Lotka-Volterra cycle as a travelling phase wave.
    phase = t * 1.2 - (x * 2.0 + y * 1.2)
    prey = 0.5 + 0.5 * math.sin(phase)
    pred = 0.5 + 0.5 * math.sin(phase - math.pi / 2)
    texture = 0.85 + 0.3 * _vnoise(x * 3 + 4, y * 3)
    return max(0.0, min(1.0, (prey * 0.65 + pred * 0.35) * texture))


def f_jellyfish(x, y, t):
    pulse = 0.85 + 0.15 * math.sin(t * 2.4)
    bell_y = y - 0.25 * pulse
    bell = math.exp(-(x * x * 5 + bell_y * bell_y * 9)) if bell_y < 0.25 else 0.0
    tent = 0.0
    if y < 0.2:
        wave = math.sin(y * 16 - t * 5 + math.sin(x * 24) * 1.2)
        tent = math.exp(-abs(x + 0.12 * math.sin(y * 5 - t * 3)) * 14) * (0.4 + 0.6 * max(0.0, wave)) * max(0.0, 0.3 - y)
        tent += math.exp(-abs(x - 0.22 * math.sin(y * 4 - t * 2.4 + 2)) * 16) * max(0.0, wave) * max(0.0, 0.25 - y) * 0.7
    return max(0.0, min(1.0, bell + tent))



# ---------------------------------------------------------------------------
# Grid renderers: g(state, w, h, t, dt) -> buffer of densities in [0, 1].
# Used for trajectories, curves, automata and simulations — anything that
# is not a pointwise analytic field. Buffers persist in state for trails
# and simulations; all re-initialise when the output size changes.
# ---------------------------------------------------------------------------

def _trail_buf(state, w, h, fade):
    buf = state.get('buf')
    if buf is None or len(buf) != h or len(buf[0]) != w:
        buf = make_buf(w, h)
        state['buf'] = buf
    elif fade < 1.0:
        for row in buf:
            for i in range(w):
                row[i] *= fade
    return buf


def _rot(x, y, ang):
    ca, sa = math.cos(ang), math.sin(ang)
    return x * ca - y * sa, x * sa + y * ca


def g_lorenz(st, w, h, t, dt):
    buf = _trail_buf(st, w, h, 0.90)
    aspect = aspect_of(w, h)
    if 'p' not in st:
        st['p'] = [0.1, 0.0, 0.0]
    x, y, z = st['p']
    rot = t * 0.35
    for _ in range(650):
        dx = 10.0 * (y - x) * 0.008
        dy = (x * (28.0 - z) - y) * 0.008
        dz = (x * y - 2.667 * z) * 0.008
        x, y, z = x + dx, y + dy, z + dz
        rx, ry = _rot(x / 26.0, y / 26.0, rot)
        px, py = to_px(rx * aspect, ry + (z - 25) / 60.0, w, h, aspect)
        splat(buf, w, h, px, py, 0.95)
    st['p'] = [x, y, z]
    return buf


def g_rossler(st, w, h, t, dt):
    buf = _trail_buf(st, w, h, 0.92)
    aspect = aspect_of(w, h)
    if 'p' not in st:
        st['p'] = [0.1, 0.0, 0.0]
    x, y, z = st['p']
    rot = t * 0.5
    for _ in range(700):
        dx = (-y - z) * 0.03
        dy = (x + 0.2 * y) * 0.03
        dz = (0.2 + z * (x - 5.7)) * 0.03
        x, y, z = x + dx, y + dy, z + dz
        rx, ry = _rot(x / 13.0, y / 13.0, rot)
        px, py = to_px(rx * aspect, ry - z / 26.0, w, h, aspect)
        splat(buf, w, h, px, py, 0.9)
    st['p'] = [x, y, z]
    return buf


def g_aizawa(st, w, h, t, dt):
    buf = _trail_buf(st, w, h, 0.92)
    aspect = aspect_of(w, h)
    if 'p' not in st:
        st['p'] = [0.1, 0.0, 0.0]
    x, y, z = st['p']
    rot = t * 0.4
    for _ in range(700):
        dx = ((z - 0.7) * x - 3.5 * y) * 0.012
        dy = (3.5 * x + (z - 0.7) * y) * 0.012
        dz = (0.6 + 0.95 * z - (z ** 3) / 3 - (x * x + y * y) * (1 + 0.25 * z) + 0.1 * z * x ** 3) * 0.012
        x, y, z = x + dx, y + dy, z + dz
        rx, ry = _rot(x * 0.72, y * 0.72, rot)
        px, py = to_px(rx * aspect, ry + (z - 0.4) * 0.3, w, h, aspect)
        splat(buf, w, h, px, py, 0.9)
    st['p'] = [x, y, z]
    return buf


def g_thomas(st, w, h, t, dt):
    buf = _trail_buf(st, w, h, 0.92)
    aspect = aspect_of(w, h)
    if 'p' not in st:
        st['p'] = [0.1, 0.0, 0.0]
    x, y, z = st['p']
    b = 0.208186
    rot = t * 0.45
    for _ in range(750):
        dx = (math.sin(y) - b * x) * 0.06
        dy = (math.sin(z) - b * y) * 0.06
        dz = (math.sin(x) - b * z) * 0.06
        x, y, z = x + dx, y + dy, z + dz
        rx, ry = _rot(x / 6.5, y / 6.5, rot)
        px, py = to_px(rx * aspect, ry + z / 14.0, w, h, aspect)
        splat(buf, w, h, px, py, 0.9)
    st['p'] = [x, y, z]
    return buf


def _map_attractor(st, w, h, step_fn, scale, steps=2600):
    buf = _trail_buf(st, w, h, 0.94)
    aspect = aspect_of(w, h)
    if 'p' not in st:
        st['p'] = [0.1, 0.1]
    x, y = st['p']
    for _ in range(steps):
        x, y = step_fn(x, y)
        if abs(x) > 1e6 or abs(y) > 1e6:
            x, y = 0.1, 0.1
        px, py = to_px(x * scale * aspect, y * scale, w, h, aspect)
        splat(buf, w, h, px, py, 0.85)
    st['p'] = [x, y]
    return buf


def g_clifford(st, w, h, t, dt):
    a, b, c, d = -1.4, 1.6, 1.0, 0.7
    return _map_attractor(st, w, h, lambda x, y: (
        math.sin(a * y) + c * math.cos(a * x),
        math.sin(b * x) + d * math.cos(b * y)), 0.42)


def g_dejong(st, w, h, t, dt):
    a, b, c, d = 1.4, -2.3, 2.4, -2.1
    return _map_attractor(st, w, h, lambda x, y: (
        math.sin(a * y) - math.cos(b * x),
        math.sin(c * x) - math.cos(d * y)), 0.36)


def g_svensson(st, w, h, t, dt):
    a, b, c, d = 1.4, 1.56, 1.4, -6.56
    return _map_attractor(st, w, h, lambda x, y: (
        d * math.sin(a * x) - math.sin(b * y),
        c * math.cos(a * x) + math.cos(b * y)), 0.16)


def g_barnsley(st, w, h, t, dt):
    buf = _trail_buf(st, w, h, 0.995)
    aspect = aspect_of(w, h)
    x, y = st.get('p', (0.0, 0.0))
    wind = 0.04 * math.sin(t * 2)
    for _ in range(2200):
        r = random.random()
        if r < 0.01:
            x, y = 0.0, 0.16 * y
        elif r < 0.86:
            x, y = 0.85 * x + (0.04 + wind) * y, -0.04 * x + 0.85 * y + 1.6
        elif r < 0.93:
            x, y = 0.2 * x - 0.26 * y, 0.23 * x + 0.22 * y + 1.6
        else:
            x, y = -0.15 * x + 0.28 * y, 0.26 * x + 0.24 * y + 0.44
        px, py = to_px(x * 0.24 * aspect, 0.92 - y * 0.185, w, h, aspect)
        splat(buf, w, h, px, py, 0.9)
    st['p'] = (x, y)
    return buf


def g_pendulum(st, w, h, t, dt):
    buf = _trail_buf(st, w, h, 0.93)
    aspect = aspect_of(w, h)
    if 'p' not in st:
        st['p'] = [math.pi / 2, 0.0, math.pi / 2 + 0.1, 0.0]
    th1, w1, th2, w2 = st['p']
    g = 9.81
    for _ in range(5):
        dth = th2 - th1
        den = 3 - math.cos(2 * dth)
        a1 = (-g * (2 * math.sin(th1) + math.sin(th1 - 2 * th2)) - 2 * math.sin(dth) * (w2 * w2 + w1 * w1 * math.cos(dth))) / den
        a2 = (2 * math.sin(dth) * (2 * w1 * w1 + g * (math.sin(th1) + math.sin(th1 - th2)) + w2 * w2 * math.cos(dth))) / den
        w1 += a1 * 0.008
        w2 += a2 * 0.008
        th1 += w1 * 0.008
        th2 += w2 * 0.008
    st['p'] = [th1, w1, th2, w2]
    l1 = l2 = 0.42
    x1, y1 = math.sin(th1) * l1, -math.cos(th1) * l1 - 0.35
    x2, y2 = x1 + math.sin(th2) * l2, y1 - math.cos(th2) * l2
    splat_line(buf, w, h, 0, -0.35, x1, y1, 0.45, aspect)
    splat_line(buf, w, h, x1, y1, x2, y2, 0.6, aspect)
    px, py = to_px(x2 * aspect, y2, w, h, aspect)
    splat(buf, w, h, px, py, 1.0, radius=1)
    return buf


def g_nbody(st, w, h, t, dt):
    buf = _trail_buf(st, w, h, 0.94)
    aspect = aspect_of(w, h)
    n = 5
    if 'bodies' not in st:
        bodies = []
        for i in range(n):
            ang = i * 2 * math.pi / n
            bodies.append([math.cos(ang) * 0.55, math.sin(ang) * 0.55,
                           -math.sin(ang) * 0.32, math.cos(ang) * 0.32, 1.0])
        st['bodies'] = bodies
    bodies = st['bodies']
    for _ in range(3):
        acc = [[0.0, 0.0] for _ in bodies]
        for i in range(n):
            for j in range(n):
                if i == j:
                    continue
                dx = bodies[j][0] - bodies[i][0]
                dy = bodies[j][1] - bodies[i][1]
                d2 = dx * dx + dy * dy + 0.02
                inv = bodies[j][4] / (d2 * math.sqrt(d2)) * 0.05
                acc[i][0] += dx * inv
                acc[i][1] += dy * inv
        for i in range(n):
            bodies[i][2] += acc[i][0] * 0.05
            bodies[i][3] += acc[i][1] * 0.05
            bodies[i][0] += bodies[i][2] * 0.05
            bodies[i][1] += bodies[i][3] * 0.05
    for b in bodies:
        px, py = to_px(b[0] * aspect, b[1], w, h, aspect)
        splat(buf, w, h, px, py, 1.0, radius=1)
    return buf


def g_fourier(st, w, h, t, dt):
    buf = _trail_buf(st, w, h, 0.90)
    aspect = aspect_of(w, h)
    phase = t * 1.2
    joints = [(0.0, 0.0)]
    x = y = 0.0
    for k in range(1, 10, 2):
        r = 0.34 / k
        x += r * math.cos(k * phase)
        y += r * math.sin(k * phase)
        joints.append((x, y))
    for i in range(1, len(joints)):
        splat_line(buf, w, h, joints[i - 1][0] * aspect * 0.9, joints[i - 1][1] * 0.9 - 0.1,
                   joints[i][0] * aspect * 0.9, joints[i][1] * 0.9 - 0.1, 0.4, aspect)
    ex, ey = joints[-1]
    px, py = to_px(ex * aspect * 0.9, ey * 0.9 - 0.1, w, h, aspect)
    splat(buf, w, h, px, py, 1.0, radius=1)
    # Draw the traced waveform to the right of the epicycles
    for i in range(60):
        ph = phase - i * 0.045
        wy = sum((0.34 / k) * math.sin(k * ph) for k in range(1, 10, 2))
        wx = 0.35 + i * 0.011
        px, py = to_px(wx * aspect, wy * 0.9 - 0.1, w, h, aspect)
        splat(buf, w, h, px, py, 0.85)
    return buf


def _chain(buf, w, h, pts, val, aspect, close=False, radius=0):
    rng = range(len(pts)) if close else range(len(pts) - 1)
    for i in rng:
        x0, y0 = pts[i]
        x1, y1 = pts[(i + 1) % len(pts)]
        splat_line(buf, w, h, x0, y0, x1, y1, val, aspect, radius)


def g_spirograph(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    R, r, d = 0.62, 0.37, 0.5
    rot = t * 0.15
    pts = []
    steps = 900
    for i in range(steps + 1):
        th = i / steps * 2 * math.pi * 8
        x = (R - r) * math.cos(th) + d * math.cos((R - r) / r * th)
        y = (R - r) * math.sin(th) - d * math.sin((R - r) / r * th)
        pts.append(_rot(x, y, rot))
    _chain(buf, w, h, [(x * aspect, y) for x, y in pts], 0.9, aspect)
    return buf


def g_epitrochoid(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    R, r, d = 0.34, 0.13, 0.3
    rot = -t * 0.12
    pts = []
    steps = 700
    for i in range(steps + 1):
        th = i / steps * 2 * math.pi * 6
        x = (R + r) * math.cos(th) - d * math.cos((R + r) / r * th)
        y = (R + r) * math.sin(th) - d * math.sin((R + r) / r * th)
        pts.append(_rot(x, y, rot))
    _chain(buf, w, h, [(x * aspect, y) for x, y in pts], 0.9, aspect)
    return buf


def g_maurer(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    n, deg = 6, 71
    rot = t * 0.1
    pts = []
    for k in range(0, 361, 1):
        th = math.radians(k * deg)
        r = 0.85 * math.sin(n * th)
        pts.append(_rot(r * math.cos(th), r * math.sin(th), rot))
    _chain(buf, w, h, [(x * aspect, y) for x, y in pts], 0.85, aspect, close=True)
    return buf


def g_lissajous(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    a, b, delta = 3, 4, t * 0.35
    pts = []
    for i in range(601):
        th = i / 600 * 2 * math.pi
        pts.append((0.85 * math.sin(a * th + delta), 0.85 * math.sin(b * th)))
    _chain(buf, w, h, [(x * aspect, y) for x, y in pts], 0.9, aspect)
    return buf


def g_phyllotaxis(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    n = 700
    rot = t * 0.2
    golden = math.pi * (3 - math.sqrt(5))
    for i in range(n):
        r = 0.031 * math.sqrt(i)
        th = i * golden + rot
        x, y = r * math.cos(th), r * math.sin(th)
        px, py = to_px(x * aspect, y, w, h, aspect)
        splat(buf, w, h, px, py, 0.35 + 0.65 * (i / n), radius=1)
    return buf


def g_metatron(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    rot = t * 0.12
    centers = [(0.0, 0.0)]
    for ring, rad in ((1, 0.34), (2, 0.68)):
        for k in range(6):
            ang = k * math.pi / 3 + rot
            centers.append((rad * math.cos(ang), rad * math.sin(ang)))
    pts = [(x * aspect, y) for x, y in centers]
    for i in range(len(pts)):
        for j in range(i + 1, len(pts)):
            splat_line(buf, w, h, pts[i][0], pts[i][1], pts[j][0], pts[j][1], 0.35, aspect)
    for (x, y) in centers:
        for i in range(40):
            ang = i / 40 * 2 * math.pi
            px, py = to_px((x + 0.17 * math.cos(ang)) * aspect, y + 0.17 * math.sin(ang), w, h, aspect)
            splat(buf, w, h, px, py, 0.9)
    return buf


def g_cardioid(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    n = 160
    mult = 2 + int(t * 0.3) % 3
    rot = t * 0.08
    circ = []
    for i in range(n):
        ang = i / n * 2 * math.pi + rot
        circ.append((0.82 * math.cos(ang), 0.82 * math.sin(ang)))
    for i in range(n):
        x0, y0 = circ[i]
        x1, y1 = circ[(i * mult) % n]
        splat_line(buf, w, h, x0 * aspect, y0, x1 * aspect, y1, 0.55, aspect)
    for (x, y) in circ[::4]:
        px, py = to_px(x * aspect, y, w, h, aspect)
        splat(buf, w, h, px, py, 0.9)
    return buf


def g_sierpinski(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    rot = t * 0.1

    def tri(p1, p2, p3, depth):
        if depth == 0:
            pts = [_rot(*p, rot) for p in (p1, p2, p3)]
            _chain(buf, w, h, [(x * aspect, y) for x, y in pts], 0.85, aspect, close=True)
            return
        m12 = ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2)
        m23 = ((p2[0] + p3[0]) / 2, (p2[1] + p3[1]) / 2)
        m31 = ((p3[0] + p1[0]) / 2, (p3[1] + p1[1]) / 2)
        tri(p1, m12, m31, depth - 1)
        tri(m12, p2, m23, depth - 1)
        tri(m31, m23, p3, depth - 1)

    tri((0, -0.85), (-0.8, 0.65), (0.8, 0.65), 5)
    return buf


def g_dragon(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    turns = [1]
    for _ in range(12):
        turns = turns + [1] + [-v for v in reversed(turns)]
    x = y = 0.0
    ang = t * 0.15
    pts = [(0.0, 0.0)]
    dx, dy = 1.0, 0.0
    for turn in turns:
        x, y = x + dx, y + dy
        pts.append((x, y))
        if turn == 1:
            dx, dy = -dy, dx
        else:
            dx, dy = dy, -dx
    scale = 0.9 / (max(abs(px) for px, _ in pts) + 1)
    rot = t * 0.1
    pts = [_rot(px * scale, py * scale, rot) for px, py in pts]
    _chain(buf, w, h, [(px * aspect, py) for px, py in pts], 0.85, aspect)
    return buf


def g_apollonian(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    rot = t * 0.15

    def circle(cx, cy, r, depth):
        steps = max(16, int(r * 90))
        for i in range(steps):
            ang = i / steps * 2 * math.pi
            x, y = _rot(cx + r * math.cos(ang), cy + r * math.sin(ang), rot)
            px, py = to_px(x * aspect, y, w, h, aspect)
            splat(buf, w, h, px, py, 0.9)
        if depth <= 0 or r < 0.05:
            return
        sub = r / (1 + 2 / math.sqrt(3))
        dist = r - sub
        for k in range(3):
            ang = k * 2 * math.pi / 3 + t * 0.2
            circle(cx + dist * math.cos(ang), cy + dist * math.sin(ang), sub, depth - 1)

    circle(0, 0, 0.85, 3)
    return buf


def _koch_seg(buf, w, h, p1, p2, depth, aspect, val):
    if depth == 0:
        splat_line(buf, w, h, p1[0], p1[1], p2[0], p2[1], val, 1.0)
        return
    dx, dy = (p2[0] - p1[0]) / 3, (p2[1] - p1[1]) / 3
    a = (p1[0] + dx, p1[1] + dy)
    b = (p1[0] + 2 * dx, p1[1] + 2 * dy)
    ang = -math.pi / 3
    rx = dx * math.cos(ang) - dy * math.sin(ang)
    ry = dx * math.sin(ang) + dy * math.cos(ang)
    peak = (a[0] + rx, a[1] + ry)
    _koch_seg(buf, w, h, p1, a, depth - 1, aspect, val)
    _koch_seg(buf, w, h, a, peak, depth - 1, aspect, val)
    _koch_seg(buf, w, h, peak, b, depth - 1, aspect, val)
    _koch_seg(buf, w, h, b, p2, depth - 1, aspect, val)


def g_koch(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    rot = t * 0.1
    verts = []
    for k in range(3):
        ang = math.pi / 2 + k * 2 * math.pi / 3 + rot
        verts.append((0.78 * math.cos(ang), 0.78 * math.sin(ang)))
    # Points are pre-scaled on x; _koch_seg splats with aspect=1.
    for k in range(3):
        p1 = verts[k]
        p2 = verts[(k + 1) % 3]
        _koch_seg(buf, w, h, (p1[0] * aspect, p1[1]), (p2[0] * aspect, p2[1]), 4, aspect, 0.9)
    return buf


def _hilbert_pts(order):
    pts = [(0, 0)]

    def rec(n, x, y, xi, xj, yi, yj):
        if n <= 0:
            pts.append((x + (xi + yi) // 2, y + (xj + yj) // 2))
            return
        rec(n - 1, x, y, yi // 2, yj // 2, xi // 2, xj // 2)
        rec(n - 1, x + xi // 2, y + xj // 2, xi // 2, xj // 2, yi // 2, yj // 2)
        rec(n - 1, x + xi // 2 + yi // 2, y + xj // 2 + yj // 2, xi // 2, xj // 2, yi // 2, yj // 2)
        rec(n - 1, x + xi // 2 + yi, y + xj // 2 + yj, -yi // 2, -yj // 2, -xi // 2, -xj // 2)

    size = 2 ** order
    rec(order, 0, 0, size, 0, 0, size)
    return pts, size


def g_hilbert(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    pts, size = _hilbert_pts(5)
    norm = [((px / size) * 1.7 - 0.85, (py / size) * 1.7 - 0.85) for px, py in pts]
    frac = 0.25 + 0.75 * (0.5 + 0.5 * math.sin(t * 0.5))
    draw = norm[: max(2, int(len(norm) * frac))]
    _chain(buf, w, h, [(x * aspect, y) for x, y in draw], 0.9, aspect)
    return buf


def _lsystem(axiom, rules, gens):
    s = axiom
    for _ in range(gens):
        s = ''.join(rules.get(ch, ch) for ch in s)
    return s


def _turtle(buf, w, h, seq, step, angle_deg, start_ang, aspect, val, sway=0.0, t=0.0):
    x = y = 0.0
    ang = math.radians(start_ang)
    stack = []
    pts = [(0.0, 0.0)]
    for ch in seq:
        if ch in 'FGAB':
            nx, ny = x + step * math.cos(ang), y + step * math.sin(ang)
            pts.append((nx, ny))
            x, y = nx, ny
        elif ch == '+':
            ang += math.radians(angle_deg) + (sway * math.sin(t + x * 3) if sway else 0)
        elif ch == '-':
            ang -= math.radians(angle_deg) + (sway * math.sin(t + y * 3) if sway else 0)
        elif ch == '[':
            stack.append((x, y, ang))
        elif ch == ']':
            x, y, ang = stack.pop()
            pts.append((x, y))
    return pts


def _fit_chain(buf, w, h, pts, aspect, val):
    if not pts:
        return
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    span = max(max(xs) - min(xs), max(ys) - min(ys), 1e-9)
    s = 1.7 / span
    norm = [((x - cx) * s, (y - cy) * s) for x, y in pts]
    _chain(buf, w, h, [(x * aspect, y) for x, y in norm], val, aspect)


def g_gosper(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    seq = _lsystem('A', {'A': 'A-B--B+A++AA+B-', 'B': '+A-BB--B-A++A+B'}, 4)
    pts = _turtle(buf, w, h, seq, 1.0, 60, t * 20, aspect, 0.9)
    _fit_chain(buf, w, h, pts, aspect, 0.9)
    return buf


def g_peano(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    seq = _lsystem('L', {'L': 'LFRFL-F-RFLFR+F+LFRFL', 'R': 'RFLFR+F+LFRFL-F-RFLFR'}, 3)
    pts = _turtle(buf, w, h, seq, 1.0, 90, 0, aspect, 0.9)
    _fit_chain(buf, w, h, pts, aspect, 0.9)
    return buf


def g_lsystem(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    seq = _lsystem('F', {'F': 'FF-[-F+F+F]+[+F-F-F]'}, 4)
    x = y = 0.0
    ang = math.pi / 2
    step = 1.0
    stack = []
    segs = []
    for ch in seq:
        if ch == 'F':
            nx, ny = x + step * math.cos(ang), y + step * math.sin(ang)
            segs.append(((x, y - 40), (nx, ny - 40)))
            x, y = nx, ny
        elif ch == '+':
            ang += math.radians(22.5) + 0.03 * math.sin(t * 1.5 + y * 0.2)
        elif ch == '-':
            ang -= math.radians(22.5) + 0.03 * math.sin(t * 1.5 + x * 0.2)
        elif ch == '[':
            stack.append((x, y, ang))
        elif ch == ']':
            x, y, ang = stack.pop()
    if segs:
        xs = [p[0] for seg in segs for p in seg]
        ys = [p[1] for seg in segs for p in seg]
        cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
        span = max(max(xs) - min(xs), max(ys) - min(ys), 1e-9)
        s = 1.7 / span
        for (x0, y0), (x1, y1) in segs:
            splat_line(buf, w, h, (x0 - cx) * s * aspect, (y0 - cy) * s,
                       (x1 - cx) * s * aspect, (y1 - cy) * s, 0.9, aspect)
    return buf


def g_starburst(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    spikes = 12
    for k in range(spikes):
        ang = k * 2 * math.pi / spikes + t * 0.3
        length = 0.55 + 0.35 * math.sin(t * 1.7 + k * 1.3)
        splat_line(buf, w, h, 0, 0, math.cos(ang) * length * aspect, math.sin(ang) * length, 0.85, aspect, radius=0)
        px, py = to_px(math.cos(ang) * length * aspect, math.sin(ang) * length, w, h, aspect)
        splat(buf, w, h, px, py, 1.0, radius=1)
    for i in range(48):
        ang = i / 48 * 2 * math.pi - t * 0.5
        px, py = to_px(math.cos(ang) * 0.3 * aspect, math.sin(ang) * 0.3, w, h, aspect)
        splat(buf, w, h, px, py, 0.7)
    return buf


def g_polyweb(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    n = 7
    layers = []
    for layer, (rad, speed) in enumerate(((0.85, 0.21), (0.55, -0.34), (0.3, 0.55))):
        pts = []
        for k in range(n):
            ang = k * 2 * math.pi / n + t * speed + layer
            pts.append((rad * math.cos(ang) * aspect, rad * math.sin(ang)))
        layers.append(pts)
        _chain(buf, w, h, pts, 0.8, aspect, close=True)
    for i in range(n):
        splat_line(buf, w, h, layers[0][i][0], layers[0][i][1], layers[1][i][0], layers[1][i][1], 0.4, aspect)
        splat_line(buf, w, h, layers[1][i][0], layers[1][i][1], layers[2][i][0], layers[2][i][1], 0.4, aspect)
    return buf


def g_cesaro(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)

    def seg(p1, p2, depth):
        if depth == 0:
            splat_line(buf, w, h, p1[0], p1[1], p2[0], p2[1], 0.9, 1.0)
            return
        dx, dy = (p2[0] - p1[0]) / 4, (p2[1] - p1[1]) / 4
        perp = (-dy, dx)
        a = (p1[0] + dx, p1[1] + dy)
        peak = (p1[0] + 2 * dx + perp[0] * 1.6, p1[1] + 2 * dy + perp[1] * 1.6)
        b = (p1[0] + 3 * dx, p1[1] + 3 * dy)
        seg(p1, a, depth - 1)
        seg(a, peak, depth - 1)
        seg(peak, b, depth - 1)
        seg(b, p2, depth - 1)

    s = 0.72
    corners = [(-s, -s), (s, -s), (s, s), (-s, s)]
    for k in range(4):
        p1 = corners[k]
        p2 = corners[(k + 1) % 4]
        seg((p1[0] * aspect, p1[1]), (p2[0] * aspect, p2[1]), 3)
    return buf


def g_collatz(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    sway = 0.02 * math.sin(t * 0.7)
    for n0 in range(2, 130):
        x, y = (n0 - 65) * 0.008, -0.95
        ang = math.pi / 2
        v = n0
        px_, py_ = x, y
        guard = 0
        while v != 1 and guard < 300:
            if v % 2 == 0:
                v //= 2
                ang -= 0.16 + sway
            else:
                v = 3 * v + 1
                ang += 0.11 + sway
            x += 0.021 * math.cos(ang)
            y += 0.021 * math.sin(ang)
            splat_line(buf, w, h, px_ * aspect, py_, x * aspect, y, 0.82, aspect)
            px_, py_ = x, y
            guard += 1
    return buf


def g_fibonacci(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    n = 420
    golden = math.pi * (3 - math.sqrt(5))
    rot_y, rot_x = t * 0.4, 0.5 + 0.2 * math.sin(t * 0.3)
    for i in range(n):
        yy = 1 - (i / (n - 1)) * 2
        rad = math.sqrt(max(0.0, 1 - yy * yy))
        th = golden * i
        x3, z3 = math.cos(th) * rad, math.sin(th) * rad
        # rotate around Y then X
        x4 = x3 * math.cos(rot_y) - z3 * math.sin(rot_y)
        z4 = x3 * math.sin(rot_y) + z3 * math.cos(rot_y)
        y4 = yy * math.cos(rot_x) - z4 * math.sin(rot_x)
        z5 = yy * math.sin(rot_x) + z4 * math.cos(rot_x)
        px, py = to_px(x4 * 0.85 * aspect, y4 * 0.85, w, h, aspect)
        shade = 0.35 + 0.65 * (z5 * 0.5 + 0.5)
        splat(buf, w, h, px, py, shade, radius=1)
    return buf


def _project3(p, rot_y, rot_x, scale, aspect):
    x, y, z = p
    x, z = x * math.cos(rot_y) - z * math.sin(rot_y), x * math.sin(rot_y) + z * math.cos(rot_y)
    y, z = y * math.cos(rot_x) - z * math.sin(rot_x), y * math.sin(rot_x) + z * math.cos(rot_x)
    persp = 1 / (1 + z * 0.25)
    return (x * scale * persp * aspect, y * scale * persp), z


def g_tesseract(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    verts4 = [(sx, sy, sz, sw) for sx in (-1, 1) for sy in (-1, 1) for sz in (-1, 1) for sw in (-1, 1)]
    a1, a2 = t * 0.5, t * 0.33
    proj = []
    for (x, y, z, wv) in verts4:
        # rotate in XW and YZ planes (4D)
        x, wv = x * math.cos(a1) - wv * math.sin(a1), x * math.sin(a1) + wv * math.cos(a1)
        y, z = y * math.cos(a2) - z * math.sin(a2), y * math.sin(a2) + z * math.cos(a2)
        persp4 = 1 / (1 + wv * 0.22)
        proj.append((x * persp4, y * persp4, z * persp4))
    pts = []
    for p in proj:
        pt, _ = _project3(p, 0.0, 0.0, 0.52, aspect)
        pts.append(pt)
    for i in range(16):
        for j in range(i + 1, 16):
            diff = bin(i ^ j).count('1')
            if diff == 1:
                splat_line(buf, w, h, pts[i][0], pts[i][1], pts[j][0], pts[j][1], 0.8, 1.0)
    return buf


def g_geodesic(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    phi = (1 + math.sqrt(5)) / 2
    raw = []
    for s1 in (-1, 1):
        for s2 in (-1, 1):
            raw.append((0, s1, s2 * phi))
            raw.append((s1, s2 * phi, 0))
            raw.append((s1 * phi, 0, s2))
    verts = []
    for v in raw:
        n = math.sqrt(sum(c * c for c in v))
        verts.append(tuple(c / n for c in v))
    edges = set()
    for i in range(len(verts)):
        for j in range(i + 1, len(verts)):
            d = math.dist(verts[i], verts[j])
            if d < 1.15:
                edges.add((i, j))
    pts = []
    for v in verts:
        pt, _ = _project3(v, t * 0.4, t * 0.27 + 0.4, 0.8, aspect)
        pts.append(pt)
    for (i, j) in edges:
        splat_line(buf, w, h, pts[i][0], pts[i][1], pts[j][0], pts[j][1], 0.75, 1.0)
    for pt in pts:
        px, py = to_px(pt[0], pt[1], w, h, 1.0)
        splat(buf, w, h, px, py, 1.0, radius=1)
    return buf


def g_voronoi(st, w, h, t, dt):
    buf = make_buf(w, h)
    seeds = []
    for i in range(14):
        seeds.append((
            (0.5 + 0.42 * math.sin(t * 0.11 + i * 2.4)) * (w - 1),
            (0.5 + 0.42 * math.cos(t * 0.09 + i * 1.9)) * (h - 1),
        ))
    for py in range(h):
        for px in range(w):
            d1 = d2 = 1e18
            for (sx, sy) in seeds:
                d = (px - sx) ** 2 + (py - sy) ** 2
                if d < d1:
                    d1, d2 = d, d1
                elif d < d2:
                    d2 = d
            edge = math.sqrt(d2) - math.sqrt(d1)
            buf[py][px] = max(0.0, min(1.0, 1.0 - edge * 0.22)) if edge < 4.5 else 0.12
    return buf


def g_delaunay(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    gx, gy = 5, 4
    grid = []
    for j in range(gy):
        row = []
        for i in range(gx):
            jx = 0.1 * math.sin(t * 0.6 + _hash2(i, j) * 9)
            jy = 0.1 * math.cos(t * 0.5 + _hash2(j, i) * 9)
            row.append((-0.85 + i * (1.7 / (gx - 1)) + jx, -0.8 + j * (1.6 / (gy - 1)) + jy))
        grid.append(row)
    for j in range(gy - 1):
        for i in range(gx - 1):
            a, b, c, d = grid[j][i], grid[j][i + 1], grid[j + 1][i], grid[j + 1][i + 1]
            for tri in ((a, b, c), (b, d, c)):
                _chain(buf, w, h, [(x * aspect, y) for x, y in tri], 0.7, aspect, close=True)
    for row in grid:
        for (x, y) in row:
            px, py = to_px(x * aspect, y, w, h, aspect)
            splat(buf, w, h, px, py, 1.0, radius=1)
    return buf


def g_lightning(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    rng = random.Random(int(t * 9))

    def bolt(x0, y0, x1, y1, depth, val):
        if depth == 0:
            splat_line(buf, w, h, x0 * aspect, y0, x1 * aspect, y1, val, aspect)
            return
        mx = (x0 + x1) / 2 + (rng.random() - 0.5) * 0.22
        my = (y0 + y1) / 2
        bolt(x0, y0, mx, my, depth - 1, val)
        bolt(mx, my, x1, y1, depth - 1, val)
        if depth == 3 and rng.random() < 0.7:
            bolt(mx, my, mx + (rng.random() - 0.5) * 0.7, my + 0.35, depth - 2, val * 0.55)

    bolt(0.05 * math.sin(t * 3), -0.95, 0.1 * math.sin(t * 2 + 2), 0.95, 5, 0.95)
    return buf


def _grid_state(st, w, h, init_cell):
    grid = st.get('grid')
    if grid is None or st.get('gw') != w or st.get('gh') != h:
        grid = [init_cell(x, y) for y in range(h) for x in range(w)]
        st['grid'] = grid
        st['gw'], st['gh'] = w, h
    return grid


def g_life(st, w, h, t, dt):
    grid = _grid_state(st, w, h, lambda x, y: 1 if random.random() < 0.25 else 0)
    st['frame'] = st.get('frame', 0) + 1
    if st['frame'] % 2 == 0:
        nxt = [0] * (w * h)
        for y in range(h):
            for x in range(w):
                ncount = 0
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        if dx == 0 and dy == 0:
                            continue
                        ncount += grid[((y + dy) % h) * w + ((x + dx) % w)]
                alive = grid[y * w + x]
                nxt[y * w + x] = 1 if (alive and ncount in (2, 3)) or (not alive and ncount == 3) else 0
        st['grid'] = grid = nxt
    buf = make_buf(w, h)
    for y in range(h):
        for x in range(w):
            if grid[y * w + x]:
                buf[y][x] = 0.9
    return buf


def _wolfram(rule):
    def render(st, w, h, t, dt):
        offset = int(t * 8) % 512
        total = offset + h
        row = [0] * w
        row[w // 2] = 1
        rows = [row]
        for _ in range(total - 1):
            prev = rows[-1]
            nxt = [0] * w
            for x in range(w):
                idx = (prev[(x - 1) % w] << 2) | (prev[x] << 1) | prev[(x + 1) % w]
                nxt[x] = (rule >> idx) & 1
            rows.append(nxt)
        buf = make_buf(w, h)
        for y in range(h):
            src = rows[offset + (h - 1 - y)]
            for x in range(w):
                if src[x]:
                    buf[y][x] = 0.9
        return buf
    return render


g_rule30 = _wolfram(30)
g_rule90 = _wolfram(90)
g_rule110 = _wolfram(110)


def g_langton(st, w, h, t, dt):
    grid = _grid_state(st, w, h, lambda x, y: 0)
    if 'ant' not in st:
        st['ant'] = [w // 2, h // 2, 0]
    ax, ay, adir = st['ant']
    dirs = [(0, -1), (1, 0), (0, 1), (-1, 0)]
    for _ in range(min(500, w * h // 6)):
        idx = ay * w + ax
        if grid[idx] == 0:
            adir = (adir + 1) % 4
            grid[idx] = 1
        else:
            adir = (adir - 1) % 4
            grid[idx] = 0
        ax = (ax + dirs[adir][0]) % w
        ay = (ay + dirs[adir][1]) % h
    st['ant'] = [ax, ay, adir]
    buf = make_buf(w, h)
    for y in range(h):
        for x in range(w):
            if grid[y * w + x]:
                buf[y][x] = 0.55
    buf[ay][ax] = 1.0
    return buf


def g_forestfire(st, w, h, t, dt):
    # 0 empty, 1 tree, 2 burning
    grid = _grid_state(st, w, h, lambda x, y: 1 if random.random() < 0.5 else 0)
    if 'ignited' not in st:
        for _ in range(4):
            idx = random.randrange(w * h)
            if grid[idx] == 1:
                grid[idx] = 2
        st['ignited'] = True
    st['frame'] = st.get('frame', 0) + 1
    if st['frame'] % 2 == 0:
        nxt = grid[:]
        for y in range(h):
            for x in range(w):
                idx = y * w + x
                cell = grid[idx]
                if cell == 2:
                    nxt[idx] = 0
                elif cell == 1:
                    burning_near = any(
                        grid[((y + dy) % h) * w + ((x + dx) % w)] == 2
                        for dy in (-1, 0, 1) for dx in (-1, 0, 1) if (dx, dy) != (0, 0))
                    if burning_near or random.random() < 0.0006:
                        nxt[idx] = 2
                elif random.random() < 0.015:
                    nxt[idx] = 1
        st['grid'] = grid = nxt
    buf = make_buf(w, h)
    for y in range(h):
        for x in range(w):
            v = grid[y * w + x]
            buf[y][x] = 0.5 if v == 1 else (1.0 if v == 2 else 0.0)
    return buf


def g_brian(st, w, h, t, dt):
    # 0 resting, 1 firing, 2 refractory
    grid = _grid_state(st, w, h, lambda x, y: 1 if random.random() < 0.18 else 0)
    nxt = [0] * (w * h)
    for y in range(h):
        for x in range(w):
            idx = y * w + x
            cell = grid[idx]
            if cell == 1:
                nxt[idx] = 2
            elif cell == 2:
                nxt[idx] = 0
            else:
                firing = sum(
                    1 for dy in (-1, 0, 1) for dx in (-1, 0, 1)
                    if (dx, dy) != (0, 0) and grid[((y + dy) % h) * w + ((x + dx) % w)] == 1)
                nxt[idx] = 1 if firing == 2 else 0
    st['grid'] = nxt
    buf = make_buf(w, h)
    for y in range(h):
        for x in range(w):
            v = nxt[y * w + x]
            buf[y][x] = 1.0 if v == 1 else (0.45 if v == 2 else 0.0)
    return buf


def g_cyclic(st, w, h, t, dt):
    K = 10
    grid = _grid_state(st, w, h, lambda x, y: random.randrange(K))
    nxt = grid[:]
    for y in range(h):
        for x in range(w):
            idx = y * w + x
            want = (grid[idx] + 1) % K
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if grid[((y + dy) % h) * w + ((x + dx) % w)] == want:
                        nxt[idx] = want
                        dy = 99
                        break
                if dy == 99:
                    break
    st['grid'] = grid = nxt
    off = int(t * 2) % K
    buf = make_buf(w, h)
    for y in range(h):
        for x in range(w):
            buf[y][x] = ((grid[y * w + x] + off) % K) / (K - 1)
    return buf


def g_reaction(st, w, h, t, dt):
    # Gray-Scott, coral growth parameters.
    if st.get('gw') != w or st.get('gh') != h or 'U' not in st:
        U = [1.0] * (w * h)
        V = [0.0] * (w * h)
        for _ in range(14):
            cx, cy = random.randrange(w), random.randrange(h)
            for dy in range(-2, 3):
                for dx in range(-2, 3):
                    V[((cy + dy) % h) * w + ((cx + dx) % w)] = 0.9
                    U[((cy + dy) % h) * w + ((cx + dx) % w)] = 0.4
        st.update(U=U, V=V, gw=w, gh=h)
    U, V = st['U'], st['V']
    feed, kill = 0.0545, 0.062
    Du, Dv = 0.2097, 0.105
    for _ in range(6):
        nU = U[:]
        nV = V[:]
        for y in range(h):
            for x in range(w):
                idx = y * w + x
                lap_u = (U[y * w + ((x + 1) % w)] + U[y * w + ((x - 1) % w)] +
                         U[((y + 1) % h) * w + x] + U[((y - 1) % h) * w + x]) * 0.2 + \
                        (U[((y + 1) % h) * w + ((x + 1) % w)] + U[((y + 1) % h) * w + ((x - 1) % w)] +
                         U[((y - 1) % h) * w + ((x + 1) % w)] + U[((y - 1) % h) * w + ((x - 1) % w)]) * 0.05 - U[idx]
                lap_v = (V[y * w + ((x + 1) % w)] + V[y * w + ((x - 1) % w)] +
                         V[((y + 1) % h) * w + x] + V[((y - 1) % h) * w + x]) * 0.2 + \
                        (V[((y + 1) % h) * w + ((x + 1) % w)] + V[((y + 1) % h) * w + ((x - 1) % w)] +
                         V[((y - 1) % h) * w + ((x + 1) % w)] + V[((y - 1) % h) * w + ((x - 1) % w)]) * 0.05 - V[idx]
                uvv = U[idx] * V[idx] * V[idx]
                nU[idx] = max(0.0, min(1.0, U[idx] + Du * lap_u - uvv + feed * (1 - U[idx])))
                nV[idx] = max(0.0, min(1.0, V[idx] + Dv * lap_v + uvv - (feed + kill) * V[idx]))
        U, V = nU, nV
    st['U'], st['V'] = U, V
    buf = make_buf(w, h)
    for y in range(h):
        for x in range(w):
            buf[y][x] = max(0.0, min(1.0, V[y * w + x] * 1.5))
    return buf


def g_epidemic(st, w, h, t, dt):
    # 0 susceptible, 1 infected, 2 recovered
    grid = _grid_state(st, w, h, lambda x, y: 0)
    if 'seeded' not in st:
        for _ in range(6):
            grid[random.randrange(h) * w + random.randrange(w)] = 1
        st['seeded'] = True
    nxt = grid[:]
    for y in range(h):
        for x in range(w):
            idx = y * w + x
            cell = grid[idx]
            if cell == 0:
                infected_near = sum(
                    1 for dy in (-1, 0, 1) for dx in (-1, 0, 1)
                    if grid[((y + dy) % h) * w + ((x + dx) % w)] == 1)
                if infected_near and random.random() < 0.16 * infected_near:
                    nxt[idx] = 1
            elif cell == 1:
                if random.random() < 0.06:
                    nxt[idx] = 2
            elif random.random() < 0.002:
                nxt[idx] = 0
    st['grid'] = nxt
    buf = make_buf(w, h)
    for y in range(h):
        for x in range(w):
            v = nxt[y * w + x]
            buf[y][x] = 1.0 if v == 1 else (0.35 if v == 2 else 0.07)
    return buf


def g_magnetic(st, w, h, t, dt):
    # Magnetic-pendulum basins, computed once per size and cached.
    if st.get('buf') is not None and st.get('gw') == w and st.get('gh') == h:
        return st['buf']
    aspect = aspect_of(w, h)
    magnets = [(0.85 * math.cos(a), 0.85 * math.sin(a)) for a in (math.pi / 2, math.pi / 2 + 2.094, math.pi / 2 + 4.189)]
    buf = make_buf(w, h)
    step = 2
    for cy in range(0, h, step):
        for cx in range(0, w, step):
            x, y, _a = pattern_xy(cx, cy, w, h)
            px, py = x, y
            vx = vy = 0.0
            steps = 0
            nearest = 0
            for steps in range(160):
                fx = fy = 0.0
                for mi, (mx, my) in enumerate(magnets):
                    dx, dy = mx - px, my - py
                    d2 = dx * dx + dy * dy + 0.08
                    inv = 1.0 / (d2 * math.sqrt(d2))
                    fx += dx * inv
                    fy += dy * inv
                    if steps == 159:
                        pass
                vx = (vx + fx * 0.02) * 0.94
                vy = (vy + fy * 0.02) * 0.94
                px += vx * 0.02 * 10
                py += vy * 0.02 * 10
                dists = [math.hypot(px - mx, py - my) for mx, my in magnets]
                nearest = dists.index(min(dists))
                if min(dists) < 0.09:
                    break
            val = (0.3 + 0.3 * nearest) * (1.0 - steps / 260)
            for dy in range(step):
                for dx in range(step):
                    if cx + dx < w and cy + dy < h:
                        buf[cy + dy][cx + dx] = max(0.05, val)
    st['buf'] = buf
    st['gw'], st['gh'] = w, h
    return buf


def g_dla(st, w, h, t, dt):
    buf = _trail_buf(st, w, h, 1.0)
    occ = st.setdefault('occ', set())
    if not occ:
        occ.add((w // 2, h // 2))
    cx, cy = w // 2, h // 2
    buf[cy][cx] = 0.95
    if len(occ) > w * h * 0.35:
        st['occ'] = occ = set()
        st['buf'] = buf = make_buf(w, h)
        occ.add((cx, cy))
    for _ in range(50):
        ang = random.random() * 2 * math.pi
        radius = min(w, h) * 0.48
        x = int(cx + radius * math.cos(ang))
        y = int(cy + radius * math.sin(ang))
        for _step in range(500):
            if (x + 1, y) in occ or (x - 1, y) in occ or (x, y + 1) in occ or (x, y - 1) in occ:
                occ.add((x, y))
                if 0 <= x < w and 0 <= y < h:
                    buf[y][x] = 0.9
                break
            x += random.choice((-1, 0, 1))
            y += random.choice((-1, 0, 1))
            if not (1 <= x < w - 1 and 1 <= y < h - 1):
                break
    return buf


def g_boids(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    if 'flock' not in st:
        st['flock'] = [[random.uniform(-0.8, 0.8), random.uniform(-0.8, 0.8),
                        random.uniform(-0.02, 0.02), random.uniform(-0.02, 0.02)]
                       for _ in range(55)]
    flock = st['flock']
    for b in flock:
        sx = sy = ax_ = ay_ = cx_ = cy_ = 0.0
        cnt = 0
        for o in flock:
            if o is b:
                continue
            dx, dy = o[0] - b[0], o[1] - b[1]
            d2 = dx * dx + dy * dy
            if d2 < 0.09:
                cnt += 1
                cx_ += o[0]
                cy_ += o[1]
                ax_ += o[2]
                ay_ += o[3]
                if d2 < 0.004:
                    sx -= dx * 0.004 / (d2 + 1e-6)
                    sy -= dy * 0.004 / (d2 + 1e-6)
        if cnt:
            b[2] += ((cx_ / cnt - b[0]) * 0.002 + (ax_ / cnt - b[2]) * 0.05 + sx)
            b[3] += ((cy_ / cnt - b[1]) * 0.002 + (ay_ / cnt - b[3]) * 0.05 + sy)
        sp = math.hypot(b[2], b[3])
        if sp > 0.03:
            b[2], b[3] = b[2] / sp * 0.03, b[3] / sp * 0.03
        elif sp < 0.012 and sp > 0:
            b[2], b[3] = b[2] / sp * 0.012, b[3] / sp * 0.012
        b[0] += b[2]
        b[1] += b[3]
        if b[0] > 1: b[0] = -1
        if b[0] < -1: b[0] = 1
        if b[1] > 1: b[1] = -1
        if b[1] < -1: b[1] = 1
        px, py = to_px(b[0] * aspect, b[1], w, h, aspect)
        splat(buf, w, h, px, py, 0.95, radius=1)
    return buf


def g_physarum(st, w, h, t, dt):
    buf = _trail_buf(st, w, h, 0.985)
    aspect = aspect_of(w, h)
    if 'agents' not in st:
        st['agents'] = [[random.uniform(-0.7, 0.7), random.uniform(-0.7, 0.7), random.random() * 2 * math.pi]
                        for _ in range(220)]
    sense_dist = 0.09

    def sense(x, y, ang):
        px, py = to_px((x + math.cos(ang) * sense_dist) * aspect,
                       y + math.sin(ang) * sense_dist, w, h, aspect)
        return buf[py][px] if 0 <= px < w and 0 <= py < h else 0.0

    for a in st['agents']:
        ahead = sense(a[0], a[1], a[2])
        left = sense(a[0], a[1], a[2] + 0.6)
        right = sense(a[0], a[1], a[2] - 0.6)
        if left > ahead and left > right:
            a[2] += 0.5
        elif right > ahead:
            a[2] -= 0.5
        a[2] += (random.random() - 0.5) * 0.3
        a[0] += math.cos(a[2]) * 0.012
        a[1] += math.sin(a[2]) * 0.012
        if abs(a[0]) > 0.95 or abs(a[1]) > 0.95:
            a[2] += math.pi
            a[0] = max(-0.94, min(0.94, a[0]))
            a[1] = max(-0.94, min(0.94, a[1]))
        px, py = to_px(a[0] * aspect, a[1], w, h, aspect)
        splat(buf, w, h, px, py, 0.55)
    return buf


def g_starfield(st, w, h, t, dt):
    buf = make_buf(w, h)
    aspect = aspect_of(w, h)
    if 'stars' not in st:
        st['stars'] = [[random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(0.08, 1.0)]
                       for _ in range(240)]
    for s in st['stars']:
        s[2] -= 0.011
        if s[2] <= 0.06:
            s[0], s[1], s[2] = random.uniform(-1, 1), random.uniform(-1, 1), 1.0
        x, y = s[0] / s[2], s[1] / s[2]
        if abs(x) > 1.6 or abs(y) > 1.2:
            continue
        px, py = to_px(x * 0.55 * aspect, y * 0.55, w, h, aspect)
        splat(buf, w, h, px, py, min(1.0, (1 - s[2]) * 1.3), radius=1 if s[2] < 0.3 else 0)
    return buf


def g_ulam(st, w, h, t, dt):
    if st.get('buf') is not None and st.get('gw') == w and st.get('gh') == h:
        return st['buf']
    cells = {}
    x = y = 0
    n = 1
    cells[(0, 0)] = 1
    max_n = (2 * max(w, h)) ** 2 + 2
    step_len = 1
    dirs = [(1, 0), (0, -1), (-1, 0), (0, 1)]
    di = 0
    while n < max_n:
        for _rep in range(2):
            dx, dy = dirs[di % 4]
            di += 1
            for _ in range(step_len):
                x += dx
                y += dy
                n += 1
                cells[(x, y)] = n
                if n >= max_n:
                    break
            if n >= max_n:
                break
        step_len += 1
    sieve = bytearray([1]) * (max_n + 1)
    sieve[0:2] = b'\x00\x00'
    for i in range(2, int(max_n ** 0.5) + 1):
        if sieve[i]:
            sieve[i * i::i] = bytearray(len(sieve[i * i::i]))
    buf = make_buf(w, h)
    cx, cy = w // 2, h // 2
    pulse = 0.85 + 0.15 * math.sin(t * 2)
    for py in range(h):
        for px in range(w):
            v = cells.get((px - cx, py - cy), 0)
            if v and sieve[v]:
                buf[py][px] = 0.95 * pulse
            elif v:
                buf[py][px] = 0.05
    st['buf'] = buf
    st['gw'], st['gh'] = w, h
    return buf


FIELD_EVALUATORS = {
    'mandelbrot': f_mandelbrot,
    'julia': f_julia,
    'mandelbulb': f_mandelbulb,
    'chladni': f_chladni,
    'interference': f_interference,
    'quantum': f_quantum,
    'soliton': f_soliton,
    'perlin': f_perlin,
    'karman': f_karman,
    'moire': f_moire,
    'penrose': f_penrose,
    'opart': f_opart,
    'tunnel': f_tunnel,
    'vortex': f_vortex,
    'predator': f_predator,
    'jellyfish': f_jellyfish,
}

GRID_RENDERERS = {
    'lorenz': g_lorenz,
    'rossler': g_rossler,
    'aizawa': g_aizawa,
    'thomas': g_thomas,
    'clifford': g_clifford,
    'dejong': g_dejong,
    'svensson': g_svensson,
    'barnsley': g_barnsley,
    'pendulum': g_pendulum,
    'nbody': g_nbody,
    'fourier': g_fourier,
    'spirograph': g_spirograph,
    'epitrochoid': g_epitrochoid,
    'maurer': g_maurer,
    'lissajous': g_lissajous,
    'phyllotaxis': g_phyllotaxis,
    'metatron': g_metatron,
    'cardioid': g_cardioid,
    'sierpinski': g_sierpinski,
    'dragon': g_dragon,
    'apollonian': g_apollonian,
    'koch': g_koch,
    'hilbert': g_hilbert,
    'gosper': g_gosper,
    'peano': g_peano,
    'lsystem': g_lsystem,
    'starburst': g_starburst,
    'polyweb': g_polyweb,
    'cesaro': g_cesaro,
    'collatz': g_collatz,
    'fibonacci': g_fibonacci,
    'tesseract': g_tesseract,
    'geodesic': g_geodesic,
    'voronoi': g_voronoi,
    'delaunay': g_delaunay,
    'lightning': g_lightning,
    'life': g_life,
    'rule30': g_rule30,
    'rule90': g_rule90,
    'rule110': g_rule110,
    'langton': g_langton,
    'forestfire': g_forestfire,
    'brian': g_brian,
    'cyclic': g_cyclic,
    'reaction': g_reaction,
    'epidemic': g_epidemic,
    'magnetic': g_magnetic,
    'dla': g_dla,
    'boids': g_boids,
    'physarum': g_physarum,
    'starfield': g_starfield,
    'ulam': g_ulam,
}


def render_frame(pattern_id, w, h, t, dt):
    """Render one frame of a pattern into a w x h density buffer."""
    grid_fn = GRID_RENDERERS.get(pattern_id)
    if grid_fn is not None:
        return grid_fn(state_for(pattern_id), w, h, t, dt)
    fn = FIELD_EVALUATORS[pattern_id]
    buf = make_buf(w, h)
    for py in range(h):
        row = buf[py]
        for px in range(w):
            x, y, _aspect = pattern_xy(px, py, w, h)
            v = fn(x, y, t)
            row[px] = 0.0 if v < 0 else (1.0 if v > 1 else v)
    return buf


def frame_to_ansi(buf, w, h, palette, header):
    """Encode a frame as half-block cells (top pixel = fg, bottom = bg).

    Escape sequences are emitted only when the colour pair changes,
    which keeps frame sizes small on smooth fields.
    """
    lines = [header]
    black = (0, 0, 0)
    for cy in range(0, h, 2):
        top_row = buf[cy]
        bot_row = buf[cy + 1] if cy + 1 < h else None
        parts = []
        cur = None
        for cx in range(w):
            top = sample_palette(palette, top_row[cx])
            bot = sample_palette(palette, bot_row[cx]) if bot_row is not None else black
            pair = (top, bot)
            if pair != cur:
                parts.append(
                    f"\033[38;2;{top[0]};{top[1]};{top[2]};48;2;{bot[0]};{bot[1]};{bot[2]}m")
                cur = pair
            parts.append('▀')
        parts.append("\033[0m")
        lines.append(''.join(parts))
    return "\n".join(lines)


def run_terminal_visualizer(pattern_id, palette, pattern_name, speed=1.0, duration=8.0):
    cols_term, rows_term = shutil.get_terminal_size((80, 24))
    if cols_term < 24 or rows_term < 10:
        print(f"error: terminal is too small ({cols_term}x{rows_term}); "
              "need at least 24x10.", file=sys.stderr)
        return 2
    w = min(cols_term, 120)
    cell_rows = min(rows_term - 3, 32)
    h = cell_rows * 2

    _STATE.pop(pattern_id, None)
    sys.stdout.write("\033[?25l\033[2J")
    start = time.time()
    frame = 0
    sim_t = 0.0
    last = start
    try:
        while True:
            now = time.time()
            dt = now - last
            last = now
            elapsed = now - start
            if duration and elapsed > duration:
                break
            sim_t += dt * speed
            buf = render_frame(pattern_id, w, h, sim_t, dt * speed)
            header = (f"\033[1;36mvisualizurrr\033[0m | Pattern: \033[1;33m{pattern_name}\033[0m"
                      f" | Palette: \033[1;35m{palette['name']}\033[0m"
                      f" | Speed: {speed:.1f}x | Frame: {frame}")
            sys.stdout.write("\033[H" + frame_to_ansi(buf, w, h, palette, header) + "\n")
            sys.stdout.flush()
            frame += 1
            render_ms = time.time() - now
            if render_ms < 0.033:
                time.sleep(0.033 - render_ms)
    except KeyboardInterrupt:
        pass
    finally:
        sys.stdout.write("\033[?25h\033[0m\n")
        sys.stdout.flush()
    return 0


# ---------------------------------------------------------------------------
# Standalone export: a single-pattern script carrying the pattern's real
# evaluator/renderer source, the shared helpers and the render loop.
# ---------------------------------------------------------------------------

_EXPORT_HELPERS = [
    hex_to_rgb, sample_palette, _hash2, _vnoise, _fbm, make_buf, aspect_of,
    pattern_xy, to_px, splat, splat_line, state_for, _trail_buf, _rot,
    _grid_state, _chain, _koch_seg, _hilbert_pts, _lsystem, _turtle,
    _fit_chain, _project3, _map_attractor, frame_to_ansi,
    run_terminal_visualizer,
]


def build_export(pattern, palette):
    pid = pattern['id']
    parts = [
        "#!/usr/bin/env python3",
        '"""',
        f"visualizurrr standalone export: {pattern['name']} ({pid})",
        f"Palette: {palette['name']}",
        "Generated by visualizurrr.py — runs the pattern in your terminal.",
        "Pure Python stdlib. Usage: ./this_file.py [--speed X] [--duration S]",
        '"""',
        "",
        "import argparse",
        "import math",
        "import random",
        "import shutil",
        "import sys",
        "import time",
        "",
        f"PATTERN_ID = {pid!r}",
        f"PATTERN_NAME = {pattern['name']!r}",
        f"PALETTE = {palette!r}",
        "_STATE = {}",
        "",
    ]
    for fn in _EXPORT_HELPERS:
        parts.append(inspect.getsource(fn))
        parts.append("")
    if pid in FIELD_EVALUATORS:
        parts.append(inspect.getsource(FIELD_EVALUATORS[pid]))
        parts.append("")
        parts.append(
            "def render_frame(pattern_id, w, h, t, dt):\n"
            "    fn = _EVALUATOR\n"
            "    buf = make_buf(w, h)\n"
            "    for py in range(h):\n"
            "        row = buf[py]\n"
            "        for px in range(w):\n"
            "            x, y, _a = pattern_xy(px, py, w, h)\n"
            "            v = fn(x, y, t)\n"
            "            row[px] = 0.0 if v < 0 else (1.0 if v > 1 else v)\n"
            "    return buf\n")
        parts.append(f"_EVALUATOR = {FIELD_EVALUATORS[pid].__name__}\n")
    else:
        if pid in ('rule30', 'rule90', 'rule110'):
            parts.append(inspect.getsource(_wolfram))
            parts.append("")
            parts.append(f"_RENDERER = _wolfram({pid[4:]})\n")
        else:
            parts.append(inspect.getsource(GRID_RENDERERS[pid]))
            parts.append("")
            parts.append(f"_RENDERER = {GRID_RENDERERS[pid].__name__}\n")
        parts.append(
            "def render_frame(pattern_id, w, h, t, dt):\n"
            "    return _RENDERER(state_for(pattern_id), w, h, t, dt)\n")
    parts.append('''
def main():
    parser = argparse.ArgumentParser(description="visualizurrr export: " + PATTERN_NAME)
    parser.add_argument("--speed", "-s", type=float, default=1.0)
    parser.add_argument("--duration", "-d", type=float, default=8.0)
    args = parser.parse_args()
    if not sys.stdout.isatty():
        print("error: rendering requires a terminal.", file=sys.stderr)
        return 2
    return run_terminal_visualizer(PATTERN_ID, PALETTE, PATTERN_NAME,
                                    speed=args.speed, duration=args.duration)


if __name__ == "__main__":
    sys.exit(main())
''')
    return "\n".join(parts)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _resolve_pattern(raw, parser):
    if raw.isdigit():
        num = int(raw)
        for p in PATTERNS:
            if p["num"] == num:
                return p
        parser.error(f"pattern number {num} is out of range (1-{len(PATTERNS)})")
    raw = WEB_ID_ALIASES.get(raw, raw)
    for p in PATTERNS:
        if p["id"] == raw or p["name"].lower() == raw.lower():
            return p
    parser.error(f"unknown pattern {raw!r} — run 'visualizurrr.py list-patterns' to see all {len(PATTERNS)} ids")
    return None  # unreachable: parser.error exits


def _resolve_palette(raw, parser):
    for p in PALETTES:
        if p["id"] == raw or p["name"].lower() == raw.lower():
            return p
    parser.error(f"unknown palette {raw!r} — run 'visualizurrr.py list-palettes' to see all {len(PALETTES)} ids")
    return None


def _list_patterns():
    print(f"\n=== visualizurrr: {len(PATTERNS)} patterns ===\n")
    for p in PATTERNS:
        print(f"[{p['num']:02d}] {p['id']:<15} | {p['name']:<42} ({p['cat']})")
    print(f"\nTotal: {len(PATTERNS)} patterns.")
    return 0


def _list_palettes():
    print(f"\n=== visualizurrr: {len(PALETTES)} color palettes ===\n")
    for idx, pal in enumerate(PALETTES, 1):
        print(f"[{idx:02d}] {pal['id']:<24} {pal['name']:<28} {' '.join(pal['colors'])}")
    print(f"\nTotal: {len(PALETTES)} palettes.")
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(
        prog="visualizurrr.py",
        description="visualizurrr — terminal algorithmic visualizer (68 patterns, 26 palettes)")
    parser.add_argument("--pattern", "-p", default="lorenz",
                        help="pattern id or number 1-68 (default: lorenz)")
    parser.add_argument("--palette", "-c", default="python-classic",
                        help="palette id or name (default: python-classic)")
    parser.add_argument("--speed", "-s", type=float, default=1.0,
                        help="animation speed multiplier (0.1 to 10.0)")
    parser.add_argument("--duration", "-d", type=float, default=8.0,
                        help="seconds to run; 0 = until Ctrl+C")
    parser.add_argument("--list-patterns", action="store_true",
                        help="list all patterns and exit")
    parser.add_argument("--list-palettes", action="store_true",
                        help="list all palettes and exit")
    sub = parser.add_subparsers(dest="command")
    sub.add_parser("list-patterns", help="list all patterns and exit")
    sub.add_parser("list-palettes", help="list all palettes and exit")
    exp = sub.add_parser("export", help="write a standalone script for one pattern")
    exp.add_argument("file", help="output .py file")
    exp.add_argument("--pattern", "-p", default="lorenz")
    exp.add_argument("--palette", "-c", default="python-classic")

    args = parser.parse_args(argv)

    if args.command == "list-patterns" or getattr(args, "list_patterns", False):
        return _list_patterns()
    if args.command == "list-palettes" or getattr(args, "list_palettes", False):
        return _list_palettes()

    if args.command == "export":
        pattern = _resolve_pattern(args.pattern, parser)
        palette = _resolve_palette(args.palette, parser)
        source = build_export(pattern, palette)
        with open(args.file, "w") as f:
            f.write(source)
        print(f"Exported '{pattern['id']}' with palette '{palette['id']}' to {args.file} "
              f"({len(source.splitlines())} lines). Run it with: python3 {args.file}")
        return 0

    if not (0.1 <= args.speed <= 10.0):
        parser.error(f"--speed must be between 0.1 and 10.0 (got {args.speed})")
    if args.duration < 0:
        parser.error("--duration must be >= 0")

    pattern = _resolve_pattern(args.pattern, parser)
    palette = _resolve_palette(args.palette, parser)

    if not sys.stdout.isatty():
        print("error: rendering requires a terminal (stdout is not a TTY).",
              file=sys.stderr)
        print("hint: use 'list-patterns', 'list-palettes' or 'export FILE' instead.",
              file=sys.stderr)
        return 2

    return run_terminal_visualizer(pattern["id"], palette, pattern["name"],
                                   speed=args.speed, duration=args.duration)


if __name__ == "__main__":
    sys.exit(main())
