import { Injectable, NgZone, inject } from '@angular/core';
import {
  Firestore,
  type Query,
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { type Message, type MessageLocation, type MessageType, type Room } from '../models/chat.models';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly firestore = inject(Firestore);
  private readonly ngZone = inject(NgZone);

  private collectionToObservable<T>(q: Query): Observable<T[]> {
    return new Observable<T[]>((subscriber) => {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as T[];
          this.ngZone.run(() => subscriber.next(items));
        },
        (error) => {
          this.ngZone.run(() => subscriber.error(error));
        }
      );
      return () => unsubscribe();
    });
  }

  listenRooms(): Observable<Room[]> {
    const roomsCollection = collection(this.firestore, 'rooms');
    const roomsQuery = query(roomsCollection, orderBy('createdAt', 'desc'));
    return this.collectionToObservable<Room>(roomsQuery);
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
    const messagesQuery = query(messages, orderBy('createdAt', 'asc'));
    return this.collectionToObservable<Message>(messagesQuery);
  }

  sendMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    text: string,
    fileUrl: string | null = null,
    location: MessageLocation | null = null,
    type: MessageType = 'text',
    fileName: string | null = null,
  ): Promise<void> {
    const messages = collection(this.firestore, `rooms/${roomId}/messages`);
    return addDoc(messages, {
      senderId,
      senderName,
      type,
      text: text.trim(),
      fileUrl,
      fileName,
      location,
      lat: location?.latitude ?? null,
      lng: location?.longitude ?? null,
      reactions: {},
      edited: false,
      readBy: [senderId],
      createdAt: serverTimestamp(),
    }).then(() => undefined);
  }

  updateMessageText(roomId: string, messageId: string, text: string): Promise<void> {
    const message = doc(this.firestore, `rooms/${roomId}/messages/${messageId}`);
    return updateDoc(message, {
      text: text.trim(),
      edited: true,
    });
  }

  deleteMessage(roomId: string, messageId: string): Promise<void> {
    const message = doc(this.firestore, `rooms/${roomId}/messages/${messageId}`);
    return deleteDoc(message);
  }

  async toggleReaction(roomId: string, message: Message, emoji: string, userId: string): Promise<void> {
    const messageRef = doc(this.firestore, `rooms/${roomId}/messages/${message.id}`);
    const userIds = message.reactions?.[emoji] ?? [];
    const nextUserIds = userIds.includes(userId) ? userIds.filter((id) => id !== userId) : [...userIds, userId];
    await updateDoc(messageRef, {
      [`reactions.${emoji}`]: nextUserIds,
    });
  }

  markMessageRead(roomId: string, messageId: string, userId: string): Promise<void> {
    const message = doc(this.firestore, `rooms/${roomId}/messages/${messageId}`);
    return updateDoc(message, { readBy: arrayUnion(userId) });
  }
}