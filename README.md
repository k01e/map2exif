# map2exif

Lots of photos — old scans, hand-me-down family archives, shots from cameras and early phones that predate GPS-tagged EXIF data — have no location info baked in. map2exif lets you fill that in after the fact: upload JPEG photos, pick a location on a map, and write that location into the photos' EXIF GPS tags — right in your browser. No backend, no accounts, no photo ever leaves your machine.

## How it works

1. **Location** — search an address/place, or click/drag a pin on the map.
2. **Photos** — drag & drop JPEGs (or use the file picker). Existing GPS data, if any, is shown per photo.
3. **Apply & download** — apply the selected location to all uploaded photos, then download them individually or as a ZIP.

Everything runs client-side: photos are read and rewritten entirely in the browser. Only text search queries go to the geocoder, and only map tile images are fetched — no image data is ever uploaded anywhere.

## Stack

- [Vite](https://vitejs.dev/) + vanilla TypeScript, no framework, no backend
- [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) tiles for the map (free, no API key)
- [Nominatim](https://nominatim.org/) for address search (OSM's free geocoding API, no API key)
- [piexifjs](https://github.com/hMatoba/piexifjs) to read/write JPEG EXIF GPS tags client-side
- [JSZip](https://stuk.github.io/jszip/) to bundle multiple photos into one ZIP download

## Development

This project targets Node 20.19+ or 22.12+ (a `.nvmrc` pins Node 22). If you use [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm use
```

Then:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Deployment

Pushes to `main` automatically build and deploy to GitHub Pages via [.github/workflows/deploy.yml](.github/workflows/deploy.yml). This requires a one-time setup step in the repo: **Settings → Pages → Source: GitHub Actions**.

`vite.config.ts` sets `base: '/map2exif/'` to match this repo's GitHub Pages URL. If you fork or rename the repo, update that path to match.

## Limitations

- JPEG only — no HEIC (iPhone's default format) or PNG support yet.
- One location is applied to the entire batch of uploaded photos, not set per-image.
- Uses Nominatim's public API, which has a light rate limit (fine for personal use).
