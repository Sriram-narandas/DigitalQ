# DigitalQ

DigitalQ is a web-based digital queue management system designed to reduce waiting time, eliminate physical crowding, and improve service efficiency in places like hospitals, banks, retail stores, and service centers.

The system allows customers to join a queue digitally and receive live updates, while staff can manage and call customers through a dedicated staff panel.

---

## 🚀 Features
- Digital ticket generation
- Real-time queue updates
- Separate customer and staff views
- Estimated waiting time display
- Audio and vibration alerts
- Staff dashboard to call and manage customers
- Firebase Realtime Database for persistent, cross-device data storage

---

## 🛠️ Tech Stack
- **Frontend:** HTML, Tailwind CSS
- **Logic:** JavaScript
- **Icons:** Lucide Icons
- **Storage:** Firebase Realtime Database

---

## 📂 Project Structure

```
DigitalQ/
├── index.html            # Main HTML page
├── style.css             # Custom styles and animations
├── script.js             # Core application logic
├── firebase-config.js    # Firebase configuration (update with your credentials)
├── README.md
└── LICENSE
```

---

## 🔥 Firebase Setup

This project uses **Firebase Realtime Database** to persist queue data. Follow these steps to configure it:

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project.
2. In Project Settings > General > Your Apps, click **Add App** and select **Web**.
3. Copy the Firebase config object from the SDK snippet.
4. Open `firebase-config.js` and replace the placeholder values with your project credentials:
   ```js
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT.firebaseapp.com",
       databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
       projectId: "YOUR_PROJECT",
       storageBucket: "YOUR_PROJECT.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```
5. In the Firebase Console, go to **Realtime Database** > **Create Database**.
6. Set the database rules for development (update for production):
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
7. Open `index.html` in a browser — the app will now read and write data from Firebase.
