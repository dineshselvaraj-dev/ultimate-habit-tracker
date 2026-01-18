import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isFuture, isToday, isPast, parseISO, differenceInMinutes, parse, isWithinInterval } from 'date-fns';
import { Clock, Check, Trash2, Edit2, AlertCircle, Flame, Star } from 'lucide-react';

const TimelineView = ({ tasks, onToggle, onDelete, onUpdate, onEdit, onAlert }) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by time (tasks with time first, then others)
    if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return 0;
  });

  const handleCheck = (task) => {
    const taskDate = parseISO(task.date);

    if (!isToday(taskDate)) {
      if (isFuture(taskDate)) {
        if (onAlert) onAlert("Whoa there, Time Traveler! ⏳\nYou cannot complete future tasks yet.", "error");
      } else {
        if (onAlert) onAlert("History is written! 📜\nYou cannot change past records.", "error");
      }
      return;
    }

    onToggle(task.id);
  };

  const getDuration = (start, end) => {
    if (!start || !end) return '';
    const today = format(new Date(), 'yyyy-MM-dd');
    const d1 = parse(`${today} ${start}`, 'yyyy-MM-dd HH:mm', new Date());
    const d2 = parse(`${today} ${end}`, 'yyyy-MM-dd HH:mm', new Date());
    const diff = differenceInMinutes(d2, d1);
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours > 0 ? hours + 'h ' : ''}${mins}m`;
  };

  const getCategoryGradient = (category) => {
    switch (category?.toLowerCase()) {
      case 'fitness': return 'linear-gradient(90deg, #f97316, #ef4444)'; // Orange -> Red
      case 'planning': return 'linear-gradient(90deg, #6366f1, #a855f7)'; // Indigo -> Purple
      case 'household': return 'linear-gradient(90deg, #14b8a6, #22c55e)'; // Teal -> Green
      case 'content': return 'linear-gradient(90deg, #ec4899, #d946ef)'; // Pink -> Fuchsia
      case 'finance': return 'linear-gradient(90deg, #eab308, #22c55e)'; // Yellow -> Green
      case 'learning': return 'linear-gradient(90deg, #06b6d4, #3b82f6)'; // Cyan -> Blue
      case 'practice': return 'linear-gradient(90deg, #8b5cf6, #3b82f6)'; // Violet -> Blue
      case 'rest': return 'linear-gradient(90deg, #94a3b8, #cbd5e1)'; // Slate (Subtle)
      default: return 'linear-gradient(90deg, #3b82f6, #8b5cf6)'; // Default Blue-Purple
    }
  };

  const isTaskActive = (task) => {
    if (!task.startTime || !task.endTime || !isToday(parseISO(task.date))) return false;
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const start = parse(`${today} ${task.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const end = parse(`${today} ${task.endTime}`, 'yyyy-MM-dd HH:mm', new Date());
    return isWithinInterval(now, { start, end });
  };

  return (
    <div className="timeline-container">
      {sortedTasks.length === 0 ? (
        <div className="empty-timeline">
          <p>No tasks scheduled for this day.</p>
        </div>
      ) : (
        <div className="timeline-list">
          <AnimatePresence>
            {sortedTasks.map((task, index) => {
              const taskDate = parseISO(task.date);
              const isFutureTask = isFuture(taskDate) && !isToday(taskDate);
              const duration = getDuration(task.startTime, task.endTime);
              const isActive = isTaskActive(task);
              const isPriority = task.priority === 'high';
              const isMilestone = task.type === 'milestone';

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: isActive ? 1.02 : 1
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`timeline-item ${task.completed ? 'completed' : ''} ${isActive ? 'active-pulse' : ''} ${isMilestone ? 'milestone-item' : ''}`}
                >
                  <div className="time-column">
                    <div className={`time-badge ${isActive ? 'active-time' : ''}`}>
                      {task.startTime ? (
                        <>
                          <span className="start-time">{task.startTime}</span>
                          {task.endTime && <span className="end-time">{task.endTime}</span>}
                        </>
                      ) : (
                        <span className="anytime">Anytime</span>
                      )}
                    </div>
                    <div className={`timeline-line ${isActive ? 'active-line' : ''}`} />
                  </div>

                  <div className={`task-card ${isPriority ? 'priority-card' : ''} ${isMilestone ? 'milestone-card' : ''}`}>
                    <div className="task-content">
                      <div className="task-header">
                        {isMilestone && <Star size={18} className="milestone-icon" fill="currentColor" />}
                        {isPriority && !isMilestone && <Flame size={18} className="priority-icon" fill="var(--danger)" />}
                        <span className="task-title">{task.title}</span>
                        {duration && <span className="duration-tag">{duration}</span>}
                        {isActive && <span className="now-badge">NOW</span>}
                      </div>
                      {task.motivation && (
                        <div className="task-motivation" style={{
                          fontSize: '0.9rem',
                          marginTop: '6px',
                          fontWeight: 600,
                          background: getCategoryGradient(task.category),
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontStyle: 'italic',
                          filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.1))' // Subtle pop for light mode
                        }}>
                          "{task.motivation}"
                        </div>
                      )}
                      {task.endTime && (
                        <div className="task-meta">
                          Completed by {task.endTime}
                        </div>
                      )}
                    </div>

                    <div className="task-actions">
                      {!task.completed && (
                        <button className="icon-btn edit" onClick={() => onEdit(task)}>
                          <Edit2 size={16} />
                        </button>
                      )}
                      <button className="icon-btn delete" onClick={() => onDelete(task.id)}>
                        <Trash2 size={16} />
                      </button>

                      <button
                        onClick={() => handleCheck(task)}
                        className={`status-btn ${task.completed ? 'done' : 'pending'} ${isFutureTask ? 'locked' : ''}`}
                        // disabled property removed so onClick can show the alert
                        title={isFutureTask ? "Cannot complete future tasks" : "Toggle Completion"}
                      >
                        {task.completed ? <Check size={18} /> : isFutureTask ? <Clock size={18} /> : <div className="empty-circle" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <style>{`
        .timeline-container { padding: 20px 0; }
        .timeline-list { display: flex; flex-direction: column; gap: 0; }
        
        .timeline-item { display: flex; gap: 16px; padding-bottom: 24px; position: relative; }
        .timeline-item:last-child { padding-bottom: 0; }
        .timeline-item:last-child .timeline-line { display: none; }

        .time-column { display: flex; flex-direction: column; align-items: center; width: 90px; min-width: 90px; }
        
        .time-badge {
          background: var(--bg-secondary);
          padding: 6px 8px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          text-align: center;
        }

        .start-time { color: var(--text-primary); }
        .end-time { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }

        .timeline-line { width: 2px; background: var(--border-color); flex: 1; margin-top: 8px; min-height: 40px; }

        .task-card {
          flex: 1;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .timeline-item.completed .task-card {
            opacity: 0.8;
            background: var(--bg-secondary);
            border-left: 4px solid var(--success);
        }
        
        .task-content { flex: 1; }
        
        .task-header { display: flex; align-items: center; gap: 12px; }
        .task-title { font-weight: 600; font-size: 1rem; color: var(--text-primary); }
        
        .duration-tag {
            font-size: 0.75rem;
            background: rgba(var(--accent-primary-rgb), 0.1);
            color: var(--accent-primary);
            padding: 2px 8px;
            border-radius: var(--radius-full);
            font-weight: 600;
        }
        
        .task-meta { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }

        .task-actions { display: flex; align-items: center; gap: 12px; }
        
        .icon-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 6px;
            border-radius: 50%;
            transition: all 0.2s;
        }
        .icon-btn:hover { background: var(--bg-secondary); color: var(--text-primary); }
        .icon-btn.delete:hover { color: var(--danger); background: var(--danger-bg); }

        .status-btn {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; cursor: pointer;
        }
        .status-btn.pending { border: 2px solid var(--danger); color: var(--danger); background: var(--danger-bg); hover: { transform: scale(1.1); } }
        .status-btn.done { background: var(--success); color: white; border: 2px solid var(--success); box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
        .status-btn.locked { border: 2px solid var(--border-color); background: var(--bg-secondary); color: var(--text-muted); cursor: not-allowed; opacity: 0.7; }
        .empty-circle { width: 100%; height: 100%; border-radius: 50%; }
        
        .empty-timeline { text-align: center; color: var(--text-muted); padding: 40px; border: 2px dashed var(--border-color); border-radius: var(--radius-md); }
        
        /* Active Pulse Animation */
        .active-pulse .task-card {
            border-color: var(--accent-primary);
            box-shadow: 0 0 15px rgba(var(--accent-primary-rgb), 0.3);
            animation: pulse-border 2s infinite;
        }
        
        .active-time {
            background: var(--accent-primary) !important;
            color: white !important;
            border-color: var(--accent-primary) !important;
        }
        .active-time .start-time, .active-time .end-time { color: white !important; }
        
        .active-line { background: var(--accent-primary); }

        .now-badge {
            background: var(--danger); color: white;
            font-size: 0.65rem; padding: 2px 6px; border-radius: 4px;
            font-weight: 800; animation: bounce 1s infinite alternate;
        }

        /* Priority Styling */
        .priority-card {
            border-left: 3px solid var(--danger);
            background: linear-gradient(to right, rgba(239, 68, 68, 0.02), transparent);
        }
        .priority-icon { color: var(--danger); margin-right: -4px; animation: flame-flicker 1.5s infinite alternate; }

        /* Milestone Styling (Gold) */
        .milestone-card {
            border-left: 3px solid #f59e0b;
            background: linear-gradient(to right, rgba(251, 191, 36, 0.1), transparent);
            border-top: 1px solid rgba(251, 191, 36, 0.3);
            border-bottom: 1px solid rgba(251, 191, 36, 0.1);
        }
        .milestone-icon { 
            color: #d97706; 
            margin-right: -4px;
            filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.6));
            animation: spin-slow 10s linear infinite;
        }

        @keyframes pulse-border {
            0% { box-shadow: 0 0 0 0 rgba(var(--accent-primary-rgb), 0.4); }
            70% { box-shadow: 0 0 0 6px rgba(var(--accent-primary-rgb), 0); }
            100% { box-shadow: 0 0 0 0 rgba(var(--accent-primary-rgb), 0); }
        }

        @keyframes flame-flicker {
            0% { opacity: 0.8; transform: scale(1); }
            100% { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 2px var(--danger)); }
        }

        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-2px); } }
      `}</style>
    </div>
  );
};

export default TimelineView;
