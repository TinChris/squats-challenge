
// import logo from './logo.svg';
import './App.css';
import './Challenge.css'; // Importiere die CSS-Datei für die Challenge
import React, { useState } from 'react';
import { api } from './api';  // ← NEU!
// Imports erweitern
import Login from './Login';  // ← NEU!

function App() {
  const [squatsHeute, setSquatsHeute] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Format: "2025-09-05"
  const [squatsProTag, setSquatsProTag] = useState({}); // Objekt: {"2025-09-05": 50, "2025-09-04": 30}
  const [userName, setUserName] = useState('Christine'); // ← NEU! Defaultname

  // Authentication States - NEU!
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);

// Test Backend Verbindung - NEU!
// React.useEffect(() => {
//   api.testConnection()
//     .then(data => console.log('Backend Test:', data))
//     .catch(error => console.error('Backend Fehler:', error));
// }, []);


// // Daten vom Backend laden - NEU!
// const loadUserSquats = async () => {
//   try {
//     const response = await api.getUserSquats(userName);
//     console.log('Squats geladen:', response);
    
//     // Backend-Daten in Frontend-Format konvertieren
//     const squatsData = {};
//     response.squats.forEach(entry => {
//       // Falls mehrere Einträge pro Tag, addieren
//       if (squatsData[entry.date]) {
//         squatsData[entry.date] += entry.squats;
//       } else {
//         squatsData[entry.date] = entry.squats;
//       }
//     });
    
//     setSquatsProTag(squatsData);
//   } catch (error) {
//     console.error('Fehler beim Laden:', error);
//   }
// };

// Auto-Login beim App-Start - ERWEITERT!
React.useEffect(() => {
  const savedToken = localStorage.getItem('authToken');
  const savedUsername = localStorage.getItem('username');
  
  if (savedToken && savedUsername) {
    setAuthToken(savedToken);
    setUserName(savedUsername);
    setIsAuthenticated(true);
    // Auch hier Daten laden - NEU!
    loadUserSquatsAfterLogin(savedUsername);
  }
}, []);

  // Hilfsfunktionen
  const heutigeSquats = squatsProTag[selectedDate] || 0;
  const gesamtSquats = Object.values(squatsProTag).reduce((sum, squats) => sum + squats, 0);

  
// Squats hinzufügen - BACKEND VERSION!
const squatsHinzufuegen = async () => {
  try {
    // Squats im Backend speichern
    const response = await api.saveSquats(userName, selectedDate, squatsHeute);
    console.log('Squats gespeichert:', response);
    
    // Local State aktualisieren
    const neueSquatsProTag = {
      ...squatsProTag,
      [selectedDate]: heutigeSquats + squatsHeute
    };
    setSquatsProTag(neueSquatsProTag);
    setSquatsHeute(0);
    
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
    alert('Fehler beim Speichern der Squats!');
  }
};

// Login Success Handler - NEU!
// Login Success Handler - ERWEITERT!
const handleLoginSuccess = (username, token) => {
  setUserName(username);
  setAuthToken(token);
  setIsAuthenticated(true);
  console.log('Login erfolgreich für:', username);
  
  // Sofort User-Daten laden - NEU!
  loadUserSquatsAfterLogin(username);
};

// Neue Funktion für Daten-Loading nach Login
const loadUserSquatsAfterLogin = async (username) => {
  try {
    const response = await api.getUserSquats(username);
    console.log('Squats nach Login geladen:', response);
    
    // Backend-Daten in Frontend-Format konvertieren
    const squatsData = {};
    response.squats.forEach(entry => {
      // Falls mehrere Einträge pro Tag, addieren
      if (squatsData[entry.date]) {
        squatsData[entry.date] += entry.squats;
      } else {
        squatsData[entry.date] = entry.squats;
      }
    });
    
    setSquatsProTag(squatsData);
  } catch (error) {
    console.error('Fehler beim Laden nach Login:', error);
  }
};

// Logout Handler - NEU!
const handleLogout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
  setIsAuthenticated(false);
  setAuthToken(null);
  setSquatsProTag({});
};


// Daten vom Backend laden - NEU!
const loadUserSquats = async () => {
  try {
    const response = await api.getUserSquats(userName);
    console.log('Squats geladen:', response);
    
    // Backend-Daten in Frontend-Format konvertieren
    const squatsData = {};
    response.squats.forEach(entry => {
      // Falls mehrere Einträge pro Tag, addieren
      if (squatsData[entry.date]) {
        squatsData[entry.date] += entry.squats;
      } else {
        squatsData[entry.date] = entry.squats;
      }
    });
    
    setSquatsProTag(squatsData);
  } catch (error) {
    console.error('Fehler beim Laden:', error);
  }
};

// Zeige Login-Seite wenn nicht eingeloggt
if (!isAuthenticated) {
  return <Login onLoginSuccess={handleLoginSuccess} />;
}

// Zeige Squats-App wenn eingeloggt
// Zeige Login-Seite wenn nicht eingeloggt
if (!isAuthenticated) {
  return <Login onLoginSuccess={handleLoginSuccess} />;
}

// Zeige Squats-App wenn eingeloggt
return (
  <div className="challenge-app">
    <header className="challenge-header">
      <h1 className="challenge-title">💪 Squats Challenge 2025</h1>
      <p>Willkommen zurück, {userName}! 👋</p>
      <button 
        onClick={handleLogout}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '5px 15px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Abmelden
      </button>
    </header>
    
    {/* Datum-Auswahl */}
    <div className="challenge-card">
      <h2>Datum wählen</h2>
      <input 
        type="date"
        className="squats-input"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
      <p className="stats-text">
        Ausgewählt: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('de-DE')}
      </p>
    </div>
    
    {/* Squats für gewähltes Datum */}
    <div className="challenge-card">
      <h2>Squats für {new Date(selectedDate + 'T00:00:00').toLocaleDateString('de-DE')}</h2>
      <div className="input-group">
        <input 
          className="squats-input"
          type="number" 
          placeholder="Anzahl Squats"
          value={squatsHeute || ''}  // ← Komplett leer wenn 0
          onChange={(e) => setSquatsHeute(Number(e.target.value) || 0)}
          onKeyPress={(e) => e.key === 'Enter' && squatsHinzufuegen()}
        />
        <button 
          className="add-button"
          onClick={squatsHinzufuegen}
        >
          Hinzufügen
        </button>
      </div>
      <p className="stats-text">
        {selectedDate === new Date().toISOString().split('T')[0] ? 'Heute' : 'Dieser Tag'} bisher: {heutigeSquats} Squats
      </p>
    </div>
    
    {/* Gesamt-Statistik */}
    <div className="challenge-card">
      <h2>Gesamt-Statistik</h2>
      <p className="stats-text">Alle Tage zusammen: {gesamtSquats} Squats</p>
      <p className="stats-text">Noch fehlen: {10000 - gesamtSquats} Squats</p>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{width: `${(gesamtSquats / 10000) * 100}%`}}
        ></div>
      </div>
      <p className="stats-text">
        Fortschritt: {Math.round((gesamtSquats / 10000) * 100)}% geschafft! 🎯
      </p>

      {/* Streak Counter */}
      <div style={{marginTop: '20px', padding: '15px', background: '#f0f8ff', borderRadius: '8px'}}>
        <h3 style={{margin: '0 0 10px 0', color: 'var(--primary-color)'}}>🔥 Streak-Counter</h3>
        <p className="stats-text" style={{margin: '5px 0'}}>
          Aktuelle Serie: {(() => {
            const dates = Object.keys(squatsProTag).sort((a, b) => new Date(b) - new Date(a));
            let streak = 0;
            
            for (let i = 0; i < dates.length; i++) {
              const checkDate = new Date();
              checkDate.setDate(checkDate.getDate() - i);
              const dateStr = checkDate.toISOString().split('T')[0];
              
              if (squatsProTag[dateStr] && squatsProTag[dateStr] > 0) {
                streak++;
              } else {
                break;
              }
            }
            return streak;
          })()} Tage 🔥
        </p>
        <p className="stats-text" style={{margin: '5px 0', fontSize: '14px', color: '#666'}}>
          Trainingstage insgesamt: {Object.keys(squatsProTag).filter(date => squatsProTag[date] > 0).length}
        </p>
      </div>
    </div>

    {/* Tages-Verlauf */}
    <div className="challenge-card">
      <h2>Deine Squats-Historie 📈</h2>
      {Object.keys(squatsProTag).length === 0 ? (
        <p className="stats-text">Noch keine Einträge vorhanden.</p>
      ) : (
        <div>
          {Object.entries(squatsProTag)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([datum, squats]) => (
              <div key={datum} style={{
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #eee'
              }}>
                <span>{new Date(datum + 'T00:00:00').toLocaleDateString('de-DE')}</span>
                <span style={{fontWeight: 'bold', color: 'var(--success-color)'}}>
                  {squats} Squats 💪
                </span>
              </div>
            ))
          }
        </div>
      )}
    </div>
  </div>
);
}

export default App;