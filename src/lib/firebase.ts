import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDFhw3i0Xa6_UeN7fjSMAHxS7kcfbQbuMo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'rokitne--yahmyrov.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'rokitne--yahmyrov',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'rokitne--yahmyrov.firebasestorage.app',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:582905785754:web:a76b3d35c704aa5e125e23',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '582905785754',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-BQ5B18N7T2',
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.storageBucket && firebaseConfig.appId);

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
export const firebaseDb = getFirestore(app);
export const firebaseStorage = getStorage(app);

export async function getFirebaseUser(): Promise<User> {
  if (firebaseAuth.currentUser) return firebaseAuth.currentUser;
  const result = await signInAnonymously(firebaseAuth);
  return result.user;
}

export async function uploadImageToFirebase(file: File, folder = 'users') {
  const user = await getFirebaseUser();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${folder}/${user.uid}/${Date.now()}-${safeName}`;
  const objectRef = ref(firebaseStorage, path);
  await uploadBytes(objectRef, file, { contentType: file.type, cacheControl: 'public,max-age=31536000' });
  return { url: await getDownloadURL(objectRef), path, uid: user.uid };
}
