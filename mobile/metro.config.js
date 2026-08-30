const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add 'tflite' to the list of asset extensions so the Metro bundler includes the model
config.resolver.assetExts.push('tflite');

module.exports = withNativeWind(config, { input: './src/global.css' });
