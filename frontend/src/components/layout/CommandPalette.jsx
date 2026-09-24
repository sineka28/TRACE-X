import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Clock,
  GitBranch,
  Network,
  FileText,
  User,
  Settings,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';

export function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          onClose(); // toggle or open via parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'demo',
      icon: Sparkles,
      title: 'Open Campus Parking Incident (Demo)',
      category: 'Quick Launch',
      action: () => navigate('/investigations/demo-campus-parking-001'),
    },
    {
      id: 'new-inv',
      icon: PlusCircle,
      title: 'Create New Investigation',
      category: 'Actions',
      action: () => navigate('/investigations?action=new'),
    },
    {
      id: 'evidence-hub',
      icon: Search,
      title: 'Browse Evidence Ingestion Hub',
      category: 'Navigation',
      action: () => navigate('/evidence'),
    },
    {
      id: 'timeline',
      icon: Clock,
      title: 'Inspect Unified Timeline',
      category: 'Analysis',
      action: () => navigate('/investigations/demo-campus-parking-001?tab=timeline'),
    },
    {
      id: 'hypotheses',
      icon: GitBranch,
      title: 'Review Competing Hypotheses & Counterfactuals',
      category: 'Analysis',
      action: () => navigate('/investigations/demo-campus-parking-001?tab=hypotheses'),
    },
    {
      id: 'graph',
      icon: Network,
      title: 'Open Interactive Evidence Graph',
      category: 'Analysis',
      action: () => navigate('/investigations/demo-campus-parking-001?tab=graph'),
    },
    {
      id: 'reports',
      icon: FileText,
      title: 'Generate or View Investigation Reports',
      category: 'Reports',
      action: () => navigate('/reports'),
    },
    {
      id: 'profile',
      icon: User,
      title: 'Investigator Profile & Credentials',
      category: 'System',
      action: () => navigate('/profile'),
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'System Settings & API Configuration',
      category: 'System',
      action: () => navigate('/settings'),
    },
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:pt-24 text-center">
        <div
          className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white text-left shadow-dropdown transition-all border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Bar */}
          <div className="flex items-center px-4 border-b border-slate-100">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              autoFocus
              type="text"
              placeholder="Type a command or search investigations, events, hypotheses..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-14 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No commands matching "{query}"
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-50 text-slate-600 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 group-hover:text-indigo-900">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {item.category}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
                  </button>
                );
              })
            )}
          </div>

          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              Use <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">Ctrl+K</kbd> anytime
            </span>
            <span>Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
