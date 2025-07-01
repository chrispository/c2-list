import { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { ScheduledEvent, TimeIncrement } from '../types';

interface ScheduledEventItemProps {
  event: ScheduledEvent;
  position: { top: number; height: number };
  timeIncrement: TimeIncrement;
  onResize: (eventId: string, newEnd: Date) => void;
}

const ScheduledEventItem: React.FC<ScheduledEventItemProps> = ({
  event,
  position,
  timeIncrement,
  onResize,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    disabled: isResizing,
  });

  const style = {
    top: `${position.top}px`,
    height: `${position.height}px`,
    backgroundColor: event.color,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isResizing ? 'ns-resize' : 'move',
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    
    const startY = e.clientY;
    const startHeight = position.height;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(60 / (60 / timeIncrement), startHeight + deltaY);
      const roundedHeight = Math.round(newHeight / (60 / (60 / timeIncrement))) * (60 / (60 / timeIncrement));
      
      if (resizeRef.current) {
        resizeRef.current.style.height = `${roundedHeight}px`;
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(60 / (60 / timeIncrement), startHeight + deltaY);
      const roundedHeight = Math.round(newHeight / (60 / (60 / timeIncrement))) * (60 / (60 / timeIncrement));
      
      const durationMinutes = (roundedHeight / 60) * timeIncrement;
      const newEnd = new Date(event.start);
      newEnd.setMinutes(newEnd.getMinutes() + durationMinutes);
      
      onResize(event.id, newEnd);
      setIsResizing(false);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (resizeRef) resizeRef.current = node;
      }}
      className="scheduled-event"
      style={style}
      {...(!isResizing && listeners)}
      {...(!isResizing && attributes)}
    >
      <div className="event-content">
        <div className="event-title">{event.title}</div>
        <div className="event-time">
          {formatTime(event.start)} - {formatTime(event.end)}
        </div>
      </div>
      
      <div 
        className="resize-handle"
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};

export default ScheduledEventItem;