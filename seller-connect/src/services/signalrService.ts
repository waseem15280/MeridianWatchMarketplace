import * as signalR from '@microsoft/signalr';
import { ChatMessage, MobileInquiryNotification } from '../types';

export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private serverUrl: string;

  constructor(serverUrl?: string) {
    if (serverUrl) {
      this.serverUrl = serverUrl;
      return;
    }

    // Safely check for browser environment without throwing in React Native (Android/iOS)
    if (
      typeof window !== 'undefined' &&
      typeof window.location !== 'undefined' &&
      window.location &&
      window.location.origin
    ) {
      this.serverUrl = window.location.origin.includes('localhost')
        ? 'http://192.168.1.33:5000'
        : window.location.origin;
    } else {
      // In React Native mobile environment: default to current dev machine LAN IP
      this.serverUrl = 'http://192.168.1.33:5000';
    }
  }

  public getServerUrl(): string {
    return this.serverUrl;
  }

  public setServerUrl(url: string): void {
    this.serverUrl = url;
  }

  public async startConnection(
    sellerId: string | number,
    onNewInquiry: (notification: MobileInquiryNotification) => void,
    onReceiveMessage: (message: ChatMessage) => void
  ): Promise<boolean> {
    try {
      if (this.hubConnection) {
        try {
          await this.hubConnection.stop();
        } catch {}
      }

      const hubUrl = `${this.serverUrl}/hubs/chat`;
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .build();

      this.hubConnection.on('NewInquiryAlert', (notif: MobileInquiryNotification) => {
        onNewInquiry(notif);
      });

      this.hubConnection.on('ReceiveMessage', (msg: ChatMessage) => {
        onReceiveMessage(msg);
      });

      await this.hubConnection.start();
      await this.hubConnection.invoke('RegisterSeller', String(sellerId));
      return true;
    } catch (err) {
      console.warn('SignalR mobile connection note (local fallback active):', err);
      return false;
    }
  }

  public async joinConversation(conversationId: string): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('JoinConversation', conversationId);
      } catch (e) {
        console.warn('JoinConversation error:', e);
      }
    }
  }

  public async sendMessage(message: ChatMessage): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('SendMessage', message);
      } catch (e) {
        console.warn('SignalR sendMessage error:', e);
      }
    }

    // Also attempt REST fallback
    try {
      await fetch(`${this.serverUrl}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    } catch {}
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch(() => {});
      this.hubConnection = null;
    }
  }
}

export const signalRService = new SignalRService();
