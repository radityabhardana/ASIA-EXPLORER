import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { firebaseAuth, googleProvider } from './firebase';

export type { FirebaseUser };

export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return cred.user;
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  if (name.trim()) {
    await updateProfile(cred.user, { displayName: name.trim() });
  }
  return cred.user;
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const cred = await signInWithPopup(firebaseAuth, googleProvider);
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(firebaseAuth);
}

export function onAuthChange(cb: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(firebaseAuth, cb);
}
