import React, { useState } from 'react';
import { X, Star, Calendar, MessageSquare } from 'lucide-react';

const MilestoneModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        motivation: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title) return;

        onSave({
            ...formData,
            type: 'milestone',
            priority: 'high', // Milestones are inherently important
            category: 'milestone' // Special category for gold theming
        });
        onClose();
        // Reset form
        setFormData({
            title: '',
            date: new Date().toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '10:00',
            motivation: ''
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content milestone-modal">
                <div className="modal-header">
                    <div className="header-title">
                        <Star className="star-icon" fill="#fbbf24" stroke="#d97706" />
                        <h2>Add Milestone Memory</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Event Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Final Exam, Dad's Birthday, Project Launch..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><Calendar size={14} /> Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Time</label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>End Time</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label><MessageSquare size={14} /> Description / Motivation</label>
                        <input
                            type="text"
                            placeholder="Why is this important?"
                            value={formData.motivation}
                            onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="save-btn gold-btn">
                            <Star size={16} fill="currentColor" /> Save Milestone
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
        .milestone-modal {
          border-top: 5px solid #fbbf24;
          background: var(--bg-card);
        }
        
        .header-title {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #d97706;
        }

        .star-icon {
            filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.5));
            animation: rotate-star 10s infinite linear;
        }

        .gold-btn {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border: none;
          color: white;
          box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
        }
        
        .gold-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 15px rgba(245, 158, 11, 0.4);
        }

        @keyframes rotate-star {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default MilestoneModal;
