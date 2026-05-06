import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, Activity, Calendar, Settings, Shield, User, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: Props) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { setRole } = useAuthStore();
  const { theme, setTheme } = useSettingsStore();

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
    { id: 'nav-routines', icon: <Calendar />, title: 'Manage Routines', section: 'Navigation', action: () => onNavigate('routines') },
    { id: 'nav-analytics', icon: <Activity />, title: 'View Analytics', section: 'Navigation', action: () => onNavigate('analytics') },
    { id: 'nav-devices', icon: <Command />, title: 'Manage Devices', section: 'Navigation', action: () => onNavigate('devices') },
    { id: 'nav-compliance', icon: <Shield />, title: 'PHI Compliance', section: 'Navigation', action: () => onNavigate('compliance') },
    { id: 'nav-reports', icon: <Search />, title: 'Generate Reports', section: 'Navigation', action: () => onNavigate('reports') },
    
    { id: 'action-patient', icon: <User />, title: 'Switch to Patient Mode', section: 'Actions', action: () => setRole('patient') },
    { id: 'action-theme', icon: <Settings />, title: `Toggle Theme (${theme})`, section: 'Actions', action: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
  ];

  const filteredCommands = commands.filter(cmd => 
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
          />
          <div className="fixed inset-0 flex items-start justify-center pt-[15vh] z-[1000] pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="w-full max-w-2xl bg-[#0f111a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center px-4 py-4 border-b border-white/5 relative">
                <Search className="text-white/40 mr-3" size={20} />
                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type a command or search..."
                  className="w-full bg-transparent text-lg text-white placeholder:text-white/30 outline-none font-light"
                />
                <button onClick={onClose} className="p-1 rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center text-white/40">No results found.</div>
                ) : (
                  Object.entries(
                    filteredCommands.reduce((acc, cmd) => {
                      (acc[cmd.section] = acc[cmd.section] || []).push(cmd);
                      return acc;
                    }, {} as Record<string, typeof commands>)
                  ).map(([section, cmds]) => (
                    <div key={section} className="mb-4">
                      <div className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
                        {section}
                      </div>
                      <div className="space-y-1">
                        {cmds.map((cmd) => (
                          <button
                            key={cmd.id}
                            onClick={() => {
                              cmd.action();
                              onClose();
                            }}
                            className="w-full flex items-center px-3 py-3 rounded-xl hover:bg-indigo-600/20 hover:text-indigo-300 text-white/70 transition-all group text-left"
                          >
                            <span className="text-white/30 group-hover:text-indigo-400 mr-3 transition-colors">
                              {React.cloneElement(cmd.icon as React.ReactElement, { size: 18 })}
                            </span>
                            <span className="font-medium">{cmd.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-3 bg-white/5 border-t border-white/5 text-xs text-white/30 flex items-center justify-between">
                <span>Use <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">↑</kbd> <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">↓</kbd> to navigate</span>
                <span>Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono">esc</kbd> to close</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
