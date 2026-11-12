import { Component, OnDestroy, NgZone, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonButton, IonProgressBar, IonBadge, IonChip
} from '@ionic/angular';
import { SensorService, Aceleracion } from '../services/sensor';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonProgressBar, IonBadge, IonChip, DecimalPipe]
})
export class HomePage implements OnDestroy {
  private readonly sensor = inject(SensorService);
  private readonly zone = inject(NgZone);
  x = 0; y = 0; z = 0;
  magnitud = 0;
  movimientos = 0;
  activo = false;
  estado = 'Sensor detenido';
  private ultimoMovimiento = 0;

  async iniciarSensor(): Promise<void> {
    try {
      await this.sensor.iniciar((data: Aceleracion) => {
        this.zone.run(() => {
          this.x = data.x;
          this.y = data.y;
          this.z = data.z;
          this.calcularMagnitud();
        });
      });
      this.activo = true;
      this.estado = 'Sensor activo';
    } catch (error) {
      console.error('No se pudo iniciar el acelerómetro:', error);
      this.activo = false;
      this.estado = 'Sensor no disponible o permiso denegado';
    }
  }

  async detenerSensor(): Promise<void> {
    await this.sensor.detener();
    this.activo = false;
    this.estado = 'Sensor detenido';
  }

  calcularMagnitud(): void {
    this.magnitud = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    const ahora = Date.now();
    if (this.magnitud > 15 && ahora - this.ultimoMovimiento > 700) {
      this.movimientos++;
      this.ultimoMovimiento = ahora;
    }
  }

  obtenerProgreso(valor: number): number {
    return Math.min(Math.abs(valor) / 20, 1);
  }

  detectarInclinacion(): string {
    if (this.x > 5) return 'Inclinación en X positivo';
    if (this.x < -5) return 'Inclinación en X negativo';
    if (this.y > 5) return 'Inclinación en Y positivo';
    if (this.y < -5) return 'Inclinación en Y negativo';
    return 'Sin inclinación predominante';
  }

  reiniciarContador(): void {
    this.movimientos = 0;
    this.ultimoMovimiento = 0;
  }

  ngOnDestroy(): void { void this.sensor.detener(); }
}
