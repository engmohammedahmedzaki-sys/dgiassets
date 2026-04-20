import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  meta: Record<string, any> | null;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private socket: Socket | null = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  get unreadCount(): number {
    return this.notificationsSubject.value.filter((n) => !n.isRead).length;
  }

  loadNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.apiUrl).pipe(
      tap((ns) => this.notificationsSubject.next(ns)),
    );
  }

  markAllRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        const updated = this.notificationsSubject.value.map((n) => ({
          ...n,
          isRead: true,
        }));
        this.notificationsSubject.next(updated);
      }),
    );
  }

  connectRealtime(): void {
    const token = this.authService.getToken();
    if (!token || this.socket) return;

    const wsBase =
      (environment as any).wsUrl ??
      (environment.apiUrl as string).replace('/api', '').replace(/^http/, 'ws');

    this.socket = io(`${wsBase}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('notification', (data: AppNotification) => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([data, ...current]);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
