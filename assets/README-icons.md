# Brand assets

The brutalist source artwork lives in `favicon.svg`. To regenerate the PNG
files Expo needs, run **once** from the repo root:

```bash
npx sharp-cli@5.0.0 -i assets/favicon.svg -o assets/icon.png resize 1024 1024
npx sharp-cli@5.0.0 -i assets/favicon.svg -o assets/adaptive-icon.png resize 1024 1024
npx sharp-cli@5.0.0 -i assets/favicon.svg -o assets/favicon.png resize 256 256
npx sharp-cli@5.0.0 -i assets/favicon.svg -o assets/splash-icon.png resize 1284 1284
```

`sharp-cli` is fetched via `npx` so nothing is added to `package.json`. If
you prefer a one-shot tool, drop the SVG into <https://realfavicongenerator.net>
or any SVG → PNG converter and replace the four PNGs above.

After regenerating, restart Metro (`npx expo start --clear`) so the new
images are picked up.

## Design notes

- Surface: `#FFE066` (NEO.yellow), thick `#000` border, hard offset shadow
- Pink slash accent: `#FF6B9D` (NEO.pink), tilted 15°
- Lime "AI" tag block: `#A6F068` (NEO.lime), bottom-right corner
- Bold black "G" monogram, Arial Black weight 900

The PNGs share the same dimensions Expo expects, so no `app.json` changes
are needed beyond the regeneration step.
