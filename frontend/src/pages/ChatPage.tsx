import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Loader, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Spinner, PageLoader } from '../components/common/UI';

interface Message {
  _id: string;
  booking: string;
  sender: string;
  senderName: string;
  senderRole: string;
  text: string;
  createdAt: string;
}

// Lazy Socket.io client — only connects if socket.io-client is installed
let socketModule: typeof import('socket.io-client') | null = null;
const getSocket = async () => {
  if (socketModule) return socketModule;
  try {
    socketModule = await import('socket.io-client');
    return socketModule;
  } catch {
    return null;
  }
};

export default function ChatPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<{ location: string; otherUser: string } | null>(null);
  const socketRef = useRef<ReturnType<typeof import('socket.io-client').io> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Get booking info
        const bookingRes = await api.get(`/bookings/${bookingId}`);
        const b = bookingRes.data.booking;
        const otherUser = user?.role === 'customer' ? b.assistant?.name : b.customer?.name;
        setBookingInfo({ location: b.location?.name, otherUser: otherUser || 'Other' });

        // Get message history
        const msgRes = await api.get(`/chat/${bookingId}`);
        setMessages(msgRes.data.messages || []);
      } catch (err) {
        console.error('Failed to load chat:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [bookingId, user?.role]);

  // Connect Socket.io
  useEffect(() => {
    const token = localStorage.getItem('carryhand_token');
    if (!token || !bookingId) return;

    let socket: ReturnType<typeof import('socket.io-client').io> | null = null;

    const connect = async () => {
      const mod = await getSocket();
      if (!mod) {
        console.log('[Chat] socket.io-client not installed — using REST fallback');
        return;
      }

      socket = mod.io('http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        setSocketConnected(true);
        socket?.emit('join_booking', bookingId);
      });

      socket.on('disconnect', () => setSocketConnected(false));

      socket.on('new_message', (msg: Message) => {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        setTypingUser('');
        setTimeout(scrollToBottom, 50);
      });

      socket.on('user_typing', ({ userName, isTyping }: { userName: string; isTyping: boolean }) => {
        setTypingUser(isTyping ? userName : '');
        if (isTyping) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTypingUser(''), 3000);
        }
      });

      socketRef.current = socket;
    };

    connect();

    return () => {
      socket?.emit('leave_booking', bookingId);
      socket?.disconnect();
    };
  }, [bookingId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);

    try {
      if (socketRef.current?.connected) {
        // Send via socket
        socketRef.current.emit('send_message', { bookingId, text: text.trim() });
        setText('');
      } else {
        // Fallback to REST API
        const res = await api.post(`/chat/${bookingId}`, { text: text.trim() });
        setMessages(prev => [...prev, res.data.message]);
        setText('');
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { bookingId, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', { bookingId, isTyping: false });
      }, 1500);
    }
  }, [bookingId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) return <PageLoader />;

  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = {};
  messages.forEach(msg => {
    const date = formatDate(msg.createdAt);
    if (!groupedMessages[date]) groupedMessages[date] = [];
    groupedMessages[date].push(msg);
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 fixed top-16 left-0 right-0 z-40">
        <Link to="/customer/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center font-bold text-brand-600">
          {bookingInfo?.otherUser?.[0] || '?'}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-sm">{bookingInfo?.otherUser || 'Chat'}</div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
            {socketConnected ? 'Live' : 'Offline'} • {bookingInfo?.location}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 mt-16" style={{ paddingBottom: '80px' }}>
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-brand-400" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-1">No messages yet</h3>
              <p className="text-gray-400 text-sm">Start the conversation below!</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium px-2">{date}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {msgs.map(msg => {
                  const isMe = msg.sender === user?._id;
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
                      {!isMe && (
                        <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-xs mr-2 flex-shrink-0 mt-1">
                          {msg.senderName[0]}
                        </div>
                      )}
                      <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isMe && (
                          <span className="text-xs text-gray-400 mb-1 ml-1">{msg.senderName}</span>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-brand-500 text-white rounded-tr-sm'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm'
                        }`}>
                          {msg.text}
                        </div>
                        <span className="text-xs text-gray-300 mt-1 mx-1">{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {/* Typing indicator */}
          {typingUser && (
            <div className="flex justify-start mb-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                <span className="text-gray-500 text-xs font-bold">{typingUser[0]}</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-end gap-3">
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); handleTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="flex-1 resize-none input-field py-2.5 max-h-32 text-sm"
            style={{ minHeight: '44px' }}
            onInput={e => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="w-11 h-11 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
          >
            {sending ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
