import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from './supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined = loading
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
          setUser({ ...session.user, name: data.name });
        } else {
          setUser(session.user);
        }

        localStorage.setItem('supabase_session', JSON.stringify(session));
      };

      if (session?.user) {
        await getOrInsertUser(session);
      } else {
        setUser(null);
        localStorage.removeItem('supabase_session');
      }

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await getOrInsertUser(session);
        } else {
          setUser(null);
          localStorage.removeItem('supabase_session');
        }
      });
      setLoading(false);
      return () => subscription.unsubscribe();
    };

    checkSupabaseUser();
  }, []);

  const login = (jwt, userData) => {
    setToken(jwt);
    localStorage.setItem('token', jwt);
    setUser(userData);
  };

  const logout = async () => {
    setToken('');
    localStorage.removeItem('token');
    setUser(null);
    await supabase.auth.signOut(); // logs out Supabase users too
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
