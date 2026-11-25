import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {
  ChatMessage,
  ChatConversation,
  MobileInquiryNotification,
  UserAccount,
  UserLogin
} from './src/types';
import { INITIAL_CONVERSATIONS } from './src/services/mockData';
import { signalRService } from './src/services/signalrService';

// Configure native mobile notifications so they behave like standard OS app notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

export default function App() {
  // Authentication & Persona State
  const [loggedInUser, setLoggedInUser] = useState<UserLogin | null>(null);
  const [sellerAccounts, setSellerAccounts] = useState<UserAccount[]>([]);
  const [activeSeller, setActiveSeller] = useState<UserAccount | null>(null);
  const [isSelectingPersona, setIsSelectingPersona] = useState(false);

  // Login Form State
  const [usernameInput, setUsernameInput] = useState('geneva_dealer');
  const [passwordInput, setPasswordInput] = useState('password123');
  const [serverUrlInput, setServerUrlInput] = useState(signalRService.getServerUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tab Navigation: 'inquiries' | 'profile'
  const [activeTab, setActiveTab] = useState<'inquiries' | 'profile'>('inquiries');
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const activeConversationRef = useRef<ChatConversation | null>(null);

  // Conversations & Messages State (filtered specifically for activeSeller)
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [activePushBanner, setActivePushBanner] = useState<MobileInquiryNotification | null>(null);
  const recentNotifKeysRef = useRef<Map<string, number>>(new Map());
  const conversationsRef = useRef<ChatConversation[]>([]);
  const readTimestampsRef = useRef<Record<string, number>>({});
  const deletedConvsRef = useRef<Record<string, number>>({});
  const historyLoadedForSellerRef = useRef<string | null>(null);
  const [selectedInquiryIds, setSelectedInquiryIds] = useState<string[]>([]);

  // UPI QR Code State
  interface SavedQrItem {
    id: string;
    label: string;
    imageUri: string;
    createdAt: string;
  }
  const [savedQrs, setSavedQrs] = useState<SavedQrItem[]>([]);
  const [isQrMenuOpen, setIsQrMenuOpen] = useState(false);

  const markConversationAsRead = async (
    sellerId: string,
    conversationId: string,
    timestampMs: number
  ) => {
    const prevTs = readTimestampsRef.current[conversationId] || 0;
    const nextTs = Math.max(prevTs, timestampMs);
    readTimestampsRef.current[conversationId] = nextTs;
    try {
      await AsyncStorage.setItem(
        `seller_read_timestamps_${sellerId}`,
        JSON.stringify(readTimestampsRef.current)
      );
    } catch {}
    signalRService.markConversationRead(conversationId);
  };

  // Chat Input State
  const [replyText, setReplyText] = useState('');
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const scrollViewRef = useRef<any>(null);

  // Unread Counts
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCountSeller, 0);

  // Keep refs synced with latest state for SignalR & notification callbacks
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Request OS notification permissions & handle tapping a system notification
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

    (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          await Notifications.requestPermissionsAsync();
        }
        // Custom notification channels are only needed in standalone/dev-client builds (Expo Go throws NPE on SDK 58 Android)
        if (Platform.OS === 'android' && !isExpoGo) {
          await Notifications.setNotificationChannelAsync('seller-inquiries', {
            name: 'Buyer Inquiries',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#C5A880'
          });
        }
      } catch {
        // Ignore in restricted Expo Go environments
      }
    })();

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const convId = response.notification.request.content.data?.conversationId as string | undefined;
      if (convId) {
        const matched = conversationsRef.current.find((c) => c.id === convId);
        if (matched) {
          handleOpenConversation(matched);
        }
      }
    });

    return () => sub.remove();
  }, []);

  const triggerMobileNotification = async (notif: MobileInquiryNotification) => {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${notif.buyerName} • ${notif.watchBrand} ${notif.watchModel}`,
          body: notif.messageText,
          data: { conversationId: notif.conversationId },
          sound: true
        },
        trigger: null
      });
    } catch (e) {
      console.warn('Local notification schedule note:', e);
    }
  };

  // Handle Login submission
  const handleLogin = async (overrideUser?: string, overridePass?: string) => {
    const userToAuth = (overrideUser || usernameInput).trim();
    const passToAuth = overridePass || passwordInput;

    if (!userToAuth || !passToAuth) {
      setLoginError('Please enter both username/email and password.');
      return;
    }

    if (serverUrlInput) {
      signalRService.setServerUrl(serverUrlInput.trim());
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const resp = await signalRService.login(userToAuth, passToAuth);
      setLoggedInUser(resp.login);

      // Filter accounts strictly for 'seller' role personas
      const sellers = (resp.accounts || []).filter(
        (a) => (a.role || '').toLowerCase() === 'seller'
      );

      if (sellers.length === 0) {
        setLoginError('No authorized Seller accounts found for this user. Seller Connect requires a Seller role.');
        setLoggedInUser(null);
        setIsLoggingIn(false);
        return;
      }

      setSellerAccounts(sellers);

      // If user has multiple seller personas, prompt persona selection; otherwise pick the first
      if (sellers.length > 1) {
        setIsSelectingPersona(true);
        // Default to active or first
        const defaultSeller = sellers.find((s) => s.id === resp.activeAccountId) || sellers[0];
        setActiveSeller(defaultSeller);
      } else {
        setActiveSeller(sellers[0]);
        setIsSelectingPersona(false);
      }
    } catch (err: any) {
      console.warn('Login error:', err);
      // Fallback demo mode if backend is unreachable
      if (userToAuth.includes('geneva') || userToAuth === '7') {
        const fallbackSeller: UserAccount = {
          id: 7,
          userLoginId: 4,
          name: 'Geneva Horology Gallery',
          email: 'contact@genevahorology.ch',
          role: 'seller',
          location: 'Geneva, Switzerland',
          isKycDone: false,
          phone: '+41 22 819 4000',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
        };
        setLoggedInUser({ id: 4, username: userToAuth, email: 'contact@genevahorology.ch', isActive: true });
        setSellerAccounts([fallbackSeller]);
        setActiveSeller(fallbackSeller);
      } else if (userToAuth.includes('alexander') || userToAuth === '1') {
        const vanceSeller: UserAccount = {
          id: 1,
          userLoginId: 1,
          name: 'Alexander Vance (Dealer Studio)',
          email: 'alexander.vance@horology.com',
          role: 'seller',
          location: 'New York, USA',
          isKycDone: false,
          phone: '+1 212 555 0199',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        };
        setLoggedInUser({ id: 1, username: userToAuth, email: 'alexander.vance@horology.com', isActive: true });
        setSellerAccounts([vanceSeller]);
        setActiveSeller(vanceSeller);
      } else {
        setLoginError(err?.message || 'Invalid credentials. Please verify your username and password.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    signalRService.stopConnection();
    historyLoadedForSellerRef.current = null;
    setLoggedInUser(null);
    setSellerAccounts([]);
    setActiveSeller(null);
    setActiveConversation(null);
    activeConversationRef.current = null;
    setConversations([]);
    setMessages({});
    setActivePushBanner(null);
    setSelectedInquiryIds([]);
    setSavedQrs([]);
    setIsQrMenuOpen(false);
    setIsSignalRConnected(false);
    setIsSelectingPersona(false);
  };

  // Switch persona (for sellers with multiple seller roles)
  const handleSelectPersona = (seller: UserAccount) => {
    historyLoadedForSellerRef.current = null;
    setSelectedInquiryIds([]);
    setActiveSeller(seller);
    setIsSelectingPersona(false);
    setActiveConversation(null);
    activeConversationRef.current = null;
  };

  // Persist conversations & messages locally so seller history survives restarts/logouts
  useEffect(() => {
    if (!activeSeller) return;
    const sellerId = String(activeSeller.id);
    if (historyLoadedForSellerRef.current !== sellerId) return;
    AsyncStorage.setItem(`seller_conversations_${sellerId}`, JSON.stringify(conversations)).catch(
      () => {}
    );
  }, [conversations, activeSeller?.id]);

  useEffect(() => {
    if (!activeSeller) return;
    const sellerId = String(activeSeller.id);
    if (historyLoadedForSellerRef.current !== sellerId) return;
    AsyncStorage.setItem(`seller_messages_${sellerId}`, JSON.stringify(messages)).catch(() => {});
  }, [messages, activeSeller?.id]);

  // Load seller-specific data and connect to SignalR whenever activeSeller changes
  useEffect(() => {
    if (!activeSeller) return;

    let mounted = true;
    const sellerId = String(activeSeller.id);
    historyLoadedForSellerRef.current = null;

    // 1. Load persisted read timestamps, cached history & backend conversations
    (async () => {
      let cachedConvs: ChatConversation[] = [];
      let cachedMsgs: Record<string, ChatMessage[]> = {};

      try {
        const [storedReads, storedConvs, storedMsgs, storedDeleted, storedQrs] = await Promise.all([
          AsyncStorage.getItem(`seller_read_timestamps_${sellerId}`),
          AsyncStorage.getItem(`seller_conversations_${sellerId}`),
          AsyncStorage.getItem(`seller_messages_${sellerId}`),
          AsyncStorage.getItem(`seller_deleted_convs_${sellerId}`),
          AsyncStorage.getItem(`seller_upi_qrs_${sellerId}`)
        ]);
        readTimestampsRef.current = storedReads ? JSON.parse(storedReads) : {};
        cachedConvs = storedConvs ? JSON.parse(storedConvs) : [];
        cachedMsgs = storedMsgs ? JSON.parse(storedMsgs) : {};
        deletedConvsRef.current = storedDeleted ? JSON.parse(storedDeleted) : {};
        if (mounted && storedQrs) {
          setSavedQrs(JSON.parse(storedQrs));
        } else if (mounted) {
          setSavedQrs([]);
        }
      } catch {
        readTimestampsRef.current = {};
        deletedConvsRef.current = {};
      }

      if (!mounted) return;
      if (Object.keys(cachedMsgs).length > 0) {
        setMessages(cachedMsgs);
      }
      if (cachedConvs.length > 0) {
        setConversations(cachedConvs);
      }

      const serverConvs = await signalRService.fetchConversations(sellerId);
      if (!mounted) return;

      // Merge cached conversations with live backend conversations
      const mergedMap = new Map<string, ChatConversation>();
      for (const c of cachedConvs) {
        mergedMap.set(c.id, c);
      }
      for (const sc of serverConvs || []) {
        const existing = mergedMap.get(sc.id);
        if (!existing) {
          mergedMap.set(sc.id, sc);
        } else {
          const existingTs = new Date(existing.lastMessageAt).getTime();
          const serverTs = new Date(sc.lastMessageAt).getTime();
          mergedMap.set(sc.id, {
            ...(serverTs >= existingTs ? sc : existing),
            watchImage: sc.watchImage || existing.watchImage,
            unreadCountSeller: Math.max(sc.unreadCountSeller, existing.unreadCountSeller)
          });
        }
      }

      let baseConvs = Array.from(mergedMap.values())
        .filter((c) => {
          const deletedTs = deletedConvsRef.current[c.id] || 0;
          return new Date(c.lastMessageAt).getTime() > deletedTs;
        })
        .sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
      if (baseConvs.length === 0) {
        baseConvs = INITIAL_CONVERSATIONS.filter((c) => {
          if (String(c.sellerId) !== sellerId) return false;
          const deletedTs = deletedConvsRef.current[c.id] || 0;
          return new Date(c.lastMessageAt).getTime() > deletedTs;
        });
      }

      // Recompute unreadCountSeller so already-read messages never show on the badge after login
      const adjustedConvs = await Promise.all(
        baseConvs.map(async (c) => {
          const lastReadTs = readTimestampsRef.current[c.id] || 0;
          const lastMsgTs = new Date(c.lastMessageAt).getTime();
          if (lastReadTs > 0 && lastMsgTs <= lastReadTs) {
            return { ...c, unreadCountSeller: 0 };
          }
          if (lastReadTs > 0 && c.unreadCountSeller > 0) {
            const convMsgs = await signalRService.fetchMessages(c.id);
            if (convMsgs && convMsgs.length > 0) {
              const unreadOnly = convMsgs.filter(
                (m) =>
                  m.sender === 'buyer' &&
                  !m.isRead &&
                  new Date(m.createdAt).getTime() > lastReadTs
              ).length;
              return { ...c, unreadCountSeller: unreadOnly };
            }
          }
          return c;
        })
      );

      if (mounted) {
        historyLoadedForSellerRef.current = sellerId;
        setConversations(adjustedConvs);
      }
    })();

    // 2. Connect to SignalR and register strictly under this seller's ID
    signalRService
      .startConnection(
        sellerId,
        // Real-time Push Alert: When buyer sends an inquiry or message to this seller
        (newNotif: MobileInquiryNotification) => {
          if (!mounted) return;

          // Deduplicate duplicate alerts emitted by both SignalR hub and REST fallback
          const dedupKey = `${newNotif.conversationId}::${newNotif.messageText}`;
          const now = Date.now();
          const lastSeen = recentNotifKeysRef.current.get(dedupKey);
          if (lastSeen && now - lastSeen < 5000) {
            return;
          }
          recentNotifKeysRef.current.set(dedupKey, now);

          const isFocusedOnSameChat =
            activeConversationRef.current?.id === newNotif.conversationId;

          // Requirement 1 & 3: Only show OS notification & banner if NOT focused on this same chat
          if (!isFocusedOnSameChat) {
            triggerMobileNotification(newNotif);
            setActivePushBanner(newNotif);
            setTimeout(() => setActivePushBanner(null), 6000);
          } else {
            markConversationAsRead(
              sellerId,
              newNotif.conversationId,
              new Date(newNotif.timestamp).getTime()
            );
          }

          // Update or prepend to inquiries list with exact unread count
          setConversations((prev) => {
            const exists = prev.find((c) => c.id === newNotif.conversationId);
            if (exists) {
              return prev.map((c) =>
                c.id === newNotif.conversationId
                  ? {
                      ...c,
                      lastMessage: newNotif.messageText,
                      lastMessageAt: newNotif.timestamp,
                      unreadCountSeller: isFocusedOnSameChat ? 0 : c.unreadCountSeller + 1
                    }
                  : c
              );
            } else {
              const newConv: ChatConversation = {
                id: newNotif.conversationId,
                listingId: newNotif.listingId,
                watchModel: newNotif.watchModel,
                watchBrand: newNotif.watchBrand,
                watchImage: newNotif.watchImage,
                price: newNotif.price,
                buyerId: 'buyer-new',
                buyerName: newNotif.buyerName,
                sellerId: activeSeller.id,
                sellerName: activeSeller.name,
                lastMessage: newNotif.messageText,
                lastMessageAt: newNotif.timestamp,
                unreadCountSeller: isFocusedOnSameChat ? 0 : 1,
                unreadCountBuyer: 0
              };
              return [newConv, ...prev];
            }
          });
        },
        // Real-time Incoming Message (received when conversation group is joined)
        (newMsg: ChatMessage) => {
          if (!mounted) return;

          const isFocusedOnSameChat =
            activeConversationRef.current?.id === newMsg.conversationId;

          setMessages((prev) => {
            const list = prev[newMsg.conversationId] || [];
            if (list.some((m) => m.id === newMsg.id)) return prev;
            return {
              ...prev,
              [newMsg.conversationId]: [...list, newMsg]
            };
          });

          setConversations((prev) =>
            prev.map((c) =>
              c.id === newMsg.conversationId
                ? {
                    ...c,
                    lastMessage: newMsg.text,
                    lastMessageAt: newMsg.createdAt,
                    unreadCountSeller: isFocusedOnSameChat ? 0 : c.unreadCountSeller
                  }
                : c
            )
          );
        }
      )
      .then((ok) => {
        if (mounted) setIsSignalRConnected(ok);
      });

    return () => {
      mounted = false;
      signalRService.stopConnection();
      setIsSignalRConnected(false);
    };
  }, [activeSeller?.id]);

  // Handle open conversation
  const handleOpenConversation = (conv: ChatConversation) => {
    setActiveConversation(conv);
    activeConversationRef.current = conv;
    if (activePushBanner?.conversationId === conv.id) {
      setActivePushBanner(null);
    }
    if (activeSeller) {
      const readTs = Math.max(Date.now(), new Date(conv.lastMessageAt).getTime());
      markConversationAsRead(String(activeSeller.id), conv.id, readTs);
    }
    signalRService.joinConversation(conv.id);

    // Fetch message history from backend and merge with locally cached messages
    const hasLocal = Boolean(messages[conv.id] && messages[conv.id].length > 0);
    if (!hasLocal) {
      setIsLoadingMessages(true);
    }
    signalRService.fetchMessages(conv.id).then((serverMsgs) => {
      setIsLoadingMessages(false);
      setMessages((prev) => {
        const existing = prev[conv.id] || [];
        const mergedMap = new Map<string, ChatMessage>();
        for (const m of existing) mergedMap.set(m.id, m);
        for (const m of serverMsgs || []) mergedMap.set(m.id, m);

        if (mergedMap.size > 0) {
          const merged = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          return { ...prev, [conv.id]: merged };
        }

        // Default seed message only if neither cache nor backend has any history
        const seed: ChatMessage = {
          id: `msg-${conv.id}-init`,
          conversationId: conv.id,
          listingId: conv.listingId,
          buyerId: conv.buyerId,
          buyerName: conv.buyerName,
          sellerId: activeSeller ? activeSeller.id : conv.sellerId,
          sellerName: activeSeller ? activeSeller.name : conv.sellerName,
          sender: 'buyer',
          text: conv.lastMessage || `Hello, is the ${conv.watchBrand} ${conv.watchModel} available?`,
          imageUrl: conv.watchImage,
          watchBrand: conv.watchBrand,
          watchModel: conv.watchModel,
          price: conv.price,
          createdAt: conv.lastMessageAt || new Date().toISOString(),
          isRead: true
        };
        return { ...prev, [conv.id]: [seed] };
      });
    });

    // Clear unread indicator
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCountSeller: 0 } : c))
    );
  };

  // Handle sending a reply from Seller Connect mobile app
  const handleSendReply = (customText?: string) => {
    const textToSend = (customText || replyText).trim();
    if (!textToSend || !activeConversation || !activeSeller) return;

    const sellerReply: ChatMessage = {
      id: `msg-seller-${Date.now()}`,
      conversationId: activeConversation.id,
      listingId: String(activeConversation.listingId),
      buyerId: String(activeConversation.buyerId),
      buyerName: activeConversation.buyerName,
      sellerId: String(activeSeller.id),
      sellerName: activeSeller.name,
      sender: 'seller',
      text: textToSend,
      createdAt: new Date().toISOString(),
      isRead: true
    };

    // 1. Add to local messages state
    setMessages((prev) => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] || []), sellerReply]
    }));

    // 2. Update conversation snippet
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, lastMessage: textToSend, lastMessageAt: sellerReply.createdAt }
          : c
      )
    );

    // 3. Dispatch over SignalR to the Buyer's open web marketplace modal
    signalRService.sendMessage(sellerReply);

    setReplyText('');
  };

  // UPI QR Code: Add from mobile gallery
  const handleAddNewQr = async () => {
    setIsQrMenuOpen(false);
    if (!activeSeller) return;
    const sellerId = String(activeSeller.id);

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow gallery access so you can select a UPI QR code image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.7,
        base64: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const mime = asset.mimeType || 'image/jpeg';
      const imageUri = asset.base64 ? `data:${mime};base64,${asset.base64}` : asset.uri;

      const newQr: SavedQrItem = {
        id: `qr-${Date.now()}`,
        label: asset.fileName
          ? asset.fileName.replace(/\.[^/.]+$/, '')
          : `UPI QR #${savedQrs.length + 1}`,
        imageUri,
        createdAt: new Date().toISOString()
      };

      const updated = [newQr, ...savedQrs];
      setSavedQrs(updated);
      await AsyncStorage.setItem(`seller_upi_qrs_${sellerId}`, JSON.stringify(updated));
      setIsQrMenuOpen(true);
    } catch (e) {
      console.warn('Add QR error:', e);
      Alert.alert('Error', 'Could not load image from gallery.');
    }
  };

  // UPI QR Code: Send selected QR image to buyer chat
  const handleSendQrToBuyer = (qr: SavedQrItem) => {
    setIsQrMenuOpen(false);
    if (!activeConversation || !activeSeller) return;

    const qrMsg: ChatMessage = {
      id: `msg-seller-qr-${Date.now()}`,
      conversationId: activeConversation.id,
      listingId: String(activeConversation.listingId),
      buyerId: String(activeConversation.buyerId),
      buyerName: activeConversation.buyerName,
      sellerId: String(activeSeller.id),
      sellerName: activeSeller.name,
      sender: 'seller',
      text: `UPI Payment QR (${qr.label}) — Tap image to view & save.`,
      imageUrl: qr.imageUri,
      createdAt: new Date().toISOString(),
      isRead: true
    };

    setMessages((prev) => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] || []), qrMsg]
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, lastMessage: '📷 UPI Payment QR Code', lastMessageAt: qrMsg.createdAt }
          : c
      )
    );

    signalRService.sendMessage(qrMsg);
  };

  // WhatsApp-style Inquiry Multi-Selection & Deletion
  const toggleInquirySelection = (convId: string) => {
    setSelectedInquiryIds((prev) =>
      prev.includes(convId) ? prev.filter((id) => id !== convId) : [...prev, convId]
    );
  };

  const selectAllInquiries = () => {
    if (selectedInquiryIds.length === conversations.length) {
      setSelectedInquiryIds([]);
    } else {
      setSelectedInquiryIds(conversations.map((c) => c.id));
    }
  };

  const clearSelection = () => {
    setSelectedInquiryIds([]);
  };

  const performDeleteSelected = async (idsToDelete: string[]) => {
    if (!activeSeller || idsToDelete.length === 0) return;
    const sellerId = String(activeSeller.id);
    const idSet = new Set(idsToDelete);
    const now = Date.now();

    // Record deletion timestamps so deleted inquiries don't reappear from cache/backend
    for (const id of idsToDelete) {
      deletedConvsRef.current[id] = now;
      delete readTimestampsRef.current[id];
    }

    setConversations((prev) => prev.filter((c) => !idSet.has(c.id)));
    setMessages((prev) => {
      const next = { ...prev };
      for (const id of idsToDelete) {
        delete next[id];
      }
      return next;
    });
    setSelectedInquiryIds([]);

    try {
      await Promise.all([
        AsyncStorage.setItem(
          `seller_deleted_convs_${sellerId}`,
          JSON.stringify(deletedConvsRef.current)
        ),
        AsyncStorage.setItem(
          `seller_read_timestamps_${sellerId}`,
          JSON.stringify(readTimestampsRef.current)
        )
      ]);
    } catch {}

    signalRService.deleteConversations(idsToDelete);
  };

  const confirmDeleteSelected = () => {
    const count = selectedInquiryIds.length;
    if (count === 0) return;
    const ids = [...selectedInquiryIds];
    const title = count === 1 ? 'Delete Inquiry?' : `Delete ${count} Inquiries?`;
    const body =
      count === 1
        ? 'This will delete the selected inquiry and all of its chat history.'
        : `This will delete the ${count} selected inquiries and all of their chat history.`;

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${body}`)) {
        performDeleteSelected(ids);
      }
      return;
    }

    Alert.alert(title, body, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => performDeleteSelected(ids)
      }
    ]);
  };

  // ==========================================
  // VIEW 1: LOGIN SCREEN (User is required to login first)
  // ==========================================
  if (!loggedInUser || !activeSeller) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={styles.loginScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.loginBrandBlock}>
            <View style={styles.loginLogoBadge}>
              <Text style={styles.loginLogoText}>THC</Text>
            </View>
            <Text style={styles.loginTitle}>Seller Connect</Text>
            <Text style={styles.loginSubtitle}>
              Luxury Horology Marketplace Mobile Portal
            </Text>
          </View>

          {/* Error Banner */}
          {loginError && (
            <View style={styles.loginErrorBanner}>
              <Text style={styles.loginErrorText}>{loginError}</Text>
            </View>
          )}

          {/* Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.loginCardHeading}>Authorized Seller Sign In</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Username or Email</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. geneva_dealer"
                placeholderTextColor="#A8A29E"
                autoCapitalize="none"
                value={usernameInput}
                onChangeText={setUsernameInput}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.formInput}
                placeholder="••••••••"
                placeholderTextColor="#A8A29E"
                secureTextEntry
                value={passwordInput}
                onChangeText={setPasswordInput}
              />
            </View>

            {/* Gateway Server URL Toggle */}
            <TouchableOpacity
              style={{ marginVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
              onPress={() => setShowServerConfig(!showServerConfig)}
            >
              <Text style={{ fontSize: 11, color: '#C5A880', fontWeight: 'bold' }}>
                ⚙ Gateway: {serverUrlInput} {showServerConfig ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {showServerConfig && (
              <View style={[styles.formGroup, { backgroundColor: '#F5F5F4', padding: 8, borderRadius: 8 }]}>
                <Text style={styles.inputLabel}>Backend Server URL</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: '#FFFFFF', fontSize: 12 }]}
                  placeholder="http://192.168.1.33:3000"
                  placeholderTextColor="#A8A29E"
                  autoCapitalize="none"
                  value={serverUrlInput}
                  onChangeText={setServerUrlInput}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => handleLogin()}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#FAF8F5" size="small" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In to Boutique</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Demo Sign-in Chips */}
          <View style={styles.quickLoginSection}>
            <Text style={styles.quickLoginHeading}>Quick Dealer Logins (One-Tap)</Text>
            <View style={styles.quickChipsWrapper}>
              {[
                { label: 'Geneva Horology (#7)', user: 'geneva_dealer', pass: 'password123' },
                { label: 'Alexander Vance Studio (#1)', user: 'alexander', pass: 'password123' },
                { label: 'Crown & Caliber Atelier (#8)', user: 'crown_atelier', pass: 'password123' },
                { label: 'Ginza Chrono Vault (#9)', user: 'ginza_vault', pass: 'password123' }
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.demoLoginChip}
                  onPress={() => {
                    setUsernameInput(item.user);
                    setPasswordInput(item.pass);
                    handleLogin(item.user, item.pass);
                  }}
                >
                  <Text style={styles.demoLoginChipText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VIEW 2: PERSONA SELECTION SCREEN (If multiple seller personas exist)
  // ==========================================
  if (isSelectingPersona && sellerAccounts.length > 1) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar style="dark" />
        <View style={{ padding: 20 }}>
          <Text style={styles.personaTitle}>Select Active Seller Persona</Text>
          <Text style={styles.personaSubtitle}>
            Your login has access to multiple dealer accounts. Select the store you wish to manage on this mobile device:
          </Text>

          <ScrollView style={{ marginTop: 20 }}>
            {sellerAccounts.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.personaCard,
                  activeSeller?.id === s.id && styles.personaCardActive
                ]}
                onPress={() => handleSelectPersona(s)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.personaCardName}>{s.name}</Text>
                  <Text style={styles.personaCardMeta}>
                    Seller ID: #{s.id} • {s.location || 'Boutique'}
                  </Text>
                  <Text style={styles.personaCardKyc}>
                    {s.isKycDone ? '✅ KYC Verified (Buy Button)' : '⚠️ KYC Pending (Chat with Seller)'}
                  </Text>
                </View>
                <Text style={styles.personaSelectArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.cancelPersonaBtn} onPress={handleLogout}>
            <Text style={styles.cancelPersonaBtnText}>Sign Out / Switch Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentMessages = activeConversation ? messages[activeConversation.id] || [] : [];

  // ==========================================
  // VIEW 3: MAIN APP INTERFACE (Seller Authenticated)
  // ==========================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Push Notification Banner (Triggered when buyer makes inquiry on THIS seller's watches) */}
      {activePushBanner && (
        <TouchableOpacity
          style={styles.pushBanner}
          activeOpacity={0.9}
          onPress={() => {
            const matchedConv = conversations.find(
              (c) => c.id === activePushBanner.conversationId
            );
            if (matchedConv) {
              handleOpenConversation(matchedConv);
            }
            setActivePushBanner(null);
          }}
        >
          <View style={styles.pushHeader}>
            <View style={styles.pushAppBadge}>
              <View style={styles.pushAppIcon}>
                <Text style={styles.pushAppIconText}>THC</Text>
              </View>
              <Text style={styles.pushAppName}>SELLER CONNECT • NOW</Text>
            </View>
            <Text style={styles.pushDismiss}>Tap to reply</Text>
          </View>
          <View style={styles.pushContent}>
            {activePushBanner.watchImage ? (
              <Image source={{ uri: activePushBanner.watchImage }} style={styles.pushThumb} />
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.pushTitle}>
                {activePushBanner.buyerName} inquired about {activePushBanner.watchBrand}
              </Text>
              <Text style={styles.pushSnippet} numberOfLines={1}>
                {activePushBanner.messageText}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Main Screen Content */}
      {activeConversation ? (
        /* Active Conversation (Live Chat with Buyer) */
        <View style={styles.chatContainer}>
          {/* Header */}
          <View style={styles.chatHeader}>
            <TouchableOpacity
              onPress={() => setActiveConversation(null)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderName} numberOfLines={1}>
                {activeConversation.buyerName}
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isSignalRConnected ? '#10B981' : '#F59E0B' }
                  ]}
                />
                <Text style={styles.chatHeaderStatus}>
                  {isSignalRConnected ? 'SignalR Live Connected' : 'Connecting to Hub...'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.qrsHeaderBtn}
              onPress={() => setIsQrMenuOpen(true)}
            >
              <Text style={styles.qrsHeaderBtnIcon}>▦</Text>
              <Text style={styles.qrsHeaderBtnText}>QRs</Text>
            </TouchableOpacity>
          </View>

          {/* QRs Context Menu Modal */}
          <Modal
            visible={isQrMenuOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setIsQrMenuOpen(false)}
          >
            <TouchableOpacity
              style={styles.qrMenuBackdrop}
              activeOpacity={1}
              onPress={() => setIsQrMenuOpen(false)}
            >
              <View
                style={styles.qrMenuContainer}
                onStartShouldSetResponder={() => true}
              >
                {/* First Option: Add new QR */}
                <TouchableOpacity
                  style={styles.qrAddOption}
                  onPress={handleAddNewQr}
                >
                  <Text style={styles.qrAddOptionIcon}>＋</Text>
                  <Text style={styles.qrAddOptionText}>Add new QR</Text>
                </TouchableOpacity>

                <View style={styles.qrMenuDivider} />

                {/* Previously Added QRs */}
                {savedQrs.length === 0 ? (
                  <View style={styles.qrEmptyBox}>
                    <Text style={styles.qrEmptyText}>No saved UPI QRs yet</Text>
                  </View>
                ) : (
                  <ScrollView style={{ maxHeight: 240 }}>
                    {savedQrs.map((qr) => (
                      <TouchableOpacity
                        key={qr.id}
                        style={styles.qrListItem}
                        onPress={() => handleSendQrToBuyer(qr)}
                      >
                        <Image source={{ uri: qr.imageUri }} style={styles.qrListThumb} />
                        <Text style={styles.qrListLabel} numberOfLines={1}>
                          {qr.label}
                        </Text>
                        <Text style={styles.qrSendIcon}>➤</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Timepiece Context Banner */}
          <View style={styles.watchContextBanner}>
            {activeConversation.watchImage ? (
              <Image
                source={{ uri: activeConversation.watchImage }}
                style={styles.watchContextThumb}
              />
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.watchContextBrand}>{activeConversation.watchBrand}</Text>
              <Text style={styles.watchContextModel} numberOfLines={1}>
                {activeConversation.watchModel}
              </Text>
              <Text style={styles.watchContextPrice}>
                ₹{activeConversation.price.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.kycPendingBadge}>
              <Text style={styles.kycPendingBadgeText}>
                Seller #{activeSeller.id}
              </Text>
            </View>
          </View>

          {/* Messages Stream */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={{ padding: 16 }}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {isLoadingMessages ? (
              <ActivityIndicator color="#C5A880" style={{ marginVertical: 20 }} />
            ) : (
              currentMessages.map((msg) => {
                const isSeller = msg.sender === 'seller';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageRow,
                      isSeller ? styles.messageRowSeller : styles.messageRowBuyer
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isSeller ? styles.messageBubbleSeller : styles.messageBubbleBuyer
                      ]}
                    >
                      {msg.imageUrl ? (
                        <Image
                          source={{ uri: msg.imageUrl }}
                          style={[styles.messageImage, isSeller && { backgroundColor: '#FFFFFF' }]}
                          resizeMode={isSeller ? 'contain' : 'cover'}
                        />
                      ) : null}
                      <Text
                        style={[
                          styles.messageText,
                          isSeller ? styles.messageTextSeller : styles.messageTextBuyer
                        ]}
                      >
                        {msg.text}
                      </Text>
                      <Text
                        style={[
                          styles.messageTime,
                          isSeller ? styles.messageTimeSeller : styles.messageTimeBuyer
                        ]}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Quick Reply Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickChipsBar}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          >
            {[
              'Yes, available with box & papers',
              'Price is slightly negotiable',
              'Can provide video inspection',
              'Ready for immediate dispatch'
            ].map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickChip}
                onPress={() => handleSendReply(chip)}
              >
                <Text style={styles.quickChipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Reply Input Bar */}
          <View style={styles.replyInputBar}>
            <TextInput
              style={styles.replyInput}
              placeholder="Type reply to buyer..."
              placeholderTextColor="#A8A29E"
              value={replyText}
              onChangeText={setReplyText}
              onSubmitEditing={() => handleSendReply()}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => handleSendReply()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Main Tabs View */
        <View style={{ flex: 1 }}>
          {/* App Header or WhatsApp-style Selection Action Bar */}
          {selectedInquiryIds.length > 0 && activeTab === 'inquiries' ? (
            <View style={styles.selectionHeaderBar}>
              <View style={styles.selectionHeaderLeft}>
                <TouchableOpacity onPress={clearSelection} style={styles.selectionBackBtn}>
                  <Text style={styles.selectionBackText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.selectionCountText}>{selectedInquiryIds.length}</Text>
              </View>

              <View style={styles.selectionHeaderRight}>
                <TouchableOpacity onPress={selectAllInquiries} style={styles.selectionActionBtn}>
                  <Text style={styles.selectionAllText}>
                    {selectedInquiryIds.length === conversations.length ? 'Deselect All' : 'Select All'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmDeleteSelected} style={styles.selectionActionBtn}>
                  <Text style={styles.selectionDeleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.appHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.appTitle}>Seller Connect</Text>
                <Text style={styles.appSubtitle} numberOfLines={1}>
                  {activeSeller.name} • ID: #{activeSeller.id}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {sellerAccounts.length > 1 && (
                  <TouchableOpacity
                    style={styles.switchPersonaBtn}
                    onPress={() => setIsSelectingPersona(true)}
                  >
                    <Text style={styles.switchPersonaBtnText}>Switch Store</Text>
                  </TouchableOpacity>
                )}
                <View style={styles.signalRBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isSignalRConnected ? '#10B981' : '#F59E0B' }
                    ]}
                  />
                  <Text style={styles.signalRBadgeText}>
                    {isSignalRConnected ? 'Live' : 'Connecting'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Tab 1: Inquiries Tab (Filtered specifically for this logged in seller) */}
          {activeTab === 'inquiries' && (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
              <View style={styles.tabHeaderRow}>
                <Text style={styles.sectionHeading}>
                  Inquiries for {activeSeller.name}
                </Text>
                <Text style={styles.sectionBadge}>
                  {conversations.length} Active
                </Text>
              </View>

              {conversations.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateEmoji}>💬</Text>
                  <Text style={styles.emptyStateTitle}>No Inquiries for this Store</Text>
                  <Text style={styles.emptyStateText}>
                    When buyers click "Chat with seller" on your listed timepieces, their inquiries will appear here in real time.
                  </Text>
                </View>
              ) : (
                conversations.map((conv) => {
                  const isSelected = selectedInquiryIds.includes(conv.id);
                  const isSelectionMode = selectedInquiryIds.length > 0;
                  return (
                    <TouchableOpacity
                      key={conv.id}
                      style={[
                        styles.conversationCard,
                        isSelected && styles.conversationCardSelected
                      ]}
                      activeOpacity={0.8}
                      delayLongPress={250}
                      onLongPress={() => toggleInquirySelection(conv.id)}
                      onPress={() =>
                        isSelectionMode
                          ? toggleInquirySelection(conv.id)
                          : handleOpenConversation(conv)
                      }
                    >
                      <View style={styles.convThumbWrapper}>
                        {conv.watchImage ? (
                          <Image source={{ uri: conv.watchImage }} style={styles.convThumb} />
                        ) : (
                          <View style={[styles.convThumb, styles.convThumbPlaceholder]}>
                            <Text style={styles.convThumbPlaceholderText}>⌚</Text>
                          </View>
                        )}
                        {isSelected && (
                          <View style={styles.selectedCheckBadge}>
                            <Text style={styles.selectedCheckText}>✓</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.convHeaderRow}>
                          <Text style={styles.convBuyerName}>{conv.buyerName}</Text>
                          <Text style={styles.convTime}>
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                        <Text style={styles.convWatchTitle}>
                          {conv.watchBrand} {conv.watchModel}
                        </Text>
                        <Text style={styles.convLastMessage} numberOfLines={1}>
                          {conv.lastMessage}
                        </Text>
                      </View>
                      {conv.unreadCountSeller > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>{conv.unreadCountSeller}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )}

          {/* Tab 2: Profile & Role Persona Management */}
          {activeTab === 'profile' && (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
              <Text style={styles.sectionHeading}>Active Seller Persona</Text>
              <View style={styles.profileCard}>
                <Text style={styles.profileName}>{activeSeller.name}</Text>
                <Text style={styles.profileDetail}>Seller ID: #{activeSeller.id}</Text>
                <Text style={styles.profileDetail}>Email: {activeSeller.email}</Text>
                <Text style={styles.profileDetail}>
                  Location: {activeSeller.location || 'Boutique Studio'}
                </Text>
                <Text style={styles.profileDetail}>
                  KYC Verification:{' '}
                  {activeSeller.isKycDone
                    ? '✅ KYC Done (Direct Buy Flow)'
                    : '⚠️ KYC Pending (Chat with Seller Flow)'}
                </Text>
                <Text style={styles.profileDetail}>
                  SignalR Gateway: {signalRService.getServerUrl()}
                </Text>
              </View>

              {/* Persona Switcher Section (if user has multiple seller accounts) */}
              {sellerAccounts.length > 1 && (
                <View>
                  <Text style={[styles.sectionHeading, { marginTop: 12, marginBottom: 8 }]}>
                    Switch Store / Persona ({sellerAccounts.length} Available)
                  </Text>
                  {sellerAccounts.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.sellerSwitchCard,
                        activeSeller.id === s.id && styles.sellerSwitchCardActive
                      ]}
                      onPress={() => handleSelectPersona(s)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.sellerSwitchName,
                            activeSeller.id === s.id && styles.sellerSwitchNameActive
                          ]}
                        >
                          {s.name}
                        </Text>
                        <Text style={styles.sellerSwitchMeta}>
                          ID: #{s.id} • {s.location || 'Location'}
                        </Text>
                      </View>
                      {activeSeller.id === s.id && (
                        <Text style={{ color: '#10B981', fontWeight: 'bold' }}>Active</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Logout Button */}
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>Log Out of Seller Connect</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Bottom Tab Bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('inquiries')}
            >
              <Text
                style={[
                  styles.tabIconText,
                  activeTab === 'inquiries' && styles.tabIconTextActive
                ]}
              >
                💬 Inquiries
              </Text>
              {unreadMessagesCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{unreadMessagesCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setActiveTab('profile')}
            >
              <Text
                style={[
                  styles.tabIconText,
                  activeTab === 'profile' && styles.tabIconTextActive
                ]}
              >
                👤 Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    paddingTop: Platform.OS === 'android' ? 25 : 0
  },

  // Login Styles
  loginContainer: {
    flex: 1,
    backgroundColor: '#FAF8F5'
  },
  loginScrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%'
  },
  loginBrandBlock: {
    alignItems: 'center',
    marginBottom: 24
  },
  loginLogoBadge: {
    backgroundColor: '#1C1917',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C5A880',
    marginBottom: 12
  },
  loginLogoText: {
    color: '#C5A880',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 0.5
  },
  loginSubtitle: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 4,
    textAlign: 'center'
  },
  loginErrorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16
  },
  loginErrorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5DFD5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3
  },
  loginCardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 16
  },
  formGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#78716C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  formInput: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5DFD5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1C1917'
  },
  signInButton: {
    backgroundColor: '#1C1917',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8
  },
  signInButtonText: {
    color: '#FAF8F5',
    fontWeight: 'bold',
    fontSize: 14
  },
  quickLoginSection: {
    marginTop: 24
  },
  quickLoginHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A8A29E',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    textAlign: 'center'
  },
  quickChipsWrapper: {
    gap: 8
  },
  demoLoginChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DFD5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  demoLoginChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917'
  },

  // Persona Selection Styles
  personaTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1917'
  },
  personaSubtitle: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 6,
    lineHeight: 18
  },
  personaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DFD5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  personaCardActive: {
    borderColor: '#C5A880',
    backgroundColor: '#FFFDF9'
  },
  personaCardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917'
  },
  personaCardMeta: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 3
  },
  personaCardKyc: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 4,
    fontWeight: '600'
  },
  personaSelectArrow: {
    fontSize: 20,
    color: '#C5A880',
    fontWeight: 'bold'
  },
  cancelPersonaBtn: {
    marginTop: 20,
    alignItems: 'center',
    padding: 12
  },
  cancelPersonaBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700'
  },

  // Top Push Alert Banner
  pushBanner: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 30 : 15,
    left: 12,
    right: 12,
    zIndex: 999,
    backgroundColor: '#1C1917',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#C5A880'
  },
  pushHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  pushAppBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  pushAppIcon: {
    backgroundColor: '#C5A880',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  pushAppIconText: {
    color: '#1C1917',
    fontSize: 9,
    fontWeight: 'bold'
  },
  pushAppName: {
    color: '#C5A880',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  pushDismiss: {
    color: '#A8A29E',
    fontSize: 10
  },
  pushContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  pushThumb: {
    width: 42,
    height: 42,
    borderRadius: 8
  },
  pushTitle: {
    color: '#FAF8F5',
    fontSize: 12,
    fontWeight: 'bold'
  },
  pushSnippet: {
    color: '#D8D0C5',
    fontSize: 11
  },

  // App Header
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5DFD5'
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1917'
  },
  appSubtitle: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 2
  },
  switchPersonaBtn: {
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D8D0C5'
  },
  switchPersonaBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1C1917'
  },
  signalRBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DFD5'
  },
  signalRBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1C1917'
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },

  // Headings & Cards
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78716C',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  sectionBadge: {
    fontSize: 11,
    color: '#C5A880',
    fontWeight: 'bold'
  },
  emptyState: {
    padding: 40,
    alignItems: 'center'
  },
  emptyStateEmoji: {
    fontSize: 36,
    marginBottom: 8
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 4
  },
  emptyStateText: {
    color: '#A8A29E',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DFD5',
    gap: 12
  },
  conversationCardSelected: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC'
  },
  convThumbWrapper: {
    position: 'relative',
    width: 52,
    height: 52
  },
  convThumb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5F5F4'
  },
  convThumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  convThumbPlaceholderText: {
    fontSize: 20
  },
  selectedCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedCheckText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  selectionHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5DFD5'
  },
  selectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  selectionBackBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  selectionBackText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1917'
  },
  selectionCountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1917'
  },
  selectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  selectionActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  selectionAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A'
  },
  selectionDeleteIcon: {
    fontSize: 20
  },
  convHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  convBuyerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917'
  },
  convTime: {
    fontSize: 10,
    color: '#A8A29E'
  },
  convWatchTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C5A880',
    marginTop: 2
  },
  convLastMessage: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 4
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  },

  // Notification tab
  notificationCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DFD5'
  },
  notificationCardUnread: {
    borderColor: '#C5A880',
    backgroundColor: '#FFFDF9'
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  notifBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C5A880',
    letterSpacing: 0.5
  },
  notifTime: {
    fontSize: 10,
    color: '#A8A29E'
  },
  notifBody: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },
  notifThumb: {
    width: 48,
    height: 48,
    borderRadius: 8
  },
  notifWatch: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917'
  },
  notifPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716C',
    marginTop: 2
  },
  notifText: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 4
  },

  // Profile Tab
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DFD5',
    gap: 6
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917'
  },
  profileDetail: {
    fontSize: 12,
    color: '#78716C'
  },
  sellerSwitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5DFD5',
    marginBottom: 8
  },
  sellerSwitchCardActive: {
    borderColor: '#1C1917',
    backgroundColor: '#F5F5F4'
  },
  sellerSwitchName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917'
  },
  sellerSwitchNameActive: {
    color: '#1C1917'
  },
  sellerSwitchMeta: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 2
  },
  logoutBtn: {
    marginTop: 16,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13
  },

  // Chat Screen
  chatContainer: {
    flex: 1,
    backgroundColor: '#FAF8F5'
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5DFD5',
    gap: 12
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1917'
  },
  chatHeaderInfo: {
    flex: 1
  },
  chatHeaderName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917'
  },
  chatHeaderStatus: {
    fontSize: 10,
    color: '#78716C'
  },
  watchContextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F4',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DFD5',
    gap: 10
  },
  watchContextThumb: {
    width: 44,
    height: 44,
    borderRadius: 8
  },
  watchContextBrand: {
    fontSize: 10,
    fontWeight: '700',
    color: '#78716C',
    textTransform: 'uppercase'
  },
  watchContextModel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1917'
  },
  watchContextPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C5A880'
  },
  kycPendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6
  },
  kycPendingBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#92400E'
  },
  messagesList: {
    flex: 1
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row'
  },
  messageRowBuyer: {
    justifyContent: 'flex-start'
  },
  messageRowSeller: {
    justifyContent: 'flex-end'
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 14
  },
  messageBubbleBuyer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5DFD5',
    borderTopLeftRadius: 2
  },
  messageBubbleSeller: {
    backgroundColor: '#1C1917',
    borderTopRightRadius: 2
  },
  messageImage: {
    width: 200,
    height: 140,
    borderRadius: 8,
    marginBottom: 8
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18
  },
  messageTextBuyer: {
    color: '#1C1917'
  },
  messageTextSeller: {
    color: '#FAF8F5'
  },
  messageTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  messageTimeBuyer: {
    color: '#A8A29E'
  },
  messageTimeSeller: {
    color: '#78716C'
  },
  quickChipsBar: {
    maxHeight: 44,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5DFD5',
    paddingVertical: 6
  },
  quickChip: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5DFD5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14
  },
  quickChipText: {
    fontSize: 11,
    color: '#1C1917'
  },
  replyInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5DFD5',
    gap: 8
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5DFD5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1C1917'
  },
  sendButton: {
    backgroundColor: '#1C1917',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20
  },
  sendButtonText: {
    color: '#FAF8F5',
    fontWeight: 'bold',
    fontSize: 12
  },

  // Bottom Navigation
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5DFD5',
    height: 58
  },
  tabItem: {
    alignItems: 'center',
    position: 'relative',
    padding: 6
  },
  tabIconText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716C'
  },
  tabIconTextActive: {
    color: '#1C1917',
    fontWeight: '800'
  },
  tabBadge: {
    position: 'absolute',
    top: 0,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold'
  },

  // QRs Header Button & Context Menu
  qrsHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1C1917',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10
  },
  qrsHeaderBtnIcon: {
    color: '#C5A880',
    fontSize: 13,
    fontWeight: 'bold'
  },
  qrsHeaderBtnText: {
    color: '#FAF8F5',
    fontSize: 12,
    fontWeight: '700'
  },
  qrMenuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'android' ? 74 : 96,
    paddingRight: 14
  },
  qrMenuContainer: {
    width: 245,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5DFD5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden'
  },
  qrAddOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#FAF8F5'
  },
  qrAddOptionIcon: {
    fontSize: 16,
    fontWeight: '800',
    color: '#C5A880'
  },
  qrAddOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1917'
  },
  qrMenuDivider: {
    height: 1,
    backgroundColor: '#E5DFD5'
  },
  qrEmptyBox: {
    padding: 16,
    alignItems: 'center'
  },
  qrEmptyText: {
    fontSize: 12,
    color: '#A8A29E'
  },
  qrListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4'
  },
  qrListThumb: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#E5DFD5'
  },
  qrListLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1917'
  },
  qrSendIcon: {
    fontSize: 16,
    color: '#16A34A',
    fontWeight: 'bold'
  }
});

registerRootComponent(App);
