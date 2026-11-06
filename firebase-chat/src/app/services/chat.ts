import { inject, Injectable } from '@angular/core';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type DocumentReference,
  type Timestamp
} from 'firebase/firestore';
import { Observable } from 'rxjs';

import { FirebaseService } from './firebase';

export interface Message {
  id?: string;
  text: string;
  nickname: string;
  uid: string;
  createdAt?: Timestamp | null;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private firebase = inject(FirebaseService);

  async sendMessage(text: string, nickname: string): Promise<DocumentReference> {

    const uid = this.firebase.getCurrentUid();
    const cleanText = text.trim();
    const cleanNickname = nickname.trim();

    if (!uid) {
      throw new Error('Usuario no conectado');
    }

    if (!cleanText || !cleanNickname) {
      throw new Error('Nombre o mensaje vacío');
    }

    if (cleanText.length > 1000 || cleanNickname.length > 30) {
      throw new Error('Texto demasiado largo');
    }

    return addDoc(
      collection(this.firebase.db, 'messages'),
      {
        text: cleanText,
        nickname: cleanNickname,
        uid,
        createdAt: serverTimestamp()
      }
    );
  }

  getMessages(): Observable<Message[]> {

    return new Observable<Message[]>(observer => {

      const q = query(
        collection(this.firebase.db, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Message));

          observer.next(messages.reverse());
        },
        error => observer.error(error)
      );

      return () => unsubscribe();
    });
  }
}