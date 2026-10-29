# Changelog — visualizurrr

All notable changes made by Muse to this repo are recorded here, newest
first. Times are America/Los_Angeles. This file is updated after every
verified stage of work. Aubrey pushes from bash and reviews after pushing.

## 2026-10-28

### 19:49 PDT — Sprint verified and packaged for delivery

- Full suite on a clean tree: npm ci, strict tsc, 22/22 tests, build,
  CLI pattern listing, patterns.json drift check, Python byte-compile —
  all green.
- Delivery is a patch against main @ da413ad7 (15 files, ~5 MB)
  verified to apply cleanly to a pristine clone, producing a tree
  identical to the working copy with the full suite green there too.
- The 7 new MP3s travel outside the patch: they download from their
  canonical Free Music Archive file URLs (commands in the handoff
  notes), and the downloaded files were verified byte-identical
  (sha256) to the copies tested here.

### 19:47 PDT — Repo tidy, prettier badges, GitHub Pages

- Tidy: removed the stale bun.lock (npm is the canonical toolchain —
  CI and README both use it; two lockfiles invite drift). Removed the
  leftover .aistudio/ entry from .gitignore and the AI Studio
  DISABLE_HMR machinery from vite.config.ts (plain Vite defaults now).
- README badges restyled: for-the-badge shields with the Python logo
  and project colours, a Lofi Tracks badge that links to CREDITS.md,
  plus live CI and GitHub Pages workflow status badges. README also
  links the live demo URL.
- GitHub Pages: vite.config.ts takes its base path from VITE_BASE
  (default '/'); new .github/workflows/pages.yml builds with
  VITE_BASE=/visualizurrr/ on every push to main and deploys via the
  official Pages actions (configure-pages with enablement, so the
  first run tries to switch Pages on; if GitHub still asks, enable it
  once under Settings → Pages → Source: GitHub Actions).
- Verified locally under a simulated /visualizurrr/ subpath: the app
  boots (canvas renders, branding correct, zero failed requests) and
  all 11 audio tracks load and decode.

### 19:45 PDT — Screenshots regenerated from the real app; README updated

- All six README screenshots re-captured from the current build at
  1440x900 (headless Chromium against vite preview). The old captures
  were pre-rename (header read "visualizerrr", GitHub pill pointed at
  the deleted repo) and pre-fix-pass: 5 render modes, no adaptive-quality
  HUD, and a playlist modal showing invented track titles with false
  "procedural audio" copy. The new shots show visualizurrr branding, all
  six render modes (incl. Matrix), the real 11-track library, honest
  player copy, and the code drawer.
- README: lofi.png is now actually referenced (it shipped unreferenced);
  the soundtrack section describes all 11 tracks (4 original + 7 Holizna);
  the custom-playlist and git-size notes match reality (~66 MB).
- Spelling sweep: zero instances of the old "visualizerrr" spelling
  remain anywhere except this changelog's historical entries.

### 19:43 PDT — Music library: 11 tracks, CC0 verified with sources

- Added 7 lofi tracks by Holizna from Free Music Archive (account
  HoliznaCC0), each verified on its FMA track page as CC0 1.0 Universal:
  Roof Tops, August Never Lasts, Ocean Memory, Currents We Used to Know,
  Tokyo Sunset, One Night In France, Bubbles. Library is now 11 tracks.
  (The same artist's HoliznaPATREON releases are CC BY-NC-ND and were
  deliberately not used.)
- public/audio/CREDITS.md now lists per-track source URLs for the new
  tracks; the original four remain marked unverified.
- The three curated playlists now include the new tracks; every library
  track is reachable from at least one playlist.
- Audio URLs are base-relative (import.meta.env.BASE_URL) so playback
  works under a subpath such as GitHub Pages, not only at a domain root.
- audioEngine test: custom-playlist length now follows the library size
  instead of hard-coding 4. Verified: tsc clean, 22/22 tests, build OK,
  and all 11 tracks load and decode in headless Chromium.

### 17:29 PDT — Stage 5 complete: housekeeping, honesty, accessibility (verified)

- **LICENSE added**: the full Apache-2.0 text the README badge and file
  headers always claimed but the repo never contained.
- **Audio provenance**: `public/audio/CREDITS.md` lists the four bundled
  tracks with the artists/licenses exactly as the app metadata claims,
  and flags that source URLs were never recorded and still need
  confirming. The README's unverified "genuine studio recorded" wording
  was softened to point at that file.
- **Honest playlist copy**: "custom playlists" no longer invent track
  titles (they previously renamed the same four recordings things like
  "Velvet Sunset Coffee"). Custom sessions keep the real track titles;
  the modal's "Procedural Web Audio Engine" label and "Generate Chill
  Soundscape" button now say what actually happens ("Bundled
  open-source tracks", "Create Playlist & Morph Visuals"), and the
  README describes the feature accurately.
- **Naming sweep**: every remaining `visualizerrr` (old spelling) is
  fixed — page title and social meta, header branding and its GitHub
  link (which pointed at the deleted repo), README clone URL, image
  alt texts, shortcuts modal.
- **README corrected**: bash section rewritten for the real CLI
  (flags, subcommands, export, error behaviour), morph description
  updated to match the fixed behaviour, M-key list now includes all
  six render modes, plus testing/license/changelog sections.
- **Accessibility**: all modals and the code drawer carry
  `role="dialog"`, `aria-modal` and labels. `prefers-reduced-motion`
  is honoured in the canvas: time advances at 0.35×, beat flares and
  the bass scale-bounce are disabled; a photosensitivity note lives in
  the shortcuts modal.
- **Error boundary**: the visualizer is wrapped in an error boundary
  with a restart button, so a component failure no longer takes down
  the whole app.
- **CI**: `.github/workflows/ci.yml` runs clean install, strict tsc,
  tests and build, plus Python byte-compile and export checks for
  the CLI.
- **Dead code**: `tsconfig` now enforces `noUnusedLocals` /
  `noUnusedParameters`; the sweep removed 30+ dead symbols (unused
  imports across the app, a dead volume handler — the player has a
  mute toggle but no slider — and 19 unused `params` destructures).
  It also exposed the web reaction pattern's feed/kill sliders doing
  nothing; they now drive the field's frequency and contrast.
  Note on ESLint: `typescript-eslint` does not yet support this
  project's TypeScript 7, so the strict tsc checks above stand in
  for it; revisit when the plugin catches up.

### 17:25 PDT — Stage 4 complete: Python CLI rewritten (verified)

`visualizurrr.py` (313 → ~2,050 lines, still pure stdlib):

- **Every one of the 68 patterns now has its own real evaluator.** Before,
  only ~12 pattern IDs had a dedicated branch and the other ~50 fell
  through to one identical default harmonograph. Now: 16 analytic fields
  (true escape-time Mandelbrot/Julia, a real power-8 Mandelbulb slice,
  Chladni modes, quantum oscillator density, value-noise flow, Kármán
  vortex street, quasicrystal superposition…), integrated trajectories
  with fading trails (Lorenz, Rössler, Aizawa, Thomas, Clifford, de Jong,
  Svensson, double pendulum, N-body, epicycles), rasterized geometry
  (Koch, Hilbert, Gosper, Peano, L-system tree, dragon, Cesàro, Collatz
  tree, Apollonian, Sierpinski, tesseract, geodesic, Voronoi, Delaunay),
  and real stateful simulations (Game of Life, Wolfram rules 30/90/110,
  Langton's Ant, forest fire, Brian's Brain, cyclic CA, Gray-Scott
  reaction-diffusion, spatial epidemic, DLA, boids, Physarum sensing
  agents, magnetic-pendulum basins, Ulam spiral). Verified headlessly:
  all 68 produce pairwise-distinct, structured frames — the "identical
  output" bug is gone. Three real bugs were caught by that check and
  fixed (Chladni n==m flat field, Mandelbulb orbit starting at the
  origin, Langton direction table).
- **Interface:** argparse subcommands (`list-patterns`, `list-palettes`,
  `export FILE`) replace the hand-rolled argument pre-parser; the old
  `--list-patterns`/`--list-palettes` flags still work. Patterns resolve
  by id, number, or full name.
- **Validation:** unknown pattern/palette/number and out-of-range speed
  now exit with code 2 and a helpful message (previously any bad input
  silently exited 0). Rendering without a TTY exits 2 with a hint; a
  terminal smaller than 24×10 gets a clean error instead of the old
  `ZeroDivisionError` from `rows - 1` at tiny sizes.
- **`--export` is real:** it writes a standalone, runnable script for the
  chosen pattern (its actual evaluator source + helpers + render loop,
  ~360 lines), verified by byte-compiling and running exports for a
  field pattern, a cellular pattern and a Wolfram rule. The old export
  wrote a 6-line stub that only printed a message.
- **Rendering:** half-block `▀` cells double the vertical resolution
  (two pixels per character), and ANSI escapes are emitted only when
  the colour pair changes instead of one full escape sequence per cell.
  Header/branding spelling fixed to visualizurrr; unused imports gone.
- Known remaining drift (Stage 6): the web app's pattern numbers and
  the CLI's diverge after #8, so the drawer's CLI tip can name the
  wrong pattern; the patterns.json single-source work will align them.

### 17:19 PDT — Stage 3 complete: medium-severity fixes (verified)

Audio analysis (audioEngine):
- FFT size 256 → 2048 (~23 Hz/bin at 48 kHz); band edges are now defined
  in Hz (bass 20–150, mid 150–4000, treble 4000–16000) instead of
  fractions of the spectrum — the old "bass" actually spanned 0–2.8 kHz.
- Beat detection: fixed `bass > 0.42` threshold replaced with spectral
  flux over the bass+mid range vs a running average, with a 180 ms
  cooldown, so a loud sustained note no longer reads as a constant beat.
- `getMetrics()` results are cached per animation frame; the canvas and
  the player used to run the full analysis twice per frame.
- Player spectrum bars: throttled to ~20 updates/sec and only re-render
  when the bars change — a paused player no longer re-renders 60×/sec.

Canvas (CanvasVisualizer):
- The 2D context is created exactly once with `{ alpha: false }`; resize
  handling previously created it first with default attributes, silently
  discarding the option. Sizing now uses ResizeObserver (window.resize
  fallback) instead of only window resize events.
- Mouse handlers replaced with Pointer Events + setPointerCapture:
  touch works, and releasing outside the canvas can't leave `isDown`
  stuck on.
- Frame delta clamped to 50 ms — returning from a hidden tab no longer
  teleports simulations.
- A pattern that throws is logged once and disabled for that activation
  instead of spamming the console every frame.
- PNG export no longer uses a `window.exportVisualizerPng` global; the
  parent passes a ref. The unused `canvasRefOut` prop is gone, and the
  download filename is spelled `visualizurrr-…` (was `visualizerrr-…`).

Parameters:
- Svensson attractor: slider for parameter `d` widened from ±3 to ±8 —
  its default −6.56 was outside its own slider range.
- Render caps that silently undercut slider maxima are aligned: Lorenz
  stepCount 4500→6000, Rössler steps 4000→5000, Barnsley points
  16000→20000, flow-field points 16000→20000, flow steps 4000→5000.
- New validation test sweeps all 68 patterns: every default inside its
  slider range and in agreement with `defaultParameters` (0 problems).

Python export (drawer + all 68 pattern definitions):
- `pythonCode` now receives the full palette object, not just its name.
  45 hardcoded hex colors in the generated scripts now interpolate the
  selected palette (figure background, primary plot color, accent,
  highlight), and a `# Requires: pip install …` line derived from the
  script's actual third-party imports is prepended to the displayed,
  copied and downloaded code.
- Clipboard copy is awaited: "Copied!" + confetti only fire on success;
  failures show "Copy failed" (e.g. plain-HTTP dev servers).
- Download revokes the object URL after 1 s instead of synchronously
  (which broke Safari), and the copied CLI command now names
  `./visualizurrr.py` (was `./visualizerrr.py`).

Stateful patterns:
- `PatternDefinition.reset()` — declared in the type but never
  implemented — is now implemented by all 11 closure-state patterns
  (Game of Life, Langton's Ant, forest fire, Brian's Brain, cyclic CA,
  flow field, boids, starfield, double pendulum, epicycles, N-body) and
  is called by the canvas whenever the active pattern changes.
- Game of Life: changing the seed-density slider now reseeds the grid,
  and stepping loops over elapsed 60 ms increments (capped at 8/frame),
  so speed multipliers above ~3.7× actually advance more generations
  instead of saturating at one step per frame.

Tests: 22/22 pass (was 20), including a new smoke test that renders
every pattern in all six render modes against a stub canvas, and a
check that all 68 generated Python scripts (×2 palettes) byte-compile.
`tsc` strict clean; production build succeeds.

### 17:13 PDT — Fix pass in progress (base: main @ adea027)

Process: Aubrey supplied a comprehensive issue list (clean-install failure,
high/medium/low severity, enhancements) and required the fix to address
every item. Work proceeds in verified stages; this changelog is updated
as each stage lands.

### Stage 2 — High severity (in progress)

- ChillMusicPlayer: morph listener leak fixed — one `onTrackChange`
  subscription registered for the component's lifetime with latest values
  in refs, and the unsubscribe function is returned/used on unmount.
- audioEngine: `setTrack` now fires track-change exactly once (removed the
  separate morph fan-out), and ChillMusicPlayer no longer calls
  `onMorphTriggered` directly from next/prev/playlist/track handlers —
  morphs can't double up.
- audioEngine: the 40-second periodic morph timer is deleted. Morphing
  happens on track change only.
- App: morph pauses for 60 s after any manual pattern/palette selection
  (prev/next, cycle, randomize, gallery, palette picker).
- Play/pause desync fixed: `audioEngine.toggle()` returns a promise for
  the resulting state and the player awaits it; the engine also syncs
  `isPlaying` from the audio element's real `play`/`pause` events.
- App: parameters are stored per pattern ID and derived at render time
  (no effect copy), so tweaks survive pattern switches and the stale
  first-frame parameters (e.g. `sigma = undefined` in generated Python)
  are gone.
- App keyboard shortcuts: Ctrl/Cmd/Alt combos return early, and SELECT
  and contentEditable targets are skipped — Ctrl+C, Cmd+R, Ctrl+S no
  longer trigger app actions.
- `matrix` render mode added to the M-key cycle and the ControlDock
  buttons (it existed in the RenderMode type but was unreachable).
- Render modes are now real: new shared helpers in `src/utils/drawModes.ts`
  (`drawPath`, `fillCell`, `strokeCircle`) make curves / particles / mesh /
  heatmap / neon / matrix visibly change the drawing. Retrofitted so far:
  all 8 fractal patterns (Lorenz, Rössler, dragon curve via drawPath;
  Mandelbrot, Julia, Barnsley, Sierpinski via fillCell; Apollonian via
  strokeCircle). Remaining pattern files (spirographs, physics, flows,
  nature, optics, turtle, cellular) are retrofitted in Stage 6.
- Verified so far: `tsc --noEmit` clean under strict mode; 20/20 tests pass.

### Stage 1 — Packaging & clean install (verified ~17:10 PDT)

- package.json: renamed `react-example` → `visualizurrr`, version 1.0.0.
- Removed the pinned `esbuild@^0.25` that broke a clean `npm install`
  against Vite 8 (nothing imported it).
- Removed unused dependencies: `@google/genai`, `dotenv`, `express`,
  `motion`, `autoprefixer`, `@types/express`.
- Deleted AI Studio leftovers: `.env.example`, `metadata.json`.
- `clean` script no longer removes a nonexistent `server.js`.
- Added a `test` script (`tsx --test "src/**/*.test.ts"` — the tests use
  extensionless imports that Node's native runner cannot resolve).
- tsconfig: `"strict": true` enabled; unused `experimentalDecorators`
  removed.
- vite.config: `__dirname` → `import.meta.dirname` (build warning gone).
- Verification: clean `npm install` (no `--legacy-peer-deps`) succeeds;
  `tsc` clean; 20/20 tests pass; build output 428 KB JS / 133 KB gzip.

### Patch 1 — mega visualiser companion (delivered ~17:05 PDT, awaiting review)

- Added `mega_visualiser.py`: a windowed NumPy/pygame visualiser
  (29 modes × 60 palettes × 30 presets, post-FX stack, mouse interaction,
  headless still/GIF export), rebranded to the visualizurrr name.
- Appended a README section describing it. Purely additive: no existing
  files modified except the README append.
- Verified: applies cleanly to a pristine clone of main @ adea027, and
  both `mega_visualiser.py` and `visualizurrr.py` CLIs run after applying.
- Delivered as `visualizurrr-mega-visualiser.patch` for Aubrey to review
  and apply; direct push is still blocked by the broken GitHub token and,
  per Aubrey's instruction, will not happen without their approval anyway.

## 2026-10-28 17:37 PDT — Stage 6: enhancements

- **One data source**: `patterns.json` at the repo root is generated from the
  web pattern library and the CLI tables by `scripts/generate_patterns_json.py`;
  CI fails on drift (`--check`). CLI pattern numbering now matches the web
  gallery exactly, and web pattern IDs work as CLI `--pattern` values via an
  alias table (so the code drawer's command line is correct as copied).
- **Render modes are real everywhere**: the remaining 40 patterns (cellular,
  spirographs, turtle, optics, physics, flows, nature) now draw through the
  shared `drawPath` / `fillCell` / `fillCircle` / `strokeCircle` helpers, so
  all six modes change every pattern's rendering. Six patterns also read the
  live audio metrics (hypotrochoid, phyllotaxis, Fourier epicycles, boids,
  starfield, jellyfish).
- **Permalinks & persistence**: the URL hash tracks pattern/palette/mode/
  speed; settings, per-pattern parameters, and custom palettes persist in
  localStorage and are restored on load (hash wins over saved settings).
- **Custom palette editor** in the palette picker (name + five colours,
  saved to localStorage, deletable).
- **Capture**: WebM recording from the control dock (MediaRecorder on the
  canvas stream), and presentation mode (F key): fullscreen, chrome hidden,
  patterns auto-advance every 18 s.
- **Adaptive quality**: the canvas backing store steps down to 75%/50%
  resolution when FPS stays under 28 and recovers when there is headroom;
  the HUD shows the current quality level.
- `pyproject.toml` added for the CLI (`visualizurrr` console entry point).
- Not taken from the enhancement list (would need a larger redesign):
  lazy-loading patterns, OffscreenCanvas workers, microphone/file audio
  input, and animated randomize transitions.

## 2026-10-28 17:41 PDT — Final verification & Patch 2

- Full suite re-run from scratch: `npm ci` and a fresh `npm install` with no
  lockfile and no `--legacy-peer-deps` both succeed; strict `tsc` clean;
  22/22 tests; production build passes.
- CLI verified end-to-end: byte-compiles, lists 68 patterns / 26 palettes,
  invalid input and non-TTY runs exit 2, exports are real standalone scripts
  (field + grid + Wolfram verified), and a headless harness confirms all 68
  patterns render pairwise-distinct, structured frames.
- All 136 web-generated Python scripts (68 patterns × 2 palettes)
  byte-compile with zero hardcoded background hex remaining.
- Delivered as Patch 2 against `main @ adea027` (40 files, +7,715/−1,435),
  verified to apply cleanly to a pristine checkout and pass the full suite
  there. Awaiting review before any push.

## 2026-10-28 17:53 PDT — Patch 1 merged in

- Per Aubrey's instruction to apply patches as they become available:
  Patch 1 (the `mega_visualiser.py` windowed companion + its README section)
  is merged into this tree on top of the fix pass, so a single combined
  patch now carries everything. Its README hunk was hand-merged because
  the fix pass rewrote the README tail.
