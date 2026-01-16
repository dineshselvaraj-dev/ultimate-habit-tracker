import { openDB } from 'idb';

const DB_NAME = 'ultimate-habit-tracker';
const DB_VERSION = 1;
const STORE_TASKS = 'tasks';

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_TASKS)) {
                const store = db.createObjectStore(STORE_TASKS, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                store.createIndex('date', 'date', { unique: false });
                store.createIndex('completed', 'completed', { unique: false });
            }
        },
    });
};

export const dbRequest = {
    async addTask(task) {
        const db = await initDB();
        const id = await db.add(STORE_TASKS, {
            ...task,
            createdAt: new Date().toISOString(),
        });
        return { ...task, id };
    },

    async getTasksByDate(date) {
        const db = await initDB();
        const index = db.transaction(STORE_TASKS).store.index('date');
        const tasks = await index.getAll(date);
        return tasks;
    },

    async updateTask(task) {
        const db = await initDB();
        await db.put(STORE_TASKS, task);
        return task;
    },

    async deleteTask(id) {
        const db = await initDB();
        await db.delete(STORE_TASKS, id);
        return id;
    },

    async getAllTasks() {
        const db = await initDB();
        return db.getAll(STORE_TASKS);
    },

    async clearAllTasks() {
        const db = await initDB();
        await db.clear(STORE_TASKS);
    },

    // Routine System (LocalStorage)
    saveRoutine(tasks) {
        // Strip sensitive/unique data, keep only structure
        const template = tasks.map(({ id, date, completed, createdAt, ...rest }) => rest);
        localStorage.setItem('habit_routine_template', JSON.stringify(template));
        return true;
    },

    getRoutine() {
        const data = localStorage.getItem('habit_routine_template');
        return data ? JSON.parse(data) : null;
    }
};
