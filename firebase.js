// firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref as dbRef, set, onValue, update, remove, push, onDisconnect } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA1KVfGtBs4dGrglj4XUO7ehFTjygO3WP4",
  authDomain: "snake-game-multiplayer-11a60.firebaseapp.com",
  databaseURL: "https://snake-game-multiplayer-11a60-default-rtdb.firebaseio.com",
  projectId: "snake-game-multiplayer-11a60",
  storageBucket: "snake-game-multiplayer-11a60.firebasestorage.app",
  messagingSenderId: "1043560771676",
  appId: "1:1043560771676:web:be5c6d4d604854d09cf699"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, dbRef as ref, set, onValue, update, remove, push, onDisconnect };