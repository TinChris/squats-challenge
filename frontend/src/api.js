// src/api.js - Backend API Calls
const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Test Backend Verbindung
  testConnection: async () => {
    const response = await fetch(`${API_BASE_URL}/test`);
    return response.json();
  },

  // Squats speichern
  saveSquats: async (userName, date, squats) => {
    const response = await fetch(`${API_BASE_URL}/squats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name: userName, date: date, squats: squats }),
    });
    return response.json();
  },

  // Alle Squats für einen User
  getUserSquats: async (userName) => {
    const response = await fetch(`${API_BASE_URL}/squats/${userName}`);
    return response.json();
  },

  // Alle Squats
  getAllSquats: async () => {
    const response = await fetch(`${API_BASE_URL}/squats`);
    return response.json();
  },

  // Authentication
  register: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  // Anonyme Statistiken
  getAnonymousStats: async () => {
    const response = await fetch(`${API_BASE_URL}/stats/anonymous`);
    return response.json();
  },
};