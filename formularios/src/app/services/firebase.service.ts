import { Injectable } from '@angular/core';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { addDoc, collection, getDocs, getFirestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

export interface Estudiante {
  nombre: string;
  correo: string;
  edad: number;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private app = getApps().length ? getApp() : initializeApp(environment.firebase);
  private db = getFirestore(this.app);

  guardarEstudiante(estudiante: Estudiante) {
    return addDoc(collection(this.db, 'estudiantes'), estudiante);
  }

  async obtenerEstudiantes(): Promise<(Estudiante & { id: string })[]> {
    const resultado = await getDocs(collection(this.db, 'estudiantes'));
    return resultado.docs.map(doc => ({ id: doc.id, ...(doc.data() as Estudiante) }));
  }
}
