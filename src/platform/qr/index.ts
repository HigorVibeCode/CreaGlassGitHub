import { Platform } from 'react-native';

export interface QRScanResult {
  data: string;
  type?: string;
}

export interface QRScanner {
  scan(): Promise<QRScanResult | null>;
  isAvailable(): boolean;
}

// Platform-specific implementations
let scanner: QRScanner | null = null;

if (Platform.OS === 'web') {
  // Web implementation (browser-based scanner)
  scanner = {
    async scan(): Promise<QRScanResult | null> {
      // Web QR scanner implementation
      // This would use a browser-based QR scanner library
      // For now, return null as placeholder
      console.warn('QR scanning on web is not yet implemented');
      return null;
    },
    isAvailable(): boolean {
      return typeof navigator !== 'undefined' && 'mediaDevices' in navigator;
    },
  };
} else {
  // Native implementation (Expo Camera)
  scanner = {
    async scan(): Promise<QRScanResult | null> {
      // Native QR scanner implementation using expo-camera
      // This will be implemented with expo-camera and barcode scanner
      console.warn('QR scanning on native is not yet fully implemented');
      return null;
    },
    isAvailable(): boolean {
      return Platform.OS !== 'web';
    },
  };
}

export const qrScanner: QRScanner = scanner;
