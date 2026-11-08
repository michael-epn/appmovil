import { Component, inject, type OnDestroy, type OnInit } from '@angular/core';
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
export class CommunityPage implements OnInit, OnDestroy {
  private readonly supabase = inject(SupabaseService);
  private onlineSubscription?: Subscription;

  profiles: CommunityProfile[] = [];
  onlineIds: ReadonlySet<string> = new Set();
  isLoading = true;
  errorMessage = '';

  constructor() {
    addIcons({ peopleOutline });
  }

  ngOnInit(): void {
    this.onlineSubscription = this.supabase.communityOnlineIds$.subscribe((ids) => {
      this.onlineIds = ids;
    });
    void this.loadProfiles();
  }

  ngOnDestroy(): void {
    this.onlineSubscription?.unsubscribe();
  }

  isOnline(profileId: string): boolean {
    return this.onlineIds.has(profileId);
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
    this.errorMessage = '';
    try {
      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('id, email, username, avatar_url, bio')
        .order('username', { ascending: true });
      if (error) {
        throw error;
      }
      this.profiles = data ?? [];
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'No se pudo cargar la comunidad.';
    } finally {
      this.isLoading = false;
    }
  }
}
