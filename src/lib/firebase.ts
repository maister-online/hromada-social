import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, type User } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'rokitne--yahmyrov',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

const missing = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'].filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig]);

export const firebaseConfigured = missing.length === 0;
export const firebaseConfigMissing = missing;

let app: ReturnType<typeof initializeApp> | undefined;
let auth: ReturnType<typeof getAuth> | undefined;
let storage: ReturnType<typeof getStorage> | undefined;

if (firebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
}

export async function getFirebaseUser(): Promise<User> {
  if (!firebaseConfigured || !auth) throw new Error(`Firebase не налаштований. Відсутні: ${missing.join(', ')}`);
  if (auth.currentUser) return auth.currentUser;
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function uploadImageToFirebase(file: File, folder = 'users') {
  if (!firebaseConfigured || !storage) throw new Error(`Firebase Storage не налаштований. Відсутні: ${missing.join(', ')}`);
  const user = await getFirebaseUser();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${folder}/${user.uid}/${Date.now()}-${safeName}`;
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, file, { contentType: file.type, cacheControl: 'public,max-age=31536000' });
  return { url: await getDownloadURL(objectRef), path, uid: user.uid };
}
