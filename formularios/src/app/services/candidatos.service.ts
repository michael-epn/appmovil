import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { Candidato } from '../models/candidato';
import { FIRESTORE } from './firestore.token';

@Injectable({ providedIn: 'root' })
export class CandidatosService {
  private readonly firestore = inject(FIRESTORE);

  async agregarCandidato(candidato: Candidato): Promise<void> {
    await addDoc(collection(this.firestore, 'candidatos'), {
      ...candidato,
      creadoEn: serverTimestamp()
    });
  }

  async obtenerCandidatos(): Promise<Candidato[]> {
    const snapshot = await getDocs(collection(this.firestore, 'candidatos'));
    return snapshot.docs.map(documento => documento.data() as Candidato);
  }
}
