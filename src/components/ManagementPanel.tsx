import { useState } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { useChatStore, type ChatSession } from '../stores/chatStore';
import { useHistoryStore, type Activity } from '../stores/historyStore';
import { X, Clock, MessageCircle, Activity as ActivityIcon, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

type Tab = 'sessions' | 'chats' | 'history';

export function ManagementPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('sessions');

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50"
        title="Session & History Manager"
      >
        <ActivityIcon size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Session & History Manager</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          {(['sessions', 'chats', 'history'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 overflow-auto max-h-[60vh]">
          {activeTab === 'sessions' && <SessionsTab />}
          {activeTab === 'chats' && <ChatsTab />}
          {activeTab === 'history' && <HistoryTab />}
        </div>
      </div>
    </div>
  );
}

function SessionsTab() {
  const { sessions, clearSessions } = useSessionStore();

  if (sessions.length === 0) {
    return <p className="text-gray-400 text-center py-8">No sessions recorded</p>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={clearSessions}
          className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
        >
          <Trash2 size={14} /> Clear All
        </button>
      </div>
      <div className="space-y-2">
        {sessions.map((session) => (
          <div key={session.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-medium">{session.role}</p>
                <p className="text-gray-400 text-sm">ID: {session.id.slice(0, 8)}...</p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <p>Started: {new Date(session.startedAt).toLocaleString()}</p>
                <p>Last active: {new Date(session.lastActiveAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatsTab() {
  const { chatSessions, deleteChat, clearChats } = useChatStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (chatSessions.length === 0) {
    return <p className="text-gray-400 text-center py-8">No chat sessions recorded</p>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={clearChats}
          className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
        >
          <Trash2 size={14} /> Clear All
        </button>
      </div>
      <div className="space-y-2">
        {chatSessions.map((chat) => (
          <ChatItem key={chat.id} chat={chat} expanded={expanded} setExpanded={setExpanded} onDelete={() => deleteChat(chat.id)} />
        ))}
      </div>
    </div>
  );
}

function ChatItem({ chat, expanded, setExpanded, onDelete }: { chat: ChatSession; expanded: string | null; setExpanded: (id: string | null) => void; onDelete: () => void }) {
  const isExpanded = expanded === chat.id;
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <button
        onClick={() => setExpanded(isExpanded ? null : chat.id)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-750"
      >
        <div className="text-left">
          <p className="text-white font-medium">{chat.title}</p>
          <p className="text-gray-400 text-sm">{chat.messages.length} messages</p>
        </div>
        {isExpanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
      </button>
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-700">
          <div className="mt-3 space-y-2 max-h-40 overflow-auto">
            {chat.messages.map((msg) => (
              <div key={msg.id} className={`text-sm p-2 rounded ${msg.role === 'user' ? 'bg-blue-900/30' : 'bg-gray-700/50'}`}>
                <span className="text-gray-400 text-xs uppercase">{msg.role}: </span>
                <span className="text-gray-200">{msg.content.slice(0, 100)}</span>
              </div>
            ))}
          </div>
          <button onClick={onDelete} className="mt-2 text-red-400 text-xs hover:text-red-300">Delete chat</button>
        </div>
      )}
    </div>
  );
}

function HistoryTab() {
  const { activities, clearHistory } = useHistoryStore();

  if (activities.length === 0) {
    return <p className="text-gray-400 text-center py-8">No activity history</p>;
  }

  const typeColors: Record<string, string> = {
    routine_completed: 'bg-green-500',
    routine_started: 'bg-blue-500',
    medication_taken: 'bg-yellow-500',
    ai_interaction: 'bg-purple-500',
    session_start: 'bg-cyan-500',
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={clearHistory}
          className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
        >
          <Trash2 size={14} /> Clear All
        </button>
      </div>
      <div className="space-y-2">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${typeColors[activity.type] || 'bg-gray-500'}`} />
            <div className="flex-1">
              <p className="text-white font-medium">{activity.title}</p>
              <p className="text-gray-400 text-sm">{activity.description}</p>
              <p className="text-gray-500 text-xs mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}