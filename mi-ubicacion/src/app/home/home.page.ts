import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonTitle, IonToolbar, IonText } from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';
import { LocationService } from '../services/location';
import { TrackingSessionService } from '../services/tracking-session';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButton, IonText, NgIf
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  private readonly loc = inject(LocationService);
  readonly session = inject(TrackingSessionService);

  readonly latitude = computed(() => this.session.currentLocation()?.latitude ?? null);
  readonly longitude = computed(() => this.session.currentLocation()?.longitude ?? null);

  watchId: string | null = null;
  readonly errorMsg = signal<string | null>(null);

  async ngOnInit() {
    try {
      await this.loc.ensurePermissions();
      await this.obtenerUbicacionActual();
    } catch (e: any) {
      this.errorMsg.set(e?.message ?? 'Permisos de ubicación denegados');
    }
  }

  async obtenerUbicacionActual() {
    try {
      const pos = await this.loc.getCurrentPosition();
      this.session.updateCurrentLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      });
      this.errorMsg.set(null);
    } catch (e: any) {
      this.errorMsg.set(e?.message ?? 'Error al obtener ubicación actual');
    }
  }

  async iniciarSeguimiento() {
    if (this.watchId) return;

    try {
      const position = await this.loc.getCurrentPosition();
      const origin = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      this.session.start(origin);
      this.watchId = await this.loc.watchPosition(
        (pos) => this.session.updateCurrentLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }),
        (err) => this.errorMsg.set(err?.message ?? 'Error en seguimiento')
      );
    } catch (e: any) {
      this.errorMsg.set(e?.message ?? 'No se pudo iniciar el seguimiento');
      await this.detenerSeguimiento();
    }
  }

  async detenerSeguimiento() {
    if (!this.watchId) return;

    const idToClear = this.watchId;
    this.watchId = null;

    try {
      await this.loc.clearWatch(idToClear);

      let destination = this.session.currentLocation();
      try {
        const pos = await this.loc.getCurrentPosition();
        destination = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch {
      }

      if (destination) {
        this.session.stop(destination);
      }
    } catch (e: any) {
      this.errorMsg.set(e?.message ?? 'Error al detener el seguimiento');
    }
  }

  ngOnDestroy() {
    if (this.watchId) {
      this.loc.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}