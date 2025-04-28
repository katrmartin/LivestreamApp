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
  
        const fullUser = {
          ...session.user,
          name: data.name,
          is_admin: data.is_admin,
          pay_status: data.pay_status
        };
  
        login('', fullUser);
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
