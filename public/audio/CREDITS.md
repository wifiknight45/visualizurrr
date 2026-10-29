# Audio credits

The web app bundles eleven lofi tracks in this directory: the original
four (below — source pages still unverified) and seven tracks by Holizna
whose CC0 status was verified track-by-track on Free Music Archive on
2026-10-29. Each Holizna track page states "licensed under a CC0 1.0
Universal License"; links are in the table.

## Original four (sources unverified)

The credits below are exactly what the app's metadata claims. **The
source pages for these recordings have not been verified yet** — the
original import did not record source URLs. Before treating the license
status as settled, confirm each track at its source and add the URL here.

| File | Title (as credited) | Artist (as credited) | License (as claimed) | Source URL |
| --- | --- | --- | --- | --- |
| `cold_brew_chill.mp3` | Cold Brew Chill | RA | Creative Commons 0 (Public Domain) | _to be confirmed_ |
| `night_in_kyoto.mp3` | Night in Kyoto | Avbe | Creative Commons 0 (Public Domain) | _to be confirmed_ |
| `moonshine_vibes.mp3` | Moonshine Vibes | Prigida | Creative Commons 0 (Public Domain) | _to be confirmed_ |
| `lofi_chill_study.mp3` | Midnight Study Session | Lofi Records | Creative Commons 0 (Public Domain) | _to be confirmed_ |

## Holizna tracks (CC0 verified 2026-10-29)

Artist: Holizna, released on Free Music Archive under the account
[HoliznaCC0](https://freemusicarchive.org/music/holiznacc0/).
License for every track below: **CC0 1.0 Universal (Public Domain)**,
verified on each track's page. Note the same artist also publishes under
a separate "HoliznaPATREON" account with CC BY-NC-ND tracks — none of
those are used here.

| File | Title | Album | Source (Free Music Archive) |
| --- | --- | --- | --- |
| `roof_tops.mp3` | Roof Tops | Summer Air (Lo-Fi) | https://freemusicarchive.org/music/holiznacc0/summer-air-lo-fi/roof-tops/ |
| `august_never_lasts.mp3` | August Never Lasts | Summer Air (Lo-Fi) | https://freemusicarchive.org/music/holiznacc0/summer-air-lo-fi/august-never-lasts/ |
| `ocean_memory.mp3` | Ocean Memory | Ocean Memory (Lo-Fi Chill) | https://freemusicarchive.org/music/holiznacc0/ocean-memory-lo-fi-chill/ocean-memory/ |
| `currents_we_used_to_know.mp3` | Currents We Used to Know | Ocean Memory (Lo-Fi Chill) | https://freemusicarchive.org/music/holiznacc0/ocean-memory-lo-fi-chill/currents-we-used-to-know/ |
| `tokyo_sunset.mp3` | Tokyo Sunset | Public Domain Lofi | https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/tokyo-sunset-lofi-peaceful-soft/ |
| `one_night_in_france.mp3` | One Night In France | Public Domain Lofi | https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/one-night-in-france-lofi-nostalgic-chill/ |
| `bubbles.mp3` | Bubbles | Public Domain Lofi | https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/bubbles-lofi-bright-relaxed/ |

Notes:

- ~66 MB of MP3 audio is committed directly in git. Moving the tracks to
  Git LFS or a CDN would shrink clones considerably; the app references
  them base-relatively (`audio/<file>` under the app's base URL), so only
  the hosting needs to change.
- "Custom playlists" in the player do not generate new music: they
  re-present the bundled library under your session name and vibe, with
  suggested pattern/palette pairings.
