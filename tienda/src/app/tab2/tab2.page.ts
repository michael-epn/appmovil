import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent
} from '@ionic/angular';
import { DatosService } from '../services/datos';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonButton,
    IonGrid, IonRow, IonCol, IonCard, IonCardContent
  ]
})
export class Tab2Page {
  datosService = inject(DatosService);
  private router = inject(Router);

  pagar(): void {
    const monto = this.datosService.montoPago();
    const total = this.datosService.totalFinal();

    if (monto < total) {
      alert(`Monto insuficiente. El total a pagar es $${total.toFixed(2)}`);
      return;
    }
    this.router.navigate(['/tabs/tab3']);
  }
}