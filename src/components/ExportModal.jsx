import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, FileText, Grid } from 'lucide-react';

const ExportModal = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    const options = [
        { id: 'daily', label: 'Daily Report', icon: <FileText size={24} />, desc: 'Today\'s tasks and status' },
        { id: 'weekly', label: 'Weekly Report', icon: <Grid size={24} />, desc: 'Summary for this week' },
        { id: 'monthly', label: 'Monthly Report', icon: <Calendar size={24} />, desc: 'Complete monthly overview' },
    ];

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                        background: 'var(--bg-card)', padding: '24px', borderRadius: '16px',
                        width: '100%', maxWidth: '400px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        border: '1px solid var(--border-color)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Export Report</h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {options.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => onSelect(opt.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px',
                                    background: 'var(--bg-card)', cursor: 'pointer', textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                    e.currentTarget.style.background = 'var(--bg-secondary)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.background = 'var(--bg-card)';
                                }}
                            >
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '10px',
                                    background: 'var(--bg-secondary)', color: 'var(--accent-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {opt.icon}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{opt.label}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{opt.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ExportModal;
