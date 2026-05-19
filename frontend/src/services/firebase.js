import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase config comes from REACT_APP_FIREBASE_* env vars (set on Vercel).
// If they aren't set, `auth` stays null and the app falls back to the
// existing demo-mode OTP flow — so the app stays usable in dev without
// touching Firebase Console.
const config = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};

export const FIREBASE_ENABLED = Boolean(config.apiKey && config.projectId && config.appId);

let app = null;
let auth = null;
if (FIREBASE_ENABLED) {
  app  = getApps().length ? getApps()[0] : initializeApp(config);
  auth = getAuth(app);
}

export { app, auth };
