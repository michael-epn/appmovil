import { inject, Injectable } from '@angular/core';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { Candidato } from '../models/candidato';
import { FIRESTORE } from './firestore.token';

export interface Estudiante {
  nombre: string;
  correo: string;
  edad: number;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private db = inject(FIRESTORE);

  guardarEstudiante(estudiante: Estudiante) {
    return addDoc(collection(this.db, 'estudiantes'), estudiante);
  }

  guardarCandidato(candidato: Candidato) {
    return addDoc(collection(this.db, 'candidatos'), candidato);
  }

  async obtenerEstudiantes(): Promise<(Estudiante & { id: string })[]> {
    const resultado = await getDocs(collection(this.db, 'estudiantes'));
    return resultado.docs.map(doc => ({ id: doc.id, ...(doc.data() as Estudiante) }));
  }
}
