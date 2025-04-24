import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

const slides = [
  {
    image: '/images/Image.jpeg', 
    title: 'Welcome to StampedeStream',
    description: 'Home of CMU Club Women\'s Rugby Livestreaming.',
    link: '/stream',
    linkText: 'Watch Now',
  },
  {
    image: '/images/Image.jpeg', 
    title: 'About the Team',
    description: 'Learn more about the team, roster, and schedule.',
    link: 'https://cmumavericks.com/sports/womens-rugby',
    linkText: 'Visit Women\'s Rugby Page',
  },
  {
    image: 'images/Image.jpeg', 
    title: 'Support the Team',
    description: 'Help us grow by donating to our program.',
    link: 'https://engage.supportingcmu.org/give/627210/#!/donation/checkout?recurring=0',
    linkText: 'Donate Now',
  },
];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Automatically move to the next slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000); // 5 seconds
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
        <div className="logo">StampedeStream</div>
         {/* Center logo */}
        <div className="nav-logo">
          <img src="/images/logo_main.svg" alt="Logo" />
       </div>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/stream">Stream</Link></li>
          <li><Link to="/admin">Admin</Link></li>
        </ul>
      </nav>

      {/* Hero Carousel */}
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

  {/* This content updates based on currentSlide, but is always centered */}
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



      {/* <section className="about">
        <h2>About The Team</h2>
        <p>Find out more about the team, including the roster and schedule here!</p>
        <a href="https://cmumavericks.com/sports/womens-rugby" className="btn" target="_blank" rel="noreferrer">CMU Club Women's Rugby Page</a>
      </section> */}

      <footer>
        <p>&copy; 2025 StampedeStream. All rights reserved.</p>
      </footer>
    </>
  );
};

export default HomePage;