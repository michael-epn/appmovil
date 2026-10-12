import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton,
  IonList, IonText, IonCard, IonCardContent
} from '@ionic/angular';
import { DatosService } from '../services/datos';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonButton,
    IonList, IonText, IonCard, IonCardContent
  ]
})
export class Tab1Page {
  datosService = inject(DatosService);
  private router = inject(Router);

  irAlCarrito(): void {
    if (!this.datosService.cedula().trim()) {
      alert('Por favor ingrese su cédula.');
      return;
    }
    if (this.datosService.productosEnCarrito().length === 0) {
      alert('Debe agregar al menos un producto.');
      return;
    }
    this.router.navigate(['/tabs/tab2']);
  }
}