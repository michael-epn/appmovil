import { Injectable } from '@angular/core';
import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

import { environment } from '../../environments/environment';

export interface RoomPresence {
  user: string;
  typing: boolean;
}

export interface RoomPresenceSummary {
  onlineCount: number;
  typingUsers: string[];
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  readonly client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);
  readonly communityOnlineIds$ = new BehaviorSubject<ReadonlySet<string>>(new Set());

  async uploadChatFile(path: string, file: Blob, contentType: string): Promise<string> {
    const { error } = await this.client.storage.from('chat-files').upload(path, file, {
      contentType,
      upsert: false,
    });
    if (error) {
      throw error;
    }

    return this.client.storage.from('chat-files').getPublicUrl(path).data.publicUrl;
  }

  joinRoomPresence(
    roomId: string,
    userId: string,
    username: string,
    onUpdate: (presence: RoomPresenceSummary) => void,
    onError: (error: Error) => void,
  ): RealtimeChannel {
    const channel = this.client.channel(`room_${roomId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<RoomPresence>();
        const typingUsers = Object.entries(state).flatMap(([key, presences]) =>
          key !== userId ? presences.filter((presence) => presence.typing).map((presence) => presence.user) : [],
        );
        onUpdate({
          onlineCount: Object.keys(state).length,
          typingUsers: [...new Set(typingUsers)],
        });
      })
      .subscribe((status, error) => {
        if (error || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          onError(error ?? new Error(`No se pudo conectar al canal de presencia: ${status}`));
          return;
        }
        if (status === 'SUBSCRIBED') {
          void this.trackPresence(channel, username, false).catch(onError);
        }
      });

    return channel;
  }

  async trackPresence(channel: RealtimeChannel, username: string, typing: boolean): Promise<void> {
    const status = await channel.track({ user: username, typing });
    if (status !== 'ok') {
      throw new Error(`No se pudo actualizar la presencia: ${status}`);
    }
  }

  async removeRoomPresence(channel: RealtimeChannel): Promise<void> {
    const status = await this.client.removeChannel(channel);
    if (status !== 'ok') {
      throw new Error(`No se pudo salir del canal de presencia: ${status}`);
    }
  }

  joinCommunityPresence(userId: string, username: string, onError: (error: Error) => void): RealtimeChannel {
    const channel = this.client.channel('community_presence', {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        this.communityOnlineIds$.next(new Set(Object.keys(channel.presenceState())));
      })
      .subscribe((status, error) => {
        if (error || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          onError(error ?? new Error(`No se pudo conectar al canal de comunidad: ${status}`));
          return;
        }
        if (status === 'SUBSCRIBED') {
          void this.trackPresence(channel, username, false).catch(onError);
        }
      });

    return channel;
  }
}
