import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

const DEMO_USER = {
  id: 'demo-investigator-001',
  email: 'investigator@trace-x.ai',
  full_name: 'Dr. Alex Rivera',
  organization: 'TRACE-X Campus Safety Intelligence',
  role: 'Senior Forensic Analyst',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  created_at: new Date('2024-01-15').toISOString(),
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for active session first
    const savedUser = localStorage.getItem('tracex_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('tracex_user');
      }
    }

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            organization: session.user.user_metadata?.organization || 'TRACE-X Intelligence',
            role: session.user.user_metadata?.role || 'Lead Investigator',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            created_at: session.user.created_at,
          });
        } else {
          // Default to demo session for ease of hackathon demo if no user
          setUser(DEMO_USER);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            organization: session.user.user_metadata?.organization || 'TRACE-X Intelligence',
            role: session.user.user_metadata?.role || 'Lead Investigator',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            created_at: session.user.created_at,
          });
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // By default in demo mode, auto-login Dr. Alex Rivera
      setUser(DEMO_USER);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const u = {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        organization: data.user.user_metadata?.organization || 'TRACE-X Intelligence',
        role: data.user.user_metadata?.role || 'Lead Investigator',
        avatar_url: data.user.user_metadata?.avatar_url || null,
        created_at: data.user.created_at,
      };
      setUser(u);
      localStorage.setItem('tracex_user', JSON.stringify(u));
      return u;
    } else {
      // Offline / Local Mock login
      const u = {
        ...DEMO_USER,
        email: email || DEMO_USER.email,
        full_name: email ? email.split('@')[0] : DEMO_USER.full_name,
      };
      setUser(u);
      localStorage.setItem('tracex_user', JSON.stringify(u));
      return u;
    }
  };

  const loginAsDemo = () => {
    setUser(DEMO_USER);
    localStorage.setItem('tracex_user', JSON.stringify(DEMO_USER));
    return DEMO_USER;
  };

  const register = async (email, password, fullName) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: 'Lead Investigator' } },
      });
      if (error) throw error;
      if (data.user) {
        const u = {
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          organization: 'TRACE-X Intelligence',
          role: 'Lead Investigator',
          avatar_url: null,
          created_at: data.user.created_at,
        };
        setUser(u);
        localStorage.setItem('tracex_user', JSON.stringify(u));
        return u;
      }
    } else {
      const u = {
        id: `user-${Date.now()}`,
        email,
        full_name: fullName,
        organization: 'TRACE-X Intelligence',
        role: 'Lead Investigator',
        avatar_url: null,
        created_at: new Date().toISOString(),
      };
      setUser(u);
      localStorage.setItem('tracex_user', JSON.stringify(u));
      return u;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('tracex_user');
    setUser(null);
  };

  const updateProfile = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('tracex_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginAsDemo,
        register,
        logout,
        updateProfile,
        isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
