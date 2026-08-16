import './style.css';
import { initUpload, onPhotosChanged, getPhotos, applyLocationToAll } from './upload';
import { initMap, onLocationSelected, getSelectedLocation } from './map';
import { downloadAllAsZip } from './download';

const applyButton = document.getElementById('apply-button') as HTMLButtonElement;
const downloadZipButton = document.getElementById('download-zip-button') as HTMLButtonElement;
const selectedLocationEl = document.getElementById('selected-location') as HTMLParagraphElement;
const statusEl = document.getElementById('status-message') as HTMLParagraphElement;
const photoCountEl = document.getElementById('photo-count') as HTMLSpanElement;

function updateButtonStates(): void {
  const count = getPhotos().length;
  applyButton.disabled = count === 0 || !getSelectedLocation();
  downloadZipButton.disabled = count === 0;
  applyButton.textContent = `Apply location to ${count} photo(s)`;
  photoCountEl.textContent = count === 0 ? 'None yet' : `${count} photo${count === 1 ? '' : 's'}`;
}

initUpload();
initMap();
updateButtonStates();

onPhotosChanged(() => {
  updateButtonStates();
});

onLocationSelected((location) => {
  selectedLocationEl.textContent = `Selected: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
  selectedLocationEl.classList.add('has-location');
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
