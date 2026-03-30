import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';

// --- DUMMY DATA ---
const INITIAL_CONVERSATIONS = [
  { id: '1', name: 'Rahul Sharma', role: 'React Mentor', lastMessage: 'Let me know when you are free to start.', timestamp: '10:30 AM', isOnline: true, unread: 2, avatar: 'R' },
  { id: '2', name: 'Priya Patel', role: 'UI/UX Designer', lastMessage: 'The figma files look great!', timestamp: 'Yesterday', isOnline: false, unread: 0, avatar: 'P' },
  { id: '3', name: 'Amit Kumar', role: 'Backend Developer', lastMessage: 'I deployed the API to Heroku.', timestamp: 'Mon', isOnline: true, unread: 0, avatar: 'A' }
];

const INITIAL_MESSAGES = {
  '1': [
    { id: 1, senderId: 'me', text: 'Hi Rahul, I am interested in your React mentorship.', time: '10:15 AM' },
    { id: 2, senderId: '1', text: 'Hello! Thanks for reaching out.', time: '10:20 AM' },
    { id: 3, senderId: '1', text: 'I have opening for this weekend.', time: '10:21 AM' },
    { id: 4, senderId: '1', text: 'Let me know when you are free to start.', time: '10:30 AM' },
  ],
  '2': [
    { id: 1, senderId: '2', text: 'Did you check the new designs?', time: 'Yesterday' },
    { id: 2, senderId: 'me', text: 'Yes, they look amazing. Do we need any changes?', time: 'Yesterday' },
    { id: 3, senderId: '2', text: 'The figma files look great!', time: 'Yesterday' },
  ],
  '3': [
    { id: 1, senderId: 'me', text: 'Is the backend ready for testing?', time: 'Mon' },
    { id: 2, senderId: '3', text: 'Almost done.', time: 'Mon' },
    { id: 3, senderId: '3', text: 'I deployed the API to Heroku.', time: 'Mon' },
  ]
};

const ChatList = ({ conversations, activeChatId, onSelectChat, searchQuery, onSearch }) => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Messages</h2>
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
        {conversations.map((chat) => (
          <div key={chat.id} onClick={() => onSelectChat(chat.id)} className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-slate-50 last:border-none ${activeChatId === chat.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600">{chat.avatar}</div>
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
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatWindow = ({ activeChat, messages, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  if (!activeChat) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-500">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm text-slate-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
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
          <button className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">??</button>
          <button className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">??</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === 'me';
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3 rounded-2xl shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'}`}>
                  <p className="text-[15px] leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 font-medium px-1">{msg.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-3 max-w-4xl mx-auto">
          <button type="button" className="p-3 text-slate-400 hover:text-blue-600 transition-colors shrink-0">??</button>
          <div className="flex-1 relative bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-transparent p-3.5 max-h-32 min-h-[48px] resize-none outline-none text-slate-700 text-[15px]"
              rows={1}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            />
          </div>
          <button type="submit" disabled={!inputText.trim()} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shrink-0 shadow-sm">?</button>
        </form>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activeChatId, setActiveChatId] = useState(INITIAL_CONVERSATIONS[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const activeChat = conversations.find(c => c.id === activeChatId);
  const activeMessages = messages[activeChatId] || [];

  const filteredConversations = conversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSendMessage = (text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => ({ ...prev, [activeChatId]: [...(prev[activeChatId] || []), { id: Date.now(), senderId: 'me', text, time }] }));
    setConversations(prev => prev.map(chat => chat.id === activeChatId ? { ...chat, lastMessage: text, timestamp: time, unread: 0 } : chat));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <PageContainer className="flex-1 py-6 flex flex-col">
        <div className="flex-1 bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden flex h-[calc(100vh-140px)] min-h-[600px]">
          <div className="w-full md:w-[340px] shrink-0 border-r border-slate-200">
            <ChatList conversations={filteredConversations} activeChatId={activeChatId} onSelectChat={(id) => { setActiveChatId(id); setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c)); }} searchQuery={searchQuery} onSearch={setSearchQuery} />
          </div>
          <div className="hidden md:flex flex-1 min-w-0">
            <ChatWindow activeChat={activeChat} messages={activeMessages} onSendMessage={handleSendMessage} />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
