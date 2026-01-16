import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Dot } from 'recharts';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isAfter,
    isToday,
    setMonth,
    setYear,
    getYear,
    getMonth
} from 'date-fns';
import { TrendingUp, TrendingDown, Minus, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MomentumChart = ({ tasks }) => {
    // State for the selected month/year view
    const [viewDate, setViewDate] = useState(new Date());

    // Check if the selected view is strictly in the future
    const isFutureView = useMemo(() => {
        const today = new Date();
        const startOfView = startOfMonth(viewDate);
        return isAfter(startOfView, endOfMonth(today));
    }, [viewDate]);

    // Data Calculation
    const data = useMemo(() => {
        const today = new Date();
        const start = startOfMonth(viewDate);
        const end = endOfMonth(viewDate);

        const daysInMonth = eachDayOfInterval({ start, end });

        return daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isFutureDay = isAfter(day, today) && !isToday(day);

            if (isFutureDay) {
                return {
                    date: format(day, 'd'),
                    fullDate: dateStr,
                    rate: null,
                };
            }

            const dayTasks = tasks.filter(t => t.date.startsWith(dateStr));
            const total = dayTasks.length;
            const completed = dayTasks.filter(t => t.completed).length;
            const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

            return {
                date: format(day, 'd'),
                fullDate: dateStr,
                rate: rate
            };
        });
    }, [tasks, viewDate]);

    // Trend Calculation
    const trendInfo = useMemo(() => {
        const activeDays = data.filter(d => d.rate !== null);
        if (activeDays.length < 6) return { direction: 'flat', diff: 0 };

        const recent = activeDays.slice(-3);
        const previous = activeDays.slice(-6, -3);

        const avgRecent = recent.reduce((acc, curr) => acc + curr.rate, 0) / 3;
        const avgPrevious = previous.reduce((acc, curr) => acc + curr.rate, 0) / 3;

        const diff = Math.round(avgRecent - avgPrevious);
        let direction = 'flat';
        if (diff > 0) direction = 'up';
        if (diff < 0) direction = 'down';

        return { direction, diff: Math.abs(diff) };
    }, [data]);

    // Trend Badge
    const renderTrendBadge = () => {
        if (isFutureView) return null;
        const { direction, diff } = trendInfo;

        const config = direction === 'up' ? { color: '#059669', bg: '#ecfdf5', label: 'Up', Icon: TrendingUp }
            : direction === 'down' ? { color: '#e11d48', bg: '#fff1f2', label: 'Down', Icon: TrendingDown }
                : { color: '#475569', bg: '#f8fafc', label: 'Stable', Icon: Minus };

        const { color, bg, label, Icon } = config;

        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '8px',
                background: bg, border: `1px solid ${color}30`,
                color: color, fontSize: '12px', fontWeight: 800,
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                whiteSpace: 'nowrap'
            }}>
                <Icon size={14} strokeWidth={2.5} />
                <span>{label} {diff > 0 && `${diff}%`}</span>
            </div>
        );
    };

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

    return (
        <div className="bento-card w-full" style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>

            {/* HEADER - STICT GRID LAYOUT */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(120px, 1fr) auto minmax(120px, 1fr)',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '32px'
            }}>

                {/* 1. LEFT: Title */}
                <div style={{ justifySelf: 'start' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.025em' }}>Momentum</h3>
                </div>

                {/* 2. CENTER: Subtitle */}
                <div style={{ justifySelf: 'center' }}>
                    <motion.div
                        whileHover={{ scale: 1.05, y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        whileTap={{ scale: 0.95 }}
                        title="Comparing the last 3 days vs the 3 days before that"
                        style={{
                            display: 'inline-block', padding: '6px 16px',
                            background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                            borderRadius: '99px', fontSize: '0.75rem',
                            fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.05em', border: '1px solid var(--border-color)',
                            cursor: 'help'
                        }}
                    >
                        Consistency Trend (3-Day Avg)
                    </motion.div>
                </div>

                {/* 3. RIGHT: Controls */}
                <div style={{ justifySelf: 'end', display: 'flex', alignItems: 'center', gap: '12px' }}>

                    {/* Interactive Trend Badge */}
                    <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="cursor-pointer"
                    >
                        {renderTrendBadge()}
                    </motion.div>

                    {/* Interactive Dropdowns */}
                    <motion.div
                        whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderColor: 'var(--text-muted)' }}
                        transition={{ duration: 0.2 }}
                        style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '4px', overflow: 'hidden' }}
                    >
                        {/* Month */}
                        <div style={{ position: 'relative' }} className="transition-colors">
                            <select
                                value={getMonth(viewDate)}
                                onChange={(e) => setViewDate(setMonth(viewDate, parseInt(e.target.value)))}
                                style={{
                                    appearance: 'none', background: 'transparent', border: 'none',
                                    padding: '8px 26px 8px 12px', fontSize: '13px', fontWeight: 700,
                                    color: 'var(--text-primary)', cursor: 'pointer', outline: 'none'
                                }}
                            >
                                {months.map((m, i) => (
                                    <option key={m} value={i} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>

                        {/* Year */}
                        <div style={{ position: 'relative', borderLeft: '1px solid var(--border-color)' }} className="transition-colors">
                            <select
                                value={getYear(viewDate)}
                                onChange={(e) => setViewDate(setYear(viewDate, parseInt(e.target.value)))}
                                style={{
                                    appearance: 'none', background: 'transparent', border: 'none',
                                    padding: '8px 26px 8px 12px', fontSize: '13px', fontWeight: 600,
                                    color: 'var(--text-primary)', cursor: 'pointer', outline: 'none'
                                }}
                            >
                                {years.map(y => (
                                    <option key={y} value={y} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* CHART AREA - Fixed Height Enforcement */}
            <div style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '16px', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">

                    {isFutureView ? (
                        /* FUTURE ALERT */
                        <motion.div
                            key="future-alert"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{
                                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                                background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
                                borderRadius: '16px', border: '2px dashed var(--border-color)'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                                style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '50%', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', marginBottom: '16px' }}
                            >
                                <Sparkles className="text-emerald-500" size={32} />
                            </motion.div>
                            <h4 className="text-xl font-black text-emerald-900 m-0 tracking-tight" style={{ color: 'var(--text-primary)' }}>Future Focus! 🔮</h4>
                            <p className="text-sm text-emerald-700/80 mt-2 max-w-xs leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
                                We can't chart the future yet. <br /> Check back when {format(viewDate, 'MMMM')} starts!
                            </p>
                        </motion.div>
                    ) : (
                        /* CHART */
                        <motion.div
                            key="chart-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 30 }}>
                                    <defs>
                                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <filter id="shadow" height="200%">
                                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10b981" floodOpacity="0.3" />
                                        </filter>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={{ stroke: 'var(--text-muted)', strokeWidth: 2 }}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 800 }}
                                        dy={12}
                                        interval="preserveStartEnd"
                                        minTickGap={10}
                                    />
                                    <YAxis
                                        axisLine={{ stroke: 'var(--text-muted)', strokeWidth: 2 }}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 800 }}
                                        domain={[0, 100]}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px', border: '1px solid var(--border-color)', padding: '12px 16px',
                                            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
                                            background: 'var(--bg-card)',
                                        }}
                                        cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4 4' }}
                                        formatter={(value) => [
                                            <span style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 900 }}>{value}%</span>,
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>Completion</span>
                                        ]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="rate"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRate)"
                                        connectNulls={false}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                                        filter="url(#shadow)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MomentumChart;
