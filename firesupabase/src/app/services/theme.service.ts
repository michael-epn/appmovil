import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly preferenceKey = 'dark-mode';

  async initialize(): Promise<boolean> {
    const { value } = await Preferences.get({ key: this.preferenceKey });
    const enabled = value === 'true';
    this.apply(enabled);
    return enabled;
  }

  async setDarkMode(enabled: boolean): Promise<void> {
    await Preferences.set({ key: this.preferenceKey, value: String(enabled) });
    this.apply(enabled);
  }

  private apply(enabled: boolean): void {
    document.documentElement.classList.toggle('ion-palette-dark', enabled);
  }
}
