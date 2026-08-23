import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, type User } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDFhw3i0Xa6_UeN7fjSMAHxS7kcfbQbuMo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'rokitne--yahmyrov.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'rokitne--yahmyrov',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'rokitne--yahmyrov.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '582905785754',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:582905785754:web:a76b3d35c704aa5e125e23',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-BQ5B18N7T2',
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.storageBucket && firebaseConfig.appId);
export const firebaseConfigMissing: string[] = [];

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
export const firebaseDb = getFirestore(app);
export const firebaseStorage = getStorage(app);

let loginPromise: Promise<User> | null = null;

export async function getFirebaseUser(): Promise<User> {
  if (firebaseAuth.currentUser) return firebaseAuth.currentUser;
  if (!loginPromise) {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    loginPromise = signInWithPopup(firebaseAuth, provider)
      .then(result => result.user)
      .catch(error => {
        loginPromise = null;
        throw error;
      });
  }
  return loginPromise;
}

export async function uploadImageToFirebase(file: File, folder = 'users') {
  if (!file?.type.startsWith('image/')) throw new Error('Оберіть файл зображення.');
  if (file.size > 8 * 1024 * 1024) throw new Error('Фото має бути не більше 8 МБ.');

  const user = await getFirebaseUser();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${folder}/${user.uid}/profile-${Date.now()}.${extension}`;
  const objectRef = ref(firebaseStorage, path);

  try {
    await uploadBytes(objectRef, file, { contentType: file.type, cacheControl: 'public,max-age=31536000' });
    const url = await getDownloadURL(objectRef);
    await setDoc(doc(firebaseDb, 'users', user.uid), {
      ...(folder === 'users' ? { avatarUrl: url } : { coverUrl: url }),
      uid: user.uid,
      email: user.email || '',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { url, path, uid: user.uid };
  } catch (error: any) {
    const code = error?.code || '';
    if (code === 'storage/unauthorized') throw new Error('Firebase Storage заборонив запис. Перевірте Storage Rules.');
    if (code === 'storage/quota-exceeded') throw new Error('Перевищено квоту Firebase Storage.');
    if (code === 'permission-denied') throw new Error('Firestore заборонив збереження профілю.');
    throw error;
  }
}
