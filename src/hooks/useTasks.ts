import { useState, useCallback, useEffect } from 'react';
import type { Task, TaskStatus } from '../shared/types';
import { tasksApi } from '../services/api';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch tasks on mount
    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await tasksApi.getAll();
            setTasks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load tasks');
            console.error('Error loading tasks:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const addTask = useCallback(async (task: Omit<Task, 'task_id' | 'created_at' | 'updated_at'>) => {
        try {
            const newTask = await tasksApi.create(task as Partial<Task>);
            setTasks(prev => [...prev, newTask]);
            return newTask;
        } catch (err) {
            console.error('Error adding task:', err);
            throw err;
        }
    }, []);

    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
        try {
            const updated = await tasksApi.update(id, updates);
            setTasks(prev => prev.map(t => t.task_id === id ? { ...t, ...updated } : t));
            return updated;
        } catch (err) {
            console.error('Error updating task:', err);
            throw err;
        }
    }, []);

    const updateTaskStatus = useCallback(async (id: string, status: TaskStatus) => {
        const completedDate = status === 'Completed' ? new Date().toISOString().split('T')[0] : '';
        return updateTask(id, { status, completed_date: completedDate });
    }, [updateTask]);

    const deleteTask = useCallback(async (id: string) => {
        try {
            await tasksApi.delete(id);
            setTasks(prev => prev.filter(t => t.task_id !== id));
        } catch (err) {
            console.error('Error deleting task:', err);
            throw err;
        }
    }, []);

    const getTasksByPhase = useCallback((phase: string) => {
        return tasks.filter(t => t.phase === phase);
    }, [tasks]);

    const getUrgentTasks = useCallback(() => {
        const now = new Date();
        const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        return tasks
            .filter(t => {
                if (t.status === 'Completed') return false;
                const dueDate = new Date(t.due_date);
                return dueDate <= twoWeeksFromNow || t.priority === 'Urgent' || t.priority === 'High';
            })
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    }, [tasks]);

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        notStarted: tasks.filter(t => t.status === 'Not Started').length,
    };

    return {
        tasks,
        isLoading,
        error,
        stats,
        loadTasks,
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        getTasksByPhase,
        getUrgentTasks,
    };
}
