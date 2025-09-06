// server.js - PostgreSQL Version
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Environment Variables
const JWT_SECRET = process.env.JWT_SECRET || 'dein-super-geheimer-schluessel-123';
const PORT = process.env.PORT || 5000;

const app = express();

// Database Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://squats_challenge_user:SYQkWTzp5quT2859y4a2s3QsWTKjXi4Q@dpg-d2u319nfte5s73aoidpg-a.frankfurt-postgres.render.com/squats_challenge',
  ssl: { rejectUnauthorized: false }  // Immer SSL verwenden für Render
});

// Test connection and create tables
const initDatabase = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('📊 PostgreSQL Database verbunden!');
    
    // Create tables
    await pool.query(`CREATE TABLE IF NOT EXISTS squats (
      id SERIAL PRIMARY KEY,
      user_name TEXT NOT NULL,
      date TEXT NOT NULL,
      squats INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    console.log('Tabellen erstellt/überprüft');
  } catch (err) {
    console.error('Database Fehler:', err);
  }
};

initDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend mit PostgreSQL läuft! 🚀📊',
    timestamp: new Date().toISOString()
  });
});

// Squats speichern
app.post('/api/squats', async (req, res) => {
  const { user_name, date, squats } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO squats (user_name, date, squats) VALUES ($1, $2, $3) RETURNING id',
      [user_name, date, squats]
    );
    res.json({ 
      message: 'Squats gespeichert!',
      id: result.rows[0].id 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alle Squats abrufen
app.get('/api/squats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM squats ORDER BY date DESC');
    res.json({ squats: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Squats für bestimmten User
app.get('/api/squats/:user_name', async (req, res) => {
  const { user_name } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM squats WHERE user_name = $1 ORDER BY date DESC',
      [user_name]
    );
    res.json({ squats: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Registration
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
      [username, passwordHash]
    );
    
    res.json({ 
      message: 'User erfolgreich registriert!',
      userId: result.rows[0].id 
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Username bereits vergeben' });
    } else {
      res.status(500).json({ error: 'Server Fehler beim Registrieren' });
    }
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User nicht gefunden' });
    }
    
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (passwordMatch) {
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Login erfolgreich!',
        token: token,
        username: user.username
      });
    } else {
      res.status(401).json({ error: 'Falsches Password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server Fehler beim Login' });
  }
});

// Anonyme Statistiken
app.get('/api/stats/anonymous', async (req, res) => {
  try {
    const excludedUsers = ['TestUser', 'Christine2025', 'test', 'admin', 'Christine', 'Daniela', 'dani'];
    
    // Gesamt-Statistiken
    const totalsResult = await pool.query(`
      SELECT SUM(squats) as total_squats, COUNT(DISTINCT user_name) as total_users
      FROM squats 
      WHERE user_name NOT IN (${excludedUsers.map((_, i) => `$${i + 1}`).join(',')})
    `, excludedUsers);
    
    // Bester User
    const bestUserResult = await pool.query(`
      SELECT SUM(squats) as max_squats
      FROM squats 
      WHERE user_name NOT IN (${excludedUsers.map((_, i) => `$${i + 1}`).join(',')})
      GROUP BY user_name 
      ORDER BY max_squats DESC 
      LIMIT 1
    `, excludedUsers);
    
    const totals = totalsResult.rows[0];
    const bestUser = bestUserResult.rows[0];
    
    res.json({
      totalSquats: parseInt(totals.total_squats) || 0,
      totalUsers: parseInt(totals.total_users) || 0,
      bestUserSquats: bestUser ? parseInt(bestUser.max_squats) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug: Alle User anzeigen
app.get('/api/debug/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT user_name, SUM(squats) as total FROM squats GROUP BY user_name ORDER BY total DESC');
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 Backend läuft auf http://localhost:${PORT}`);
});