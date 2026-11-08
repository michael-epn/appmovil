import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { type User, type UserCredential } from 'firebase/auth';
import { firstValueFrom, type Observable } from 'rxjs';

import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly supabase = inject(SupabaseService);

  readonly authState$: Observable<User | null> = authState(this.auth);

  getCurrentUser(): Promise<User | null> {
    return firstValueFrom(authState(this.auth));
  }

  signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email: string, password: string): Promise<UserCredential> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    const { error } = await this.supabase.client.from('profiles').upsert(
      {
        id: credential.user.uid,
        email: credential.user.email ?? email,
        username: email.split('@')[0],
        avatar_url: null,
        bio: '',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );

    if (error) {
      throw new Error(`La cuenta se creó en Firebase, pero no se pudo sincronizar el perfil: ${error.message}`);
    }

    return credential;
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }
}
