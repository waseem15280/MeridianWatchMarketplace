import * as signalR from '@microsoft/signalr';
import Constants from 'expo-constants';
import { NativeModules } from 'react-native';
import {
  ChatMessage,
  ChatConversation,
  MobileInquiryNotification,
  LoginResponse
} from '../types';

function resolveDevHostUrl(): string {
  // 1. Extract current PC LAN IP dynamically from Expo Metro hostUri (e.g. "192.168.1.37:8081")
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (typeof hostUri === 'string' && hostUri.length > 0) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:3000`;
    }
  }

  // 2. Fallback: extract host from React Native bundle scriptURL
  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  if (typeof scriptURL === 'string' && scriptURL.startsWith('http')) {
    const match = scriptURL.match(/^https?:\/\/([^/:]+)/);
    if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
      return `http://${match[1]}:3000`;
    }
  }

  // 3. Final fallback
  return typeof __DEV__ !== 'undefined' && __DEV__
    ? 'http://192.168.1.37:3000'
    : 'https://thcwatches.com';
}

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
        ? resolveDevHostUrl()
        : window.location.origin;
    } else {
      // In React Native mobile environment: resolve current dev machine LAN IP dynamically
      this.serverUrl = resolveDevHostUrl();
    }
  }

  public getServerUrl(): string {
    return this.serverUrl;
  }

  public setServerUrl(url: string): void {
    this.serverUrl = url;
  }

  // Authenticate seller user against backend UserManagement API
  public async login(usernameOrEmail: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${this.serverUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Login failed with status ${res.status}`);
    }

    return await res.json();
  }

  // Load conversations specifically for this logged-in seller
  public async fetchConversations(sellerId: string | number): Promise<ChatConversation[]> {
    try {
      const res = await fetch(`${this.serverUrl}/api/chat/conversations?sellerId=${sellerId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.warn('fetchConversations error:', e);
      return [];
    }
  }

  // Load mobile push notifications specifically for this logged-in seller
  public async fetchNotifications(sellerId: string | number): Promise<MobileInquiryNotification[]> {
    try {
      const res = await fetch(`${this.serverUrl}/api/chat/notifications?sellerId=${sellerId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.warn('fetchNotifications error:', e);
      return [];
    }
  }

  // Load messages for a given conversation
  public async fetchMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`${this.serverUrl}/api/chat/messages?conversationId=${encodeURIComponent(conversationId)}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.warn('fetchMessages error:', e);
      return [];
    }
  }

  // Mark all buyer messages in a conversation as read on the backend
  public async markConversationRead(conversationId: string): Promise<void> {
    try {
      await fetch(
        `${this.serverUrl}/api/chat/conversations/${encodeURIComponent(conversationId)}/read?reader=seller`,
        { method: 'POST' }
      );
    } catch {}
  }

  // Delete one or more conversations and their chat history on the backend
  public async deleteConversations(conversationIds: string[]): Promise<void> {
    if (!conversationIds || conversationIds.length === 0) return;
    try {
      await fetch(`${this.serverUrl}/api/chat/conversations/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversationIds)
      });
    } catch {}
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
      // Register this mobile connection exclusively to this seller's channel
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

    // Also attempt REST fallback to ensure persistence
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
