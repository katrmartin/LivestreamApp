import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  const containerStyle = {
    textAlign: 'center',
    padding: '80px 20px',
    fontFamily: "'Segoe UI', sans-serif",
    backgroundColor: 'white',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const headingStyle = {
    fontSize: '120px',
    margin: 0,
    color: '#860037',
  };

  const textStyle = {
    fontSize: '20px',
    color: '#860037',
    margin: '20px 0',
  };

  const linkStyle = {
    display: 'flex',
    margin: '0 auto',
    padding: '10px 20px',
    backgroundColor: '#860037',
    color: 'white',
    width: '250px',
    textDecoration: 'none',
    borderRadius: '25px',
    transition: 'background-color 0.3s',
    justifyContent: 'center'
  };

  const linkHoverStyle = {
    backgroundColor: '#610028',
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>404</h1>
      <p style={textStyle}>Oops! No livestreams here!</p>
      <Link
        to="/home"
        style={linkStyle}
        onMouseEnter={(e) => (e.target.style.backgroundColor = linkHoverStyle.backgroundColor)}
        onMouseLeave={(e) => (e.target.style.backgroundColor = linkStyle.backgroundColor)}
      >
        Take me home
      </Link>
    </div>
  );
};

export default NotFoundPage;
