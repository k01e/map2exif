import { readFileAsDataUrl, readGps, writeGps, type LatLng } from './exif';
import { downloadSingle } from './download';

export interface PhotoItem {
  id: string;
  file: File;
  originalDataUrl: string;
  currentDataUrl: string;
  existingGps: LatLng | null;
  appliedGps: LatLng | null;
}

type ChangeListener = (photos: PhotoItem[]) => void;

const photos: PhotoItem[] = [];
const listeners: ChangeListener[] = [];

export function onPhotosChanged(listener: ChangeListener): void {
  listeners.push(listener);
}

export function getPhotos(): PhotoItem[] {
  return photos;
}

export function applyLocationToAll(location: LatLng): void {
  for (const item of photos) {
    item.currentDataUrl = writeGps(item.originalDataUrl, location);
    item.appliedGps = location;
  }
  notify();
}

function notify(): void {
  for (const listener of listeners) listener(photos);
}

async function addFiles(fileList: FileList | File[]): Promise<void> {
  const jpegFiles = Array.from(fileList).filter(
    (file) => file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name),
  );
  for (const file of jpegFiles) {
    const dataUrl = await readFileAsDataUrl(file);
    photos.push({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      originalDataUrl: dataUrl,
      currentDataUrl: dataUrl,
      existingGps: readGps(dataUrl),
      appliedGps: null,
    });
  }
  notify();
}

function removePhoto(id: string): void {
  const index = photos.findIndex((item) => item.id === id);
  if (index !== -1) photos.splice(index, 1);
  notify();
}

function formatLatLng({ lat, lng }: LatLng): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function renderThumbnails(items: PhotoItem[], container: HTMLUListElement): void {
  container.innerHTML = '';
  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'thumbnail-card';

    const img = document.createElement('img');
    img.className = 'thumbnail-img';
    img.src = item.currentDataUrl;
    img.alt = item.file.name;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'thumbnail-remove';
    removeBtn.textContent = '×';
    removeBtn.setAttribute('aria-label', `Remove ${item.file.name}`);
    removeBtn.addEventListener('click', () => removePhoto(item.id));

    const meta = document.createElement('div');
    meta.className = 'thumbnail-meta';

    const name = document.createElement('span');
    name.className = 'thumbnail-name';
    name.textContent = item.file.name;

    const gpsStatus = document.createElement('span');
    gpsStatus.className = 'thumbnail-gps';
    if (item.appliedGps) {
      gpsStatus.textContent = `Updated: ${formatLatLng(item.appliedGps)}`;
      gpsStatus.classList.add('gps-applied');
    } else if (item.existingGps) {
      gpsStatus.textContent = `Existing: ${formatLatLng(item.existingGps)}`;
    } else {
      gpsStatus.textContent = 'No location set';
    }

    const downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.className = 'thumbnail-download';
    downloadBtn.textContent = 'Download';
    downloadBtn.addEventListener('click', () => downloadSingle(item));

    meta.append(name, gpsStatus, downloadBtn);
    li.append(img, removeBtn, meta);
    container.appendChild(li);
  }
}

export function initUpload(): void {
  const dropzone = document.getElementById('dropzone') as HTMLElement;
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const thumbnailList = document.getElementById('thumbnail-list') as HTMLUListElement;

  fileInput.addEventListener('change', () => {
    if (fileInput.files) void addFiles(fileInput.files);
    fileInput.value = '';
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer?.files) void addFiles(e.dataTransfer.files);
  });

  onPhotosChanged((items) => renderThumbnails(items, thumbnailList));
}
