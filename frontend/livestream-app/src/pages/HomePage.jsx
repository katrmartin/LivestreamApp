import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
// import '../styles.css';
import '../styles/homepage.css';
import '../styles/global.css';
import '../styles/responsive.css';

const slides = [
  {
    image: '/images/CMUChampionship412.jpg',
  },
  {
    image: '/images/CMUwomensRugby.jpg',
  }, 
  {
    image: '/images/IMG_1021.jpg',
  },
  {
    image: '/images/IMG_2221.jpg',
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

<header className="hero-new">
  <div className="hero-box">
    <nav className="hero-nav">
      {/* <div className="nav-logo">
        <img src="/images/logo_main.svg" alt="Logo" />
      </div> */}
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

    <div className="hero-content">
  <div className="hero-left-text">
    <h2>COLORADO MESA UNIVERSITY<br />WOMEN'S CLUB RUGBY</h2>
    <p>Live from the pitch<br /><Link to="/stream" className="stream-btn">
      Go To Stream  →
    </Link></p>
  </div>

  {/* <div className="hero-photo-stack">
  <div className="photo-stack-wrapper">
    {slides.map((slide, index) => (
      <img
        key={index}
        src={slide.image}
        alt={`Slide ${index + 1}`}
        className={`photo-stack-image ${index === currentSlide ? 'active' : ''}`}
        style={{
          transform: `rotate(${(index - 1) * 7}deg)`,
          zIndex: index === currentSlide ? 10 : index, // Top image higher z-index
          opacity: index === currentSlide ? 1 : 0.7,
        }}
      />
    ))}
  </div>
</div> */}
</div>


    {/* WRAP the heading separately */}
    <div className="hero-title-container">
      <h1>STAMPEDESTREAM</h1>
    </div>
  </div>
</header>

<main className="home-content">
  {/* About the Team */}
  <section className="info-section" id="about">
    <h2>About the Team</h2>
    <p>
      Learn more about the CMU Women's Rugby team — our history, values, and upcoming seasons.
    </p>
    <a
      href="https://cmumavericks.com/sports/womens-rugby"
      className="info-button"
      target="_blank"
      rel="noopener noreferrer"
    >
      Visit Team Page
    </a>
  </section>

  {/* Watch Past Games */}
  <section className="info-section" id="past-games">
    <h2>Watch Past Games</h2>
    <p>
      Relive exciting matches and witness the growth of the team through past livestreams.
    </p>
    <a
      href="https://www.youtube.com/@CMUMavericks"
      className="info-button"
      target="_blank"
      rel="noopener noreferrer"
    >
      Watch on YouTube
    </a>
  </section>

  {/* Donate */}
  <section className="info-section" id="donate">
    <h2>Support the Team</h2>
    <p>
      Your donations help us travel, compete, and continue growing. Thank you for your support!
    </p>
    <a
      href="https://engage.supportingcmu.org/give/627210/#!/donation/checkout?recurring=0"
      className="info-button"
      target="_blank"
      rel="noopener noreferrer"
    >
      Donate Now
    </a>
  </section>

</main>

      <footer>
        <p>&copy; 2025 StampedeStream. All rights reserved.</p>
      </footer>
    </>
  );
};

export default HomePage;
