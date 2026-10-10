import { initializeApp, getApps } from "firebase/app";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** False until the NEXT_PUBLIC_FIREBASE_* variables are set (see ADMIN.md). The site then shows the sample stock. */
export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

export const firebaseApp = () => (getApps()[0] ?? initializeApp(config));
