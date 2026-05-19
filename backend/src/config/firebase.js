// Lazy firebase-admin init so the backend boots even when Firebase env vars
// aren't set (dev / demo). `verifyIdToken` will throw "Firebase admin not
// configured" in that case, which the route handler surfaces as 503.
const admin = require('firebase-admin');

let app = null;

const init = () => {
  if (app) return app;
  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Vercel stores newlines as literal \n — restore them before parsing.
  const privateKey  = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) return null;

  app = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
  return app;
};

exports.isFirebaseConfigured = () =>
  Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

exports.verifyIdToken = async (idToken) => {
  const a = init();
  if (!a) throw new Error('Firebase admin not configured on the server');
  return admin.auth(a).verifyIdToken(idToken);
};
