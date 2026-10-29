# Audio credits

The web app bundles four lofi tracks in this directory. The credits below
are exactly what the app's metadata claims. **The source pages for these
recordings have not been verified yet** — the original import did not
record source URLs. Before treating the license status as settled,
confirm each track at its source and add the URL here.

| File | Title (as credited) | Artist (as credited) | License (as claimed) | Source URL |
| --- | --- | --- | --- | --- |
| `cold_brew_chill.mp3` | Cold Brew Chill | RA | Creative Commons 0 (Public Domain) | _to be confirmed_ |
| `night_in_kyoto.mp3` | Night in Kyoto | Avbe | Creative Commons 0 (Public Domain) | _to be confirmed_ |
| `moonshine_vibes.mp3` | Moonshine Vibes | Prigida | Creative Commons 0 (Public Domain) | _to be confirmed_ |
| `lofi_chill_study.mp3` | Midnight Study Session | Lofi Records | Creative Commons 0 (Public Domain) | _to be confirmed_ |

Notes:

- ~20 MB of MP3 audio is committed directly in git. Moving the tracks to
  Git LFS or a CDN would shrink clones considerably; the app references
  them by path (`/audio/<file>`), so only the hosting needs to change.
- "Custom playlists" in the player do not generate new music: they
  re-present these four tracks under your session name and vibe, with
  suggested pattern/palette pairings.
