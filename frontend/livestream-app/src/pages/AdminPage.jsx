import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/admin.css';
import '../styles/global.css';
import '../styles/responsive.css';
import { AuthContext } from '../AuthContext';
import { getUTCPartsFromLocal, getLocalInputsFromUTC } from '../utils/time_utils';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
const WS_BASE_URL = process.env.REACT_APP_WS_URL;

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [opponent, setOpponent] = useState('');
  const [teamColor, setTeamColor] = useState('#610028');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [homeTeam, setHomeTeam] = useState('Home');
  const [awayTeam, setAwayTeam] = useState('Away');
  const [currentBroadcastUrl, setCurrentBroadcastUrl] = useState('');

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const markAsLive = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/broadcast/${id}/go_live`, {
        method: 'POST',
      });
      alert('Broadcast marked as live!');
      // Optionally reload broadcasts
    } catch (error) {
      console.error('Failed to mark broadcast as live:', error);
    }
  };

  const markAsDone = async (id) => {
    const confirmed = window.confirm("Are you sure you want to end this broadcast? This will remove it from the platform.");
    if (confirmed) {
      await handleDelete(id);
      alert('Broadcast marked as done!');
    }
  };

  const handleConnectYouTube = () => {
    // Open the backend's /youtube/auth endpoint
    window.location.href = `${API_BASE_URL}/youtube/auth`;
  };

  useEffect(() => {
    const fetchLiveBroadcast = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/broadcast/live`);
        
        if (res.status === 404) {
          console.log('No live broadcast found.');
          setCurrentBroadcastUrl(null);
          return;
        }

        if (!res.ok) throw new Error('Server error while fetching live broadcast');

        const data = await res.json();
        setCurrentBroadcastUrl(data.url);

      } catch (err) {
        console.error('Error fetching live broadcast:', err);
        setCurrentBroadcastUrl(null);
      }
    };

    fetchLiveBroadcast();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE_URL}/ws/score`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setHome(data.home);
      setAway(data.away);
      setHomeTeam(data.home_name);
      setAwayTeam(data.away_name);
    };
    return () => { if (ws.readyState === WebSocket.OPEN) ws.close(); };
  }, []);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/broadcasts`);
      const data = response.data;
      if (Array.isArray(data) && data.length === 0) {
        setBroadcasts([]);
        setError('No broadcasts are currently scheduled.');
      } else {
        setBroadcasts(data);
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch broadcasts. Please try again later.');
    }
  };

  const handleCreateNew = () => {
    setIsEditing(true);
    setEditingBroadcast(null);
    setTitle('');
    setDate('');
    setTime('');
  };

  const handleEdit = (broadcast) => {
    setIsEditing(true);
    setEditingBroadcast(broadcast);
    const { date: localDate, time: localTime } = getLocalInputsFromUTC(broadcast.date, broadcast.time);
    setTitle(broadcast.title);
    setDate(localDate);
    setTime(localTime);
    setOpponent(broadcast.opponent || '');
    setTeamColor(broadcast.teamColor || '#000000');
    setLocation(broadcast.location || '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { month, day, time: utcTime } = getUTCPartsFromLocal(date, time);
      const broadcastData = {
        title,
        month,
        day,
        time: utcTime,
        opponent,
        team_color: teamColor,
        location
      };
      if (editingBroadcast) {
        await axios.put(`${API_BASE_URL}/broadcast/${editingBroadcast.id}`, broadcastData);
      } else {
        await axios.post(`${API_BASE_URL}/broadcast`, broadcastData);
      }
      setIsEditing(false);
      fetchBroadcasts();
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/broadcast/${id}`);
      fetchBroadcasts();
      setShowConfirmDelete(false);
    } catch (err) {
      setError('Failed to delete broadcast');
    }
  };

  const updateScore = async (team, points) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/score/update`, { team, points });
      setHome(res.data.home);
      setAway(res.data.away);
    } catch (err) {
      console.error(err);
    }
  };

  const updateTeamNames = async () => {
    try {
      await axios.post(`${API_BASE_URL}/score/team_names`, {
        home_name: homeTeam,
        away_name: awayTeam
      });
    } catch (err) {
      console.error('Failed to update team names', err);
    }
  };

  return (
    <header className="hero-new">
      <div className="hero-box">
        <nav className="hero-nav">
          <button className="hamburger-menu" onClick={toggleMenu}>☰</button>
          <div className={`nav-content ${isMenuOpen ? 'open' : ''}`}>
            <ul className="nav-links">
              <li><Link to="/home">Home</Link></li>
              <li><Link to="/stream">Stream</Link></li>
              {user?.is_admin && <li><Link to="/admin">Admin</Link></li>}
              <li><a href="https://engage.supportingcmu.org/give/627210/#!/donation/checkout?recurring=0" target="_blank" rel="noopener noreferrer">Donate</a></li>
            </ul>
            {user && (
              <div className="nav-user-controls">
                <span className="user-greeting">Hi {displayName}!</span>
                <button className="logout-btn" onClick={handleLogout}>Log Out</button>
              </div>
            )}
          </div>
        </nav>

        <div className="admin-page">
          {isEditing ? (
            <div className="edit-broadcast">
              <div className="header">
                <button className="btn back-btn" onClick={() => setIsEditing(false)}>Back</button>
                <h2>{editingBroadcast ? 'Edit Broadcast' : 'Create Broadcast'}</h2>
              </div>
              <form onSubmit={handleSave}>
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                <input type="text" placeholder="Opponent Name" value={opponent} onChange={(e) => setOpponent(e.target.value)} />
                <input type="color" value={teamColor} onChange={(e) => setTeamColor(e.target.value)} title="Pick Opponent Team Color" />
                <input type="text" placeholder="Game Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                <div className="button-group">
                  <button type="submit" className="btn save-btn">Save</button>
                  {editingBroadcast && (
                    <button type="button" className="btn delete-btn" onClick={() => setShowConfirmDelete(true)}>Delete</button>
                  )}
                </div>
              </form>
              {error && <p className="error">{error}</p>}
            </div>
          ) : (
            <>
              <div className="welcome-section">
                <h1>Welcome</h1>
                <button className="btn create-btn" onClick={handleConnectYouTube}>Connect YouTube</button>
                <button className="btn create-btn" onClick={handleCreateNew}>Create Broadcast</button>
              </div>

              <div className="scheduled-broadcasts">
                <h2>Scheduled Broadcasts:</h2>
                {broadcasts.map((broadcast) => (
                  <div key={broadcast.id} className="broadcast-item">
                    <div className="broadcast-info">
                      <h3>{broadcast.title}</h3>
                      {(() => {
                        const localDate = new Date(`${broadcast.date}T${broadcast.time}Z`);
                        return <p>{localDate.toLocaleString()} (your time)</p>;
                      })()}
                    </div>
                    <button className="btn edit-btn" onClick={() => handleEdit(broadcast)}>Edit</button>

                    <div className="broadcast-actions">
                    {!broadcast.is_live && (
                      <button className="btn go-live-btn" onClick={() => {
                        const confirmed = window.confirm('Are you sure you want to mark this broadcast as live? This will make it visible to viewers on the stream page');
                        if (confirmed) {
                          markAsLive(broadcast.id);
                        }
                      }}
                    >
                        Live
                      </button>
                    )}
                    <button
                      className="btn end-broadcast-btn"
                      onClick={() => markAsDone(broadcast.id)}
                    >
                      End
                    </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="current-broadcast">
                <h2>Current Broadcast</h2>
                <div className="broadcast-preview">
                  {currentBroadcastUrl ? (
                    <iframe title="Live Stream" width="100%" height="200" src={currentBroadcastUrl} frameBorder="0" allowFullScreen />
                  ) : (
                    <div className="placeholder">No active broadcast</div>
                  )}
                </div>
              </div>

              <div className="score-controls">
                <h2>Scoreboard</h2>
                <div className="team-inputs">
                  <input type="text" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} onBlur={updateTeamNames} placeholder="Home Team Name" />
                  <input type="text" value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} onBlur={updateTeamNames} placeholder="Away Team Name" />
                </div>
                <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{homeTeam}: {home} | {awayTeam}: {away}</p>
                <div className="score-buttons">
                  <button onClick={() => updateScore('home', 1)}>+1 {homeTeam}</button>
                  <button onClick={() => updateScore('home', -1)}>-1 {homeTeam}</button>
                  <button onClick={() => updateScore('away', 1)}>+1 {awayTeam}</button>
                  <button onClick={() => updateScore('away', -1)}>-1 {awayTeam}</button>
                </div>
                <button className="btn reset-btn" onClick={() => {
                  updateScore('home', -home);
                  updateScore('away', -away);
                }}>Reset Scores</button>
              </div>
            </>
          )}

          {showConfirmDelete && (
            <div className="modal">
              <div className="modal-content">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this broadcast?</p>
                <div className="button-group">
                  <button className="btn delete-btn" onClick={() => handleDelete(editingBroadcast.id)}>Delete</button>
                  <button className="btn cancel-btn" onClick={() => setShowConfirmDelete(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminPage;
