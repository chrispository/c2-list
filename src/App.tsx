import { useState } from 'react';
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import TodoSection from './components/TodoSection';
import Scheduler from './components/Scheduler';
import type { Task, TodoList, ScheduledEvent, TimeIncrement } from './types';
import './App.css';

function App() {
  const [lists, setLists] = useState<TodoList[]>([
    { id: '1', title: 'Personal Tasks', color: '#8B5CF6' },
    { id: '2', title: 'Work Tasks', color: '#3B82F6' },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Morning workout', listId: '1', completed: false },
    { id: '2', title: 'Review project proposal', listId: '2', completed: false },
    { id: '3', title: 'Team meeting', listId: '2', completed: false },
  ]);

  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([]);
  const [timeIncrement, setTimeIncrement] = useState<TimeIncrement>(30);
  const [schedulerStartTime, setSchedulerStartTime] = useState(8);
  const [schedulerEndTime, setSchedulerEndTime] = useState(20);
  const [activeDragItem, setActiveDragItem] = useState<Task | ScheduledEvent | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeTask = tasks.find(t => t.id === active.id);
    const activeEvent = scheduledEvents.find(e => e.id === active.id);
    setActiveDragItem(activeTask || activeEvent || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveDragItem(null);
      return;
    }

    const activeTask = tasks.find(t => t.id === active.id);
    const activeEvent = scheduledEvents.find(e => e.id === active.id);
    
    if (over.id.toString().startsWith('time-')) {
      const [, hour, minute] = over.id.toString().split('-');
      const start = new Date();
      start.setHours(parseInt(hour), parseInt(minute), 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + timeIncrement);

      if (activeTask) {
        const list = lists.find(l => l.id === activeTask.listId);
        const newEvent: ScheduledEvent = {
          id: `event-${Date.now()}`,
          taskId: activeTask.id,
          title: activeTask.title,
          start,
          end,
          color: list?.color || '#8B5CF6',
          listId: activeTask.listId,
        };
        setScheduledEvents([...scheduledEvents, newEvent]);
        setTasks(tasks.filter(t => t.id !== activeTask.id));
      } else if (activeEvent) {
        const updatedEvents = scheduledEvents.map(e => 
          e.id === activeEvent.id 
            ? { ...e, start, end }
            : e
        );
        setScheduledEvents(updatedEvents);
      }
    } else if (over.id.toString().startsWith('list-')) {
      const targetListId = over.id.toString().replace('list-', '');
      
      if (activeEvent) {
        const newTask: Task = {
          id: activeEvent.taskId,
          title: activeEvent.title,
          listId: targetListId,
          completed: false,
        };
        setTasks([...tasks, newTask]);
        setScheduledEvents(scheduledEvents.filter(e => e.id !== activeEvent.id));
      } else if (activeTask && activeTask.listId !== targetListId) {
        setTasks(tasks.map(t => 
          t.id === activeTask.id 
            ? { ...t, listId: targetListId }
            : t
        ));
      }
    }

    setActiveDragItem(null);
  };

  const handleEventResize = (eventId: string, newEnd: Date) => {
    setScheduledEvents(scheduledEvents.map(e => 
      e.id === eventId ? { ...e, end: newEnd } : e
    ));
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="app">
        <TodoSection
          lists={lists}
          tasks={tasks}
          onAddList={(title) => {
            const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
            const newList: TodoList = {
              id: Date.now().toString(),
              title,
              color: colors[lists.length % colors.length],
            };
            setLists([...lists, newList]);
          }}
          onAddTask={(listId, title) => {
            const newTask: Task = {
              id: Date.now().toString(),
              title,
              listId,
              completed: false,
            };
            setTasks([...tasks, newTask]);
          }}
          onToggleTask={(taskId) => {
            setTasks(tasks.map(t => 
              t.id === taskId ? { ...t, completed: !t.completed } : t
            ));
          }}
          onDeleteTask={(taskId) => {
            setTasks(tasks.filter(t => t.id !== taskId));
          }}
        />
        
        <Scheduler
          events={scheduledEvents}
          timeIncrement={timeIncrement}
          startTime={schedulerStartTime}
          endTime={schedulerEndTime}
          onTimeIncrementChange={setTimeIncrement}
          onStartTimeChange={setSchedulerStartTime}
          onEndTimeChange={setSchedulerEndTime}
          onEventResize={handleEventResize}
        />
        
        <DragOverlay>
          {activeDragItem && (
            <div className="drag-overlay">
              {activeDragItem.title}
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default App
