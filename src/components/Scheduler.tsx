import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import type { ScheduledEvent, TimeIncrement } from '../types';
import ScheduledEventItem from './ScheduledEventItem';

interface SchedulerProps {
  events: ScheduledEvent[];
  timeIncrement: TimeIncrement;
  startTime: number;
  endTime: number;
  onTimeIncrementChange: (increment: TimeIncrement) => void;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  onEventResize: (eventId: string, newEnd: Date) => void;
}

const Scheduler: React.FC<SchedulerProps> = ({
  events,
  timeIncrement,
  startTime,
  endTime,
  onTimeIncrementChange,
  onStartTimeChange,
  onEndTimeChange,
  onEventResize,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const schedulerRef = useRef<HTMLDivElement>(null);

  const timeSlots = [];
  for (let hour = startTime; hour < endTime; hour++) {
    for (let minute = 0; minute < 60; minute += timeIncrement) {
      timeSlots.push({ hour, minute });
    }
  }

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour || 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const getEventPosition = (event: ScheduledEvent) => {
    const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
    const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
    const schedulerStartMinutes = startTime * 60;
    
    const top = ((startMinutes - schedulerStartMinutes) / timeIncrement) * 60;
    const height = ((endMinutes - startMinutes) / timeIncrement) * 60;
    
    return { top, height };
  };

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate.toDateString() === currentDate.toDateString();
  });

  return (
    <div className="scheduler">
      <div className="scheduler-header">
        <div className="date-navigation">
          <button onClick={() => changeDate(-1)}>
            <ChevronLeft size={20} />
          </button>
          <h2>{formatDate(currentDate)}</h2>
          <button onClick={() => changeDate(1)}>
            <ChevronRight size={20} />
          </button>
        </div>
        
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings size={20} />
        </button>
      </div>

      {showSettings && (
        <div className="scheduler-settings">
          <div className="setting-group">
            <label>Time Increment</label>
            <select 
              value={timeIncrement} 
              onChange={(e) => onTimeIncrementChange(Number(e.target.value) as TimeIncrement)}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label>Start Time</label>
            <select 
              value={startTime} 
              onChange={(e) => onStartTimeChange(Number(e.target.value))}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{formatTime(i, 0).split(':')[0]} {i >= 12 ? 'PM' : 'AM'}</option>
              ))}
            </select>
          </div>
          
          <div className="setting-group">
            <label>End Time</label>
            <select 
              value={endTime} 
              onChange={(e) => onEndTimeChange(Number(e.target.value))}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{formatTime(i, 0).split(':')[0]} {i >= 12 ? 'PM' : 'AM'}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      <div 
        className="scheduler-grid" 
        ref={schedulerRef}
        style={{ '--time-slot-height': `${timeIncrement === 60 ? 120 : timeIncrement === 30 ? 60 : 30}px` } as React.CSSProperties}
      >
        <div className="time-column">
          {timeSlots.map(({ hour, minute }) => (
            <div key={`${hour}-${minute}`} className="time-slot-label">
              {minute === 0 && formatTime(hour, minute)}
            </div>
          ))}
        </div>
        
        <div className="events-column">
          {timeSlots.map(({ hour, minute }) => (
            <TimeSlot 
              key={`${hour}-${minute}`} 
              hour={hour} 
              minute={minute}
              isHourStart={minute === 0}
            />
          ))}
          
          <div className="events-container">
            {todayEvents.map(event => {
              const position = getEventPosition(event);
              return (
                <ScheduledEventItem
                  key={event.id}
                  event={event}
                  position={position}
                  timeIncrement={timeIncrement}
                  onResize={onEventResize}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimeSlotProps {
  hour: number;
  minute: number;
  isHourStart: boolean;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ hour, minute, isHourStart }) => {
  const { setNodeRef } = useDroppable({
    id: `time-${hour}-${minute}`,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`time-slot ${isHourStart ? 'hour-start' : ''}`}
    />
  );
};

export default Scheduler;