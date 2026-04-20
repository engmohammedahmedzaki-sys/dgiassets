import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ChatMessage {
  id: string;
  dealId: string;
  senderId: string;
  sender?: { id: string; fullName: string };
  content: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private socket: Socket | null = null;
  private messageSubject = new Subject<ChatMessage>();
  public message$ = this.messageSubject.asObservable();
  private historySubject = new Subject<ChatMessage[]>();
  public history$ = this.historySubject.asObservable();

  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getMessages(dealId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/${dealId}/messages`);
  }

  connect(dealId: string): void {
    const token = this.authService.getToken();
    if (!token) return;

    const wsBase =
      (environment as any).wsUrl ??
      (environment.apiUrl as string).replace('/api', '').replace(/^http/, 'ws');

    this.socket = io(`${wsBase}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.socket?.emit('joinDeal', dealId);
    });

    this.socket.on('history', (msgs: ChatMessage[]) => {
      this.historySubject.next(msgs);
    });

    this.socket.on('newMessage', (msg: ChatMessage) => {
      this.messageSubject.next(msg);
    });
  }

  sendMessage(dealId: string, content: string): void {
    this.socket?.emit('sendMessage', { dealId, content });
  }

  markRead(dealId: string): void {
    this.socket?.emit('markRead', dealId);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
