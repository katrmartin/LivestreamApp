import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { useRef } from 'react';
import '../styles/homepage.css';
import '../styles/global.css';
import '../styles/responsive.css';



const slides = [
  { image: '/images/CMUChampionship412.jpg' },
  { image: '/images/CMUwomensRugby.jpg' },
  { image: '/images/IMG_1021.jpg' },
  { image: '/images/IMG_2221.jpg' },
];


const HomePage = () => {

  useEffect(() => {
    const elements = document.querySelectorAll('.scroll-animate');
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
  
    elements.forEach(el => observer.observe(el));
  
    return () => observer.disconnect();
  }, []);
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="hero-new">
        <div className="hero-box">
        <nav className="hero-nav">

  <button className="hamburger-menu" onClick={toggleMenu}>
    ☰
  </button>

  <div className={`nav-content ${isMenuOpen ? 'open' : ''}`}>
    <ul className="nav-links">
      <li><Link to="/home">Home</Link></li>
      <li><Link to="/stream">Stream</Link></li>
      {user?.is_admin && <li><Link to="/admin">Admin</Link></li>}
      <li>
        <a href="https://engage.supportingcmu.org/give/627210/#!/donation/checkout?recurring=0" target="_blank" rel="noopener noreferrer">Donate</a>
      </li>
    </ul>

    {user && (
      <div className="nav-user-controls">
        <span className="user-greeting">Hi {displayName}!</span>
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </div>
    )}
  </div>
</nav>


          <div className="hero-content">
  <div className="hero-left-text">
    <h2 id="hero-text">COLORADO MESA UNIVERSITY<br />WOMEN'S CLUB RUGBY</h2>
    <p>Live from the pitch.<br /><Link to="/stream" className="stream-btn">
      Watch Now →
    </Link></p>
  </div>

  <div className="hero-right-image">
  <div className="model-wrapper">
    <model-viewer
      src="/models/RugbyBall.glb"
      alt="Rotating Rugby Ball"
      auto-rotate
      auto-rotate-delay="0"
      rotation-per-second="30deg"
      disable-zoom
      disable-pan
      disable-rotate
      style={{ width: '500px', height: '500px' }}
    >
    </model-viewer>
    <div className="model-shadow"></div> {/* Shadow element */}
  </div>
</div>
</div>


          <div className="hero-title-container">
            <h1>STAMPEDESTREAM</h1>
          </div>
        </div>
      </header>

      <main className="home-content">
  {[
    {
      image: '/images/WYO end photo 10.26.24.JPG',
      title: 'About the Mavericks',
      description: "We're fierce, we're fast, and we're building a rugby legacy at Colorado Mesa University. Learn about our journey, our drive, and what it means to be a Maverick.",
      buttonText: 'Meet the Team',
      buttonLink: 'https://cmumavericks.com/sports/womens-rugby',
    },
    {
      image: '/images/download.webp',
      title: 'Replay the Glory',
      description: 'Every match tells a story. Rewatch past battles and feel the adrenaline of every try, tackle, and victory.',
      buttonText: 'Watch on YouTube',
      buttonLink: 'https://www.youtube.com/@CMUMavericks',
    },
    {
      image: '/images/IMG_2455.jpg',
      title: 'Fuel Our Stampede',
      description: 'Help power our dreams. Your support sends us to new fields, new challenges, and greater heights.',
      buttonText: 'Donate Now',
      buttonLink: 'https://engage.supportingcmu.org/give/627210/#!/donation/checkout?recurring=0',
    },
  ].map((section, index) => (
    <section
      key={index}
      className={`info-section alt-section scroll-animate ${index % 2 === 1 ? 'reverse' : ''}`}
    >
      <div className="info-image">
        <img src={section.image} alt={section.title} />
      </div>
      <div className="info-text">
        <h2>{section.title}</h2>
        <p>{section.description}</p>
        <a
          href={section.buttonLink}
          className="info-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          {section.buttonText}
        </a>
      </div>
    </section>
  ))}
</main>


      <footer>
        <p>&copy; 2025 StampedeStream. All rights reserved.</p>
      </footer>
    </>
  );
};

export default HomePage;
