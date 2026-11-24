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
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import {
  ChatMessage,
  ChatConversation,
  MobileInquiryNotification,
  SellerProfile
} from './src/types';
import {
  INITIAL_SELLERS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS
} from './src/services/mockData';
import { signalRService } from './src/services/signalrService';

export default function App() {
  // Active Seller Profile State
  const [sellers] = useState<SellerProfile[]>(INITIAL_SELLERS);
  const [activeSeller, setActiveSeller] = useState<SellerProfile>(INITIAL_SELLERS[0]);

  // Tab Navigation: 'inquiries' | 'notifications' | 'profile'
  const [activeTab, setActiveTab] = useState<'inquiries' | 'notifications' | 'profile'>('inquiries');
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);

  // Conversations & Messages State
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    'conv-1-buyer-101': [
      {
        id: 'msg-seed-1',
        conversationId: 'conv-1-buyer-101',
        listingId: '1',
        buyerId: 'buyer-101',
        buyerName: 'Arjun Mehta',
        sellerId: '1',
        sellerName: 'Geneva Horology Gallery',
        sender: 'buyer',
        text: 'Hello, I am interested in your Rolex Cosmograph Daytona listed for ₹2,450,000. Is this timepiece available with original box and papers?',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
        watchBrand: 'Rolex',
        watchModel: 'Cosmograph Daytona "Panda"',
        price: 2450000,
        createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
        isRead: true
      }
    ]
  });

  // Mobile Device Notification Center State
  const [notifications, setNotifications] = useState<MobileInquiryNotification[]>(INITIAL_NOTIFICATIONS);
  const [activePushBanner, setActivePushBanner] = useState<MobileInquiryNotification | null>(null);

  // Chat Input State
  const [replyText, setReplyText] = useState('');
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);
  const scrollViewRef = useRef<any>(null);

  // Unread Counts
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCountSeller, 0);

  // Setup SignalR connection for the active seller
  useEffect(() => {
    let mounted = true;

    signalRService
      .startConnection(
        activeSeller.id,
        // When buyer triggers inquiry -> mobile device receives notification alert
        (newNotif: MobileInquiryNotification) => {
          if (!mounted) return;

          // 1. Add to mobile notification tray
          setNotifications((prev) => [newNotif, ...prev]);

          // 2. Trigger mobile top push notification banner
          setActivePushBanner(newNotif);
          setTimeout(() => setActivePushBanner(null), 6000);

          // 3. Update or create conversation
          setConversations((prev) => {
            const exists = prev.find((c) => c.id === newNotif.conversationId);
            if (exists) {
              return prev.map((c) =>
                c.id === newNotif.conversationId
                  ? {
                      ...c,
                      lastMessage: newNotif.messageText,
                      lastMessageAt: newNotif.timestamp,
                      unreadCountSeller: c.unreadCountSeller + 1
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
                unreadCountSeller: 1,
                unreadCountBuyer: 0
              };
              return [newConv, ...prev];
            }
          });
        },
        // When a message is received in active conversation
        (newMsg: ChatMessage) => {
          if (!mounted) return;

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
                    unreadCountSeller: newMsg.sender === 'buyer' ? c.unreadCountSeller + 1 : c.unreadCountSeller
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
    };
  }, [activeSeller.id, activeSeller.name]);

  // Handle open conversation
  const handleOpenConversation = (conv: ChatConversation) => {
    setActiveConversation(conv);
    signalRService.joinConversation(conv.id);

    // Clear unread indicator
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCountSeller: 0 } : c))
    );
  };

  // Handle sending a reply from Seller Connect
  const handleSendReply = (customText?: string) => {
    const textToSend = (customText || replyText).trim();
    if (!textToSend || !activeConversation) return;

    const sellerReply: ChatMessage = {
      id: `msg-seller-${Date.now()}`,
      conversationId: activeConversation.id,
      listingId: activeConversation.listingId,
      buyerId: activeConversation.buyerId,
      buyerName: activeConversation.buyerName,
      sellerId: activeSeller.id,
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

  const currentMessages = activeConversation ? messages[activeConversation.id] || [] : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Push Notification Banner (Triggered when buyer makes inquiry) */}
      {activePushBanner && (
        <TouchableOpacity
          style={styles.pushBanner}
          activeOpacity={0.9}
          onPress={() => {
            const matchedConv = conversations.find((c) => c.id === activePushBanner.conversationId);
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
            <Text style={styles.pushDismiss}>Tap to open</Text>
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
        /* Active Conversation (Chat with Buyer) */
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
                  {isSignalRConnected ? 'SignalR Live' : 'Connecting...'}
                </Text>
              </View>
            </View>
          </View>

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
              <Text style={styles.kycPendingBadgeText}>KYC Pending Flow</Text>
            </View>
          </View>

          {/* Messages Stream */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={{ padding: 16 }}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {currentMessages.map((msg) => {
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
                    {msg.imageUrl && !isSeller ? (
                      <Image source={{ uri: msg.imageUrl }} style={styles.messageImage} />
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
            })}
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
          {/* App Header */}
          <View style={styles.appHeader}>
            <View>
              <Text style={styles.appTitle}>Seller Connect</Text>
              <Text style={styles.appSubtitle}>
                {activeSeller.name} • {activeSeller.isKycDone ? 'KYC Verified' : 'KYC Pending'}
              </Text>
            </View>
            <View style={styles.signalRBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isSignalRConnected ? '#10B981' : '#F59E0B' }
                ]}
              />
              <Text style={styles.signalRBadgeText}>
                {isSignalRConnected ? 'SignalR Live' : 'Connecting'}
              </Text>
            </View>
          </View>

          {/* Tab 1: Inquiries Tab */}
          {activeTab === 'inquiries' && (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
              <Text style={styles.sectionHeading}>Active Buyer Inquiries</Text>
              {conversations.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No inquiries yet.</Text>
                </View>
              ) : (
                conversations.map((conv) => (
                  <TouchableOpacity
                    key={conv.id}
                    style={styles.conversationCard}
                    activeOpacity={0.8}
                    onPress={() => handleOpenConversation(conv)}
                  >
                    {conv.watchImage ? (
                      <Image source={{ uri: conv.watchImage }} style={styles.convThumb} />
                    ) : null}
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
                ))
              )}
            </ScrollView>
          )}

          {/* Tab 2: Notifications Tab */}
          {activeTab === 'notifications' && (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
              <Text style={styles.sectionHeading}>Mobile Push Notification Center</Text>
              {notifications.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[
                    styles.notificationCard,
                    !notif.isRead && styles.notificationCardUnread
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    const matchedConv = conversations.find(
                      (c) => c.id === notif.conversationId
                    );
                    if (matchedConv) {
                      handleOpenConversation(matchedConv);
                    }
                  }}
                >
                  <View style={styles.notifHeaderRow}>
                    <Text style={styles.notifBadge}>NEW BUYER INQUIRY</Text>
                    <Text style={styles.notifTime}>
                      {new Date(notif.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                  <View style={styles.notifBody}>
                    {notif.watchImage ? (
                      <Image source={{ uri: notif.watchImage }} style={styles.notifThumb} />
                    ) : null}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifWatch}>
                        {notif.watchBrand} {notif.watchModel}
                      </Text>
                      <Text style={styles.notifPrice}>
                        ₹{notif.price.toLocaleString('en-IN')}
                      </Text>
                      <Text style={styles.notifText} numberOfLines={2}>
                        {notif.messageText}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Tab 3: Profile & Switch Seller */}
          {activeTab === 'profile' && (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
              <Text style={styles.sectionHeading}>Seller Persona & Profile</Text>
              <View style={styles.profileCard}>
                <Text style={styles.profileName}>{activeSeller.name}</Text>
                <Text style={styles.profileDetail}>Email: {activeSeller.email}</Text>
                <Text style={styles.profileDetail}>Phone: {activeSeller.phone}</Text>
                <Text style={styles.profileDetail}>
                  KYC Status:{' '}
                  {activeSeller.isKycDone ? '✅ Verified (Buy Button)' : '⚠️ Pending (Chat with Seller)'}
                </Text>
              </View>

              <Text style={[styles.sectionHeading, { marginTop: 12 }]}>
                Switch Active Seller (For Testing)
              </Text>
              {sellers.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.sellerSwitchCard,
                    activeSeller.id === s.id && styles.sellerSwitchCardActive
                  ]}
                  onPress={() => setActiveSeller(s)}
                >
                  <Text
                    style={[
                      styles.sellerSwitchName,
                      activeSeller.id === s.id && styles.sellerSwitchNameActive
                    ]}
                  >
                    {s.name}
                  </Text>
                  <Text style={styles.sellerSwitchMeta}>
                    ID: {s.id} • {s.isKycDone ? 'KYC Done' : 'KYC Pending'}
                  </Text>
                </TouchableOpacity>
              ))}
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
              onPress={() => setActiveTab('notifications')}
            >
              <Text
                style={[
                  styles.tabIconText,
                  activeTab === 'notifications' && styles.tabIconTextActive
                ]}
              >
                🔔 Alerts
              </Text>
              {unreadNotificationsCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{unreadNotificationsCount}</Text>
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
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917'
  },
  appSubtitle: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 2
  },
  signalRBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DFD5'
  },
  signalRBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1C1917'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },

  // Headings & Cards
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78716C',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  emptyState: {
    padding: 30,
    alignItems: 'center'
  },
  emptyStateText: {
    color: '#A8A29E',
    fontSize: 13
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
  convThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F5F5F4'
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
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5DFD5'
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
  }
});

registerRootComponent(App);
