// src/App.jsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { db, auth } from './services/firebase';
import Alarm from './components/Alarm';
import AlarmForm from './components/AlarmForm';
import SnoozeModal from './components/SnoozeModal';
import './App.css';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function App() {
  const [alarms, setAlarms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState(null);
  const [userId, setUserId] = useState(null); // State to hold the user's ID

  // Handle user authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, get their UID
        setUserId(user.uid);
      } else {
        // User is signed out, sign them in anonymously
        signInAnonymously(auth).catch(error => {
          console.error("Anonymous sign-in failed:", error);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch user-specific alarms from Firestore
  useEffect(() => {
    // Only fetch alarms if we have a userId
    if (!userId) return;

    // The collection path is now unique to the user
    const userAlarmsCollection = collection(db, 'users', userId, 'alarms');
    const unsubscribe = onSnapshot(userAlarmsCollection, (snapshot) => {
      const alarmsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlarms(alarmsData);
    });

    return () => unsubscribe();
  }, [userId]); // Re-run this effect when the userId changes

  // Check for ringing alarms
  useEffect(() => {
    const checkAlarms = async () => {
      if (showSnoozeModal || !userId) return;

      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDay = weekDays[now.getDay()];
      
      const alarmToRing = alarms.find(alarm => 
        alarm.time === currentTime && 
        alarm.enabled &&
        alarm.days?.includes(currentDay)
      );

      if (alarmToRing) {
        const alarmRef = doc(db, 'users', userId, 'alarms', alarmToRing.id);
        await updateDoc(alarmRef, { enabled: false });
        setCurrentAlarm(alarmToRing);
        setShowSnoozeModal(true);
      }
    };

    const interval = setInterval(checkAlarms, 1000); 
    return () => clearInterval(interval);
  }, [alarms, showSnoozeModal, userId]);

  // All database operations now require the userId to build the correct path
  const handleSaveAlarm = async (alarm) => {
    if (!userId) return;
    if (editingAlarm) {
      await updateDoc(doc(db, 'users', userId, 'alarms', editingAlarm.id), alarm);
    } else {
      await addDoc(collection(db, 'users', userId, 'alarms'), { ...alarm, enabled: true });
    }
    setEditingAlarm(null);
    setShowForm(false);
  };

  const handleEdit = (alarm) => {
    setEditingAlarm(alarm);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'alarms', id));
  };

  const handleToggle = async (alarm) => {
    if (!userId) return;
    const alarmRef = doc(db, 'users', userId, 'alarms', alarm.id);
    await updateDoc(alarmRef, { enabled: !alarm.enabled });
  };

  const handleSnooze = async (alarmToSnooze) => {
    if (!userId) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const newTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const alarmRef = doc(db, 'users', userId, 'alarms', alarmToSnooze.id);
    await updateDoc(alarmRef, { time: newTime, enabled: true });
  };
  
  const closeSnoozeModal = () => {
    if (currentAlarm && userId) {
        const alarmRef = doc(db, 'users', userId, 'alarms', currentAlarm.id);
        updateDoc(alarmRef, { enabled: true });
    }
    setShowSnoozeModal(false);
    setCurrentAlarm(null);
  };

  return (
    <div className="app-wrapper">
       <img src="http://googleusercontent.com/file_content/11" alt="Suresh decorative background" className="background-image left" onError={(e) => { e.target.style.display = 'none'; }} />
       <img src="http://googleusercontent.com/file_content/11" alt="Suresh decorative background" className="background-image right" onError={(e) => { e.target.style.display = 'none'; }} />
      <div className="app-container">
        <header className="app-header">
          <h1>Snoozed by Suresh</h1>
          <p>Your alarm that judges your excuses.</p>
        </header>
        <main>
          <div className="alarms-list">
            {alarms.map(alarm => (
              <Alarm key={alarm.id} alarm={alarm} onEdit={() => handleEdit(alarm)} onDelete={() => handleDelete(alarm.id)} onToggle={() => handleToggle(alarm)} />
            ))}
          </div>
          <button className="add-alarm-btn" onClick={() => { setEditingAlarm(null); setShowForm(true); }}>
            + Add Alarm
          </button>
        </main>
        {showForm && <AlarmForm alarm={editingAlarm} onSave={handleSaveAlarm} onClose={() => setShowForm(false)} />}
        {showSnoozeModal && currentAlarm && <SnoozeModal alarm={currentAlarm} onClose={closeSnoozeModal} onSnooze={handleSnooze} />}
        <footer className="app-footer">
          <p>A fun project for TinkerHub ✨</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
