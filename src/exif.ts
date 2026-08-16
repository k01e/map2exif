import * as piexif from 'piexifjs';

export interface LatLng {
  lat: number;
  lng: number;
}

/** Reads an image File as a base64 data URL (what piexifjs expects). */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Reads GPS coordinates already embedded in a JPEG data URL, if any. */
export function readGps(dataUrl: string): LatLng | null {
  let exif: piexif.ExifDict;
  try {
    exif = piexif.load(dataUrl);
  } catch {
    return null;
  }

  const gps = exif.GPS;
  const lat = gps[piexif.GPSIFD.GPSLatitude];
  const latRef = gps[piexif.GPSIFD.GPSLatitudeRef];
  const lng = gps[piexif.GPSIFD.GPSLongitude];
  const lngRef = gps[piexif.GPSIFD.GPSLongitudeRef];

  if (!lat || !lng || !latRef || !lngRef) return null;

  type Dms = [[number, number], [number, number], [number, number]];
  return {
    lat: piexif.GPSHelper.dmsRationalToDeg(lat as unknown as Dms, latRef as string),
    lng: piexif.GPSHelper.dmsRationalToDeg(lng as unknown as Dms, lngRef as string),
  };
}

/** Returns a new JPEG data URL with GPS EXIF tags set to the given coordinates. */
export function writeGps(dataUrl: string, { lat, lng }: LatLng): string {
  let exif: piexif.ExifDict;
  try {
    exif = piexif.load(dataUrl);
  } catch {
    exif = { '0th': {}, Exif: {}, GPS: {}, Interop: {}, '1st': {}, thumbnail: null };
  }

  exif.GPS[piexif.GPSIFD.GPSVersionID] = [2, 0, 0, 0];
  exif.GPS[piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? 'N' : 'S';
  exif.GPS[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(lat);
  exif.GPS[piexif.GPSIFD.GPSLongitudeRef] = lng >= 0 ? 'E' : 'W';
  exif.GPS[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(lng);

  const exifBytes = piexif.dump(exif);
  return piexif.insert(exifBytes, dataUrl);
}

/** Converts a JPEG data URL into a Blob for downloading. */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/data:(.*);base64/)?.[1] ?? 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
