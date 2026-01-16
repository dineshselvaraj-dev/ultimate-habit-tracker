import React, { useState, useEffect, useMemo } from 'react';
import { dbRequest } from '../db/db';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Trophy, Calendar, Activity } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isAfter } from 'date-fns';
import MomentumChart from './MomentumChart';

const Analytics = () => {
    const [tasks, setTasks] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const load = async () => {
            const all = await dbRequest.getAllTasks();
            setTasks(all);
        };
        load();
    }, []);

    // Get basic stats from hook (Streak, Best Day, Global Rate)
    const {
        completionRate: globalRate,
        streak,
        totalWins,
        bestDay,
        habitHealthData,
        dayOfWeekData
    } = useAnalytics(tasks);

    // Calculate specific stats for the Monthly Gauge based on 'currentDate'
    const monthlyRate = useMemo(() => {
        const startOfMonthDate = startOfMonth(currentDate);
        const today = new Date();

        // End calculation at "Today" if looking at current month, otherwise end of that month
        let endCalculationDate = endOfMonth(currentDate);
        if (isAfter(endCalculationDate, today)) {
            endCalculationDate = today;
        }

        const daysInPeriod = eachDayOfInterval({ start: startOfMonthDate, end: endCalculationDate });
        let totalDailyPercentages = 0;
        let daysCounted = 0;

        daysInPeriod.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayTasks = tasks.filter(t => t.date === dateStr);

            if (dayTasks.length > 0) {
                const completed = dayTasks.filter(t => t.completed).length;
                totalDailyPercentages += (completed / dayTasks.length);
            } else {
                // 0% for days with no tasks (missed days)
                totalDailyPercentages += 0;
            }
            daysCounted++;
        });

        return daysCounted === 0 ? 0 : Math.round((totalDailyPercentages / daysCounted) * 100);
    }, [tasks, currentDate]);

    // KPI Card Component
    const KpiCard = ({ title, value, subtext, icon: Icon, color }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="kpi-card"
            style={{ borderTop: `4px solid ${color}` }}
        >
            <div className="kpi-icon-wrapper" style={{ background: `${color}20`, color: color }}>
                <Icon size={24} />
            </div>
            <div>
                <h3 className="kpi-title">{title}</h3>
                <div className="kpi-value">{value}</div>
                <div className="kpi-subtext">{subtext}</div>
            </div>
        </motion.div>
    );

    return (
        <div className="analytics-container container">
            <header className="analytics-header">
                <div>
                    <h1 className="title-gradient">Analytics & Insights</h1>
                    <p className="subtitle">Track your progress and identify patterns.</p>
                </div>
            </header>

            {/* Row 1: KPI Grid */}
            <div className="kpi-grid">
                <KpiCard
                    title="Monthly Consistency"
                    value={`${monthlyRate}%`}
                    subtext="Weighted Daily Average"
                    icon={TrendingUp}
                    color="#10b981"
                />
                <KpiCard
                    title="Current Streak"
                    value={`${streak} Days`}
                    subtext="Keep the fire burning!"
                    icon={Flame}
                    color="#f59e0b"
                />
                <KpiCard
                    title="Total Wins"
                    value={totalWins}
                    subtext="Tasks Completed"
                    icon={Trophy}
                    color="#3b82f6"
                />
                <KpiCard
                    title="Best Day"
                    value={bestDay}
                    subtext="Most Productive"
                    icon={Calendar}
                    color="#8b5cf6"
                />
            </div>





            {/* Row 2: Momentum Trend */}
            <div className="mb-8">
                <MomentumChart tasks={tasks} />
            </div>

            <style>{`
                .analytics-container { padding-bottom: 80px; }
                .analytics-header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; }
                
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 24px;
                    margin-bottom: 24px;
                }

                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 24px;
                }

                .kpi-card {
                    background: var(--bg-card);
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    border: 1px solid var(--border-color);
                }

                .bento-card {
                    background: var(--bg-card);
                    padding: 24px;
                    border-radius: 16px;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .card-header h3 {
                    font-size: 1.1rem;
                    color: var(--text-primary);
                    font-weight: 700;
                    margin: 0;
                }

                .kpi-icon-wrapper {
                    padding: 12px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .kpi-title { font-size: 0.9rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin: 0 0 4px 0; }
                .kpi-value { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); line-height: 1.2; }
                .kpi-subtext { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
            `}</style>
        </div>
    );
};

export default Analytics;
