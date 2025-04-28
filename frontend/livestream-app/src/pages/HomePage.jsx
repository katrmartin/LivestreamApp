import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import '../styles.css';

const slides = [
  {
    image: '/images/Image.jpeg',
    title: 'Welcome to StampedeStream',
    description: "Home of CMU Club Women's Rugby Livestreaming.",
    link: '/stream',
    linkText: 'Watch Now',
  },
  {
    image: '/images/Image.jpeg',
    title: 'About the Team',
    description: 'Learn more about the team, roster, and schedule.',
    link: 'https://cmumavericks.com/sports/womens-rugby',
    linkText: "Visit Women's Rugby Page",
  }, 
  {
    image: '/images/Image.jpeg',
    title: 'Watch Past Games',
    description: 'Catchup on past rugby games.',
    link: 'https://www.youtube.com/@CMUMavericks', // Replace with actual YouTube link
    linkText: 'Watch Past Games',
  },
  {
    image: '/images/Image.jpeg',
    title: 'Support the Team',
    description: 'Help us grow by donating to our program.',
    link: 'https://engage.supportingcmu.org/give/627210/#!/donation/checkout?recurring=0',
    linkText: 'Donate Now',
  },
];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName =
    user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  // Automatically move to the next slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <nav>
        
        <div className="nav-logo">
          <img src="/images/logo_main.svg" alt="Logo" />
        </div>
        <ul className="nav-left">
          <li><Link to="/">Home</Link></li>
        </ul>
        <ul className="nav-right">
          <li><Link to="/stream">Stream</Link></li>
          {user?.is_admin && (
            <li><a href="/admin">Admin</a></li>
          )}
        </ul>

        {user && (
          <div className="nav-user-controls">
            <span className="user-greeting">Hi {displayName}!</span>
            <button className="logout-btn" onClick={handleLogout}>Log Out</button>
          </div>
        )}
      </nav>

      <header className="hero">
        <div className="carousel-track-container">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div className="carousel-slide" key={index}>
                <img src={slide.image} alt={slide.title} className="carousel-image" />
                <div className="carousel-overlay"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Centered dynamic content */}
        <div className="carousel-content">
          <h1>{slides[currentSlide].title}</h1>
          <p>{slides[currentSlide].description}</p>
          <a
            href={slides[currentSlide].link}
            className="btn"
            target={slides[currentSlide].link.startsWith('http') ? '_blank' : '_self'}
            rel="noreferrer"
          >
            {slides[currentSlide].linkText}
          </a>
        </div>

        <div className="carousel-controls">
          <button onClick={goToPrevious}>&#10094;</button>
          <button onClick={goToNext}>&#10095;</button>
        </div>
      </header>

      <footer>
        <p>&copy; 2025 StampedeStream. All rights reserved.</p>
      </footer>
    </>
  );
};

export default HomePage;
