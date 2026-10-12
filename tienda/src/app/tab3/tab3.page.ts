import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonList, IonItem, IonLabel
} from '@ionic/angular';
import { DatosService } from '../services/datos';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonList, IonItem, IonLabel
  ]
})
export class Tab3Page {
  datosService = inject(DatosService);
  private router = inject(Router);

  reiniciarCompra(): void {
    this.datosService.reiniciar();
    this.router.navigate(['/tabs/tab1']);
  }
}