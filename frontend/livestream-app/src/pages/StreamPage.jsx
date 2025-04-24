import React, { useEffect, useState } from 'react';
import '../styles.css';

const StreamPage = () => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState("Connecting...");

  const [score, setScore] = useState({
    home: 0,
    away: 0,
    home_name: 'Home',
    away_name: 'Away'
  });

  const [upcomingGame, setUpcomingGame] = useState(null);

  // Fetch livestream URL and broadcast metadata
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

  // Connect to scoreboard WebSocket
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/score");

    socket.onopen = () => setStatus("Connected to live scoreboard");
    socket.onerror = () => setStatus("WebSocket error");
    socket.onclose = () => setStatus("Disconnected");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setScore(data);
    };

    return () => socket.close();
  }, []);

  return (
    <div className="stream-container">
      {/* TV-style Score Bug Overlay */}
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

      <h1>Live Broadcast</h1>
      <p>{status}</p>

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
        <p>No livestream is active and no upcoming games are scheduled.</p>
      )}
    </div>
  );
};

export default StreamPage;
