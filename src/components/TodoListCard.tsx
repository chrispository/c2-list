import { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Plus, Trash2, Check } from 'lucide-react';
import type { Task, TodoList } from '../types';

interface TodoListCardProps {
  list: TodoList;
  tasks: Task[];
  onAddTask: (listId: string, title: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const TodoListCard: React.FC<TodoListCardProps> = ({
  list,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const { setNodeRef } = useDroppable({
    id: `list-${list.id}`,
  });

  const handleSubmitNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(list.id, newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className="todo-list-card"
      style={{ borderTopColor: list.color }}
    >
      <div className="list-header">
        <h3>{list.title}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>
      
      <div className="tasks-container">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            color={list.color}
            onToggle={() => onToggleTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
        
        {isAddingTask ? (
          <form onSubmit={handleSubmitNewTask} className="new-task-form">
            <input
              type="text"
              placeholder="Task name..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
              onBlur={() => {
                if (!newTaskTitle.trim()) {
                  setIsAddingTask(false);
                }
              }}
            />
          </form>
        ) : (
          <button 
            className="add-task-btn"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus size={16} />
            Add task
          </button>
        )}
      </div>
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  color: string;
  onToggle: () => void;
  onDelete: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, color, onToggle, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`task-item ${task.completed ? 'completed' : ''}`}
    >
      <button
        className="task-checkbox"
        onClick={onToggle}
        style={{ borderColor: task.completed ? color : undefined, backgroundColor: task.completed ? color : undefined }}
      >
        {task.completed && <Check size={14} />}
      </button>
      <span className="task-title">{task.title}</span>
      <button className="task-delete" onClick={onDelete}>
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default TodoListCard;