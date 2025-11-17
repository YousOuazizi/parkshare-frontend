import { Injectable, inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, fromEvent } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Notification } from '../models';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private authService = inject(AuthService);
  private socket: Socket | null = null;
  private connectedSignal = signal<boolean>(false);

  isConnected = this.connectedSignal.asReadonly();

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = this.authService.getAccessToken();
    if (!token) {
      console.warn('No auth token available for WebSocket connection');
      return;
    }

    this.socket = io(environment.wsUrl, {
      auth: {
        token
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connectedSignal.set(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.connectedSignal.set(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.connectedSignal.set(false);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectedSignal.set(false);
    }
  }

  /**
   * Listen to notification events
   */
  onNotification(): Observable<Notification> {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    return fromEvent<Notification>(this.socket, 'notification');
  }

  /**
   * Listen to booking update events
   */
  onBookingUpdate(): Observable<any> {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    return fromEvent(this.socket, 'booking_update');
  }

  /**
   * Listen to parking update events
   */
  onParkingUpdate(): Observable<any> {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    return fromEvent(this.socket, 'parking_update');
  }

  /**
   * Listen to message events
   */
  onMessage(): Observable<any> {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    return fromEvent(this.socket, 'receive_message');
  }

  /**
   * Send message
   */
  sendMessage(recipientId: string, content: string, bookingId?: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('send_message', {
      recipientId,
      content,
      bookingId
    });
  }

  /**
   * Emit custom event
   */
  emit(event: string, data: any): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    this.socket.emit(event, data);
  }

  /**
   * Listen to custom event
   */
  on<T = any>(event: string): Observable<T> {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    return fromEvent<T>(this.socket, event);
  }
}
