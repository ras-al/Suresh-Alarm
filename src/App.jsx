// src/App.jsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './services/firebase';
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

  // Fetch alarms from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'alarms'), (snapshot) => {
      const alarmsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlarms(alarmsData);
    });
    return () => unsubscribe();
  }, []);

  // Check for ringing alarms every second
  useEffect(() => {
    const checkAlarms = async () => {
      if (showSnoozeModal) return;

      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentDay = weekDays[now.getDay()];
      
      const alarmToRing = alarms.find(alarm => 
        alarm.time === currentTime && 
        alarm.enabled &&
        alarm.days &&
        alarm.days.includes(currentDay)
      );

      if (alarmToRing) {
        // FIX: Immediately disable the alarm in the database to prevent re-triggering.
        const alarmRef = doc(db, 'alarms', alarmToRing.id);
        await updateDoc(alarmRef, { enabled: false });

        setCurrentAlarm(alarmToRing);
        setShowSnoozeModal(true);
      }
    };

    const interval = setInterval(checkAlarms, 1000); 

    return () => clearInterval(interval);
  }, [alarms, showSnoozeModal]);


  const handleSaveAlarm = async (alarm) => {
    if (editingAlarm) {
      await updateDoc(doc(db, 'alarms', editingAlarm.id), alarm);
    } else {
      await addDoc(collection(db, 'alarms'), { ...alarm, enabled: true });
    }
    setEditingAlarm(null);
    setShowForm(false);
  };

  const handleEdit = (alarm) => {
    setEditingAlarm(alarm);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'alarms', id));
  };

  const handleToggle = async (alarm) => {
    const alarmRef = doc(db, 'alarms', alarm.id);
    await updateDoc(alarmRef, { enabled: !alarm.enabled });
  };

  const handleSnooze = async (alarmToSnooze) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);

    const newTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const alarmRef = doc(db, 'alarms', alarmToSnooze.id);
    // Snoozing re-enables the alarm with the new time.
    await updateDoc(alarmRef, { time: newTime, enabled: true });
  };
  
  const closeSnoozeModal = () => {
    // FIX: When dismissing the modal without snoozing, re-enable the alarm
    // so it's active for the next scheduled day.
    if (currentAlarm) {
        const alarmRef = doc(db, 'alarms', currentAlarm.id);
        updateDoc(alarmRef, { enabled: true });
    }
    setShowSnoozeModal(false);
    setCurrentAlarm(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Snoozed by Suresh 🛏️</h1>
        <p>Your alarm that judges your excuses.</p>
      </header>

      <main>
        <div className="alarms-list">
          {alarms.map(alarm => (
            <Alarm
              key={alarm.id}
              alarm={alarm}
              onEdit={() => handleEdit(alarm)}
              onDelete={() => handleDelete(alarm.id)}
              onToggle={() => handleToggle(alarm)}
            />
          ))}
        </div>
        <button className="add-alarm-btn" onClick={() => { setEditingAlarm(null); setShowForm(true); }}>
          + Add Alarm
        </button>
      </main>

      {showForm && (
        <AlarmForm
          alarm={editingAlarm}
          onSave={handleSaveAlarm}
          onClose={() => setShowForm(false)}
        />
      )}
      
      {showSnoozeModal && currentAlarm && (
        <SnoozeModal
          alarm={currentAlarm}
          onClose={closeSnoozeModal}
          onSnooze={handleSnooze}
        />
      )}

      <footer className="app-footer">
        <p>A fun project for TinkerHub ✨</p>
      </footer>
    </div>
  );
}

export default App;
