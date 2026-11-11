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

  formatearFecha(valor: string | Date | Timestamp): string {
    const fecha =
      valor instanceof Timestamp
        ? valor.toDate()
        : typeof valor === 'string'
          ? new Date(valor)
          : valor;

    return Number.isNaN(fecha.getTime())
      ? String(valor)
      : fecha.toLocaleString();
  }
}
