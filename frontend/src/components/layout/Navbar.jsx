import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

export function Navbar({ onOpenMobileMenu, onOpenCommandPalette }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Demo Incident Ready',
      message: 'Campus Parking Incident synthetic evidence loaded and ready for analysis.',
      type: 'success',
      time: 'Just now',
    },
    {
      id: '2',
      title: 'Unknown Gap Detected',
      message: '9-second coverage gap identified between Camera B and Camera C.',
      type: 'warning',
      time: '5m ago',
    },
  ]);

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Breadcrumb from route
  const pathParts = location.pathname.split('/').filter(Boolean);
  const getBreadcrumbTitle = (part) => {
    if (part === 'dashboard') return 'Dashboard';
    if (part === 'investigations') return 'Investigations';
    if (part === 'evidence') return 'Evidence Hub';
    if (part === 'analysis') return 'Analysis';
    if (part === 'reports') return 'Reports';
    if (part === 'settings') return 'Settings';
    if (part === 'profile') return 'Profile';
    if (part.startsWith('demo-')) return 'Campus Parking Incident';
    return part.length > 12 ? `${part.substring(0, 10)}...` : part;
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 min-w-0 overflow-hidden">
          <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
            TRACE-X
          </Link>
          {pathParts.map((part, index) => {
            const isLast = index === pathParts.length - 1;
            const routeTo = '/' + pathParts.slice(0, index + 1).join('/');
            return (
              <React.Fragment key={routeTo}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                {isLast ? (
                  <span className="font-bold text-slate-900 truncate">
                    {getBreadcrumbTitle(part)}
                  </span>
                ) : (
                  <Link
                    to={routeTo}
                    className="hover:text-indigo-600 transition-colors truncate"
                  >
                    {getBreadcrumbTitle(part)}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Search, Notifications & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Global Search Button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors"
          title="Search Command Palette (Ctrl+K)"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-400">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
          </button>

          {notifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-dropdown p-4 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">Intelligence Notifications</span>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {notifications.length} New
                </span>
              </div>
              <div className="divide-y divide-slate-100 mt-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="py-3 flex items-start gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors">
                    <div className="mt-0.5">
                      {n.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900">{n.title}</div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user?.full_name || 'User'}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white font-bold flex items-center justify-center text-xs">
                {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user?.full_name || 'Alex Rivera'}
              </span>
              <span className="text-[10px] text-slate-500 leading-tight">
                {user?.email || 'investigator@trace-x.ai'}
              </span>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-dropdown p-2 animate-in fade-in zoom-in-95 duration-100 text-xs font-semibold">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="font-bold text-slate-900">{user?.full_name || 'Alex Rivera'}</div>
                <div className="text-[11px] font-normal text-slate-500 truncate">{user?.email}</div>
              </div>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/settings?tab=security');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                <Shield className="w-4 h-4 text-slate-400" />
                Security
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={async () => {
                  setUserMenuOpen(false);
                  await logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
