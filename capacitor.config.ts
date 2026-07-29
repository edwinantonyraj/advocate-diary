import type { CapacitorConfig } from '@capacitor/cli';

// IMPORTANT: After you deploy the backend (see README-MOBILE.md), replace the
// placeholder URL below with your real deployed URL, e.g.
// https://advocate-diary.onrender.com
const DEPLOYED_APP_URL = 'https://REPLACE-WITH-YOUR-DEPLOYED-URL.onrender.com';

const config: CapacitorConfig = {
  appId: 'com.advocatediary.app',
  appName: 'Advocate Diary',
  webDir: 'dist',
  server: {
    // Loading the live, deployed site inside the native app shell means the
    // frontend and the /api/* backend routes stay same-origin (no CORS
    // headaches), and the AI + email + sync features work exactly as they
    // do on the web, but now inside an installable Android app.
    url: DEPLOYED_APP_URL,
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
