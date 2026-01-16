# **Ultimate Habit Tracker Project Documentation**

## **1. What is the Project?**
The **Ultimate Habit Tracker** is a **premium, offline-first web application** designed to help users master their daily routines, track consistency, and visualize their progress. Unlike simple todo lists, this application focuses on **habit formation** through powerful visualizations and strict time discipline.

### **Core Philosophy & Features**
*   **Offline-First & Privacy Focused**: The application performs **all operations locally** in your browser using **IndexedDB**. Your data never leaves your device, providing maximum privacy and zero latency.
*   **Multi-View Interface**:
    *   **Timeline View**: A sequential, vertical list of your day's schedule, perfect for focused execution.
    *   **Weekly Grid View**: A professional spreadsheet-style matrix that visualizes your habits across the entire week, highlighting trends and missed days.
*   **Advanced Analytics**:
    *   **Progress Circles**: Visual indicators for Daily Focus, Missed Tasks, and Weekly Goals.
    *   **Momentum Charts**: A 14-day trend line graph that calculates your consistency score.
    *   **Heatmaps**: A GitHub-style contribution graph to see your long-term activity at a glance.
*   **Strict Time Discipline (IST)**: The system enforces **Strict Indian Standard Time (IST)** logic. It prevents "Time Traveling" (completing future tasks) and "Rewriting History" (changing past statuses), ensuring your data integrity is real and honest.
*   **Routine System**: A powerful **Template Engine** that allows you to:
    *   **Save Today as Routine**: Instantly capture a perfect day's setup.
    *   **Load Routine**: Populate a new day with one click.
    *   **Import/Export**: Share routines via JSON files.
*   **Premium Theming**: Includes **5 Professionally Curated Themes** (Light, Midnight Pro, Ocean Breeze, Sunset Glow, Forest Focus) that instantly adapt the entire application's color palette.
*   **Export Capabilities**: Generate professional **PDF Reports** and **CSV dumps** of your habit data for external analysis or archiving.

---

## **2. How It Was Created**
This project was built using a modern, scalable, and performance-oriented technology stack. Every component was designed for modularity and reusability.

### **Technology Stack**
*   **Frontend Framework**: **React (Vite)**
    *   Chosen for its blazing fast performance, component-based architecture, and efficient HMR (Hot Module Replacement) during development.
*   **State Management**: **React Hooks (useState, useEffect, useReducer)**
    *   Used for managing complex local states like modal visibility, data fetching, and theme toggling without the overhead of external libraries like Redux.
*   **Database**: **IndexedDB (via `idb` wrapper)**
    *   A low-level API for client-side storage of significant amounts of structured data. It provides a persistent, transactional database system right in the browser.
*   **Styling Engine**: **CSS Modules & CSS Custom Properties (Variables)**
    *   Instead of heavy CSS frameworks, we used **Native CSS Variables** for the Theme System. This allows instantaneous theme switching (e.g., changing `--accent-primary`) with zero performance cost.
*   **Date & Time Logic**: **date-fns**
    *   A lightweight library for manipulating JavaScript dates.
    *   **Custom IST Layer**: We built a custom utility layer (`src/utils/dateUtils.js`) on top of `date-fns` to strictly enforce Indian Standard Time logic regardless of the user's system clock.
*   **Animations**: **Framer Motion**
    *   Used for the smooth, physics-based animations seen in modails, the "Quote Banner", and task list transitions.
*   **Icons**: **Lucide React**
    *   A clean, consistent icon set that scales perfectly.

### **Architecture Breakdown**
1.  **`src/components/Dashboard.jsx`**: The **Command Center**. It handles the main state, fetches data from the DB, calculates specific stats (like "Missed Tasks"), and renders the appropriate sub-views.
2.  **`src/db/db.js`**: The **Data Layer**. A dedicated module that abstracts all raw IndexedDB operations (Open, Add, Put, Delete, GetAll). This ensures the UI components never touch raw database code.
3.  **`src/styles/themes.js`**: The **Design System**. A JavaScript object containing the precise hex codes for every theme. The application injects these as CSS variables into the `:root` element at runtime.
4.  **`src/components/WeeklyGrid.jsx`**: The **Complex View**. Renders a dynamic HTML table that calculates per-habit weekly completion percentages on the fly.

### **Installation & Setup**
To run this project locally, follow these steps:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
3.  **Build for Production**:
    ```bash
    npm run build
    ```
