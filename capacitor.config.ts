import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.senstudio.host',
  appName: 'Sen Studio Host',
  webDir: 'public',
  server: {
    url: 'https://host.senstudio.space',
    cleartext: true
  }
};

export default config;