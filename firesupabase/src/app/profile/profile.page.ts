import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';
import { type User } from 'firebase/auth';

import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';
import { ThemeService } from '../services/theme.service';

interface Profile {
  username: string;
  bio: string;
  avatar_url: string | null;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonTextarea,
    IonTitle,
    IonToggle,
    IonToolbar,
  ],
})
export class ProfilePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
    bio: ['', [Validators.maxLength(500)]],
  });

  readonly user = signal<User | null>(null);
  readonly avatarUrl = signal<string | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly isDarkMode = signal(false);

  async ionViewWillEnter(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      this.isDarkMode.set(await this.theme.initialize());
      const user = await this.authService.getCurrentUser();
      this.user.set(user);
      if (!user) {
        await this.router.navigateByUrl('/login', { replaceUrl: true });
        return;
      }

      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('username, bio, avatar_url')
        .eq('id', user.uid)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        this.setProfile(data);
      } else {
        await this.ensureProfile(user);
      }
    } catch (error) {
      this.errorMessage.set(this.getErrorMessage(error, 'No se pudo cargar el perfil.'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveProfile(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');
    const user = this.user();
    if (!user || this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    try {
      const { username, bio } = this.form.getRawValue();
      const { error } = await this.supabase.client.from('profiles').upsert(
        {
          id: user.uid,
          email: user.email,
          username: username.trim(),
          bio: bio.trim(),
          avatar_url: this.avatarUrl(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );
      if (error) {
        throw error;
      }
      this.successMessage.set('Perfil actualizado.');
    } catch (error) {
      this.errorMessage.set(this.getErrorMessage(error, 'No se pudo guardar el perfil.'));
    } finally {
      this.isSaving.set(false);
    }
  }

  async chooseAvatar(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');
    const user = this.user();
    if (!user) {
      return;
    }

    this.isSaving.set(true);
    try {
      const photo = await Camera.getPhoto({
        source: CameraSource.Photos,
        resultType: CameraResultType.Uri,
        quality: 85,
        width: 512,
        height: 512,
      });
      if (!photo.webPath) {
        throw new Error('No se pudo leer la imagen seleccionada.');
      }

      const response = await fetch(photo.webPath);
      if (!response.ok) {
        throw new Error('No se pudo leer la imagen seleccionada.');
      }
      const image = await response.blob();
      const extension = image.type.split('/')[1] || 'jpg';
      const filePath = `${user.uid}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await this.supabase.client.storage
        .from('avatars')
        .upload(filePath, image, { contentType: image.type || 'image/jpeg', upsert: true });
      if (uploadError) {
        throw uploadError;
      }

      const { data } = this.supabase.client.storage.from('avatars').getPublicUrl(filePath);
      const { error: profileError } = await this.supabase.client
        .from('profiles')
        .update({ avatar_url: data.publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.uid);
      if (profileError) {
        throw profileError;
      }
      this.avatarUrl.set(data.publicUrl);
      this.successMessage.set('Foto de perfil actualizada.');
    } catch (error) {
      this.errorMessage.set(this.getErrorMessage(error, 'No se pudo subir la foto de perfil.'));
    } finally {
      this.isSaving.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.signOut();
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error) {
      this.errorMessage.set(this.getErrorMessage(error, 'No se pudo cerrar la sesión.'));
    }
  }

  async setDarkMode(enabled: boolean): Promise<void> {
    try {
      await this.theme.setDarkMode(enabled);
      this.isDarkMode.set(enabled);
    } catch (error) {
      this.errorMessage.set(this.getErrorMessage(error, 'No se pudo guardar la preferencia del tema.'));
    }
  }

  private async ensureProfile(user: User): Promise<void> {
    const email = user.email ?? '';
    const { data, error } = await this.supabase.client
      .from('profiles')
      .upsert(
        {
          id: user.uid,
          email,
          username: email.split('@')[0] || 'usuario',
          avatar_url: null,
          bio: '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      .select('username, bio, avatar_url')
      .single();
    if (error) {
      throw error;
    }
    this.setProfile(data);
  }

  private setProfile(profile: Profile): void {
    this.form.patchValue({ username: profile.username ?? '', bio: profile.bio ?? '' });
    this.avatarUrl.set(profile.avatar_url);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }
}
