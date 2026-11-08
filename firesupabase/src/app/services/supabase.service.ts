import { Injectable } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  readonly client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);

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
}
