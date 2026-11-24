import React, { useState, useEffect, useRef } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  Send,
  Smartphone,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  MessageCircle,
  Bot
} from 'lucide-react';
import * as signalR from '@microsoft/signalr';
import { ChatMessage } from '../types';

export const SellerConnectChatModal: React.FC = () => {
  const {
    isSellerChatOpen,
    setIsSellerChatOpen,
    chatWatch,
    setChatWatch,
    currentUser,
    isLoggedIn,
    promptLogin,
    showToast
  } = useMarketplace();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const hubConnectionRef = useRef<signalR.HubConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const conversationId = chatWatch
    ? `conv-${chatWatch.id}-${currentUser.id || 'guest-buyer'}`
    : '';

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle SignalR connection and conversation setup
  useEffect(() => {
    if (!isSellerChatOpen || !chatWatch) return;

    let isMounted = true;
    setIsConnecting(true);

    const initializeChat = async () => {
      // 1. Check localStorage for existing history
      const saved = localStorage.getItem(`chat_${conversationId}`);
      let localMessages: ChatMessage[] = [];
      if (saved) {
        try {
          localMessages = JSON.parse(saved);
        } catch {
          localMessages = [];
        }
      }

      // 2. Check backend for existing chat history between this buyer & seller for this watch
      let backendMessages: ChatMessage[] = [];
      try {
        const res = await fetch(
          `/api/chat/messages?conversationId=${encodeURIComponent(conversationId)}`
        );
        if (res.ok) {
          backendMessages = await res.json();
        }
      } catch {}

      if (!isMounted) return;

      const hasExistingHistory = backendMessages.length > 0 || localMessages.length > 0;
      let initialToDispatch: ChatMessage | null = null;

      if (hasExistingHistory) {
        // Merge backend & local messages (deduplicated by id) without re-sending watch image/price
        const mergedMap = new Map<string, ChatMessage>();
        [...localMessages, ...backendMessages].forEach((m) => mergedMap.set(m.id, m));
        const merged = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(merged);
        try {
          localStorage.setItem(`chat_${conversationId}`, JSON.stringify(merged));
        } catch {}
      } else {
        // New chat for this watch: send watch image & price one time only
        const initialBuyerMessage: ChatMessage = {
          id: `msg-${Date.now()}-init`,
          conversationId,
          listingId: String(chatWatch.id),
          buyerId: String(currentUser.id || 'buyer-1'),
          buyerName: currentUser.name || 'Interested Buyer',
          sellerId: String(chatWatch.sellerId),
          sellerName: chatWatch.sellerName,
          sender: 'buyer',
          text: `Hello ${chatWatch.sellerName}, I am inquiring about the ${chatWatch.brand} ${chatWatch.model} (Ref: ${chatWatch.referenceNumber || 'N/A'}) listed on THC for ₹${chatWatch.price.toLocaleString()}. Is this timepiece still available for purchase?`,
          imageUrl: chatWatch.images?.[0] || '',
          watchBrand: chatWatch.brand,
          watchModel: chatWatch.model,
          price: Number(chatWatch.price || 0),
          createdAt: new Date().toISOString(),
          isRead: false
        };
        initialToDispatch = initialBuyerMessage;
        setMessages([initialBuyerMessage]);
        try {
          localStorage.setItem(`chat_${conversationId}`, JSON.stringify([initialBuyerMessage]));
        } catch {}
      }

      // 3. Build SignalR connection
      const hubUrl = `${window.location.origin}/hubs/chat`;
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .build();

      hubConnectionRef.current = connection;

      // Listen for incoming messages from seller
      connection.on('ReceiveMessage', (msg: ChatMessage) => {
        if (!isMounted) return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          const updated = [...prev, msg];
          try {
            localStorage.setItem(`chat_${conversationId}`, JSON.stringify(updated));
          } catch {}
          return updated;
        });
      });

      connection
        .start()
        .then(async () => {
          if (!isMounted) return;
          setIsConnected(true);
          setIsConnecting(false);

          // Join conversation room
          await connection.invoke('JoinConversation', conversationId);

          // Only dispatch initial watch image & price if this is a brand-new chat
          if (initialToDispatch) {
            try {
              await connection.invoke('SendMessage', initialToDispatch);
            } catch (e) {
              console.warn('Initial message dispatch via hub:', e);
            }
            try {
              fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(initialToDispatch)
              }).catch(() => {});
            } catch {}
          }
        })
        .catch((err) => {
          console.warn('SignalR hub connection notice (running in local sandbox mode):', err);
          if (isMounted) {
            setIsConnected(false);
            setIsConnecting(false);
          }
        });
    };

    initializeChat();

    return () => {
      isMounted = false;
      const conn = hubConnectionRef.current;
      if (conn && conn.state === signalR.HubConnectionState.Connected) {
        conn.invoke('LeaveConversation', conversationId).catch(() => {});
        conn.stop().catch(() => {});
      }
    };
  }, [isSellerChatOpen, chatWatch, conversationId, currentUser.id, currentUser.name]);

  if (!isSellerChatOpen || !chatWatch) return null;

  const handleClose = () => {
    setIsSellerChatOpen(false);
    setChatWatch(null);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const isFirstMessage = messages.length === 0;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      listingId: String(chatWatch.id),
      buyerId: String(currentUser.id || 'buyer-1'),
      buyerName: currentUser.name || 'Interested Buyer',
      sellerId: String(chatWatch.sellerId),
      sellerName: chatWatch.sellerName,
      sender: 'buyer',
      text: inputText.trim(),
      imageUrl: isFirstMessage ? chatWatch.images?.[0] : undefined,
      watchBrand: chatWatch.brand,
      watchModel: chatWatch.model,
      price: isFirstMessage ? Number(chatWatch.price || 0) : undefined,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setInputText('');
    setMessages((prev) => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem(`chat_${conversationId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Send via SignalR if connected
    if (hubConnectionRef.current && hubConnectionRef.current.state === signalR.HubConnectionState.Connected) {
      try {
        await hubConnectionRef.current.invoke('SendMessage', newMsg);
      } catch (err) {
        console.warn('Failed to send message via SignalR hub:', err);
      }
    }

    // Also persist via REST endpoint if available
    try {
      fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      }).catch(() => {});
    } catch {}
  };

  // Helper for testing seller reply directly
  const handleSimulateSellerReply = (replyText: string) => {
    const sellerReply: ChatMessage = {
      id: `msg-${Date.now()}-seller`,
      conversationId,
      listingId: String(chatWatch.id),
      buyerId: String(currentUser.id || 'buyer-1'),
      buyerName: currentUser.name || 'Interested Buyer',
      sellerId: String(chatWatch.sellerId),
      sellerName: chatWatch.sellerName,
      sender: 'seller',
      text: replyText,
      createdAt: new Date().toISOString(),
      isRead: true
    };

    setMessages((prev) => {
      const updated = [...prev, sellerReply];
      try {
        localStorage.setItem(`chat_${conversationId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (hubConnectionRef.current && hubConnectionRef.current.state === signalR.HubConnectionState.Connected) {
      hubConnectionRef.current.invoke('SendMessage', sellerReply).catch(() => {});
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs"
      onClick={handleClose}
    >
      <div
        id="seller-connect-chat-modal"
        className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#E5DFD5] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] h-[680px] overflow-hidden animate-in fade-in zoom-in-95 text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#FFFFFF] border-b border-[#E5DFD5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                alt={chatWatch.sellerName}
                className="w-10 h-10 rounded-full object-cover border border-[#D8D0C5]"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-serif font-bold text-[#1C1917]">
                  {chatWatch.sellerName}
                </h3>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 font-mono font-semibold">
                  KYC Pending
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#78716C]">
                <Smartphone className="w-3.5 h-3.5 text-[#967139]" />
                <span>
                  Routing to: <strong className="text-[#1C1917]">{chatWatch.sellerName}</strong>'s Mobile (ID: #{chatWatch.sellerId})
                </span>
              </div>
            </div>
          </div>

          {/* Top Right Cross Button */}
          <button
            id="chat-modal-top-close-btn"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-[#EDE8E0] transition-colors"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Watch Listing Reference Card */}
        <div className="px-5 py-2.5 bg-[#FAF8F5] border-b border-[#E5DFD5] flex items-center gap-3">
          <img
            src={chatWatch.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
            alt={chatWatch.model}
            className="w-12 h-12 rounded-xl object-cover border border-[#D8D0C5] shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#967139]">
              {chatWatch.brand}
            </div>
            <div className="text-xs font-semibold text-[#1C1917] truncate">{chatWatch.model}</div>
            <div className="text-xs font-mono font-bold text-[#1C1917]">
              ₹{chatWatch.price.toLocaleString()}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
              Inquiry Dispatched
            </span>
          </div>
        </div>

        {/* Message Thread Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]">
          <div className="text-center my-1">
            <span className="text-[10px] font-mono text-[#8C7D70] bg-[#EDE8E0] px-2.5 py-1 rounded-full">
              Connected via THC SignalR • Notifications sent to Seller Connect App
            </span>
          </div>

          {messages.map((msg) => {
            const isBuyer = msg.sender === 'buyer';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-2xs text-xs space-y-1.5 ${
                    isBuyer
                      ? 'bg-[#1C1917] text-[#FAF8F5] rounded-br-none'
                      : 'bg-[#FFFFFF] text-[#1C1917] border border-[#E5DFD5] rounded-bl-none'
                  }`}
                >
                  {/* Photo thumbnail in message if attached */}
                  {msg.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/20 mb-1 max-w-[200px]">
                      <img src={msg.imageUrl} alt="Watch" className="w-full h-24 object-cover" />
                      <div className="bg-black/60 p-1 px-2 text-[10px] font-mono font-bold text-[#FAF8F5]">
                        ₹{msg.price?.toLocaleString()}
                      </div>
                    </div>
                  )}

                  <p className="leading-relaxed">{msg.text}</p>

                  <div
                    className={`flex items-center justify-end gap-1 text-[9px] font-mono pt-1 ${
                      isBuyer ? 'text-[#C5A880]' : 'text-[#78716C]'
                    }`}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isBuyer && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                </div>
                <span className="text-[9px] text-[#78716C] mt-0.5 px-1">
                  {isBuyer ? 'You (Buyer)' : `${chatWatch.sellerName} (via Seller Connect)`}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Simulator Bar for dev/testing seller replies */}
        <div className="px-4 py-1.5 bg-[#EDE8E0]/70 border-t border-[#E5DFD5] flex items-center justify-between text-[11px]">
          <span className="text-[10px] text-[#78716C] flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-[#967139]" />
            <span>Simulate Mobile Seller Response:</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSimulateSellerReply('Yes, it is in mint condition with full box and papers. Ready to ship!')}
              className="text-[10px] bg-white hover:bg-gray-50 border border-[#D8D0C5] px-2 py-0.5 rounded text-[#1C1917] font-medium"
            >
              "Available & Mint"
            </button>
            <button
              type="button"
              onClick={() => handleSimulateSellerReply('I can do a live video inspection on WhatsApp or Telegram if you want.')}
              className="text-[10px] bg-white hover:bg-gray-50 border border-[#D8D0C5] px-2 py-0.5 rounded text-[#1C1917] font-medium"
            >
              "Video Call"
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-[#FFFFFF] border-t border-[#E5DFD5] flex items-center gap-2">
          <input
            id="seller-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message to the seller..."
            className="flex-1 bg-[#FAF8F5] border border-[#D8D0C5] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#967139]"
          />
          <button
            id="seller-chat-send-btn"
            type="submit"
            className="p-2.5 bg-[#1C1917] hover:bg-[#3D3A36] text-[#FAF8F5] rounded-xl transition-colors shadow-xs"
            title="Send Message"
          >
            <Send className="w-4 h-4 text-[#C5A880]" />
          </button>
        </form>

        {/* Bottom Close Button (Requirement 7) */}
        <div className="px-4 py-2.5 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center justify-between">
          <span className="text-[11px] text-[#78716C]">
            Push notification dispatched to seller's mobile
          </span>
          <button
            id="chat-modal-bottom-close-btn"
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 rounded-xl bg-[#EDE8E0] hover:bg-[#DDD6CB] text-xs font-semibold text-[#1C1917] transition-colors"
          >
            Close Chat
          </button>
        </div>
      </div>
    </div>
  );
};
