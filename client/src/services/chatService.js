import api from './api';

export function createOrOpenConversation(payload) {
  return api.post('/chat/conversations', payload).then((response) => response.data);
}

export function getConversations() {
  return api.get('/chat/conversations').then((response) => response.data);
}

export function deleteConversation(conversationId) {
  return api.delete(`/chat/conversations/${conversationId}`).then((response) => response.data);
}

export function getMessages(conversationId) {
  return api.get(`/chat/messages/${conversationId}`).then((response) => response.data);
}

export function sendMessage(messageData) {
  return api.post('/chat/messages', messageData).then((response) => response.data);
}

export function markConversationRead(conversationId) {
  return api.post('/chat/mark-read', { conversationId }).then((response) => response.data);
}
