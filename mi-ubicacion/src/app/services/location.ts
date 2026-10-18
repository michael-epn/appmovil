import { Injectable } from '@angular/core';
import { Geolocation, PermissionStatus, Position } from '@capacitor/geolocation';

@Injectable({ providedIn: 'root' })
export class LocationService {
  async ensurePermissions() {
    const permissions = await Geolocation.checkPermissions();
    if (permissions.location !== 'granted') {
      const request = await Geolocation.requestPermissions();
      if (request.location !== 'granted') {
        throw new Error('Permisos de ubicación denegados en el dispositivo');
      }
    }
  }

  async getCurrentPosition(): Promise<Position> {
    return Geolocation.getCurrentPosition({ enableHighAccuracy: true });
  }

  async watchPosition(onPos: (p: Position) => void, onErr?: (e: any) => void): Promise<string> {
    const id = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (pos, err) => {
        if (pos) onPos(pos);
        else if (err && onErr) onErr(err);
      }
    );
    // Capacitor v6 devuelve string; en v5 podía ser string|null
    return id as unknown as string;
  }

  async clearWatch(id: string): Promise<void> {
    await Geolocation.clearWatch({ id });
  }
}