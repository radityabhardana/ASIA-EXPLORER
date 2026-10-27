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

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<void> {
  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(cred.user, { displayName: name });
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(firebaseAuth, googleProvider);
}

export async function signOutUser(): Promise<void> {
  await signOut(firebaseAuth);
}

export function onAuthChange(cb: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(firebaseAuth, cb);
}
