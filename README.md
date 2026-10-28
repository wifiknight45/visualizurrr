# visualizurrr

![Python](https://img.shields.io/static/v1?label=Python&message=3.10&color=blue)
![Patterns](https://img.shields.io/static/v1?label=Patterns&message=68&color=blueviolet)
![Palettes](https://img.shields.io/static/v1?label=Palettes&message=26&color=magenta)
![Platform](https://img.shields.io/static/v1?label=Platform&message=WebAndBash&color=informational)
![License](https://img.shields.io/static/v1?label=License&message=Apache2&color=green)

Python Algorithmic Visualizer

## Overview

visualizurrr is an interactive mathematical art and algorithmic pattern visualizer built for both modern web browsers and bash terminals. The application showcases sixty eight distinct mathematical patterns alongside twenty six curated color palettes, with real time animation speed modulation, tactile controls, and runnable Python scripts.

![visualizerrr main overview](public/screenshots/desktop.png)

## Core Features

1. Sixty Eight Unique Aesthetic Patterns
The library contains mathematical equations spanning eight distinct categories:
Category one: Fractals and Strange Attractors including Lorenz, Mandelbrot, Julia, Barnsley Fern, Sierpinski, Rossler, Heighway Dragon, and Apollonian Circles.
Category two: Sacred Spirographs including Hypotrochoid, Epitrochoid, Maurer Rose, Lissajous Harmonograph, Phyllotaxis Sunflower, Metatrons Cube, Cardioid Caustics, and Archimedean Vortex.
Category three: Cellular Automata including Conways Game of Life, Wolfram Rule 30, Wolfram Rule 90, Wolfram Rule 110, Langtons Ant, Forest Fire Percolation, Brians Brain, and Cyclic Automata.
Category four: Physics and Wave Harmonics including Chladni Acoustic Plates, Double Pendulum Chaos, Fourier Epicycles, Wave Interference, Quantum Oscillators, Coupled Solitons, Magnetic Basins, and Gravitational N Body Orbits.
Category five: Vector Fields and Fluid Dynamics including Perlin Curl Noise, Clifford Attractors, De Jong Attractors, Svensson Attractors, Aizawa Tornadic Flow, Thomas Attractors, Karman Vortex Streets, and Diffusion Limited Aggregation.
Category six: Turtle Geometry and Lindenmayer Systems including Koch Snowflake, Hilbert Space Filling Curves, Gosper Flowsnakes, Peano Curves, Stochastic Trees, Starbursts, Polygonal Webs, and Cesaro Curves.
Category seven: Computational Optics and Geometry including Moire Gratings, Penrose P3 Quasicrystals, Voronoi Partitions, Delaunay Networks, Op Art Deformations, Tunnel Vortices, Four Dimensional Tesseracts, and Geodesic Domes.
Category eight: Organic Complex Systems including Gray Scott Morphogenesis, Boids Murmurations, Physarum Slime Mold Networks, Predator Prey Waves, Epidemic SIR Fronts, Dielectric Lightning, Jellyfish Pulses, Relativistic Starfields, Mandelbulb Slices, Ulam Spirals, Collatz Trees, and Fibonacci Spheres.

![visualizerrr aesthetic patterns explorer](public/screenshots/patterns.png)

2. Twenty Six Predefined Color Palettes
The visualizer includes twenty six diverse palettes with names clearly displayed throughout the user interface:
Python Classic
Cyberpunk Neon
Synthwave 84
Viridis
Plasma
Magma
Inferno
Bioluminescence
Monokai Pro
Nord Frost and Aurora
Solarized Dark
Dracula Vampire
Tokyo Night
Sunset Horizon
Emerald Forest
Celestial Nebula
Golden Amber and Obsidian
Cherry Blossom
Electric Ultraviolet
Vaporwave Pastel
Laser Matrix
Deep Coral Reef
Blueprint Technical
Copper and Patina
Rainbow Spectrum
Monochrome Velvet

![visualizerrr color palettes selector](public/screenshots/palettes.png)

3. Real Time Speed Control
Users can adjust simulation velocity smoothly from very slow speeds like 0.05x up to rapid speeds like 6.0x using the tactile slider control or quick preset buttons.

4. Dual Runtime Architecture
The application runs as a high performance web application with sixty frames per second rendering and as a standalone Python script in bash terminals with twenty four bit truecolor graphics.

![visualizerrr python code generator](public/screenshots/code.png)

## Running in Bash Terminal

The Python script visualizerrr.py runs directly in standard bash environments with Python 3:

python3 visualizerrr.py

Available flags and commands:
To list all sixty eight patterns:
python3 visualizerrr.py with the list patterns flag

To list all twenty six palettes:
python3 visualizerrr.py with the list palettes flag

To select pattern number two:
python3 visualizerrr.py with pattern 2

To set custom speed:
python3 visualizerrr.py with speed 2.5

## Web Application Commands and Shortcuts

Space key: Play or pause animation
Right Arrow: Next pattern
Left Arrow: Previous pattern
Up Arrow: Increase speed
Down Arrow: Decrease speed
C key: Cycle predefined color palette
R key: Randomize pattern and palette
M key: Cycle rendering mode between curves, particles, wireframe, heatmap, and neon
G key: Toggle glow effect
T key: Toggle trail persistence
P key: Open Python code inspector
O key: Open full pattern explorer
S key: Save high resolution PNG image

## Architecture and Testing

The codebase enforces decoupled pure logic, comprehensive unit tests, smoke testing across all sixty eight patterns, and parameter fuzzing. All tests run using the native Node test runner.
