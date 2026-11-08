import { AsyncPipe } from '@angular/common';
import { Component, inject, type ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { type User } from 'firebase/auth';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  map,
  of,
  startWith,
  switchMap,
  type Observable,
} from 'rxjs';

import { type Message } from '../models/chat.models';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.page.html',
  styleUrl: './chat-room.page.scss',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonSearchbar,
    IonTitle,
    IonToolbar,
  ],
})
export class ChatRoomPage {
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly chatService = inject(ChatService);
  private readonly supabase = inject(SupabaseService);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly messageForm = new FormGroup({
    text: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] }),
  });
  readonly roomId$: Observable<string> = this.route.paramMap.pipe(
    map((params) => params.get('roomId') ?? ''),
    distinctUntilChanged(),
  );
  readonly messages$: Observable<Message[]> = this.roomId$.pipe(
    switchMap((roomId) => (roomId ? this.chatService.listenMessages(roomId) : of([]))),
  );
  readonly filteredMessages$: Observable<Message[]> = combineLatest([
    this.messages$,
    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value), debounceTime(250)),
  ]).pipe(
    map(([messages, term]) => {
      const searchTerm = term.trim().toLocaleLowerCase();
      return searchTerm
        ? messages.filter((message) => message.text.toLocaleLowerCase().includes(searchTerm))
        : messages;
    }),
  );
  errorMessage = '';
  isSendingMedia = false;

  async sendMessage(): Promise<void> {
    this.errorMessage = '';
    if (this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }

    try {
      const [roomId, user] = await Promise.all([
        firstValueFrom(this.roomId$),
        firstValueFrom(this.authService.authState$),
      ]);
      if (!user) {
        await this.router.navigateByUrl('/login', { replaceUrl: true });
        return;
      }

      const text = this.messageForm.controls.text.value;
      await this.chatService.sendMessage(roomId, user.uid, user.displayName ?? user.email ?? 'Usuario', text);
      this.messageForm.reset();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'No se pudo enviar el mensaje.';
    }
  }

  async sendImage(): Promise<void> {
    this.errorMessage = '';
    this.isSendingMedia = true;
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.Base64,
      });
      if (!photo.base64String) {
        throw new Error('La cámara no devolvió datos de imagen.');
      }

      const binary = atob(photo.base64String);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }
      const contentType = photo.format ? `image/${photo.format}` : 'image/jpeg';
      const image = new Blob([bytes], { type: contentType });
      const { roomId, user } = await this.getChatContext();
      const path = `${user.uid}/${roomId}/${crypto.randomUUID()}.${photo.format || 'jpg'}`;
      const publicUrl = await this.supabase.uploadChatFile(path, image, contentType);
      await this.chatService.sendMessage(
        roomId,
        user.uid,
        user.displayName ?? user.email ?? 'Usuario',
        '',
        publicUrl,
        null,
        'image',
      );
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudo enviar la imagen.');
    } finally {
      this.isSendingMedia = false;
    }
  }

  async sendFile(event: Event): Promise<void> {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    this.errorMessage = '';
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedTypes = new Set(['pdf', 'docx', 'zip']);
    if (!extension || !allowedTypes.has(extension)) {
      this.errorMessage = 'Solo se permiten archivos PDF, DOCX o ZIP.';
      return;
    }

    this.isSendingMedia = true;
    try {
      const { roomId, user } = await this.getChatContext();
      const path = `${user.uid}/${roomId}/${crypto.randomUUID()}.${extension}`;
      const contentType = file.type || this.getContentType(extension);
      const publicUrl = await this.supabase.uploadChatFile(path, file, contentType);
      await this.chatService.sendMessage(
        roomId,
        user.uid,
        user.displayName ?? user.email ?? 'Usuario',
        '',
        publicUrl,
        null,
        'file',
        file.name,
      );
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudo enviar el archivo.');
    } finally {
      this.isSendingMedia = false;
    }
  }

  async sendLocation(): Promise<void> {
    this.errorMessage = '';
    this.isSendingMedia = true;
    try {
      const position = await Geolocation.getCurrentPosition();
      const { roomId, user } = await this.getChatContext();
      const { latitude, longitude } = position.coords;
      await this.chatService.sendMessage(
        roomId,
        user.uid,
        user.displayName ?? user.email ?? 'Usuario',
        '',
        null,
        { latitude, longitude },
        'location',
      );
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudo compartir la ubicación.');
    } finally {
      this.isSendingMedia = false;
    }
  }

  chooseFile(): void {
    this.fileInput?.nativeElement.click();
  }

  async goBack(): Promise<void> {
    await this.router.navigateByUrl('/rooms');
  }

  private async getChatContext(): Promise<{ roomId: string; user: User }> {
    const [roomId, user] = await Promise.all([
      firstValueFrom(this.roomId$),
      firstValueFrom(this.authService.authState$),
    ]);
    if (!user) {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
      throw new Error('Inicia sesión para enviar mensajes.');
    }
    if (!roomId) {
      throw new Error('No se encontró la sala de chat.');
    }
    return { roomId, user };
  }

  private getContentType(extension: string): string {
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/zip';
    }
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }
}
