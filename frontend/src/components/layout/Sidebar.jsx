import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Files,
  Cpu,
  FileText,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Shield,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { user } = useAuth();

  const mainNav = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Investigations', to: '/investigations', icon: FolderKanban },
    { name: 'Evidence', to: '/evidence', icon: Files },
    { name: 'Analysis', to: '/analysis', icon: Cpu },
    { name: 'Reports', to: '/reports', icon: FileText },
  ];

  const secondaryNav = [
    { name: 'Settings', to: '/settings', icon: Settings },
    { name: 'Profile', to: '/profile', icon: User },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-indigo-700 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-subtle">
            <Shield className="w-5 h-5 text-indigo-100" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
                TRACE-X
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 mt-1">
                Evidence Engine
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 items-center justify-center transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {!isCollapsed && 'Investigation Intelligence'}
        </div>
        {mainNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-subtle'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0`} />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {!isCollapsed && 'System'}
        </div>
        {secondaryNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-subtle'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom User Profile */}
      <div className="p-3 border-t border-slate-100 flex-shrink-0">
        <NavLink
          to="/profile"
          onClick={onCloseMobile}
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={user?.full_name || 'Investigator Profile'}
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name || 'Avatar'}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/20 flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center flex-shrink-0 text-xs">
              {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
            </div>
          )}
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">
                {user?.full_name || 'Alex Rivera'}
              </span>
              <span className="text-[11px] text-slate-500 truncate">
                {user?.role || 'Lead Analyst'}
              </span>
            </div>
          )}
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-200 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
