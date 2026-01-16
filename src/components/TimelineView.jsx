import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isFuture, isToday, isPast, parseISO, differenceInMinutes, parse } from 'date-fns';
import { Clock, Check, Trash2, Edit2, AlertCircle } from 'lucide-react';

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

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`timeline-item ${task.completed ? 'completed' : ''}`}
                >
                  <div className="time-column">
                    <div className="time-badge">
                      {task.startTime ? (
                        <>
                          <span className="start-time">{task.startTime}</span>
                          {task.endTime && <span className="end-time">{task.endTime}</span>}
                        </>
                      ) : (
                        <span className="anytime">Anytime</span>
                      )}
                    </div>
                    <div className="timeline-line" />
                  </div>

                  <div className="task-card">
                    <div className="task-content">
                      <div className="task-header">
                        <span className="task-title">{task.title}</span>
                        {duration && <span className="duration-tag">{duration}</span>}
                      </div>
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
      `}</style>
    </div>
  );
};

export default TimelineView;
