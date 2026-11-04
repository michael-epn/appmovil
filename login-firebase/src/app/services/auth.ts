import { Injectable } from '@angular/core';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { Observable } from 'rxjs';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

import { environment } from '../../environments/environment';

const app = getApps().length
  ? getApp()
  : initializeApp(environment.firebase);

const auth = getAuth(app);

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$ = new Observable<User | null>((subscriber) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => subscriber.next(user),
      (error) => subscriber.error(error)
    );

    return unsubscribe;
  });

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(
      auth, email, password
    );
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(
      auth, email, password
    );
  }

  logout() {
    return signOut(auth);
  }
}