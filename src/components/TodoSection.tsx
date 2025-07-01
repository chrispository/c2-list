import { useState } from 'react';
import { Plus } from 'lucide-react';
import TodoListCard from './TodoListCard';
import type { Task, TodoList } from '../types';

interface TodoSectionProps {
  lists: TodoList[];
  tasks: Task[];
  onAddList: (title: string) => void;
  onAddTask: (listId: string, title: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const TodoSection: React.FC<TodoSectionProps> = ({
  lists,
  tasks,
  onAddList,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const handleSubmitNewList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListTitle.trim()) {
      onAddList(newListTitle.trim());
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  return (
    <div className="todo-section">
      <div className="todo-header">
        <h1>My Lists</h1>
        <button 
          className="add-list-btn"
          onClick={() => setIsAddingList(true)}
        >
          <Plus size={20} />
          New List
        </button>
      </div>
      
      <div className="lists-container">
        {lists.map(list => (
          <TodoListCard
            key={list.id}
            list={list}
            tasks={tasks.filter(task => task.listId === list.id)}
            onAddTask={onAddTask}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
        
        {isAddingList && (
          <div className="new-list-card">
            <form onSubmit={handleSubmitNewList}>
              <input
                type="text"
                placeholder="List name..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                autoFocus
                onBlur={() => {
                  if (!newListTitle.trim()) {
                    setIsAddingList(false);
                  }
                }}
              />
              <div className="new-list-actions">
                <button type="submit">Create</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAddingList(false);
                    setNewListTitle('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoSection;