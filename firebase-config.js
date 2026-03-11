// Firebase Configuration (compat SDK - loaded via script tags in index.html)
const firebaseConfig = {
  apiKey: "AIzaSyCwwN2MD-jD31Wy4UoQxZTtuLrcYzFS4ic",
  authDomain: "digitalq-b7140.firebaseapp.com",
  databaseURL: "https://digitalq-b7140-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "digitalq-b7140",
  storageBucket: "digitalq-b7140.firebasestorage.app",
  messagingSenderId: "606555419857",
  appId: "1:606555419857:web:c57abd2de4689ba9c041f0",
  measurementId: "G-91MNQ08005"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Database reference for the queue state
const db = firebase.database();
const stateRef = db.ref('queueState');
