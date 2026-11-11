import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { Timestamp } from 'firebase/firestore';
import { Candidato } from '../models/candidato';
import { CandidatosService } from '../services/candidatos.service';

@Component({
  selector: 'app-candidatos',
  standalone: true,
  templateUrl: './candidatos.page.html',
  styleUrls: ['./candidatos.page.scss'],
  imports: [
    CommonModule,
    RouterLink,
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonSpinner,
    IonTitle,
    IonToolbar
  ]
})
export class CandidatosPage implements OnInit {
  private readonly candidatosService = inject(CandidatosService);

  readonly candidatos = signal<Candidato[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      this.candidatos.set(await this.candidatosService.obtenerCandidatos());
    } catch (error) {
      console.error(error);
      this.error.set(
        'No se pudieron cargar los candidatos. Revisa la conexión y los permisos de Firestore.'
      );
    } finally {
      this.cargando.set(false);
    }
  }

  formatearFecha(valor: string | Date | Timestamp | any): string {
    if (!valor) return '';
    if (typeof valor === 'string') {
      const fechaCorta = valor.split('T')[0];
      const partes = fechaCorta.split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      const fechaFallback = new Date(valor);
      if (isNaN(fechaFallback.getTime())) {
        return valor;
      }
      valor = fechaFallback;
    }

    let fechaDate: Date;

    if (valor && typeof valor.toDate === 'function') {
      fechaDate = valor.toDate();
    } else if (valor instanceof Date) {
      fechaDate = valor;
    } else {
      return String(valor);
    }
    const dia = fechaDate.getDate().toString().padStart(2, '0');
    const mes = (fechaDate.getMonth() + 1).toString().padStart(2, '0');
    const anio = fechaDate.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }
}
