// Firebase Configuration
// Replace these placeholder values with your own Firebase project credentials.
// You can find these in the Firebase Console: https://console.firebase.google.com
// Go to Project Settings > General > Your Apps > Firebase SDK snippet > Config

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const stateRef = db.ref('queueState');
