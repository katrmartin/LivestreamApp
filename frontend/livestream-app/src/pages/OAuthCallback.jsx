import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const finalizeLogin = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl();

      if (error) {
        console.error('OAuth error:', error.message);
        navigate('/login');
        return;
      }

      const session = data?.session;
      const user = session?.user;

      if (user) {
        const email = user.email;

        // Optional: insert user into your custom 'users' table
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (fetchError) {
          console.error('User fetch error:', fetchError.message);
        }

        if (!existingUser) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({ email, pay_status: false });

          if (insertError) {
            console.error('User insert error:', insertError.message);
          }
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
