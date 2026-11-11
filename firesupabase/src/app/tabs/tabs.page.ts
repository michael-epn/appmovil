import { Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { type RealtimeChannel } from '@supabase/supabase-js';
import { addIcons } from 'ionicons';
import { chatbubblesOutline, peopleOutline, personCircleOutline } from 'ionicons/icons';
import { type Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrl: './tabs.page.scss',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, RouterLink],
})
export class TabsPage implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly supabase = inject(SupabaseService);
  private authSubscription?: Subscription;
  private presenceChannel?: RealtimeChannel;

  constructor() {
    addIcons({ chatbubblesOutline, peopleOutline, personCircleOutline });
  }

  ngOnInit(): void {
    this.authSubscription = this.auth.authState$.subscribe((user) => {
      if (this.presenceChannel) {
        void this.supabase.removeRoomPresence(this.presenceChannel).catch((error: unknown) => {
          console.error('No se pudo cerrar el canal de presencia de comunidad.', error);
        });
        this.presenceChannel = undefined;
      }
      if (!user) {
        return;
      }

      this.presenceChannel = this.supabase.joinCommunityPresence(
        user.uid,
        user.displayName ?? user.email ?? 'Usuario',
        (error) => console.error('Error en la presencia de comunidad.', error),
      );
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    if (this.presenceChannel) {
      void this.supabase.removeRoomPresence(this.presenceChannel).catch((error: unknown) => {
        console.error('No se pudo cerrar el canal de presencia de comunidad.', error);
      });
    }
  }
}
