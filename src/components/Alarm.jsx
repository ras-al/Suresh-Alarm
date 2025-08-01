// src/components/Alarm.jsx
import React from 'react';
import './Alarm.css';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Alarm = ({ alarm, onEdit, onDelete, onToggle }) => {

  const formatTime12Hour = (time24) => {
    if (!time24) return { displayTime: '00:00', period: 'AM' };
    
    let [hours, minutes] = time24.split(':');
    let period = 'AM';
    
    if (hours >= 12) {
      period = 'PM';
    }
    if (hours > 12) {
      hours -= 12;
    } else if (hours == 0) {
      hours = 12;
    }
    
    return {
      displayTime: `${hours}:${minutes}`,
      period: period
    };
  };

  const { displayTime, period } = formatTime12Hour(alarm.time);

  return (
    <div className={`alarm-card ${!alarm.enabled ? 'disabled' : ''}`}>
      <div className="alarm-info">
        <div className="alarm-time-label">
            <h2 className="time-display">{displayTime}</h2>
            <span className="time-period">{period}</span>
        </div>
        <div className="alarm-days-list">
          {weekDays.map(day => (
            <span 
              key={day} 
              className={`day-indicator ${alarm.days?.includes(day) ? 'active' : ''}`}
            >
              {day}
            </span>
          ))}
        </div>
      </div>
      <div className="alarm-controls">
        <label className="switch">
          <input type="checkbox" checked={alarm.enabled} onChange={onToggle} />
          <span className="slider round"></span>
        </label>
        <button onClick={onEdit} className="control-btn edit-btn">Edit</button>
        <button onClick={onDelete} className="control-btn delete-btn">Delete</button>
      </div>
    </div>
  );
};

export default Alarm;
