import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // optional if you want to check user

  useEffect(() => {
    const finalizeLogin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const email = session.user.email;

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !data) {
          console.error('Error fetching user info:', error?.message);
          navigate('/login');
          return;
        }

        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (!existingUser) {
          await supabase.from('users').insert({ email, pay_status: false });
        }


        navigate('/home');
      } else {
        navigate('/login');
      }
    };

    finalizeLogin();
  }, [navigate]);

  return <p>Completing login...</p>;
};

export default OAuthCallback;
