import JSZip from 'jszip';
import { dataUrlToBlob } from './exif';
import type { PhotoItem } from './upload';

export function downloadSingle(item: PhotoItem): void {
  triggerDownload(dataUrlToBlob(item.currentDataUrl), item.file.name);
}

export async function downloadAllAsZip(items: PhotoItem[]): Promise<void> {
  const zip = new JSZip();
  for (const item of items) {
    zip.file(item.file.name, dataUrlToBlob(item.currentDataUrl));
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, `map2exif-${timestamp()}.zip`);
}

/** Local date/time formatted for use in a filename, e.g. "2026-08-16-142530". */
function timestamp(): string {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${date}-${time}`;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
