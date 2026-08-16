import './style.css';
import { initUpload, onPhotosChanged, getPhotos, applyLocationToAll } from './upload';
import { initMap, onLocationSelected, getSelectedLocation } from './map';
import { downloadAllAsZip } from './download';

const applyButton = document.getElementById('apply-button') as HTMLButtonElement;
const downloadZipButton = document.getElementById('download-zip-button') as HTMLButtonElement;
const selectedLocationEl = document.getElementById('selected-location') as HTMLParagraphElement;
const statusEl = document.getElementById('status-message') as HTMLParagraphElement;

function updateButtonStates(): void {
  applyButton.disabled = getPhotos().length === 0 || !getSelectedLocation();
  downloadZipButton.disabled = getPhotos().length === 0;
}

initUpload();
initMap();
updateButtonStates();

onPhotosChanged(() => {
  updateButtonStates();
});

onLocationSelected((location) => {
  selectedLocationEl.textContent = `Selected: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
  updateButtonStates();
});

applyButton.addEventListener('click', () => {
  const location = getSelectedLocation();
  if (!location) return;
  applyLocationToAll(location);
  statusEl.textContent = `Location applied to ${getPhotos().length} photo(s).`;
});

downloadZipButton.addEventListener('click', () => {
  void downloadAllAsZip(getPhotos());
});
