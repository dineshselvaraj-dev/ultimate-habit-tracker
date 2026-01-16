import React, { useEffect, useState } from 'react';
import { dbRequest } from '../db/db';
import { format, parseISO, isFuture, isToday } from 'date-fns';
import { Check, X, Trash2, Edit2, Save, RotateCcw } from 'lucide-react';
import Toast from './Toast';
import ConfirmModal from './ConfirmModal';

import { getTodayISTString, isTodayIST, isFutureIST } from '../utils/dateUtils';

const History = () => {
  const [tasks, setTasks] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'danger'
  });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const fetchTasks = async () => {
      const all = await dbRequest.getAllTasks();
      // Sort by date desc, then created time
      all.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTasks(all);
    };
    fetchTasks();
  }, [refreshKey]);

  const handleToggle = async (task) => {
    // Strict Rules using IST
    if (!isTodayIST(task.date)) {
      if (isFutureIST(task.date)) {
        showToast("Whoa there, Time Traveler! ⏳\nYou cannot complete future tasks yet.", "error");
      } else {
        showToast("History is written! 📜\nYou cannot change past records.", "error");
      }
      return;
    }

    const updated = { ...task, completed: !task.completed };
    await dbRequest.updateTask(updated);
    setRefreshKey(k => k + 1);
    showToast(updated.completed ? "Task Completed! 🎉" : "Task marked pending.", "success");
  };

  const confirmDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Record?',
      message: 'Are you sure you want to delete this task permanently? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        await dbRequest.deleteTask(id);
        setRefreshKey(k => k + 1);
        showToast("Record deleted.", "success");
        closeConfirm();
      }
    });
  };

  const startEdit = (task) => {
    // Strict Rule: Prevent editing past? User said "we need to edit". 
    // Usually history implies immutable past, but user asked for "edit delete".
    // I will allow editing Titles (typo fixes) but NOT Status for past days (to keep "History is written" logic consistent).
    // Actually, if I allow editing title, it helps correcting logs.
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async (task) => {
    if (!editTitle.trim()) return;
    const updated = { ...task, title: editTitle };
    await dbRequest.updateTask(updated);
    setEditingId(null);
    setRefreshKey(k => k + 1);
    showToast("Task updated successfully", "success");
  };

  const confirmResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset All Data?',
      message: 'WARNING: This will wipe ALL your history, tasks, and progress. This is irreversible. Are you absolutely sure?',
      type: 'danger',
      onConfirm: async () => {
        await dbRequest.clearAllTasks();
        setRefreshKey(k => k + 1);
        showToast("All data wiped clean.", "success");
        closeConfirm();
      }
    });
  };

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="title-gradient">History Log</h1>
        <button
          onClick={confirmResetData}
          className="reset-btn"
        >
          <RotateCcw size={16} /> Reset Data
        </button>
      </div>

      <div className="spreadsheet-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Task</th>
              <th>Time / Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td className="date-cell">{format(parseISO(task.date), 'MMM d, yyyy')}</td>

                  {/* Editable Title Cell */}
                  <td style={{ width: '40%' }}>
                    {editingId === task.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="edit-input"
                        autoFocus
                      />
                    ) : (
                      <span style={{ fontWeight: 500 }}>{task.title}</span>
                    )}
                  </td>

                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {task.startTime ? `${task.startTime} - ${task.endTime || '?'}` : '-'}
                  </td>

                  {/* Interactive Status Cell */}
                  <td>
                    <button
                      onClick={() => handleToggle(task)}
                      className={`status-badge ${task.completed ? 'success' : 'pending'}`}
                      title="Click to toggle status (Today only)"
                    >
                      {task.completed ? 'Completed' : 'Pending'}
                    </button>
                  </td>

                  {/* Actions Cell */}
                  <td>
                    <div className="action-buttons">
                      {editingId === task.id ? (
                        <>
                          <button onClick={() => saveEdit(task)} className="icon-btn save"><Save size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="icon-btn cancel"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(task)} className="icon-btn edit"><Edit2 size={16} /></button>
                          <button onClick={() => confirmDelete(task.id)} className="icon-btn delete"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No records found. Start adding tasks!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Global Components */}
      <Toast
        message={toast.message}
        isVisible={toast.show}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={closeConfirm}
        type={confirmModal.type}
      />

      <style>{`
        .spreadsheet-container {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
        }

      .history-table {
        width: 100%;
      border-collapse: collapse;
      text-align: left;
        }

      .history-table th {
        background: var(--bg-secondary);
      padding: 16px;
      font-weight: 700;
      color: var(--text-secondary);
      border-bottom: 2px solid var(--border-color);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
        }

      .history-table td {
        padding: 16px;
      border-bottom: 1px solid var(--border-color);
      vertical-align: middle;
      color: var(--text-primary);
        }

      .history-table tr:hover {
        background: var(--bg-secondary);
        }

      .date-cell {
        color: var(--text-primary);
      font-weight: 500;
        }

      .status-badge {
        border: 1px solid transparent;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      transition: all 0.2s;
        }

      .status-badge.success {
        background: rgba(16, 185, 129, 0.1);
      color: var(--success);
      border-color: rgba(16, 185, 129, 0.2);
        }
      .status-badge.success:hover {background: var(--success); color: white; }

      .status-badge.pending {
        background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
      border-color: rgba(239, 68, 68, 0.2);
        }
      .status-badge.pending:hover {background: var(--danger); color: white; }

      .action-buttons {
        display: flex;
      gap: 8px;
        }

      .icon-btn {
        background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 4px;
      color: var(--text-muted);
      transition: all 0.2s;
        }
      .icon-btn:hover {background: var(--bg-secondary); color: var(--text-primary); }
      .icon-btn.delete:hover {background: rgba(239, 68, 68, 0.1); color: var(--danger); }
      .icon-btn.save:hover {background: rgba(16, 185, 129, 0.1); color: var(--success); }

      .edit-input {
        width: 100%;
      padding: 8px;
      border: 1px solid var(--accent-primary);
      border-radius: 4px;
      font-family: inherit;
      outline: none;
      background: var(--bg-primary);
      color: var(--text-primary);
        }

      .reset-btn {
        display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: 1px solid var(--danger);
      color: var(--danger);
      background: var(--bg-card);
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
        }
      .reset-btn:hover {background: rgba(239, 68, 68, 0.1); }
      `}</style>
    </div >
  );
};

export default History;
