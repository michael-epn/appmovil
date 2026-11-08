import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, type ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonSearchbar,
  IonTextarea,
  IonTitle,
  IonToolbar,
  ActionSheetController,
  AlertController,
} from '@ionic/angular';
import { type RealtimeChannel } from '@supabase/supabase-js';
import { type User } from 'firebase/auth';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  checkmarkDoneOutline,
  documentTextOutline,
  imageOutline,
  locationOutline,
  send,
} from 'ionicons/icons';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  map,
  of,
  startWith,
  switchMap,
  type Subscription,
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
    DatePipe,
    ReactiveFormsModule,
    IonButton,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonSearchbar,
    IonTextarea,
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
  private readonly actionSheetController = inject(ActionSheetController);
  private readonly alertController = inject(AlertController);

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
  onlineCount = 0;
  typingUsers: string[] = [];
  currentUser: User | null = null;
  readonly reactionEmojis = ['👍', '❤️', '😂'];
  private presenceChannel?: RealtimeChannel;
  private readSubscription?: Subscription;
  private typingTimer?: ReturnType<typeof setTimeout>;
  private messagePressTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    addIcons({ addCircleOutline, checkmarkDoneOutline, documentTextOutline, imageOutline, locationOutline, send });
  }

  async ionViewWillEnter(): Promise<void> {
    try {
      const { roomId, user } = await this.getChatContext();
      this.currentUser = user;
      const username = user.displayName ?? user.email ?? 'Usuario';
      this.presenceChannel = this.supabase.joinRoomPresence(
        roomId,
        user.uid,
        username,
        ({ onlineCount, typingUsers }) => {
          this.onlineCount = onlineCount;
          this.typingUsers = typingUsers;
        },
        (error) => {
          this.errorMessage = this.getErrorMessage(error, 'No se pudo actualizar la presencia.');
        },
      );
      this.readSubscription = this.messages$.subscribe((messages) => {
        for (const message of messages) {
          if (message.senderId !== user.uid && !message.readBy?.includes(user.uid)) {
            void this.chatService.markMessageRead(roomId, message.id, user.uid).catch((error: unknown) => {
              this.errorMessage = this.getErrorMessage(error, 'No se pudo marcar el mensaje como leído.');
            });
          }
        }
      });
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudo conectar a la sala.');
    }
  }

  ionViewWillLeave(): void {
    this.readSubscription?.unsubscribe();
    this.readSubscription = undefined;
    if (this.presenceChannel) {
      void this.supabase.removeRoomPresence(this.presenceChannel).catch((error: unknown) => {
        this.errorMessage = this.getErrorMessage(error, 'No se pudo salir del canal de presencia.');
      });
      this.presenceChannel = undefined;
    }
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    if (this.messagePressTimer) {
      clearTimeout(this.messagePressTimer);
    }
  }

  onMessageInput(value: string | null | undefined): void {
    if (!this.presenceChannel || !this.currentUser) {
      return;
    }
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    void this.supabase
      .trackPresence(
        this.presenceChannel,
        this.currentUser.displayName ?? this.currentUser.email ?? 'Usuario',
        !!value?.trim(),
      )
      .catch((error: unknown) => {
        this.errorMessage = this.getErrorMessage(error, 'No se pudo actualizar el estado de escritura.');
      });
    this.typingTimer = setTimeout(() => {
      if (this.presenceChannel && this.currentUser) {
        void this.supabase
          .trackPresence(
            this.presenceChannel,
            this.currentUser.displayName ?? this.currentUser.email ?? 'Usuario',
            false,
          )
          .catch((error: unknown) => {
            this.errorMessage = this.getErrorMessage(error, 'No se pudo actualizar el estado de escritura.');
          });
      }
    }, 1200);
  }

  startMessagePress(message: Message): void {
    this.cancelMessagePress();
    if (message.senderId !== this.currentUser?.uid) {
      return;
    }
    this.messagePressTimer = setTimeout(() => {
      void this.openMessageActions(message);
      this.messagePressTimer = undefined;
    }, 500);
  }

  cancelMessagePress(): void {
    if (this.messagePressTimer) {
      clearTimeout(this.messagePressTimer);
      this.messagePressTimer = undefined;
    }
  }

  async reactToMessage(message: Message, emoji: string): Promise<void> {
    if (!this.currentUser) {
      return;
    }
    try {
      const roomId = await firstValueFrom(this.roomId$);
      await this.chatService.toggleReaction(roomId, message, emoji, this.currentUser.uid);
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudo guardar la reacción.');
    }
  }

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

  private async openMessageActions(message: Message): Promise<void> {
    const buttons = [];
    if (message.text) {
      buttons.push({ text: 'Editar', handler: () => void this.editMessage(message) });
    }
    buttons.push(
      { text: 'Eliminar', role: 'destructive', handler: () => void this.deleteMessage(message) },
      { text: 'Cancelar', role: 'cancel' },
    );
    const sheet = await this.actionSheetController.create({
      header: 'Mensaje',
      buttons,
    });
    await sheet.present();
  }

  private async editMessage(message: Message): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Editar mensaje',
      inputs: [{ name: 'text', type: 'textarea', value: message.text, attributes: { maxlength: 2000 } }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (values: { text?: string }) => {
            const text = values.text?.trim();
            if (!text) {
              return false;
            }
            void this.updateMessage(message, text);
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  private async updateMessage(message: Message, text: string): Promise<void> {
    try {
      const roomId = await firstValueFrom(this.roomId$);
      await this.chatService.updateMessageText(roomId, message.id, text);
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudo editar el mensaje.');
    }
  }

  private async deleteMessage(message: Message): Promise<void> {
    try {
      const roomId = await firstValueFrom(this.roomId$);
      await this.chatService.deleteMessage(roomId, message.id);
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error, 'No se pudo eliminar el mensaje.');
    }
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
