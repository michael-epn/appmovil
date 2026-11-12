import { Injectable } from '@angular/core';
import { Motion } from '@capacitor/motion';
import type { PluginListenerHandle } from '@capacitor/core';

export interface Aceleracion {
  x: number;
  y: number;
  z: number;
}

@Injectable({
  providedIn: 'root'
})
export class SensorService {

  private listener?: PluginListenerHandle;

  async iniciar(
    callback: (data: Aceleracion) => void
  ): Promise<void> {

    await this.detener();

    // Solicitar permiso en plataformas que lo requieren,
    // como Safari en iOS.
    if (
      typeof window !== 'undefined' &&
      typeof DeviceMotionEvent !== 'undefined'
    ) {
      const MotionEventWithPermission =
        DeviceMotionEvent as typeof DeviceMotionEvent & {
          requestPermission?: () => Promise<'granted' | 'denied'>;
        };

      if (
        typeof MotionEventWithPermission.requestPermission === 'function'
      ) {
        const permission =
          await MotionEventWithPermission.requestPermission();

        if (permission !== 'granted') {
          throw new Error('Permiso de movimiento denegado');
        }
      }
    }

    this.listener = await Motion.addListener(
      'accel',
      (event) => {

        const data: Aceleracion = {
          x: event.acceleration.x ?? 0,
          y: event.acceleration.y ?? 0,
          z: event.acceleration.z ?? 0
        };

        callback(data);

      }
    );

  }

  async detener(): Promise<void> {

    if (this.listener) {
      await this.listener.remove();
      this.listener = undefined;
    }

  }

}