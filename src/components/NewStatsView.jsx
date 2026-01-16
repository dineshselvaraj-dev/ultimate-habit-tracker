import React from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isToday,
    getDay,
    setMonth,
    setYear,
    getYear,
    getMonth,
    isSameDay
} from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

// --- COMPONENT 1: MONTHLY CALENDAR ---
export const MonthlyCalendar = ({ tasks, currentDate, onDateChange }) => {
    // Fallback to today if currentDate is missing
    const activeDate = currentDate || new Date();

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(activeDate),
        end: endOfMonth(activeDate),
    });

    const getDayStatus = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        // Filter tasks for this specific day
        const dayTasks = tasks.filter(t => t.date === dateStr);

        if (dayTasks.length === 0) return 'empty';

        const completed = dayTasks.filter(t => t.completed).length;
        const total = dayTasks.length;
        const percentage = total === 0 ? 0 : (completed / total) * 100;

        if (percentage === 100) return 'perfect';
        if (percentage >= 50) return 'good';
        return 'progress';
    };

    const startDayRaw = getDay(startOfMonth(activeDate));
    // Mon=0
    const startDay = (startDayRaw + 6) % 7;
    const emptySlots = Array(startDay).fill(null);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

    const handleMonthChange = (e) => {
        if (onDateChange) onDateChange(setMonth(activeDate, parseInt(e.target.value)));
    };

    const handleYearChange = (e) => {
        if (onDateChange) onDateChange(setYear(activeDate, parseInt(e.target.value)));
    };

    return (
        <div className="bento-card h-full flex flex-col" style={{ padding: '20px' }}>
            {/* Header with Dropdowns - Compact View */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    {/* Month Select */}
                    <div className="relative">
                        <select
                            value={getMonth(activeDate)}
                            onChange={handleMonthChange}
                            className="appearance-none font-bold py-1 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-sm"
                            style={{
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            {months.map((m, i) => <option key={m} value={i} style={{ background: 'var(--bg-card)' }}>{m}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    </div>

                    {/* Year Select */}
                    <div className="relative">
                        <select
                            value={getYear(activeDate)}
                            onChange={handleYearChange}
                            className="appearance-none font-medium py-1 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-sm"
                            style={{
                                background: 'var(--bg-card)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            {years.map(y => <option key={y} value={y} style={{ background: 'var(--bg-card)' }}>{y}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    </div>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2 text-center">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 flex-grow content-start">
                {emptySlots.map((_, i) => <div key={`empty-${i}`} />)}

                {daysInMonth.map((day) => {
                    const status = getDayStatus(day);
                    const isCurrentDay = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            className={`
                                aspect-square flex flex-col items-center justify-center rounded-lg border transition-all duration-200
                                ${isCurrentDay ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                            `}
                            style={{
                                background: status === 'perfect' ? 'rgba(16, 185, 129, 0.1)' : status === 'good' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                borderColor: isCurrentDay ? 'transparent' : 'var(--border-color)',
                                borderWidth: '1px'
                            }}
                            title={format(day, 'yyyy-MM-dd')}
                        >
                            <span className="text-xs font-semibold" style={{ color: isCurrentDay ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                                {format(day, 'd')}
                            </span>

                            {/* Visual Indicators - Compact */}
                            {status === 'perfect' && (
                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[8px] mt-0.5">✓</div>
                            )}
                            {status === 'good' && (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1"></div>
                            )}
                            {status === 'progress' && (
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// --- COMPONENT 2: CONSISTENCY GAUGE ---
export const ConsistencyGauge = ({ percentage }) => {
    const data = [
        { name: 'Score', value: percentage },
        { name: 'Remaining', value: 100 - percentage },
    ];

    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 60 ? 'B' : 'C';
    const color = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#3b82f6' : '#f59e0b';

    return (
        <div className="bento-card h-full flex flex-col items-center justify-center relative overflow-hidden" style={{ padding: '24px' }}>
            <h3 className="w-full text-left text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Consistency Grade
            </h3>

            <div className="w-full relative flex items-center justify-center" style={{ flex: 1, minHeight: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="70%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell fill={color} />
                            <Cell fill="var(--bg-secondary)" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '30px', pointerEvents: 'none' }}>
                    <span className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{percentage}%</span>
                    <span className="text-xs font-medium mt-1 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Completion</span>
                </div>
            </div>

            <div className="text-center w-full mt-2 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Grade: <span className="font-bold text-xl ml-2" style={{ color: color }}>{grade}</span>
                </p>
            </div>
        </div>
    );
};

export default { MonthlyCalendar, ConsistencyGauge };
