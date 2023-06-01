import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeAnalytics, setUserId, setUserProperties } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const analytics = initializeAnalytics(firebaseApp);
export const getCurrentUser = () => {
  return new Promise<User | null>((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, user => {
          unsubscribe();
          if (user && import.meta.env.PROD) {
            setUserId(analytics, user.uid);
            setUserProperties(analytics, {
              account_type: 'Basic'
            });
          }
          resolve(user);
      }, reject);
  })
};
