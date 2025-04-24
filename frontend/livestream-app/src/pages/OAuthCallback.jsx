import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { AuthContext } from '../AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const finalizeLogin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        login('', session.user);
        navigate('/home');
      } else {
        navigate('/login');
      }
    };

    finalizeLogin();
}, [navigate, login]);

  return <p>Completing login...</p>;
};

export default OAuthCallback;
