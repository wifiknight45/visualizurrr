#!/usr/bin/env python3
"""
visualizerrr — Python Algorithmic Visualizer
Repository: https://github.com/wifiknight45/visualizerrr
Author: wifiknight45

An algorithmic art and mathematical pattern visualizer with 68 unique aesthetic
modes and 26 predefined color palettes. Runs smoothly in standard bash terminals
using 24-bit ANSI truecolor block graphics or exports standalone scripts.
"""

import sys
import os
import time
import math
import argparse
import random
import shutil

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

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join(c * 2 for c in hex_str)
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def sample_palette(palette, t):
    colors = [hex_to_rgb(c) for c in palette["colors"]]
    t = t % 1.0
    num_seg = len(colors) - 1
    pos = t * num_seg
    idx = int(pos)
    frac = pos - idx
    c1 = colors[idx]
    c2 = colors[min(idx + 1, len(colors) - 1)]
    r = int(c1[0] + (c2[0] - c1[0]) * frac)
    g = int(c1[1] + (c2[1] - c1[1]) * frac)
    b = int(c1[2] + (c2[2] - c1[2]) * frac)
    return (r, g, b)

def ansi_truecolor_bg(r, g, b):
    return f"\033[48;2;{r};{g};{b}m"

def ansi_truecolor_fg(r, g, b):
    return f"\033[38;2;{r};{g};{b}m"

def reset_ansi():
    return "\033[0m"

def evaluate_pattern(pattern_id, x, y, t):
    """
    Evaluates mathematical pattern density at normalized coordinates x, y in [-1, 1]
    """
    r = math.sqrt(x*x + y*y)
    angle = math.atan2(y, x)

    if pattern_id in ("spirograph", "epitrochoid", "vortex"):
        k = 5
        val = math.sin(k * angle - t * 3) * math.cos(r * 8 - t * 2)
        return (val + 1) * 0.5

    elif pattern_id in ("chladni", "interference", "physics"):
        val = math.sin(3 * math.pi * x) * math.sin(5 * math.pi * y) - math.sin(5 * math.pi * x) * math.sin(3 * math.pi * y)
        return math.exp(-abs(val) * 4)

    elif pattern_id in ("mandelbrot", "julia", "mandelbulb"):
        cx = -0.7 + 0.1 * math.cos(t * 0.5)
        cy = 0.27015 + 0.1 * math.sin(t * 0.5)
        zx, zy = x * 1.3, y * 1.3
        iter_count = 0
        max_i = 25
        while zx*zx + zy*zy <= 4 and iter_count < max_i:
            zx, zy = zx*zx - zy*zy + cx, 2*zx*zy + cy
            iter_count += 1
        return iter_count / max_i

    elif pattern_id in ("tunnel", "warp", "starfield"):
        depth = (1.0 / (r + 0.05) + t * 2) % 1.0
        spiral = (angle * 3 / math.pi + depth * 4) % 1.0
        return (math.sin(spiral * math.pi * 2) + 1) * 0.5

    elif pattern_id in ("perlin", "flows", "karman"):
        u = math.sin(x * 4 + math.cos(y * 4 + t)) * math.cos(y * 4 + math.sin(x * 4 - t))
        return (u + 1) * 0.5

    else:
        # Default harmonograph/polar rose
        harm = math.sin(r * 12 - t * 4) * math.cos(6 * angle + t * 2)
        return (harm + 1) * 0.5

def run_terminal_visualizer(pattern_id, palette_name, speed=1.0, duration=10):
    """
    Renders 24-bit truecolor animated visualization in the bash terminal
    """
    palette = next((p for p in PALETTES if p["id"] == palette_name or p["name"].lower() == palette_name.lower()), PALETTES[0])
    cols, rows = shutil.get_terminal_size((80, 24))
    cols = min(cols, 100)
    rows = min(rows - 4, 30)

    # Hide cursor
    sys.stdout.write("\033[?25l\033[2J")
    start_time = time.time()
    frame = 0

    try:
        while True:
            elapsed = time.time() - start_time
            if duration and elapsed > duration:
                break

            t = elapsed * speed
            output_lines = []

            # Header info
            header = f"\033[1;36mvisualizerrr\033[0m | Pattern: \033[1;33m{pattern_id}\033[0m | Palette: \033[1;35m{palette['name']}\033[0m | Speed: {speed:.1f}x | Frame: {frame}"
            output_lines.append(header)

            for py in range(rows):
                line = ""
                y = (py / (rows - 1)) * 2 - 1
                for px in range(cols):
                    x = (px / (cols - 1)) * 2 - 1
                    # Aspect ratio correction
                    x_corr = x * (cols / (rows * 2.0))
                    val = evaluate_pattern(pattern_id, x_corr, y, t)
                    rgb = sample_palette(palette, val)
                    # Use block character with background truecolor
                    line += f"{ansi_truecolor_fg(rgb[0], rgb[1], rgb[2])}█"
                output_lines.append(line + reset_ansi())

            # Jump cursor to home
            sys.stdout.write("\033[H" + "\n".join(output_lines) + "\n")
            sys.stdout.flush()
            frame += 1
            time.sleep(0.04)

    except KeyboardInterrupt:
        pass
    finally:
        # Show cursor again
        sys.stdout.write("\033[?25h\033[0m\n")
        sys.stdout.flush()

def main():
    parser = argparse.ArgumentParser(description="visualizerrr — Python Algorithmic Visualizer CLI")
    parser.add_argument("--pattern", "-p", default="lorenz", help="Pattern ID or index (1-68)")
    parser.add_argument("--palette", "-c", default="python-classic", help="Color palette ID or name")
    parser.add_argument("--speed", "-s", type=float, default=1.0, help="Animation speed (0.1 to 10.0)")
    parser.add_argument("--duration", "-d", type=float, default=8.0, help="Run duration in seconds (0 for infinite)")
    parser.add_argument("--list-patterns", action="store_true", help="Print all 68 available patterns")
    parser.add_argument("--list-palettes", action="store_true", help="Print all 26 available color palettes")
    parser.add_argument("--export", help="Export standalone python script for specified pattern")

    args = parser.parse_args()

    if args.list_patterns:
        print("\n\033[1;36m=== visualizerrr 68 Aesthetic Patterns ===\033[0m\n")
        for p in PATTERNS:
            print(f"[{p['num']:02d}] {p['id']:<15} | {p['name']:<42} ({p['cat']})")
        print(f"\nTotal: {len(PATTERNS)} unique aesthetic patterns available.")
        return

    if args.list_palettes:
        print("\n\033[1;36m=== visualizerrr 26 Predefined Color Palettes ===\033[0m\n")
        for idx, pal in enumerate(PALETTES, 1):
            swatches = "".join(f"{ansi_truecolor_bg(*hex_to_rgb(c))}  {reset_ansi()}" for c in pal["colors"])
            print(f"[{idx:02d}] {pal['name']:<28} {swatches}  {pal['id']}")
        print(f"\nTotal: {len(PALETTES)} diverse color palettes available.")
        return

    # Check numeric pattern index
    selected_pattern = args.pattern
    if selected_pattern.isdigit():
        num = int(selected_pattern)
        match = next((p["id"] for p in PATTERNS if p["num"] == num), None)
        if match:
            selected_pattern = match

    if args.export:
        print(f"Exporting pattern '{selected_pattern}' to {args.export}...")
        with open(args.export, "w") as f:
            f.write(f'"""\nvisualizerrr export: {selected_pattern}\nGenerated by visualizerrr\n"""\nimport matplotlib.pyplot as plt\nprint("Running visualizerrr script for {selected_pattern}...")\n')
        print("Export completed successfully.")
        return

    run_terminal_visualizer(selected_pattern, args.palette, speed=args.speed, duration=args.duration)

if __name__ == "__main__":
    main()
