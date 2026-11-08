import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular';
import { type User } from 'firebase/auth';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

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
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
})
export class ProfilePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
    bio: ['', [Validators.maxLength(500)]],
  });

  user: User | null = null;
  avatarUrl: string | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  async ionViewWillEnter(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.user = await firstValueFrom(this.authService.authState$);
      if (!this.user) {
        await this.router.navigateByUrl('/login', { replaceUrl: true });
        return;
      }

      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('username, bio, avatar_url')
        .eq('id', this.user.uid)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        this.setProfile(data);
      } else {
        await this.ensureProfile(this.user);
      }
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudo cargar el perfil.');
    } finally {
      this.isLoading = false;
    }
  }

  async saveProfile(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.user || this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    try {
      const { username, bio } = this.form.getRawValue();
      const { error } = await this.supabase.client.from('profiles').upsert(
        {
          id: this.user.uid,
          email: this.user.email,
          username: username.trim(),
          bio: bio.trim(),
          avatar_url: this.avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );
      if (error) {
        throw error;
      }
      this.successMessage = 'Perfil actualizado.';
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudo guardar el perfil.');
    } finally {
      this.isSaving = false;
    }
  }

  async chooseAvatar(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.user) {
      return;
    }

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
      const filePath = `${this.user.uid}/${crypto.randomUUID()}.${extension}`;
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
        .eq('id', this.user.uid);
      if (profileError) {
        throw profileError;
      }
      this.avatarUrl = data.publicUrl;
      this.successMessage = 'Foto de perfil actualizada.';
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudo subir la foto de perfil.');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.signOut();
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudo cerrar la sesión.');
    }
  }

  async openRooms(): Promise<void> {
    await this.router.navigateByUrl('/rooms');
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
    this.avatarUrl = profile.avatar_url;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }
}
