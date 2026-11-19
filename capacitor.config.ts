import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chessforge.app',
  appName: 'Chess Forge',
  webDir: 'dist',
  android: {
    backgroundColor: '#0e0d0b',
  },
  plugins: {
    // Edge-to-edge: the page draws behind the status/navigation bars and pads
    // itself with env(safe-area-inset-*) (see src/styles/tokens.css).
    SystemBars: {
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
      style: 'DARK',
    },
  },
};

export default config;
