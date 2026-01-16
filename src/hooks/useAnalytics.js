import { useMemo } from 'react';
import { format, subDays, isSameDay, parseISO, startOfYear, endOfDay, eachDayOfInterval, getDay, isAfter } from 'date-fns';

export const useAnalytics = (tasks) => {
    return useMemo(() => {
        if (!tasks || tasks.length === 0) {
            return {
                completionRate: 0,
                streak: 0,
                totalWins: 0,
                bestDay: 'N/A',
                heatmapData: [],
                habitHealthData: [],
                dayOfWeekData: []
            };
        }

        // 1. Global Stats
        const totalWins = tasks.filter(t => t.completed).length;
        // Note: Completion Rate is simplistic here. Ideally needs "Total Scheduled" logic.
        // For now, we use (Completed / Total in DB) * 100
        const completionRate = tasks.length > 0 ? Math.round((totalWins / tasks.length) * 100) : 0;

        // 2. Current Streak
        // Sort completed tasks by date descending
        const completedDates = [...new Set(
            tasks
                .filter(t => t.completed)
                .map(t => t.date)
                .sort((a, b) => b.localeCompare(a))
        )];

        let streak = 0;
        let checkDate = new Date();
        // Normalize checkDate to YYYY-MM-DD
        let checkStr = format(checkDate, 'yyyy-MM-dd');

        // If today is completed, start from today. If not, check yesterday.
        if (!completedDates.includes(checkStr)) {
            checkDate = subDays(checkDate, 1);
            checkStr = format(checkDate, 'yyyy-MM-dd');
        }

        // Iterate backwards
        while (completedDates.includes(checkStr)) {
            streak++;
            checkDate = subDays(checkDate, 1);
            checkStr = format(checkDate, 'yyyy-MM-dd');
        }

        // 3. Best Day of Week
        const daysCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // 0=Sun
        tasks.filter(t => t.completed).forEach(t => {
            const d = parseISO(t.date);
            daysCount[getDay(d)]++;
        });

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let maxVal = -1;
        let bestDayIndex = 0;
        Object.entries(daysCount).forEach(([dayIdx, count]) => {
            if (count > maxVal) {
                maxVal = count;
                bestDayIndex = dayIdx;
            }
        });
        const bestDay = maxVal > 0 ? dayNames[bestDayIndex] : 'N/A';

        // 4. Heatmap Data (Last 365 Days)
        const today = new Date();
        const oneYearAgo = subDays(today, 365);
        const dateRange = eachDayOfInterval({ start: oneYearAgo, end: today });

        // Pre-calculate counts per date
        const countsByDate = {};
        tasks.filter(t => t.completed).forEach(t => {
            countsByDate[t.date] = (countsByDate[t.date] || 0) + 1;
        });

        const heatmapData = dateRange.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const count = countsByDate[dateStr] || 0;
            return {
                date: dateStr,
                count,
                // 0=Empty, 1=Light, 2=Med, 3=Heavy, 4=Super
                level: count === 0 ? 0 : count < 3 ? 1 : count < 5 ? 2 : count < 7 ? 3 : 4
            };
        });

        // 5. Habit Health (Success Rate per Habit Title - Last 30 Days)
        const thirtyDaysAgo = subDays(new Date(), 30);
        // Filter tasks to only those after 30 days ago
        const recentTasks = tasks.filter(t => {
            const d = parseISO(t.date);
            return isAfter(d, thirtyDaysAgo);
        });

        const habitGroups = {};
        recentTasks.forEach(t => {
            if (!habitGroups[t.title]) habitGroups[t.title] = { total: 0, completed: 0 };
            habitGroups[t.title].total++;
            if (t.completed) habitGroups[t.title].completed++;
        });

        const habitHealthData = Object.entries(habitGroups).map(([name, stat]) => ({
            name,
            // Avoid 0 division
            rate: stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0
        })).sort((a, b) => b.rate - a.rate); // Sort best to worst

        // 6. Day of Week Breakdown (For Radar/Bar)
        const dayOfWeekData = dayNames.map((name, index) => ({
            day: name.substring(0, 3), // Mon, Tue
            count: daysCount[index]
        }));

        return {
            completionRate,
            streak,
            totalWins,
            bestDay,
            heatmapData,
            habitHealthData,
            dayOfWeekData
        };

    }, [tasks]);
};
