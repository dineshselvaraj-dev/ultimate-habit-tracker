import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Upload, Download, Check, AlertCircle, FileJson } from 'lucide-react';
import { dbRequest } from '../db/db';

const RoutineModal = ({ isOpen, onClose, currentTasks, onApply }) => {
    const [savedRoutine, setSavedRoutine] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadRoutine();
        }
    }, [isOpen]);

    const loadRoutine = () => {
        const routine = dbRequest.getRoutine();
        setSavedRoutine(routine);
    };

    const handleSaveCurrent = () => {
        if (currentTasks.length === 0) {
            alert("No tasks to save! Add some tasks first.");
            return;
        }
        dbRequest.saveRoutine(currentTasks);
        loadRoutine();
        showSuccess("Current view saved as default routine!");
    };

    const handleLoad = async () => {
        if (!savedRoutine) return;
        await onApply(savedRoutine);
        showSuccess("Routine loaded successfully!");
        setTimeout(onClose, 800);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    dbRequest.saveRoutine(imported);
                    loadRoutine();
                    showSuccess("Routine imported from file!");
                } else {
                    alert("Invalid file format.");
                }
            } catch (err) {
                alert("Error reading file.");
            }
        };
        reader.readAsText(file);
    };

    const handleExport = () => {
        if (!savedRoutine) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedRoutine, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "my_habit_routine.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showSuccess("Routine exported!");
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 2500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    style={{
                        background: 'var(--bg-card)',
                        width: '100%', maxWidth: '500px',
                        borderRadius: '20px',
                        padding: '30px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid var(--border-color)',
                        position: 'relative'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: 20, right: 20,
                            background: 'none', border: 'none', fontSize: '1.5rem',
                            cursor: 'pointer', color: 'var(--text-muted)'
                        }}
                    >
                        &times;
                    </button>

                    <h2 className="title-gradient" style={{ marginBottom: '8px', fontSize: '1.8rem' }}>Routine Manager</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: 1.5 }}>
                        Create a daily template to instantly populate your day.
                    </p>

                    {/* Status Message */}
                    <AnimatePresence>
                        {successMsg && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)',
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                    padding: '12px', borderRadius: '8px', marginBottom: '20px',
                                    display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500
                                }}
                            >
                                <Check size={18} /> {successMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ display: 'grid', gap: '16px' }}>

                        {/* 1. Save Current */}
                        <div className="routine-card">
                            <div className="icon-box purple"><Save size={20} /></div>
                            <div style={{ flex: 1 }}>
                                <h3>Save Today as Routine</h3>
                                <p>Use current list ({currentTasks.length} tasks) as default.</p>
                            </div>
                            <button className="action-btn" onClick={handleSaveCurrent}>Save</button>
                        </div>

                        {/* 2. Load Existing */}
                        <div className={`routine-card ${!savedRoutine ? 'disabled' : ''}`}>
                            <div className="icon-box blue"><FileJson size={20} /></div>
                            <div style={{ flex: 1 }}>
                                <h3>Load Default Routine</h3>
                                <p>{savedRoutine ? `${savedRoutine.length} tasks saved` : 'No routine saved yet'}</p>
                            </div>
                            <button
                                className="action-btn primary"
                                disabled={!savedRoutine}
                                onClick={handleLoad}
                            >
                                Apply
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                            {/* 3. Export */}
                            <button className="secondary-btn" onClick={handleExport} disabled={!savedRoutine}>
                                <Download size={16} /> Export JSON
                            </button>

                            {/* 4. Import */}
                            <label className="secondary-btn" style={{ cursor: 'pointer' }}>
                                <Upload size={16} /> Import JSON
                                <input type="file" accept=".json" hidden onChange={handleFileUpload} />
                            </label>
                        </div>

                    </div>

                </motion.div>

                <style>{`
                    .routine-card {
                        background: var(--bg-secondary);
                        border: 1px solid var(--border-color);
                        padding: 16px;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        transition: all 0.2s;
                    }
                    .routine-card.disabled { opacity: 0.6; pointer-events: none; }
                    .routine-card h3 { margin: 0 0 4px 0; font-size: 1rem; color: var(--text-primary); }
                    .routine-card p { margin: 0; font-size: 0.85rem; color: var(--text-muted); }

                    .icon-box {
                        width: 40px; height: 40px;
                        border-radius: 10px;
                        display: flex; alignItems: center; justifyContent: center;
                        color: white;
                    }
                    .icon-box.purple { background: linear-gradient(135deg, #a855f7, #d8b4fe); }
                    .icon-box.blue { background: linear-gradient(135deg, #3b82f6, #60a5fa); }

                    .action-btn {
                        padding: 8px 16px;
                        border-radius: 8px;
                        border: 1px solid var(--border-color);
                        background: var(--bg-card);
                        color: var(--text-primary);
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .action-btn:hover { background: var(--bg-secondary); transform: translateY(-1px); }
                    .action-btn.primary {
                        background: var(--accent-primary);
                        color: white;
                        border: none;
                    }
                    .action-btn.primary:hover { background: var(--accent-hover); }

                    .secondary-btn {
                        flex: 1;
                        padding: 12px;
                        border-radius: 10px;
                        border: 1px dashed var(--border-color);
                        background: var(--bg-card);
                        color: var(--text-secondary);
                        font-weight: 500;
                        display: flex; alignItems: center; justifyContent: center; gap: 8px;
                        transition: all 0.2s;
                    }
                    .secondary-btn:hover { border-color: var(--accent-primary); color: var(--accent-primary); background: rgba(var(--accent-primary-rgb), 0.05); }
                `}</style>
            </div>
        </AnimatePresence>
    );
};

export default RoutineModal;
