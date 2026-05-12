import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  patientId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  context?: {
    routineName?: string;
    stepIndex?: number;
    preferences?: Record<string, unknown>;
  };
}

interface ChatState {
  chatSessions: ChatSession[];
  currentChatId: string | null;

  createChat: (patientId: string, title?: string, context?: ChatSession['context']) => string;
  addMessage: (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  getChat: (chatId: string) => ChatSession | undefined;
  getChatsByPatient: (patientId: string) => ChatSession[];
  updateChatContext: (chatId: string, context: Partial<ChatSession['context']>) => void;
  deleteChat: (chatId: string) => void;
  clearChats: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chatSessions: [],
      currentChatId: null,

      createChat: (patientId, title = 'New Chat', context) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const session: ChatSession = {
          id,
          patientId,
          title,
          messages: [],
          createdAt: now,
          updatedAt: now,
          context,
        };
        set((state) => ({
          chatSessions: [...state.chatSessions, session],
          currentChatId: id,
        }));
        return id;
      },

      addMessage: (chatId, message) => {
        const now = new Date().toISOString();
        const fullMessage: ChatMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: now,
        };
        set((state) => ({
          chatSessions: state.chatSessions.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, fullMessage],
                  updatedAt: now,
                }
              : chat
          ),
        }));
      },

      getChat: (chatId) => {
        return get().chatSessions.find((c) => c.id === chatId);
      },

      getChatsByPatient: (patientId) => {
        return get().chatSessions
          .filter((c) => c.patientId === patientId)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      },

      updateChatContext: (chatId, context) => {
        set((state) => ({
          chatSessions: state.chatSessions.map((chat) =>
            chat.id === chatId ? { ...chat, context: { ...chat.context, ...context } } : chat
          ),
        }));
      },

      deleteChat: (chatId) => {
        set((state) => ({
          chatSessions: state.chatSessions.filter((c) => c.id !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
        }));
      },

      clearChats: () => {
        set({ chatSessions: [], currentChatId: null });
      },
    }),
    { name: 'cueguide-chats' }
  )
);