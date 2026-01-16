import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // Auto close after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const variants = {
        initial: { opacity: 0, y: -50, scale: 0.9 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -20, scale: 0.9 }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} />;
            case 'error': return <AlertCircle size={20} />;
            default: return <Info size={20} />;
        }
    };

    const colors = {
        success: 'bg-green-100 text-green-800 border-green-200',
        error: 'bg-red-100 text-red-800 border-red-200',
        info: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    // Unified style map using theme variables for both light and dark modes
    const styleMap = {
        success: {
            background: 'var(--bg-card)',
            color: 'var(--success)',
            border: '1px solid var(--success)',
            boxShadow: 'var(--shadow-md)'
        },
        error: {
            background: 'var(--bg-card)',
            color: 'var(--danger)',
            border: '1px solid var(--danger)',
            boxShadow: 'var(--shadow-md)'
        },
        info: {
            background: 'var(--bg-card)',
            color: 'var(--blue)',
            border: '1px solid var(--blue)',
            boxShadow: 'var(--shadow-md)'
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="toast-notification"
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{
                        position: 'fixed',
                        top: '20px',
                        left: '50%',
                        translateX: '-50%',
                        zIndex: 9999,
                        padding: '12px 24px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minWidth: '300px',
                        maxWidth: '90vw',
                        ...styleMap[type]
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>
                        {type === 'error' ? '⏳' : type === 'success' ? '✅' : 'ℹ️'}
                    </span>
                    <div style={{ flex: 1, whiteSpace: 'pre-line', fontSize: '0.95rem', fontWeight: 500 }}>
                        {message}
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7 }}
                    >
                        <X size={18} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
