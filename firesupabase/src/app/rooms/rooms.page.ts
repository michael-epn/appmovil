import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  IonAvatar,
  IonBadge,
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, chatbubblesOutline } from 'ionicons/icons';
import {
  catchError,
  combineLatest,
  debounceTime,
  firstValueFrom,
  map,
  of,
  startWith,
  tap,
  type Observable,
} from 'rxjs';

import { type Room } from '../models/chat.models';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.page.html',
  styleUrl: './rooms.page.scss',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    IonAvatar,
    IonBadge,
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonSearchbar,
    IonSkeletonText,
    IonTitle,
    IonToolbar,
  ],
})
export class RoomsPage {
  private readonly chatService = inject(ChatService);
  private readonly authService = inject(AuthService);
  private readonly alertController = inject(AlertController);
  private readonly router = inject(Router);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly rooms$: Observable<Room[]> = this.chatService.listenRooms().pipe(
    tap(() => {
      this.isLoading = false;
    }),
    catchError((error: unknown) => {
      this.errorMessage = error instanceof Error ? error.message : 'No se pudieron cargar las salas.';
      this.isLoading = false;
      return of([]);
    }),
  );
  readonly filteredRooms$: Observable<Room[]> = combineLatest([
    this.rooms$,
    this.searchControl.valueChanges.pipe(startWith(this.searchControl.value), debounceTime(250)),
  ]).pipe(
    map(([rooms, term]) => {
      const searchTerm = term.trim().toLocaleLowerCase();
      return searchTerm ? rooms.filter((room) => room.name.toLocaleLowerCase().includes(searchTerm)) : rooms;
    }),
  );
  errorMessage = '';
  isLoading = true;

  constructor() {
    addIcons({ addOutline, chatbubblesOutline });
  }

  async openCreateRoomAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Crear sala',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nombre de la sala', attributes: { maxlength: 80 } },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Descripción (opcional)',
          attributes: { maxlength: 300 },
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (values: { name?: string; description?: string }) =>
            this.createRoom(values.name ?? '', values.description ?? ''),
        },
      ],
    });
    await alert.present();
  }

  async openRoom(roomId: string): Promise<void> {
    await this.router.navigate(['/rooms', roomId]);
  }

  private async createRoom(name: string, description: string): Promise<boolean> {
    this.errorMessage = '';
    const user = await firstValueFrom(this.authService.authState$);
    if (!user) {
      this.errorMessage = 'Inicia sesión para crear una sala.';
      return false;
    }
    if (!name.trim()) {
      this.errorMessage = 'El nombre de la sala es obligatorio.';
      return false;
    }

    try {
      await this.chatService.createRoom(name, description, user.uid);
      return true;
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'No se pudo crear la sala.';
      return false;
    }
  }
}
