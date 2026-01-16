import { format, parseISO } from 'date-fns';

// Get current date object in IST
export const getTodayIST = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    // IST is UTC + 5:30
    const ist = new Date(utc + (3600000 * 5.5));
    return ist;
};

// Get today's date string in YYYY-MM-DD format (IST)
export const getTodayISTString = () => {
    return format(getTodayIST(), 'yyyy-MM-dd');
};

// Check if a given date string (YYYY-MM-DD) matches today in IST
export const isTodayIST = (dateStr) => {
    if (!dateStr) return false;
    // Just compare the strings directly since dateStr is supposedly YYYY-MM-DD
    // and matching it against getTodayISTString() is the safest, tz-agnostic way
    return dateStr === getTodayISTString();
};

export const isFutureIST = (dateStr) => {
    if (!dateStr) return false;
    return dateStr > getTodayISTString();
};
