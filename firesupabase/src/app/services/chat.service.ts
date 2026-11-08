import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from '@angular/fire/firestore';
import { type Observable } from 'rxjs';

import { type Message, type MessageLocation, type Room } from '../models/chat.models';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly firestore = inject(Firestore);

  listenRooms(): Observable<Room[]> {
    const rooms = collection(this.firestore, 'rooms');
    return collectionData(query(rooms, orderBy('createdAt', 'desc')), { idField: 'id' }) as Observable<Room[]>;
  }

  async createRoom(name: string, description: string, createdBy: string): Promise<string> {
    const rooms = collection(this.firestore, 'rooms');
    const room = doc(rooms);
    await setDoc(room, {
      id: room.id,
      name: name.trim(),
      description: description.trim(),
      createdBy,
      createdAt: serverTimestamp(),
    });
    return room.id;
  }

  listenMessages(roomId: string): Observable<Message[]> {
    const messages = collection(this.firestore, `rooms/${roomId}/messages`);
    return collectionData(query(messages, orderBy('createdAt', 'asc')), { idField: 'id' }) as Observable<Message[]>;
  }

  sendMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    text: string,
    fileUrl: string | null = null,
    location: MessageLocation | null = null,
  ): Promise<void> {
    const messages = collection(this.firestore, `rooms/${roomId}/messages`);
    return addDoc(messages, {
      senderId,
      senderName,
      text: text.trim(),
      fileUrl,
      location,
      reactions: {},
      edited: false,
      readBy: [senderId],
      createdAt: serverTimestamp(),
    }).then(() => undefined);
  }
}
