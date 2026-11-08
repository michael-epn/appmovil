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

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  fileUrl: string | null;
  location: MessageLocation | null;
  reactions: Record<string, string[]>;
  edited: boolean;
  readBy: string[];
  createdAt: Timestamp | null;
}
