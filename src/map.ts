import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { LatLng } from './exif';

// Leaflet's default marker icon paths assume a specific server layout that
// bundlers break; point them at the bundled asset URLs instead.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

type LocationListener = (location: LatLng) => void;

let map: L.Map;
let marker: L.Marker | null = null;
let selected: LatLng | null = null;
const listeners: LocationListener[] = [];

export function onLocationSelected(listener: LocationListener): void {
  listeners.push(listener);
}

export function getSelectedLocation(): LatLng | null {
  return selected;
}

function setLocation(location: LatLng): void {
  selected = location;
  if (marker) {
    marker.setLatLng(location);
  } else {
    marker = L.marker(location, { draggable: true }).addTo(map);
    marker.on('dragend', () => {
      const pos = marker!.getLatLng();
      setLocation({ lat: pos.lat, lng: pos.lng });
    });
  }
  for (const listener of listeners) listener(location);
}

export function initMap(): void {
  map = L.map('map').setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  map.on('click', (e: L.LeafletMouseEvent) => {
    setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
  });

  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const searchButton = document.getElementById('search-button') as HTMLButtonElement;

  const runSearch = (): void => void search(searchInput.value.trim());
  searchButton.addEventListener('click', runSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch();
    }
  });

  centerOnBrowserLocation();
}

/** Best-effort recenter near the visitor on load; silently does nothing if unsupported/denied. */
function centerOnBrowserLocation(): void {
  if (!('geolocation' in navigator)) return;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      map.setView([position.coords.latitude, position.coords.longitude], 12);
    },
    () => {
      // Permission denied, timed out, or unavailable — keep the default world view.
    },
    { timeout: 8000, maximumAge: 10 * 60 * 1000 },
  );
}

async function search(query: string): Promise<void> {
  if (!query) return;
  const statusEl = document.getElementById('status-message');
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Search failed (${response.status})`);
    const results = (await response.json()) as NominatimResult[];
    if (results.length === 0) {
      if (statusEl) statusEl.textContent = `No results for "${query}".`;
      return;
    }
    const location: LatLng = { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
    map.setView(location, 14);
    setLocation(location);
    if (statusEl) statusEl.textContent = '';
  } catch (err) {
    if (statusEl) statusEl.textContent = 'Location search failed. Please try again.';
    console.error(err);
  }
}
