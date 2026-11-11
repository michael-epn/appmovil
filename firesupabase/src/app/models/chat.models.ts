import { type Timestamp } from '@angular/fire/firestore';

export interface Room {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Timestamp | null;
}

export interface MessageLocation {
  latitude: number;
  longitude: number;
}

export type MessageType = 'text' | 'image' | 'file' | 'location';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  text: string;
  fileUrl: string | null;
  fileName: string | null;
  location: MessageLocation | null;
  lat: number | null;
  lng: number | null;
  reactions?: Record<string, string[]>;
  edited: boolean;
  readBy?: string[];
  createdAt: Timestamp | null;
}
