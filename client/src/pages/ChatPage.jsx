import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, LayoutDashboard, Calendar, Settings } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import useAuth from '../hooks/useAuth';
import {
  deleteConversation as deleteChatConversation,
  getConversations,
  getMessages,
  sendMessage as sendChatMessage,
} from '../services/chatService';

function getAvatarLabel(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'SV';
}

function formatConversationTimestamp(dateValue) {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();

  return new Intl.DateTimeFormat(
    'en-IN',
    isSameDay ? { hour: 'numeric', minute: '2-digit' } : { day: '2-digit', month: 'short' },
  ).format(date);
}

function formatMessageTimestamp(dateValue) {
  if (!dateValue) {
    return '';
  }

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

function sortConversations(items) {
  return [...items].sort(
    (first, second) =>
      new Date(second.lastMessageAt || 0).getTime() - new Date(first.lastMessageAt || 0).getTime(),
  );
}

function mapConversation(conversation) {
  const participantName = conversation.participantName || 'SkillVigo member';

  return {
    ...conversation,
    name: participantName,
    role: conversation.role || 'Conversation',
    avatar: conversation.avatar || getAvatarLabel(participantName),
    lastMessage: conversation.lastMessage || 'No messages yet.',
    unread: Number(conversation.unreadCount) || 0,
    timestamp: formatConversationTimestamp(conversation.lastMessageAt),
  };
}

function mapMessage(message, conversationId) {
  return {
    id: message.id || message._id || `${conversationId}-${message.createdAt || Date.now()}`,
    senderId: message.senderRole === 'me' ? 'me' : conversationId,
    text: message.content || message.text || '',
    time: formatMessageTimestamp(message.createdAt),
  };
}

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 11v6" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
    />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.4 20.4l17.2-8.4L3.4 3.6l1.9 6.8 9.2 1.6-9.2 1.6-1.9 6.8z" />
  </svg>
);

const ChatList = ({
  conversations,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  searchQuery,
  onSearch,
  loading,
  deleteBusyId,
}) => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-xl flex items-center gap-2 font-bold text-slate-800 mb-4">
          <MessageSquare className="text-blue-500 w-5 h-5" /> Messages
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          <span className="absolute left-3.5 top-3 text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading your chats...</div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-sm leading-6 text-slate-500">
            No conversations match this search yet.
          </div>
        ) : (
          conversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectChat(chat.id);
                }
              }}
              role="button"
              tabIndex={0}
              className={`flex w-full items-center gap-3 border-b border-slate-50 p-4 text-left transition-colors last:border-none ${activeChatId === chat.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">{chat.avatar}</div>
                {chat.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-slate-900 truncate">{chat.name}</h3>
                  <span className="text-xs text-slate-500 shrink-0 ml-2">{chat.timestamp}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${chat.unread && activeChatId !== chat.id ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{chat.lastMessage}</p>
                  {chat.unread > 0 && activeChatId !== chat.id && <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0">{chat.unread}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteChat(chat);
                }}
                disabled={deleteBusyId === chat.id}
                className="shrink-0 rounded-full border border-rose-200 bg-white p-2 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={`Delete chat with ${chat.name}`}
              >
                <TrashIcon />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ChatWindow = ({
  activeChat,
  messages,
  onSendMessage,
  loading,
  sending,
  deleting,
  onDeleteChat,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, activeChat?.id]);

  useEffect(() => {
    setInputText('');
  }, [activeChat?.id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat?.id || sending) return;

    const content = inputText.trim();
    setInputText('');

    try {
      await onSendMessage(content);
    } catch {
      setInputText(content);
    }
  };

  if (!activeChat) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
      <div className="text-3xl mb-4 text-slate-400">
        <MessageSquare className="w-16 h-16 text-blue-200" />
      </div>
      <h2 className="text-xl font-semibold text-slate-700">Your Messages</h2>
      <p className="mt-2 text-sm">Select a conversation to start chatting</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      <div className="h-20 border-b border-slate-200 px-6 flex items-center gap-4 bg-white/95 backdrop-blur z-10 shrink-0">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">{activeChat.avatar}</div>
          {activeChat.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>}
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-slate-900">{activeChat.name}</h2>
          <p className="text-xs font-medium text-blue-600">{activeChat.role}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDeleteChat}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <TrashIcon />
            {deleting ? 'Deleting...' : 'Delete chat'}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No messages yet. Start the conversation below.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === 'me';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`px-5 py-3 rounded-2xl shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'}`}>
                    <p className="text-[15px] leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 font-medium px-1">{msg.time}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeChat.name}...`}
              className="w-full bg-transparent p-3.5 max-h-32 min-h-[48px] resize-none outline-none text-slate-700 text-[15px]"
              rows={1}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            />
          </div>
          <button type="submit" disabled={!inputText.trim() || sending || deleting} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shrink-0 shadow-sm">
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

function AuthPrompt() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <PageContainer className="flex flex-1 items-center justify-center py-10">
        <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-md">
          <h1 className="text-2xl flex items-center justify-center gap-3 font-bold text-slate-900">
            <MessageSquare className="w-8 h-8 text-blue-500" /> Sign in to manage your chats
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Chat history, replies, and delete actions are available after you sign in to your account.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to login
            </Link>
            <Link
              to="/register"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Create account
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

export default function ChatPage() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const requestedConversationIdRef = useRef(location.state?.conversationId || '');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const [deleteBusyId, setDeleteBusyId] = useState('');
  const [feedback, setFeedback] = useState({ tone: 'success', message: '' });

  const activeChat = useMemo(
    () => conversations.find((conversation) => conversation.id === activeChatId) || null,
    [activeChatId, conversations],
  );
  const activeMessages = messages[activeChatId] || [];

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(query) ||
        conversation.lastMessage.toLowerCase().includes(query),
    );
  }, [conversations, searchQuery]);

  useEffect(() => {
    if (!feedback.message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback({ tone: 'success', message: '' });
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback.message]);

  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([]);
      setMessages({});
      setActiveChatId(null);
      setLoading(false);
      return;
    }

    let ignore = false;

    const loadConversations = async () => {
      setLoading(true);
      setFeedback({ tone: 'success', message: '' });

      try {
        const response = await getConversations();

        if (ignore) {
          return;
        }

        const nextConversations = sortConversations(
          (Array.isArray(response) ? response : []).map(mapConversation),
        );
        const requestedConversationId = requestedConversationIdRef.current;

        setConversations(nextConversations);
        setActiveChatId((currentId) =>
          nextConversations.some((conversation) => conversation.id === currentId)
            ? currentId
            : nextConversations.some((conversation) => conversation.id === requestedConversationId)
              ? requestedConversationId
              : nextConversations[0]?.id || null,
        );
        requestedConversationIdRef.current = '';
      } catch (error) {
        if (!ignore) {
          setFeedback({
            tone: 'error',
            message: error.message || 'Could not load your chats right now.',
          });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadConversations();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !activeChatId) {
      return undefined;
    }

    let ignore = false;

    const loadMessages = async () => {
      setMessagesLoading(true);

      try {
        const response = await getMessages(activeChatId);

        if (ignore) {
          return;
        }

        setMessages((currentMessages) => ({
          ...currentMessages,
          [activeChatId]: (Array.isArray(response) ? response : []).map((message) =>
            mapMessage(message, activeChatId),
          ),
        }));
        setConversations((currentConversations) =>
          currentConversations.map((conversation) =>
            conversation.id === activeChatId
              ? {
                  ...conversation,
                  unread: 0,
                }
              : conversation,
          ),
        );
      } catch (error) {
        if (!ignore) {
          setFeedback({
            tone: 'error',
            message: error.message || 'Could not load the selected conversation.',
          });
        }
      } finally {
        if (!ignore) {
          setMessagesLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      ignore = true;
    };
  }, [activeChatId, isAuthenticated]);

  const handleSelectChat = (conversationId) => {
    setActiveChatId(conversationId);
    setConversations((currentConversations) =>
      currentConversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              unread: 0,
            }
          : conversation,
      ),
    );
  };

  const handleSendMessage = async (text) => {
    if (!activeChatId) {
      return;
    }

    setSendBusy(true);
    setFeedback({ tone: 'success', message: '' });

    try {
      const response = await sendChatMessage({
        conversationId: activeChatId,
        content: text,
      });

      const nextConversation = mapConversation(response.conversation || {});

      setMessages((currentMessages) => ({
        ...currentMessages,
        [activeChatId]: (Array.isArray(response.messages) ? response.messages : []).map((message) =>
          mapMessage(message, activeChatId),
        ),
      }));
      setConversations((currentConversations) =>
        sortConversations([
          nextConversation,
          ...currentConversations.filter((conversation) => conversation.id !== activeChatId),
        ]),
      );
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error.message || 'Could not send your message.',
      });
      throw error;
    } finally {
      setSendBusy(false);
    }
  };

  const handleDeleteChat = async (conversationToDelete = activeChat) => {
    if (!conversationToDelete) {
      return;
    }

    const confirmed = window.confirm(
      `Remove chat with ${conversationToDelete.name} from your inbox? It will reappear if a new message arrives.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleteBusyId(conversationToDelete.id);
    setFeedback({ tone: 'success', message: '' });

    try {
      await deleteChatConversation(conversationToDelete.id);

      const currentIndex = conversations.findIndex(
        (conversation) => conversation.id === conversationToDelete.id,
      );
      const remainingConversations = conversations.filter(
        (conversation) => conversation.id !== conversationToDelete.id,
      );
      const nextActiveConversation =
        remainingConversations[Math.min(currentIndex, Math.max(remainingConversations.length - 1, 0))] ||
        null;

      setConversations(remainingConversations);
      setMessages((currentMessages) => {
        const nextMessages = { ...currentMessages };
        delete nextMessages[conversationToDelete.id];
        return nextMessages;
      });
      setActiveChatId((currentId) =>
        currentId === conversationToDelete.id ? nextActiveConversation?.id || null : currentId,
      );
      setFeedback({
        tone: 'success',
        message: `Chat with ${conversationToDelete.name} was removed from your inbox.`,
      });
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error.message || 'Could not delete this chat.',
      });
    } finally {
      setDeleteBusyId('');
    }
  };

  if (!isAuthenticated) {
    return <AuthPrompt />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <PageContainer className="flex-1 py-6 flex flex-col">
        {feedback.message ? (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-medium ${
              feedback.tone === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="flex-1 bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden flex h-[calc(100vh-140px)] min-h-[600px]">
          <div className="w-full md:w-[340px] shrink-0 border-r border-slate-200">
            <ChatList
              conversations={filteredConversations}
              activeChatId={activeChatId}
              onSelectChat={handleSelectChat}
              onDeleteChat={handleDeleteChat}
              searchQuery={searchQuery}
              onSearch={setSearchQuery}
              loading={loading}
              deleteBusyId={deleteBusyId}
            />
          </div>
          <div className="hidden md:flex flex-1 min-w-0">
            <ChatWindow
              activeChat={activeChat}
              messages={activeMessages}
              onSendMessage={handleSendMessage}
              loading={messagesLoading}
              sending={sendBusy}
              deleting={deleteBusyId === activeChatId}
              onDeleteChat={() => handleDeleteChat(activeChat)}
            />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
