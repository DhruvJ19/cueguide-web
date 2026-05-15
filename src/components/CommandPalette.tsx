import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, ClipboardList, FileText, LayoutDashboard, Pill, Radio, Settings, User, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: Props) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { setRole } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearch('');
    }
  }, [isOpen]);

  // Handle keyboard navigation for closing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const commands = [
    { id: 'nav-today', icon: <LayoutDashboard />, title: 'Care overview', section: 'Navigation', action: () => onNavigate('today') },
    { id: 'nav-medications', icon: <Pill />, title: 'Medications', section: 'Navigation', action: () => onNavigate('medications') },
    { id: 'nav-routines', icon: <Calendar />, title: 'Routines', section: 'Navigation', action: () => onNavigate('routines') },
    { id: 'nav-session', icon: <Radio />, title: 'Live session', section: 'Navigation', action: () => onNavigate('session') },
    { id: 'nav-reports', icon: <FileText />, title: 'Reports', section: 'Navigation', action: () => onNavigate('reports') },
    { id: 'nav-settings', icon: <Settings />, title: 'Settings', section: 'Navigation', action: () => onNavigate('settings') },
    { id: 'action-patient', icon: <User size={18} />, title: 'Open patient mode', section: 'Actions', action: () => setRole('patient') },
  ];

  interface CommandItem {
    id: string;
    icon: React.ReactElement;
    title: string;
    section: string;
    action: () => void;
  }

  const filteredCommands = commands.filter((cmd: CommandItem) => 
    cmd.title.toLowerCase().includes(search.toLowerCase()) || 
    cmd.section.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="command-backdrop"
          />
          <div className="command-layer">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="command-shell"
            >
              <div className="command-search-row">
                <Search size={20} />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a care screen"
                />
                <button onClick={onClose}>
                  <X size={20} />
                </button>
              </div>

              <div className="command-results">
                {filteredCommands.length === 0 ? (
                  <div className="command-empty">No results found.</div>
                ) : (
                  Object.entries(
                    filteredCommands.reduce((acc, cmd) => {
                      (acc[cmd.section] = acc[cmd.section] || []).push(cmd);
                      return acc;
                    }, {} as Record<string, typeof commands>)
                  ).map(([section, cmds]) => (
                    <div key={section} className="command-section">
                      <div className="command-section-label">{section}</div>
                      <div className="command-list">
                        {cmds.map((cmd) => (
                          <button
                            key={cmd.id}
                            onClick={() => {
                              cmd.action();
                              onClose();
                            }}
                            className="command-item"
                          >
                            <span>
                              {React.createElement(cmd.icon.type, { size: 18 })}
                            </span>
                            <span className="font-medium">{cmd.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="command-footer">
                <span>Search care screens</span>
                <span>Press <kbd>esc</kbd> to close</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
