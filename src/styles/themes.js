export const themes = {
    light: {
        id: 'light',
        name: 'Professional Light',
        colors: {
            '--bg-primary': '#f8f9fa',
            '--bg-card': '#ffffff',
            '--bg-secondary': '#f1f3f5',
            '--text-primary': '#1e293b',
            '--text-secondary': '#64748b',
            '--text-muted': '#94a3b8',
            '--border-color': '#e2e8f0',
            '--accent-primary': '#0f172a',
            '--accent-primary-rgb': '15, 23, 42',
            '--success': '#10b981',
            '--danger': '#ef4444',
            '--warning': '#f59e0b',
            '--blue': '#3b82f6',
            '--shadow-sm': '0 1px 3px rgba(0, 0, 0, 0.05)',
            '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }
    },
    midnight: {
        id: 'midnight',
        name: 'Midnight Pro',
        colors: {
            '--bg-primary': '#0f172a',
            '--bg-card': '#1e293b',
            '--bg-secondary': '#334155',
            '--text-primary': '#f8fafc',
            '--text-secondary': '#cbd5e1',
            '--text-muted': '#94a3b8',
            '--border-color': '#334155',
            '--accent-primary': '#38bdf8', /* Sky blue accent for dark mode */
            '--accent-primary-rgb': '56, 189, 248',
            '--success': '#34d399',
            '--danger': '#f87171',
            '--warning': '#fbbf24',
            '--blue': '#60a5fa',
            '--shadow-sm': '0 1px 3px rgba(0, 0, 0, 0.3)',
            '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
        }
    },
    ocean: {
        id: 'ocean',
        name: 'Ocean Breeze',
        colors: {
            '--bg-primary': '#f0f9ff',  /* Sky 50 */
            '--bg-card': '#ffffff',
            '--bg-secondary': '#e0f2fe', /* Sky 100 */
            '--text-primary': '#0c4a6e', /* Sky 900 */
            '--text-secondary': '#0284c7', /* Sky 600 */
            '--text-muted': '#7dd3fc',   /* Sky 300 */
            '--border-color': '#bae6fd', /* Sky 200 */
            '--accent-primary': '#0ea5e9', /* Sky 500 */
            '--accent-primary-rgb': '14, 165, 233',
            '--success': '#06b6d4',
            '--danger': '#ef4444',
            '--warning': '#f59e0b',
            '--blue': '#0ea5e9',
            '--shadow-sm': '0 1px 3px rgba(14, 165, 233, 0.1)',
            '--shadow-md': '0 4px 12px -2px rgba(14, 165, 233, 0.12)'
        }
    },
    sunset: {
        id: 'sunset',
        name: 'Sunset Glow',
        colors: {
            '--bg-primary': '#fff7ed', /* Orange 50 - Warm foundation */
            '--bg-card': '#ffffff',    /* Clean white cards */
            '--bg-secondary': '#ffedd5', /* Orange 100 */
            '--text-primary': '#431407', /* Orange 950 - Deepest brown for max contrast */
            '--text-secondary': '#9a3412', /* Orange 800 - Readable terracotta */
            '--text-muted': '#f97316',   /* Orange 500 - Visible muted (was 300) */
            '--border-color': '#fed7aa', /* Orange 200 */
            '--accent-primary': '#ea580c', /* Orange 600 - Vivid accent */
            '--accent-primary-rgb': '234, 88, 12',
            '--success': '#059669',      /* Emerald 600 - Distinct Green for success */
            '--danger': '#e11d48',       /* Rose 600 - Distinct Red for errors */
            '--warning': '#f59e0b',
            '--blue': '#0284c7',         /* Sky 600 - Distinct Blue for goals */
            '--shadow-sm': '0 1px 3px rgba(234, 88, 12, 0.1)',
            '--shadow-md': '0 4px 12px -2px rgba(234, 88, 12, 0.12)'
        }
    },
    forest: {
        id: 'forest',
        name: 'Forest Focus',
        colors: {
            '--bg-primary': '#ecfdf5', /* Emerald 50 - slightly cooler/fresher */
            '--bg-card': '#ffffff',    /* Keep white for clean look, but relies on bg-primary for contrast */
            '--bg-secondary': '#d1fae5', /* Emerald 100 */
            '--text-primary': '#064e3b', /* Emerald 900 - Very dark for readability */
            '--text-secondary': '#047857', /* Emerald 700 - Readable secondary */
            '--text-muted': '#34d399',   /* Emerald 400 - Readable muted (was 300) */
            '--border-color': '#a7f3d0', /* Emerald 200 */
            '--accent-primary': '#10b981', /* Emerald 500 */
            '--accent-primary-rgb': '16, 185, 129',
            '--success': '#059669',      /* Emerald 600 */
            '--danger': '#ef4444',
            '--warning': '#d97706',
            '--blue': '#10b981',         /* Consistent Emerald */
            '--shadow-sm': '0 1px 3px rgba(16, 185, 129, 0.1)',
            '--shadow-md': '0 4px 12px -2px rgba(16, 185, 129, 0.12)'
        }
    }
};
