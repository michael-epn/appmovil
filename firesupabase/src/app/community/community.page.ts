import { Component, inject, signal, type OnDestroy } from '@angular/core';
import {
  IonAvatar,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { peopleOutline } from 'ionicons/icons';
import { type Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

interface CommunityProfile {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

@Component({
  selector: 'app-community',
  templateUrl: './community.page.html',
  styleUrl: './community.page.scss',
  imports: [IonAvatar, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonTitle, IonToolbar],
})
export class CommunityPage implements OnDestroy {
  private readonly supabase = inject(SupabaseService);
  private readonly authService = inject(AuthService);
  private onlineSubscription?: Subscription;

  readonly profiles = signal<CommunityProfile[]>([]);
  readonly onlineIds = signal<ReadonlySet<string>>(new Set());
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  constructor() {
    addIcons({ peopleOutline });
  }

  ionViewWillEnter(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.onlineSubscription ??= this.supabase.communityOnlineIds$.subscribe((ids) => {
      this.onlineIds.set(ids);
    });
    void this.loadProfiles();
  }

  ngOnDestroy(): void {
    this.onlineSubscription?.unsubscribe();
  }

  isOnline(profileId: string): boolean {
    return this.onlineIds().has(profileId);
  }

  initials(profile: CommunityProfile): string {
    const name = profile.username || profile.email;
    return name
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toLocaleUpperCase())
      .join('');
  }

  private async loadProfiles(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');
    try {
      const user = await this.authService.getCurrentUser();
      if (!user) {
        this.profiles.set([]);
        return;
      }
      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('id, email, username, avatar_url, bio')
        .order('username', { ascending: true });
      if (error) {
        throw error;
      }
      this.profiles.set(data ?? []);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo cargar la comunidad.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
