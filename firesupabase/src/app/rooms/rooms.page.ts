import { Component, computed, inject, signal } from '@angular/core';
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
import { debounceTime, firstValueFrom, startWith, take, type Subscription } from 'rxjs';

import { type Room } from '../models/chat.models';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.page.html',
  styleUrl: './rooms.page.scss',
  imports: [
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
  readonly rooms = signal<Room[]>([]);
  readonly searchTerm = signal('');
  readonly filteredRooms = computed(() => {
    const searchTerm = this.searchTerm().trim().toLocaleLowerCase();
    return searchTerm
      ? this.rooms().filter((room) => room.name.toLocaleLowerCase().includes(searchTerm))
      : this.rooms();
  });
  readonly errorMessage = signal('');
  readonly isLoading = signal(true);
  private roomsSubscription?: Subscription;

  constructor() {
    addIcons({ addOutline, chatbubblesOutline });
    this.searchControl.valueChanges
      .pipe(startWith(this.searchControl.value), debounceTime(250))
      .subscribe((term) => this.searchTerm.set(term));
  }

  async ionViewWillEnter(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.roomsSubscription?.unsubscribe();
    this.roomsSubscription = undefined;

    try {
      const user = await this.authService.getCurrentUser();
      if (!user) {
        this.rooms.set([]);
        await this.router.navigateByUrl('/login', { replaceUrl: true });
        return;
      }

      const rooms$ = this.chatService.listenRooms();
      this.rooms.set(await firstValueFrom(rooms$.pipe(take(1))));
      this.roomsSubscription = rooms$.subscribe({
        next: (rooms) => this.rooms.set(rooms),
        error: (error: unknown) => {
          this.errorMessage.set(error instanceof Error ? error.message : 'No se pudieron cargar las salas.');
        },
      });
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudieron cargar las salas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  ionViewWillLeave(): void {
    this.roomsSubscription?.unsubscribe();
    this.roomsSubscription = undefined;
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
    this.errorMessage.set('');
    if (!name.trim()) {
      this.errorMessage.set('El nombre de la sala es obligatorio.');
      return false;
    }

    try {
      const user = await this.authService.getCurrentUser();
      if (!user) {
        this.errorMessage.set('Inicia sesión para crear una sala.');
        return false;
      }
      await this.chatService.createRoom(name, description, user.uid);
      return true;
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo crear la sala.');
      return false;
    }
  }
}
