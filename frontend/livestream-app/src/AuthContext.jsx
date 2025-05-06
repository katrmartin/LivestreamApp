import React, { createContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [loading, setLoading] = useState(true);

  const fetchUser = async (session) => {
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

      if (!insertRes.error) data = insertRes.data;
    }

    if (data) {
      setUser({ ...session.user, name: data.name, is_admin: data.is_admin });
    } else {
      setUser(session.user);
    }

    localStorage.setItem('supabase_session', JSON.stringify(session));
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchUser(session);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchUser(session);
      else setUser(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
