import React, { useState, useEffect, useRef } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, addWeeks, subWeeks, isFuture, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Save, Download, Quote } from 'lucide-react';
import WeeklyGrid from './WeeklyGrid';
import TimelineView from './TimelineView';
import ProgressCircle from './ProgressCircle';
import { dbRequest } from '../db/db';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Toast from './Toast';
import ExportModal from './ExportModal';
import RoutineModal from './RoutineModal';
import ConfirmModal from './ConfirmModal';
import { getTodayIST, getTodayISTString, isTodayIST, isFutureIST } from '../utils/dateUtils';

import { themes } from '../styles/themes';
import { Palette } from 'lucide-react';

const HeaderClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const istTime = now.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const istDate = now.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div
      className="subtitle"
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        userSelect: 'none'
      }}
    >
      <span>{istDate}</span>
      <span style={{ height: '16px', borderLeft: '2px solid var(--border-color)' }}></span>
      <span style={{ fontWeight: 700, color: 'var(--accent-primary)', minWidth: '110px' }}>
        {istTime}
      </span>
      <span style={{
        fontSize: '0.7em',
        fontWeight: 800,
        padding: '2px 6px',
        borderRadius: '6px',
        background: 'var(--bg-secondary)',
        color: 'var(--text-secondary)'
      }}>
        IST
      </span>
    </div>
  );
};

const Dashboard = () => {
  // Theme State
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('habit-theme') || 'light';
  });

  // Apply Theme Effect
  useEffect(() => {
    const theme = themes[currentTheme];
    if (theme) {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      localStorage.setItem('habit-theme', currentTheme);
    }
  }, [currentTheme]);

  // State for navigation & Data
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingTask, setEditingTask] = useState(null);
  const formRef = useRef(null);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);

  // Routine Modal State
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  // Theme Dropdown State
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Confirmation Modal State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => { }
  });

  const confirmAction = (title, message, onConfirm, type = 'danger') => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const handleApplyRoutine = async (routineTasks) => {
    // 1. Get current date string
    const dateStr = format(currentDate, 'yyyy-MM-dd');

    // 2. Iterate and add each task with current date
    let addedCount = 0;
    for (const t of routineTasks) {
      // Strip ID, use current date, reset completion
      const newTask = {
        title: t.title,
        startTime: t.startTime || '',
        endTime: t.endTime || '',
        date: dateStr,
        completed: false // Always start pending
      };
      await dbRequest.addTask(newTask);
      addedCount++;
    }

    setRefreshKey(k => k + 1);
    showToast(`${addedCount} tasks added from routine!`, "success");
  };

  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, percentage: 0, missed: 0 });

  // Pending Changes for Batch Update
  const [pendingChanges, setPendingChanges] = useState({}); // Map of id -> newTaskState
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'timeline'
  const [tasks, setTasks] = useState([]);

  // Helper: Strictly Get "Today" in IST
  // const getTodayIST = ... Removed, imported from utils

  // Motivational Quotes - Billionaire Edition (Daily Rotation)
  const quotes = [
    { text: "When something is important enough, you do it even if the odds are not in your favor.", author: "Elon Musk" },
    { text: "If you double the number of experiments you do per year you’re going to double your inventiveness.", author: "Jeff Bezos" },
    { text: "The most important investment you can make is in yourself.", author: "Warren Buffett" },
    { text: "Patience is a key element of success.", author: "Bill Gates" },
    { text: "The biggest risk is not taking any risk.", author: "Mark Zuckerberg" },
    { text: "You don't have to be a genius or a visionary or even a college graduate to be successful. You just need a framework and a dream.", author: "Michael Dell" },
    { text: "I have had all of the disadvantages required for success.", author: "Larry Ellison" },
    { text: "Always deliver more than expected.", author: "Larry Page" },
    { text: "You can't have a better tomorrow if you are thinking about yesterday all the time.", author: "Charles Kettering" },
    { text: "If you don't give up, you still have a chance. Giving up is the greatest failure.", author: "Jack Ma" },
    { text: "Business opportunities are like buses, there's always another one coming.", author: "Richard Branson" },
    { text: "The more you praise and celebrate your life, the more there is in life to celebrate.", author: "Oprah Winfrey" },
    { text: "Risk more than others think is safe. Dream more than others think is practical.", author: "Howard Schultz" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is a lousy teacher. It seduces smart people into thinking they can't lose.", author: "Bill Gates" },
    { text: "It takes 20 years to build a reputation and five minutes to ruin it.", author: "Warren Buffett" },
    { text: "Work like there is someone working 24 hours a day to take it away from you.", author: "Mark Cuban" },
    { text: "High expectations are the key to everything.", author: "Sam Walton" },
    { text: "Move fast and break things.", author: "Mark Zuckerberg" },
    { text: "Persistence is very important. You should not give up unless you are forced to give up.", author: "Elon Musk" },
    { text: "Smart people focus on the right things.", author: "Jensen Huang" }
  ];

  const getDailyQuote = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Rotates daily based on day of year
    return quotes[dayOfYear % quotes.length];
  };

  const [quote] = useState(getDailyQuote());

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchTasks = React.useCallback(async () => {
    const all = await dbRequest.getAllTasks();
    const dateStr = getTodayISTString();

    // Filter for current view
    const daysTasks = all.filter(t => t.date === dateStr);
    setTasks(daysTasks);

    // Calc Daily Stats
    const total = daysTasks.length;
    const completed = daysTasks.filter(t => t.completed).length;

    // Strict Weekly Stats Logic
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const today = new Date(); // Real time

    const weeklyTasks = all.filter(t => {
      const d = parseISO(t.date);
      return d >= weekStart && d <= weekEnd;
    });

    // 1. Identify distinct habits active this week
    const uniqueHabits = [...new Set(weeklyTasks.map(t => t.title))];

    // 2. Calculate "Days Elapsed" in this week (Monday up to Today)
    let daysElapsed = 0;

    // We only count "past/active" days if the selected week is the current week or past
    if (weekStart > today) {
      daysElapsed = 0; // Future week
    } else if (weekEnd < today) {
      daysElapsed = 7; // Past week fully done
    } else {
      // Current week: Count days from Monday (1) to Today (indexed)
      // differenceInCalendarDays(today, weekStart) + 1 (for inclusive today)
      const diffTime = Math.abs(today - weekStart);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Robust calc: how many days in [weekStart, weekEnd] are <= today?
      daysElapsed = 0;
      let d = new Date(weekStart);
      const endCheck = new Date(weekEnd);
      const todayCheck = new Date(today);

      // Normalize to midnight for comparison
      todayCheck.setHours(23, 59, 59, 999);

      while (d <= endCheck && d <= todayCheck) {
        daysElapsed++;
        d.setDate(d.getDate() + 1);
      }
    }

    // 3. Target = Habits * Days Elapsed
    const weeklyTotal = (uniqueHabits.length * daysElapsed) || 1; // avoid /0

    // 4. Actual = Completed counts for days <= today
    const weeklyDone = weeklyTasks.filter(t => {
      if (!t.completed) return false;
      const tDate = parseISO(t.date);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      return tDate <= todayEnd;
    }).length;

    // 5. Percentage
    const weeklyPct = Math.round((weeklyDone / weeklyTotal) * 100);

    // Calc Missed
    const missed = all.filter(t => !t.completed && t.date < getTodayISTString()).length;

    setStats({
      totalTasks: total,
      completedTasks: completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      missed,
      weeklyTotal: weeklyTotal || 1,
      weeklyDone,
      weeklyPct
    });
  }, [currentDate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshKey]);

  // Handle local toggle (doesn't save yet)
  const handleToggleEvent = (taskId) => {
    const existingTask = tasks.find(t => t.id === taskId);
    if (!existingTask) return;

    // Strict Rule: Cannot complete future OR past tasks
    if (!isTodayIST(existingTask.date)) {
      if (isFutureIST(existingTask.date)) {
        showToast("Whoa there, Time Traveler! ⏳\nYou cannot complete future tasks yet.", "error");
      } else {
        showToast("History is written! 📜\nYou cannot change past records.", "error");
      }
      return;
    }

    const isCurrentlyCompleted = pendingChanges[taskId]
      ? pendingChanges[taskId].completed
      : existingTask.completed;

    const newState = { ...existingTask, completed: !isCurrentlyCompleted };

    setPendingChanges(prev => ({
      ...prev,
      [taskId]: newState
    }));
    setHasUnsavedChanges(true);

    // Optimistic UI update for list
    setTasks(prev => prev.map(t => t.id === taskId ? newState : t));
  };

  // Commit changes to DB
  const saveChanges = async () => {
    const updates = Object.values(pendingChanges);
    for (const task of updates) {
      await dbRequest.updateTask(task);
    }
    setPendingChanges({});
    setHasUnsavedChanges(false);
    setRefreshKey(k => k + 1); // Refresh all
    showToast("Progress Saved Successfully!", "success");
  };

  const handleDelete = (taskId) => {
    confirmAction(
      "Delete Task?",
      "Are you sure you want to delete this task permanently?",
      async () => {
        await dbRequest.deleteTask(taskId);
        setRefreshKey(k => k + 1);
      }
    );
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    if (formRef.current) {
      formRef.current.title.value = task.title;
      formRef.current.startTime.value = task.startTime || '';
      formRef.current.endTime.value = task.endTime || '';
      // Scroll to form
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    if (formRef.current) formRef.current.reset();
  };

  // Year Selection Logic (2026 onwards)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i); // Next 5 years

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    const newDate = new Date(currentDate);
    newDate.setFullYear(newYear);
    setCurrentDate(newDate);
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    const newDate = new Date(currentDate);
    newDate.setMonth(newMonth);
    setCurrentDate(newDate);
  };

  // Export Logic with Modal
  const generatePDF = async (range) => {
    setShowExportModal(false); // Close modal

    // Fetch fresh data
    const allTasks = await dbRequest.getAllTasks();
    let filteredTasks = [];
    let title = '';
    let subtitle = '';

    if (range === 'daily') {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      filteredTasks = allTasks.filter(t => t.date === dateStr);
      title = "Daily Habit Report";
      subtitle = `Date: ${format(currentDate, 'MMMM do, yyyy')}`;
    }
    else if (range === 'weekly') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      filteredTasks = allTasks.filter(t => isWithinInterval(parseISO(t.date), { start, end }));
      title = "Weekly Habit Report";
      subtitle = `Week of: ${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      // Sort by date then time
      filteredTasks.sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''));
    }
    else if (range === 'monthly') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      filteredTasks = allTasks.filter(t => isWithinInterval(parseISO(t.date), { start, end }));
      title = "Monthly Habit Report";
      subtitle = `Month: ${format(currentDate, 'MMMM yyyy')}`;
      filteredTasks.sort((a, b) => a.date.localeCompare(b.date));
    }

    if (filteredTasks.length === 0) {
      showToast("No data found for this period!", "error");
      return;
    }

    // Generate PDF
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 14, 28);
    doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 33);

    // Summary Stats
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 38, 196, 38);

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Tasks: ${total}`, 14, 46);
    doc.text(`Completed: ${completed}`, 60, 46);
    doc.text(`Success Rate: ${rate}%`, 110, 46);

    // Table
    const tableColumn = ["Date", "Task Title", "Time / Duration", "Status"];
    const tableRows = filteredTasks.map(task => [
      task.date, // Add date column for multi-day reports
      task.title,
      `${task.startTime || '-'} — ${task.endTime || '-'}`,
      task.completed ? "COMPLETED" : "PENDING"
    ]);

    autoTable(doc, {
      startY: 54,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [63, 81, 181], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          if (data.cell.raw === "COMPLETED") {
            data.cell.styles.textColor = [0, 128, 0]; // Green
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [180, 0, 0]; // Red
          }
        }
      }
    });

    doc.save(`${range}_habit_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    showToast(`${title} Downloaded!`, "success");
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Date,Task,Start Time,End Time,Status\n"
      + tasks.map(t => `${t.date},${t.title},${t.startTime || ''},${t.endTime || ''},${t.completed ? 'Completed' : 'Pending'}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `habit_report_${format(currentDate, 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="container dashboard-container">
      {/* Quote Banner */}
      {/* Animated Quote Banner */}
      <motion.div
        className="quote-banner"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        whileHover={{ scale: 1.02 }}
        style={{
          background: 'linear-gradient(120deg, #0cebeb 0%, #20e3b2 50%, #29ffc6 100%)', // Vibrant Teal/Cyan/Green
          color: '#0f172a', // Dark text for contrast vs bright background
          boxShadow: '0 10px 20px -5px rgba(32, 227, 178, 0.4)'
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            style={{ marginBottom: '16px' }}
          >
            <Quote size={32} className="quote-icon" style={{ color: '#0f172a', opacity: 0.8 }} />
          </motion.div>

          <div style={{ width: '100%' }}>
            <motion.p
              key={quote.text}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', fontStyle: 'normal', marginBottom: 4 }}
            >
              "{quote.text}"
            </motion.p>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ fontSize: '0.9rem', color: '#334155', fontStyle: 'italic', fontWeight: 600 }}
            >
              — {quote.author}
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Header Section */}
      <header className="dash-header">
        <div>
          <h1 className="title-gradient">My Progress Tracker</h1>
          <HeaderClock />
        </div>

        <div className="date-controls">
          <div className="select-wrapper">
            <select value={currentDate.getMonth()} onChange={handleMonthChange}>
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
          <div className="select-wrapper">
            <select value={currentDate.getFullYear()} onChange={handleYearChange} className="date-select">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <button className="today-btn" onClick={() => {
            setCurrentDate(new Date());
            setRefreshKey(k => k + 1);
          }}>
            Today
          </button>
        </div>
      </header>

      {/* Top Stats Row */}
      <div className="stats-row">

        {/* Daily Focus Card */}
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)" }}
        >
          <div className="stat-info">
            <h3 style={{ color: 'var(--success)' }}>Daily Focus</h3>
            <p className="stat-big">{stats.completedTasks} <span className="stat-small">/ {stats.totalTasks}</span></p>
            <span className="stat-desc">Tasks Today</span>
          </div>
          <ProgressCircle progress={stats.percentage} size={85} strokeWidth={8} color="var(--success)">
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--success)' }}>{stats.percentage}%</span>
          </ProgressCircle>
        </motion.div>

        {/* Missed Tasks Card */}
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.3)" }}
        >
          <div className="stat-info">
            <h3 style={{ color: 'var(--danger)' }}>Missed Tasks</h3>
            <p className="stat-big" style={{ color: 'var(--danger)' }}>{stats.missed}</p>
            <span className="stat-desc">Incomplete Past</span>
          </div>
          <ProgressCircle progress={Math.min(stats.missed * 10, 100)} size={85} strokeWidth={8} color="var(--danger)">
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--danger)' }}>{stats.missed}</span>
          </ProgressCircle>
        </motion.div>

        {/* Weekly Goal Card */}
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}
        >
          <div className="stat-info">
            <h3 style={{ color: 'var(--blue)' }}>Weekly Goal</h3>
            <p className="stat-big" style={{ color: 'var(--text-primary)' }}>
              {stats.weeklyDone} <span className="stat-small" style={{ fontSize: '0.9rem' }}>/ {stats.weeklyTotal}</span>
            </p>
            <span className="stat-desc">Completed this week</span>
          </div>
          <ProgressCircle progress={stats.weeklyPct} size={85} strokeWidth={8} color="var(--blue)">
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--blue)' }}>{stats.weeklyPct}%</span>
          </ProgressCircle>
        </motion.div>

      </div>

      {/* View Toggle & Export */}
      <div className="controls-row">
        <div className="view-toggles">
          <button
            className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </button>
          <button
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Weekly Grid
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <button
              className="export-btn"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              style={{ minWidth: '120px', justifyContent: 'center' }}
            >
              <Palette size={16} /> {themes[currentTheme]?.name || 'Theme'}
            </button>
            {showThemeMenu && (
              <div className="theme-menu">
                {Object.values(themes).map(theme => (
                  <button
                    key={theme.id}
                    className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentTheme(theme.id);
                      setShowThemeMenu(false);
                    }}
                  >
                    <div className="theme-preview" style={{ background: theme.colors['--bg-primary'] }}>
                      <div className="theme-dot" style={{ background: theme.colors['--accent-primary'] }}></div>
                    </div>
                    {theme.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="export-btn" onClick={() => setShowRoutineModal(true)}>
            ⚡ Routine
          </button>
          <button className="export-btn" onClick={handleExportCSV}>
            <Download size={18} /> CSV
          </button>
          <button className="export-btn" onClick={() => setShowExportModal(true)}>
            <Download size={18} /> PDF
          </button>
          <button
            className="export-btn"
            onClick={() => {
              confirmAction(
                "Reset Data?",
                "WARNING: This will delete ALL your history and tasks permanently. This action cannot be undone.",
                async () => {
                  try {
                    await dbRequest.clearAllTasks();
                    window.location.reload();
                  } catch (e) {
                    showToast("Failed to reset data", "error");
                  }
                }
              );
            }}
            style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
          >
            Reset Data
          </button>
        </div>
      </div>

      <div className="add-task-section">
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target;
            const title = form.title.value;
            const startTime = form.startTime.value;
            const endTime = form.endTime.value;

            if (!title.trim()) return;

            if (editingTask) {
              // Update mode
              const updatedTask = {
                ...editingTask,
                title,
                startTime,
                endTime
              };
              dbRequest.updateTask(updatedTask).then(() => {
                form.reset();
                setEditingTask(null);
                setRefreshKey(k => k + 1); // Trigger Global Refresh
                showToast("Task Updated!", "success");
              });
            } else {
              // Add task logic
              const newTask = {
                title,
                startTime,
                endTime,
                date: format(currentDate, 'yyyy-MM-dd'),
                completed: false,
                priority: 'normal'
              };

              dbRequest.addTask(newTask).then(() => {
                form.reset();
                setRefreshKey(k => k + 1); // Trigger Global Refresh
              });
            }
          }}
          className={`add-task-form ${editingTask ? 'editing' : ''}`}
        >
          <input name="title" type="text" placeholder={editingTask ? "Update task title..." : "Add a new task..."} className="input-text" required />
          <div className="time-inputs">
            <div className="time-group">
              <label>Start</label>
              <input name="startTime" type="time" className="input-time" required />
            </div>
            <div className="time-group">
              <label>End</label>
              <input name="endTime" type="time" className="input-time" />
            </div>
          </div>
          <button type="submit" className="add-btn" style={{ background: editingTask ? 'var(--warning)' : 'var(--accent-primary)' }}>
            {editingTask ? <span>✎</span> : <span>+</span>} {editingTask ? "Update" : "Add"}
          </button>
          {editingTask && (
            <button type="button" onClick={handleCancelEdit} style={{ marginLeft: '10px', color: 'var(--text-secondary)' }}>Cancel</button>
          )}
        </form>
      </div>

      {/* Main Content Area */}
      <section className="content-area">
        {viewMode === 'grid' ? (
          <div className="grid-section">
            <div className="grid-header">
              <h2>Weekly Overview</h2>
              <div className="week-nav">
                <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))}><ChevronLeft /></button>
                <span>Week of {format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}</span>
                <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))}><ChevronRight /></button>
              </div>
            </div>
            <WeeklyGrid
              startWeekDate={currentDate}
              onUpdate={() => setRefreshKey(k => k + 1)}
              refreshTrigger={refreshKey}
              onAlert={(msg, type) => showToast(msg, type)}
              onConfirm={confirmAction}
            />
          </div>
        ) : (
          <div className="timeline-section">
            <h2 style={{ marginBottom: 20 }}>Timeline: {format(currentDate, 'MMMM do, yyyy')}</h2>
            <TimelineView
              tasks={tasks}
              onToggle={handleToggleEvent}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onAlert={(msg, type) => showToast(msg, type)}
            />
          </div>
        )}
      </section>

      {/* Global Toast */}
      <Toast
        message={toast.message}
        isVisible={toast.show}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onSelect={generatePDF}
      />

      {/* Sticky Save Bar */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="save-bar"
          >
            <div className="save-content container">
              <span>You have unsaved changes.</span>
              <button className="save-btn" onClick={saveChanges}>
                <Save size={18} /> Update / Save Progress
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <RoutineModal
        isOpen={showRoutineModal}
        onClose={() => setShowRoutineModal(false)}
        currentTasks={tasks} // Pass current view tasks for "Save"
        onApply={handleApplyRoutine}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
      />


      <style>{`
        .add-task-form {
          display: flex;
          gap: 12px;
          background: var(--bg-card);
          padding: 8px; /* Compact padding */
          border-radius: var(--radius-full); /* Pill shape */
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
          align-items: center;
          transition: all 0.2s;
          flex-wrap: wrap; /* Allow wrapping on small screens */
        }
        
        .add-task-form:focus-within {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-color: var(--accent-primary);
          transform: translateY(-1px);
        }

        .input-text {
          flex: 2; /* Take twice as much space */
          border: none;
          outline: none;
          padding: 8px 16px;
          font-size: 1rem;
          background: transparent;
          min-width: 200px; /* Ensure detail is visible */
          color: var(--text-primary);
        }
        .input-text::placeholder { color: var(--text-muted); }

        .time-inputs {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 0 12px;
          border-left: 1px solid var(--border-color);
          flex: 1;
        }

        /* Mobile Responsive Adjustments for Form */
        @media (max-width: 768px) {
            .add-task-form {
                border-radius: 16px; /* Less pill-like on mobile */
                flex-direction: column;
                align-items: stretch;
                padding: 16px;
            }
            .time-inputs {
                border-left: none;
                border-top: 1px solid var(--border-color);
                padding-top: 12px;
                margin-top: 4px;
                justify-content: space-between;
            }
            .add-btn { width: 100%; justify-content: center; }
        }

        .time-group { display: flex; align-items: center; gap: 6px; }
        .time-group label { font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; }
        .input-time {
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.9rem;
          color: var(--text-primary);
          background: var(--bg-secondary);
        }

        .add-btn {
            background: var(--accent-primary);
            color: white;
            border: none;
            width: 48px; 
            height: 48px;
            border-radius: 50%; /* Circle button */
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            transition: all 0.2s;
            flex-shrink: 0;
            white-space: nowrap;
            overflow: hidden;
            width: auto; /* Allow expanding for text if needed, but icon preferred */
            padding: 0 24px;
            border-radius: 30px;
            font-weight: 600;
            font-size: 1rem;
            gap: 8px;
        }
        .add-btn:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); }

        .quote-banner {
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          overflow: hidden;
          background-size: 200% 200%;
          border-left: none; /* Removed old border */
        }
        
        /* Animation for the gradient background */
        @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .quote-banner {
             animation: gradientMove 10s ease infinite;
        }

        .controls-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 24px;
            flex-wrap: wrap; /* Wrap on small screens */
            gap: 16px;
        }

        .view-toggles {
            display: flex;
            background: var(--bg-secondary); /* Darker bg for contrast */
            padding: 4px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
        }

        .toggle-btn {
            padding: 8px 20px;
            border-radius: 8px;
            font-weight: 600;
            color: var(--text-secondary); /* Muted text */
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            background: transparent;
            border: none;
        }

        .toggle-btn.active {
            background: var(--bg-card);
            color: var(--accent-primary); /* Active Color */
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .export-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            color: var(--text-primary);
            font-weight: 500;
        }
        .export-btn:hover { background: var(--bg-secondary); }

        .theme-menu {
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 8px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow: var(--shadow-md);
            width: 200px;
            z-index: 50;
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .theme-option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s;
            text-align: left;
            width: 100%;
        }

        .theme-option:hover { background: var(--bg-secondary); }
        .theme-option.active { background: var(--bg-secondary); color: var(--accent-primary); font-weight: 600; }

        .theme-preview {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .theme-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }

        .save-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
            padding: 16px 0;
            box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
            z-index: 1000;
        }

        .save-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .save-btn {
            background: var(--success);
            color: white;
            padding: 10px 24px;
            border-radius: var(--radius-full);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            transition: transform 0.2s;
        }
        .save-btn:active { transform: scale(0.96); }

        .dashboard-container { padding-top: 32px; padding-bottom: 100px; }
        
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
        }

        .subtitle { color: var(--text-secondary); margin-top: 8px; font-style: italic; }

        .date-controls { display: flex; gap: 12px; }

        .select-wrapper select {
          padding: 8px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          font-family: inherit;
          font-size: 0.95rem;
          cursor: pointer;
          outline: none;
          min-width: 120px;
          color: var(--text-primary);
        }

        .today-btn {
          padding: 8px 16px;
          background: var(--accent-primary);
          color: white;
          border-radius: var(--radius-md);
          font-weight: 500;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: var(--bg-card);
          padding: 24px;
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid var(--border-color);
          transition: background 0.3s;
        }
        .stat-card:hover { border-color: transparent; }

        .stat-info h3 { font-size: 0.9rem; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-big { font-size: 2.5rem; font-weight: 800; color: var(--text-primary); margin: 0; line-height: 1; }
        .stat-small { font-size: 1rem; color: var(--text-muted); font-weight: 500; }
        .stat-desc { font-size: 0.85rem; color: var(--text-muted); margin-top: 6px; display: block; font-weight: 500; }

        .timeline-section {
          background: var(--bg-card);
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          min-height: 400px;
          color: var(--text-primary);
        }

        .add-task-section {
            margin-bottom: 24px;
        }
        
        /* Removed duplicate entries to clean up */
        
        .icon-circle {
          width: 80px; height: 80px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem;
        }

        .grid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .grid-header h2 { color: var(--text-primary); }

        .week-nav {
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--bg-card);
          padding: 8px 16px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }

        .week-nav button { 
            display: flex; align-items: center; 
            color: var(--text-secondary); 
            padding: 4px;
            border-radius: 50%;
        }
        .week-nav button:hover { background: var(--bg-secondary); color: var(--text-primary); }
        .week-nav span { font-weight: 600; font-variant-numeric: tabular-nums; color: var(--text-primary); }
      `}</style>
    </div >
  );
};

export default Dashboard;
