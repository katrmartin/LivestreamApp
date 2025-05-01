import React, { useEffect, useState, useRef, useContext } from 'react';
import '../styles/stream.css';
import '../styles/donation.css';
import '../styles/global.css';
import '../styles/responsive.css';
import { AuthContext } from '../AuthContext';

const StreamPage = () => {
  const { user } = useContext(AuthContext);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [showDonationPopup, setShowDonationPopup] = useState(true);
  const [showDonateButton, setShowDonateButton] = useState(false);   
  const [upcomingGame, setUpcomingGame] = useState(null);
  const [status, setStatus] = useState("Connecting...");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [score, setScore] = useState({
    home: 0,
    away: 0,
    home_name: 'Home',
    away_name: 'Away',
  });

  const chatSocketRef = useRef(null);
  const chatEndRef = useRef(null);

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    fetch('http://localhost:8000/live_url')
      .then((res) => res.text())
      .then((text) => {
        if (text.includes('youtube.com')) {
          setUrl(text);
        } else {
          setError(text);
        }
      })
      .catch((err) => {
        setError('Failed to load livestream.');
        console.error(err);
      });

    fetch('http://localhost:8000/broadcasts')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const sorted = data.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
          const nextGame = sorted.find(game => new Date(game.date + 'T' + game.time) > new Date());
          if (nextGame) setUpcomingGame(nextGame);
        }
      })
      .catch(err => console.error('Failed to load upcoming game info:', err));
  }, []);

  useEffect(() => {
    const scoreSocket = new WebSocket('ws://localhost:8000/ws/score');
    scoreSocket.onopen = () => setStatus('Connected to live scoreboard');
    scoreSocket.onerror = () => setStatus('WebSocket error');
    scoreSocket.onclose = () => setStatus('Disconnected');
    scoreSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setScore(data);
    };
    return () => scoreSocket.close();
  }, []);

  useEffect(() => {
    chatSocketRef.current = new WebSocket('ws://localhost:8000/ws/chat');
    chatSocketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setChatMessages((prev) => [...prev, data]);
    };
    return () => chatSocketRef.current.close();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && user) {
      chatSocketRef.current.send(
        JSON.stringify({
          username: user?.name || user?.email,
          message: newMessage,
        })
      );
      setNewMessage('');
    }
  };

  return (
    <>
      <header className="hero-new">
        <div className="hero-box">
          <nav className="hero-nav">
            <ul className="nav-left">
              <li><a href="/home">Home</a></li>
            </ul>
            <ul className="nav-right">
              <li><a href="/stream">Stream</a></li>
              {user?.is_admin && <li><a href="/admin">Admin</a></li>}
            </ul>
            {user && (
              <div className="nav-user-controls">
                <span className="user-greeting">Hi {displayName}!</span>
                <button className="logout-btn" onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}>
                  Log Out
                </button>
              </div>
            )}
          </nav>

          {showDonateButton && (
  <div className="donate-wrapper">
    <a
      href="https://engage.supportingcmu.org/give/627210/#!/donation/checkout?recurring=0"
      className="donate-banner-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="donate-banner">
        <span className="donate-button">Donate Now</span>
      </div>
    </a>
  </div>
)}

          
        <div className="stream-container">
        <div className="stream-video" id="live">
          {url ? (
            <iframe
              width="100%"
              height="500"
              src={url}
              title="YouTube Livestream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : upcomingGame ? (
            <div className="upcoming-banner" style={{ borderLeft: `10px solid ${upcomingGame.team_color || '#610028'}` }}>
              <h2>Upcoming Game</h2>
              <p>
                <span style={{ color: '#610028', fontWeight: 'bold' }}>CMU</span> vs{' '}
                <span style={{ color: upcomingGame.team_color }}>{upcomingGame.opponent || 'TBD'}</span> at{' '}
                {upcomingGame.location || 'TBD'}
              </p>
              <p><strong>Date:</strong> {upcomingGame.date} — <strong>Time:</strong> {upcomingGame.time}</p>
            </div>
          ) : (
            <h2>No livestream is active and no upcoming games are scheduled.</h2>
          )}
        </div>
        </div>
        
        {/* Show only if livestream is active */}
        {url && (
          <>
            <div className="score-bug">
              <div className="team">
                <span className="team-name">{score.home_name}</span>
                <span className="score">{score.home}</span>
              </div>
              <div className="team">
                <span className="team-name">{score.away_name}</span>
                <span className="score">{score.away}</span>
              </div>
            </div>

            <div className={`chat-box ${isChatOpen ? '' : 'collapsed'}`}>
              <div className="chat-header">
                <h3>Live Chat</h3>
                <button className="collapse-btn" onClick={() => setIsChatOpen(!isChatOpen)}>
                  {isChatOpen ? 'Hide' : 'Show'}
                </button>
              </div>
              {isChatOpen && (
                <>
                  <div className="chat-messages">
                    {chatMessages.map((msg, i) => (
                      <p key={i}><strong>{msg.username}:</strong> {msg.message}</p>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      required
                    />
                    <button type="submit" className="btn">Send</button>
                  </form>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {showDonationPopup && (
          <div className="donation-popup">
            <div className="donation-content">
              <h2>Support the Team!</h2>
              <p>Your donations help the CMU Women's Rugby team. Thank you!</p>
              <div className="donation-buttons">
              <button
              onClick={() => {
                setShowDonationPopup(false);
                setShowDonateButton(true);
                window.open('https://engage.supportingcmu.org/give/627210/#!/donation/checkout?recurring=0', '_blank');
              }}
              className="btn"
            >
              Donate Now
            </button>
                <button
                onClick={() => {
                  setShowDonationPopup(false);
                  setShowDonateButton(true);
                }}
                className="btn-secondary"
              >
                Maybe Later
              </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default StreamPage;
