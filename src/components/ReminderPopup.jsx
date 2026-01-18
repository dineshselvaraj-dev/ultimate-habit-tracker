import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle } from 'lucide-react';

const ReminderPopup = ({ isOpen, task, onClose }) => {
    // Auto-close after 1 minute if not interacted
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(onClose, 60000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen || !task) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 2000,
                perspective: '1000px'
            }}>
                <motion.div
                    initial={{ opacity: 0, x: 100, rotateY: 20 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--accent-primary)',
                        borderLeft: '6px solid var(--accent-primary)',
                        borderRadius: '12px',
                        padding: '20px',
                        width: '320px',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Background decorative glow */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(var(--accent-primary-rgb), 0.1) 0%, transparent 70%)',
                        zIndex: 0,
                        pointerEvents: 'none'
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                            <Bell size={18} className="animate-ring" />
                            <span>It's Time!</span>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={16} />
                        </button>
                    </div>

                    <div style={{ zIndex: 1 }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{task.title}</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {task.startTime} - {task.endTime}
                        </p>
                    </div>

                    {task.motivation && (
                        <div style={{
                            background: 'var(--bg-secondary)',
                            padding: '10px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontStyle: 'italic',
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                            borderLeft: '3px solid var(--text-muted)',
                            zIndex: 1
                        }}>
                            "{task.motivation}"
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        style={{
                            marginTop: '8px',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: '100%',
                            zIndex: 1,
                            transition: 'transform 0.1s'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        <CheckCircle size={16} /> Start Task
                    </button>
                </motion.div>

                <style>{`
                    @keyframes ring {
                        0% { transform: rotate(0); }
                        10% { transform: rotate(30deg); }
                        30% { transform: rotate(-28deg); }
                        50% { transform: rotate(34deg); }
                        70% { transform: rotate(-32deg); }
                        90% { transform: rotate(30deg); }
                        100% { transform: rotate(0); }
                    }
                    .animate-ring { animation: ring 2s infinite; }
                `}</style>
            </div>
        </AnimatePresence>
    );
};

export default ReminderPopup;
