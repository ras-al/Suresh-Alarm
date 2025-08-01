// src/components/AlarmForm.jsx
import React, { useState, useEffect } from 'react';
import './AlarmForm.css';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AlarmForm = ({ alarm, onSave, onClose }) => {
  const [time, setTime] = useState('07:00');
  const [label, setLabel] = useState('');
  const [days, setDays] = useState([]);

  useEffect(() => {
    if (alarm) {
      setTime(alarm.time);
      setLabel(alarm.label);
      setDays(alarm.days || []); // Handle existing alarms that don't have days
    }
  }, [alarm]);

  const handleDayClick = (day) => {
    setDays(prevDays => 
      prevDays.includes(day)
        ? prevDays.filter(d => d !== day)
        : [...prevDays, day]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (days.length === 0) {
      alert("Please select at least one day for the alarm.");
      return;
    }
    onSave({ time, label, days });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>{alarm ? 'Edit Alarm' : 'Add Alarm'}</h2>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Morning Jog"
            />
          </div>
          <div className="form-group">
            <label>Repeat on</label>
            <div className="day-selector">
              {weekDays.map(day => (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`day-btn ${days.includes(day) ? 'active' : ''}`}
                >
                  {day.charAt(0)}
                </button>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-save">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlarmForm;
