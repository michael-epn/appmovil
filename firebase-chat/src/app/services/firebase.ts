import { Injectable } from '@angular/core';
import {
  initializeApp,
  getApps,
  getApp
} from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import {
  getFirestore
} from 'firebase/firestore';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private app = getApps().length
    ? getApp()
    : initializeApp(environment.firebase);

  auth = getAuth(this.app);
  db = getFirestore(this.app);

  async connect(): Promise<User> {

    const existingUser = await new Promise<User | null>(
      (resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
          this.auth,
          user => {
            unsubscribe();
            resolve(user);
          },
          error => {
            unsubscribe();
            reject(error);
          }
        );
      }
    );

    if (existingUser) {
      return existingUser;
    }

    const credential = await signInAnonymously(this.auth);
    return credential.user;
  }

  getCurrentUid(): string | undefined {
    return this.auth.currentUser?.uid;
  }
}