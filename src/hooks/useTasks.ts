import { useState, useCallback, useEffect } from 'react';
import type { Task, TaskStatus } from '../shared/types';
import { tasksApi } from '../services/api';
import { useToast } from '../components/ui';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    // Fetch tasks on mount
    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await tasksApi.getAll();
            // Sort by created_at descending (newest first)
            const sorted = data.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
            setTasks(sorted);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load tasks');
            console.error('Error loading tasks:', err);
            showToast('Failed to load tasks', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const addTask = useCallback(async (task: Omit<Task, 'task_id' | 'created_at' | 'updated_at'>) => {
        try {
            const newTask = await tasksApi.create(task as Partial<Task>);
            // Prepend new task
            setTasks(prev => [newTask, ...prev]);
            showToast('Task added successfully', 'success');
            return newTask;
        } catch (err) {
            console.error('Error adding task:', err);
            showToast('Failed to add task', 'error');
            throw err;
        }
    }, [showToast]);

    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
        try {
            const updated = await tasksApi.update(id, updates);
            setTasks(prev => prev.map(t => t.task_id === id ? { ...t, ...updated } : t));
            showToast('Task updated successfully', 'success');
            return updated;
        } catch (err) {
            console.error('Error updating task:', err);
            showToast('Failed to update task', 'error');
            throw err;
        }
    }, [showToast]);

    const updateTaskStatus = useCallback(async (id: string, status: TaskStatus) => {
        const completedDate = status === 'Completed' ? new Date().toISOString().split('T')[0] : '';
        try {
            const updated = await updateTask(id, { status, completed_date: completedDate });
            return updated;
        } catch (error) {
            // Toast already handled in updateTask
            throw error;
        }
    }, [updateTask]);

    const deleteTask = useCallback(async (id: string) => {
        try {
            await tasksApi.delete(id);
            setTasks(prev => prev.filter(t => t.task_id !== id));
            showToast('Task deleted successfully', 'success');
        } catch (err) {
            console.error('Error deleting task:', err);
            showToast('Failed to delete task', 'error');
            throw err;
        }
    }, [showToast]);

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
