# visualizurrr

![Python](https://img.shields.io/static/v1?label=Python&message=3.10&color=blue)
![Patterns](https://img.shields.io/static/v1?label=Patterns&message=68&color=blueviolet)
![Palettes](https://img.shields.io/static/v1?label=Palettes&message=26&color=magenta)
![ChillMusic](https://img.shields.io/static/v1?label=ChillMusic&message=OpenSourceLofi&color=emerald)
![AudioTracks](https://img.shields.io/static/v1?label=Audio&message=CreativeCommons0&color=teal)
![Platform](https://img.shields.io/static/v1?label=Platform&message=WebAndBash&color=informational)
![License](https://img.shields.io/static/v1?label=License&message=Apache2&color=green)


python algorithmic visualizer and open source lofi chill station


## Overview

visualizurrr is an interactive mathematical art and algorithmic pattern visualizer built for both modern web browsers and bash terminals. The application showcases sixty eight distinct mathematical patterns alongside twenty six curated color palettes, real time animation speed modulation, tactile controls, runnable Python scripts, and an audio reactive open source lofi chill sound engine that dynamically morphs visual patterns and color palettes to match musical phrasing and frequencies.

![visualizerrr main overview](public/screenshots/desktop.png)

## Open Source Lofi Audio Engine and Visual Morphing

visualizurrr features genuine open source studio recorded lofi tracks released under Creative Commons Zero public domain dedication. The audio engine connects directly to Web Audio API frequency analysis nodes to drive visual reactivity without synthetic beeps.

1. High Quality Open Source Soundtracks
The station bundles four authentic studio recordings:
Track one: Cold Brew Chill by RA. Smooth Rhodes electric piano, mellow acoustic drum groove, and relaxed downtempo swing in E flat major seventh.
Track two: Night in Kyoto by Avbe. Atmospheric nighttime Japanese chill hop with acoustic guitars and subtle vinyl texture in D minor ninth.
Track three: Moonshine Vibes by Prigida. Vintage analog tape saturation, warm basslines, and golden era hip hop beats in F major seventh.
Track four: Midnight Study Session by Lofi Records. Deep rain drenched acoustic piano chords with immersive low end warmth in C major seventh.

2. Controlling Playback
Click the play button inside the floating music player dock in the upper right corner of the screen. The animated vinyl disc spins while eight frequency spectrum bars dance in direct proportion to real time audio power. Use the skip buttons to move forward or backward between tracks, and use the volume slider or mute button to adjust listening levels.

3. Curated and Custom Chill Playlists
Clicking the track title or playlist icon opens the playlist generator modal. Users can select from prepackaged sessions such as Midnight Tokyo Lofi, Cosmic Study Session, or Coffee Shop Vinyl Beats. Users can also enter a custom session title, pick a vibe mood such as Late Night Focus or Celestial Slumber, adjust the tempo slider between 58 BPM and 85 BPM, and generate an entirely new visual and sonic journey.

4. Audio Reactive Visual Mechanics
The Web Audio API analyzer extracts spectral metrics sixty times per second:
Sub Bass Frequencies: Kick drums and acoustic sub bass notes trigger instantaneous center scale bounces and rhythmic canvas breathing.
Mid Range Frequencies: Warm jazz piano chords and melodic riffs control continuous color palette hue cycles and wave ripples.
Treble Frequencies: Crisp hi hats and ambient room textures excite sparkling particle jitter and sharpen line contours.
Beat Transients: Percussive strikes trigger luminous bloom flares across the visual canvas.

5. Visual Audio Morphing
When the Morph button is active, visualizurrr synchronizes audio and visuals automatically. Every track change or periodic musical phrase smoothly morphs the active mathematical pattern and color palette to match the mood and harmonic key of the soundtrack.

![visualizurrr chill playlists](public/screenshots/playlists.png)

## How to Push to Git Repository

The local git repository is configured with origin pointing to https://github.com/wifiknight45/visualizerrr.git. Because automated remote environments do not possess your secret GitHub personal access token, git push will prompt for authentication.

To push all commits and audio files directly to your GitHub repository in one step, choose either method below:

Method one: Push from terminal with personal access token
Replace YOUR_TOKEN with your GitHub personal access token:

git push https://wifiknight45:YOUR_TOKEN@github.com/wifiknight45/visualizerrr.git main

Method two: Pull or clone and push from your authenticated computer
On your local machine where your git credentials and SSH keys are already stored:

git clone https://github.com/wifiknight45/visualizerrr.git
cd visualizerrr
git pull
git push origin main

All audio files inside public audio are fully tracked and committed in git history.

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

Available commands:
To list all sixty eight patterns:
python3 visualizerrr.py list_patterns

To list all twenty six palettes:
python3 visualizerrr.py list_palettes

To select pattern number two:
python3 visualizerrr.py pattern 2

To set custom speed:
python3 visualizerrr.py speed 2.5

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

The codebase enforces decoupled pure logic, comprehensive unit tests, smoke testing across all sixty eight patterns, audio engine validation, and parameter fuzzing. All tests run using the native Node test runner.
