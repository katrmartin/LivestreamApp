import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from './supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : undefined; // still loading if undefined
  });
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJWTUser = async () => {
      if (token) {
        try {
          const res = await axios.get('http://localhost:8000/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error('JWT token invalid or expired');
          setUser(null);
          setToken('');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchJWTUser();
  }, [token]);

  useEffect(() => {
    const checkSupabaseUser = async () => {
      const { data: { session }} = await supabase.auth.getSession();

      const getOrInsertUser = async (session) => {
        const email = session.user.email;
        const fullName = session.user.user_metadata?.full_name || email;
      
        let { data } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
      
        if (!data && email) {
          const insertRes = await supabase
            .from('users')
            .insert({ email, name: fullName, pay_status: false })
            .select()
            .single();
      
          if (!insertRes.error) {
            data = insertRes.data;
          } else {
            console.error('Insert error:', insertRes.error.message);
          }
        }
      
        if (data) {
          console.log("GOOD Set user from session (admin status):", data);
          setUser({ ...session.user, name: data.name, is_admin: data.is_admin });
        } else {
          console.log("GOOD Set user from session (no data row):", session.user);
          setUser(session.user);
        }
      
        localStorage.setItem('supabase_session', JSON.stringify(session));
      };
      

      if (session?.user) {
        await getOrInsertUser(session);
      } else {
        console.log('Initial session is null, waiting for auth state change...');
      }

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth change:', event, session);
      
        if (session?.user) {
          await getOrInsertUser(session);
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setUser(null);
          localStorage.removeItem('supabase_session');
        } else {
          console.log('Skipped setting user to null due to transient state');
        }
      });
      setLoading(false);
      return () => subscription.unsubscribe();
    };

    checkSupabaseUser();
  }, []);

  const login = (jwt, userData) => {
    console.log("LOGIN:", userData);
    setToken(jwt);
    localStorage.setItem('token', jwt);
    setUser(userData);
    console.log("User set in AuthContext:", userData);

    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
