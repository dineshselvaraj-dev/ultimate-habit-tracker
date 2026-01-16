import React, { useState, useEffect } from 'react';
import { dbRequest } from '../db/db';
import { format, startOfWeek, addDays, isSameDay, parseISO, isFuture, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { isTodayIST, isFutureIST } from '../utils/dateUtils';

const WeeklyGrid = ({ startWeekDate = new Date(), onUpdate, refreshTrigger, onAlert, onConfirm }) => {
    const [weekDays, setWeekDays] = useState([]);
    const [habitMap, setHabitMap] = useState({});
    const [loading, setLoading] = useState(true);

    // Generate days of the week
    useEffect(() => {
        const start = startOfWeek(startWeekDate, { weekStartsOn: 1 }); // Monday start
        const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
        setWeekDays(days);
    }, [startWeekDate]);

    // Fetch all tasks and organize by Habit Title -> Date -> Status
    useEffect(() => {
        const fetchWeekData = async () => {
            setLoading(true);
            const allTasks = await dbRequest.getAllTasks();

            // 1. Filter tasks for this week to optimize? Or just get all unique titles ever used?
            // User wants to see "Walking" if they added it today.
            // Let's get all unique titles from the DB tasks + default habits

            const map = {};
            // Removed hardcoded defaults so user can "delete" them by removing tasks.
            // const defaultHabits = ['Drink Water', 'Exercise', 'Reading', 'Meditation', 'Journaling'];
            const allTitles = new Set();

            // Add any custom titles found in existing tasks
            allTasks.forEach(task => {
                if (task.title) allTitles.add(task.title);
            });

            // Initialize map for all titles
            allTitles.forEach(title => {
                map[title] = {};
            });

            // Populate progress
            allTasks.forEach(task => {
                if (map[task.title]) {
                    map[task.title][task.date] = task;
                }
            });

            setHabitMap(map);
            setLoading(false);
        };

        fetchWeekData();
    }, [startWeekDate, refreshTrigger]); // Re-fetch when parent updates

    const toggleHabit = async (habitTitle, dateObj) => {
        const dateStr = format(dateObj, 'yyyy-MM-dd');

        // Strict Rule: Cannot complete future OR past tasks
        if (!isTodayIST(dateStr)) {
            if (isFutureIST(dateStr)) {
                if (onAlert) onAlert("Whoa there, Time Traveler! ⏳\nYou cannot complete future tasks yet.", "error");
            } else {
                if (onAlert) onAlert("History is written! 📜\nYou cannot change past records.", "error");
            }
            return;
        }

        const existingTask = habitMap[habitTitle]?.[dateStr];

        if (existingTask) {
            // Toggle completion
            const updated = { ...existingTask, completed: !existingTask.completed };
            await dbRequest.updateTask(updated);
        } else {
            // Create new task
            const newTask = {
                title: habitTitle,
                date: dateStr,
                completed: true,
                priority: 'normal'
            };
            await dbRequest.addTask(newTask);
        }

        // Trigger refresh
        if (onUpdate) onUpdate();
    };

    // Delete entire habit (all tasks with this title)
    const deleteHabit = async (habitTitle) => {
        const action = async () => {
            // Find all IDs for this title
            const tasksToDelete = [];
            Object.values(habitMap[habitTitle]).forEach(task => {
                if (task && task.id) tasksToDelete.push(task.id);
            });

            for (const id of tasksToDelete) {
                await dbRequest.deleteTask(id);
            }
            if (onUpdate) onUpdate();
        };

        if (onConfirm) {
            onConfirm(
                `Delete "${habitTitle}"?`,
                "This will permanently delete this habit and all its history.",
                action,
                'danger'
            );
        } else if (window.confirm(`Delete "${habitTitle}" and all its history permanently?`)) {
            // Fallback
            await action();
        }
    };

    // Helper to delete a task if it exists for a specific day
    const deleteHabitEntry = async (habitTitle, dayObj) => {
        const dateStr = format(dayObj, 'yyyy-MM-dd');
        const existingTask = habitMap[habitTitle]?.[dateStr];

        if (existingTask) {
            const action = async () => {
                await dbRequest.deleteTask(existingTask.id);
                if (onUpdate) onUpdate();
            };

            if (onConfirm) {
                onConfirm(
                    "Remove Task?",
                    "Do you want to clear this task record?",
                    action
                );
            } else if (window.confirm('Delete this entry?')) {
                await action();
            }
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Loading Grid...</div>;

    return (
        <div className="weekly-grid-container">
            <table className="spreadsheet-table">
                <thead>
                    <tr>
                        <th className="habit-col">Weekly Habits</th>
                        {weekDays.map(day => (
                            <th key={day.toString()} className={`day-col ${isSameDay(day, new Date()) ? 'today' : ''}`}>
                                <div className="day-name">{format(day, 'EEE')}</div>
                                <div className="day-num">{format(day, 'd')}</div>
                            </th>
                        ))}
                        <th className="stats-col">Progress</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(habitMap).map(habit => {
                        const weekProgress = weekDays.reduce((acc, day) => {
                            const task = habitMap[habit][format(day, 'yyyy-MM-dd')];
                            return acc + (task?.completed ? 1 : 0);
                        }, 0);
                        const percent = Math.round((weekProgress / 7) * 100);

                        return (
                            <tr key={habit}>
                                <td className="habit-name">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{habit}</span>
                                        <button
                                            onClick={() => deleteHabit(habit)}
                                            className="row-delete-btn"
                                            title="Delete this habit"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </td>
                                {weekDays.map(day => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const task = habitMap[habit][dateStr];
                                    const isCompleted = task?.completed;
                                    const isTodayCell = isSameDay(day, new Date());

                                    return (
                                        <td key={dateStr} className={`cell-check ${isTodayCell ? 'today-cell' : ''}`} onContextMenu={(e) => {
                                            e.preventDefault();
                                            deleteHabitEntry(habit, day);
                                        }}>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => toggleHabit(habit, day)}
                                                className={`grid-checkbox ${isCompleted ? 'checked' : 'unchecked'}`}
                                                title={isCompleted ? "Completed (Right click to delete)" : "Click to complete"}
                                            >
                                                {isCompleted && <Check size={14} strokeWidth={4} />}
                                            </motion.button>
                                        </td>
                                    );
                                })}
                                <td className="cell-progress">
                                    <div className="mini-bar-bg">
                                        <div
                                            className="mini-bar-fill"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: percent === 100 ? 'var(--success)' : percent > 50 ? 'var(--blue)' : 'var(--danger)'
                                            }}
                                        />
                                    </div>
                                    <span className="percent-text">{percent}%</span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <style>{`
            .weekly-grid-container {
                background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            overflow-x: auto;
            box-shadow: var(--shadow-md);
            position: relative;
        }

            .spreadsheet-table {
                width: 100%;
            border-collapse: separate; /* Required for sticky to visually work well with borders */
            border-spacing: 0;
            min-width: 800px;
        }

            .spreadsheet-table th, .spreadsheet-table td {
                border - bottom: 1px solid var(--border-color);
            border-right: 1px solid var(--border-color);
            padding: 12px;
            text-align: center;
            background: var(--bg-card); /* Default bg */
            color: var(--text-primary);
            transition: background-color 0.2s;
        }

            /* Sticky Header First Column */
            .habit-col {
                position: sticky;
            left: 0;
            z-index: 20;
            text-align: left;
            width: 200px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-weight: 600;
            border-right: 2px solid var(--border-color); /* Separator */
        }

            /* Sticky Body First Column */
            .habit-name {
                position: sticky;
            left: 0;
            z-index: 10;
            font-weight: 600;
            color: var(--text-primary);
            background: var(--bg-card);
            text-align: left !important;
            border-right: 2px solid var(--border-color); /* Separator */
            box-shadow: 4px 0 8px rgba(0,0,0,0.02);
        }

            /* Hover row effect - targeted to cells to override backgrounds */
            tr:hover td {
                background - color: var(--bg-secondary) !important;
        }

            /* Ensure sticky column part of row hover looks correct */
            tr:hover .habit-name {
                background - color: var(--bg-secondary) !important;
        }

            .spreadsheet-table th {
                background: var(--bg-secondary);
                font-weight: 700;
                color: var(--text-secondary);
                border-bottom: 2px solid var(--border-color);
            }

            .day-col {
                width: 80px;
                background: var(--bg-secondary);
                position: relative;
            }

            .day-col.today {
                background: rgba(var(--accent-primary-rgb), 0.15); /* Transparent accent for dark mode compatibility */
                color: var(--accent-primary);
                border-bottom: 2px solid var(--accent-primary);
            }

            .today-cell {
                background-color: rgba(var(--accent-primary-rgb), 0.05) !important;
            }

            .day-name {font - size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
            .day-num {font - size: 1.25rem; font-weight: 800; margin-top: 2px; }

            .grid-checkbox {
                width: 32px;
            height: 32px;
            border-radius: 8px;
            border: 2px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer;
        }

            .grid-checkbox.unchecked:hover {
                border - color: var(--accent-primary);
            background: rgba(var(--accent-primary-rgb), 0.1);
            transform: scale(1.1);
        }

            .grid-checkbox.checked {
                background: var(--success);
            border-color: var(--success);
            color: white;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

            .stats-col {width: 140px; background: var(--bg-secondary); }
            .cell-progress {padding: 0 16px !important; }

            .mini-bar-bg {
                height: 8px;
            background: var(--border-color);
            border-radius: 4px;
            width: 100%;
            margin-bottom: 6px;
            overflow: hidden;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
        }

            .mini-bar-fill {height: 100%; border-radius: 4px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
            .percent-text {font - size: 0.75rem; color: var(--text-secondary); font-weight: 700; }

            .row-delete-btn {
                background: var(--danger-bg);
            border: none;
            color: var(--danger);
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            opacity: 0;
            transition: all 0.2s;
            transform: translateX(-10px);
        }

            .habit-name:hover .row-delete-btn {
                opacity: 1;
            transform: translateX(0);
        }
            .row-delete-btn:hover {
                background: var(--danger);
            color: white;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }
      `}</style>
        </div >
    );
};

export default WeeklyGrid;
