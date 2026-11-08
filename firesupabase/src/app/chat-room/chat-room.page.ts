import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly chatService = inject(ChatService);

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

  async goBack(): Promise<void> {
    await this.router.navigateByUrl('/rooms');
  }
}
