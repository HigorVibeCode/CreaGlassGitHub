// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for React 19 + Expo SDK 54 web build issue with import.meta
// Disable experimental import support to prevent import.meta errors
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
  },
});

module.exports = config;
