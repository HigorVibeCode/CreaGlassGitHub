import { Platform } from 'react-native';

export interface NFCReadResult {
  data: string;
  type?: string;
}

export interface NFCReader {
  read(): Promise<NFCReadResult | null>;
  isAvailable(): boolean;
}

// NFC is only available on native platforms
let reader: NFCReader | null = null;

if (Platform.OS === 'web') {
  reader = {
    async read(): Promise<NFCReadResult | null> {
      return null; // NFC not available on web
    },
    isAvailable(): boolean {
      return false;
    },
  };
} else {
  // Native implementation (Android/iOS)
  reader = {
    async read(): Promise<NFCReadResult | null> {
      // Native NFC reader implementation
      // This will be implemented with a React Native NFC library
      // For now, return null as placeholder
      console.warn('NFC reading is not yet implemented');
      return null;
    },
    isAvailable(): boolean {
      return Platform.OS !== 'web';
    },
  };
}

export const nfcReader: NFCReader = reader;
