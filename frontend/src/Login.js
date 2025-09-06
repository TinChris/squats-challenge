// src/Login.js - Login/Register Komponente
import React, { useState } from 'react';
import { api } from './api';
import './Challenge.css';

function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null); // NEU

  // Statistiken laden beim Komponenten-Start - NEU
  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await api.getAnonymousStats();
        setStats(result);
      } catch (error) {
        console.error('Fehler beim Laden der Statistiken:', error);
      }
    };
    loadStats();
  }, []);

  // Enter-Taste Support - NEU
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const result = await api.login(username, password);
        if (result.token) {
          localStorage.setItem('authToken', result.token);
          localStorage.setItem('username', result.username);
          onLoginSuccess(result.username, result.token);
        } else {
          setMessage(result.error || 'Login fehlgeschlagen');
        }
      } else {
        const result = await api.register(username, password);
        if (result.message) {
          setMessage('Registrierung erfolgreich! Jetzt einloggen.');
          setIsLogin(true);
          setPassword('');
        } else {
          setMessage(result.error || 'Registrierung fehlgeschlagen');
        }
      }
    } catch (error) {
      setMessage('Verbindungsfehler');
      console.error('Auth Error:', error);
    }

    setLoading(false);
  };

  return (
    <div className="challenge-app">
      <header className="challenge-header">
        <h1 className="challenge-title">💪 Squats Challenge 2025</h1>
        <p>Sichere Anmeldung für deine persönlichen Squats!</p>
      </header>

      {/* Community Statistiken */}
      {stats && (
        <div className="challenge-card" style={{maxWidth: '400px', margin: '0 auto 20px auto', textAlign: 'center'}}>
          <h2>🏆 Community Stats</h2>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px'}}>
            <div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--success-color)'}}>{stats.totalSquats.toLocaleString()}</div>
              <div style={{fontSize: '12px', color: '#666'}}>Gesamt Squats</div>
            </div>
            <div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)'}}>{stats.totalUsers}</div>
              <div style={{fontSize: '12px', color: '#666'}}>Aktive User</div>
            </div>
            <div>
              <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--success-color)'}}>{stats.bestUserSquats.toLocaleString()}</div>
              <div style={{fontSize: '12px', color: '#666'}}>Bester User</div>
            </div>
          </div>
        </div>
      )}

      <div className="challenge-card" style={{maxWidth: '400px', margin: '0 auto'}}>
        <h2>{isLogin ? 'Anmelden' : 'Registrieren'}</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            className="squats-input"
            type="text"
            placeholder="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            required
            style={{marginBottom: '10px'}}
          />
          
          <input
            className="squats-input"
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            required
            style={{marginBottom: '15px'}}
          />
          
          <button 
            className="add-button" 
            type="submit" 
            disabled={loading}
            style={{width: '100%'}}
          >
            {loading ? 'Lädt...' : (isLogin ? 'Anmelden' : 'Registrieren')}
          </button>
        </form>

        {message && (
          <p style={{
            marginTop: '15px', 
            color: message.includes('erfolgreich') ? 'green' : 'red',
            textAlign: 'center'
          }}>
            {message}
          </p>
        )}

        <p style={{textAlign: 'center', marginTop: '20px'}}>
          {isLogin ? 'Noch kein Account?' : 'Schon registriert?'}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
              setPassword('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color)',
              textDecoration: 'underline',
              cursor: 'pointer',
              marginLeft: '5px'
            }}
          >
            {isLogin ? 'Registrieren' : 'Anmelden'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;