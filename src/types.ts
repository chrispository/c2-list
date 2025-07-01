export interface Task {
  id: string;
  title: string;
  listId: string;
  completed: boolean;
  scheduledTime?: {
    start: Date;
    end: Date;
  };
}

export interface TodoList {
  id: string;
  title: string;
  color: string;
}

export interface ScheduledEvent {
  id: string;
  taskId: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  listId: string;
}

export type TimeIncrement = 15 | 30 | 60;