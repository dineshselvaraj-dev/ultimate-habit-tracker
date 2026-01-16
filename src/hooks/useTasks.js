import { useState, useEffect, useCallback } from 'react';
import { dbRequest } from '../db/db';
import { format } from 'date-fns';

export const useTasks = (selectedDate) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    const loadTasks = useCallback(async () => {
        setLoading(true);
        try {
            const dateTasks = await dbRequest.getTasksByDate(formattedDate);
            setTasks(dateTasks);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoading(false);
        }
    }, [formattedDate]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const addTask = async (title, time = '') => {
        const newTask = {
            title,
            time,
            date: formattedDate,
            completed: false,
            priority: 'normal', // normal, high
        };
        const savedTask = await dbRequest.addTask(newTask);
        setTasks((prev) => [...prev, savedTask]);
    };

    const toggleTask = async (id) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) return;
        const updatedTask = { ...task, completed: !task.completed };
        await dbRequest.updateTask(updatedTask);
        setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    };

    const deleteTask = async (id) => {
        await dbRequest.deleteTask(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    return { tasks, loading, addTask, toggleTask, deleteTask, refresh: loadTasks };
};
