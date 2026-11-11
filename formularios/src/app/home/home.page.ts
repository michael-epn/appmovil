import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonList, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { FirebaseService, Estudiante } from '../services/firebase.service';

@Component({
  selector: 'app-home', standalone: true, templateUrl: './home.page.html', styleUrls: ['./home.page.scss'],
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonList, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
})
export class HomePage implements OnInit {
  private firebase = inject(FirebaseService);
  nombre = '';
  correo = '';
  edad: number | null = null;
  estudiantes: (Estudiante & { id: string })[] = [];
  guardando = false;
  mensaje = '';

  async ngOnInit() { await this.cargarEstudiantes(); }

  async guardar() {
    if (!this.nombre.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo.trim()) || this.edad === null || !Number.isFinite(Number(this.edad)) || Number(this.edad) <= 0) {
      this.mensaje = 'Ingrese nombre, correo válido y edad mayor a cero.';
      return;
    }
    this.guardando = true;
    this.mensaje = '';
    try {
      await this.firebase.guardarEstudiante({ nombre: this.nombre.trim(), correo: this.correo.trim(), edad: Number(this.edad) });
      this.nombre = ''; this.correo = ''; this.edad = null;
      this.mensaje = 'Estudiante guardado correctamente.';
      await this.cargarEstudiantes();
    } catch (error) {
      console.error(error);
      this.mensaje = 'No se pudo guardar. Revise la configuración y las reglas de Firestore.';
    } finally { this.guardando = false; }
  }

  async cargarEstudiantes() {
    try { this.estudiantes = await this.firebase.obtenerEstudiantes(); }
    catch (error) { console.error(error); this.mensaje = 'No se pudo consultar Firestore. Revise la configuración.'; }
  }
}
