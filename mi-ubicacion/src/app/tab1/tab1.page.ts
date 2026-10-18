import { Component, computed, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonTitle, IonToolbar, IonText } from '@ionic/angular/standalone';
import { LocationService } from '../services/location';
import { Coordinates, TrackingSessionService } from '../services/tracking-session';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButton, IonText, NgIf
  ],
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss']
})

export class Tab1Page {
  readonly session = inject(TrackingSessionService);
  private readonly location = inject(LocationService);

  readonly errorMsg = signal<string | null>(null);
  readonly statusMsg = signal<string | null>(null);

  private readonly targetPoint = computed(() => 
    this.session.destination() ?? this.session.currentLocation()
  );

  readonly routeUrl = computed(() => {
    const origin = this.session.origin();
    const destination = this.targetPoint();
    if (!origin || !destination) return null;

    const params = new URLSearchParams({
      api: '1',
      origin: this.formatCoordinates(origin),
      destination: this.formatCoordinates(destination)
    });

    const waypoints = this.selectWaypoints(this.session.waypoints())
      .map(point => this.formatCoordinates(point));

    if (waypoints.length) params.set('waypoints', waypoints.join('|'));
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  });

  readonly currentLocationUrl = computed(() => {
    const loc = this.session.currentLocation();
    if (!loc) return null;
    return `https://www.google.com/maps/search/?api=1&query=${this.formatCoordinates(loc)}`;
  });

  async ionViewWillEnter(): Promise<void> {
    if (!this.session.currentLocation()) {
      await this.actualizarUbicacionActual();
    }
  }

  async actualizarUbicacionActual(): Promise<void> {
    try {
      await this.location.ensurePermissions();
      const position = await this.location.getCurrentPosition();
      this.session.updateCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      this.errorMsg.set(null);
    } catch (error: unknown) {
      this.errorMsg.set(error instanceof Error ? error.message : 'No se pudo obtener la ubicación actual');
    }
  }

  async guardarArchivo(): Promise<void> {
    this.errorMsg.set(null);
    this.statusMsg.set(null);

    const routeUrl = this.routeUrl();
    const currentLocationUrl = this.currentLocationUrl();
    const origin = this.session.origin();
    const destination = this.targetPoint();
    const currentLocation = this.session.currentLocation();

    if (!origin || !destination || !currentLocation || !routeUrl || !currentLocationUrl) {
      this.errorMsg.set('No hay datos suficientes de la ruta para guardar.');
      return;
    }

    try {
      const contents = [
        'Ruta de seguimiento',
        `Origen: ${this.formatCoordinates(origin)}`,
        `Destino: ${this.formatCoordinates(destination)}`,
        `Enlace de la ruta: ${routeUrl}`,
        '',
        `Ubicación actual: ${this.formatCoordinates(currentLocation)}`,
        `Enlace a mi ubicación actual: ${currentLocationUrl}`
      ].join('\n');

      if (Capacitor.isNativePlatform()) {
        const result = await Filesystem.writeFile({
          path: 'ubicacion-ruta.txt',
          data: contents,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true
        });
        this.statusMsg.set(`Archivo guardado: ${result.uri}`);
      } else {
        const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' });
        const fileUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = 'ubicacion-ruta.txt';
        link.click();
        URL.revokeObjectURL(fileUrl);
        this.statusMsg.set('Se descargó el archivo ubicacion-ruta.txt.');
      }
      
      setTimeout(() => {
        this.statusMsg.set(null);
      }, 3000);

    } catch (error: unknown) {
      this.errorMsg.set(error instanceof Error ? error.message : 'No se pudo guardar el archivo TXT');
    }
  }

  private formatCoordinates(c: Coordinates): string {
    return `${c.latitude},${c.longitude}`;
  }

  private selectWaypoints(points: Coordinates[]): Coordinates[] {
    const max = 3;
    if (points.length <= max) return points;
    return Array.from({ length: max }, (_, i) => {
      const idx = Math.round((i + 1) * (points.length - 1) / (max + 1));
      return points[idx];
    });
  }
}