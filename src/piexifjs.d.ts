declare module 'piexifjs' {
  export interface ExifDict {
    '0th': Record<number, unknown>;
    Exif: Record<number, unknown>;
    GPS: Record<number, unknown>;
    Interop: Record<number, unknown>;
    '1st': Record<number, unknown>;
    thumbnail: string | null;
  }

  export const GPSIFD: {
    GPSVersionID: number;
    GPSLatitudeRef: number;
    GPSLatitude: number;
    GPSLongitudeRef: number;
    GPSLongitude: number;
    GPSAltitudeRef: number;
    GPSAltitude: number;
    [key: string]: number;
  };

  export const GPSHelper: {
    degToDmsRational(degFloat: number): [[number, number], [number, number], [number, number]];
    dmsRationalToDeg(dmsArray: [[number, number], [number, number], [number, number]], ref: string): number;
  };

  export function load(jpegBinaryOrBase64: string): ExifDict;
  export function dump(exifDict: ExifDict): string;
  export function insert(exifBytes: string, jpegBinary: string): string;
  export function remove(jpegBinary: string): string;
}
