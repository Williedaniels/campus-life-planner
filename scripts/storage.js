/**
 * Storage Module
 * Handles localStorage persistence for Campus Life Planner
 */

const storage = (() => {
    const STORAGE_KEY = 'campus-life-planner:tasks';
    const SETTINGS_KEY = 'campus-life-planner:settings';
    const TAGS_KEY = 'campus-life-planner:tags';

    // Default settings
    const defaultSettings = {
        unit: 'minutes',
        weeklyCap: 20,
        caseSensitiveSearch: false
    };

    // Default tags
    const defaultTags = [
        'Academic',
        'Personal',
        'Social',
        'Work',
        'Deadline',
        'Project'
    ];

    /**
     * Load all tasks from localStorage
     * @returns {array} Array of task objects
     */
    const loadTasks = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading tasks:', e);
            return [];
        }
    };

    /**
     * Save all tasks to localStorage
     * @param {array} tasks - Array of task objects
     * @returns {boolean} Success status
     */
    const saveTasks = (tasks) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            return true;
        } catch (e) {
            console.error('Error saving tasks:', e);
            return false;
        }
    };

    /**
     * Load settings from localStorage
     * @returns {object} Settings object
     */
    const loadSettings = () => {
        try {
            const data = localStorage.getItem(SETTINGS_KEY);
            return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
        } catch (e) {
            console.error('Error loading settings:', e);
            return defaultSettings;
        }
    };

    /**
     * Save settings to localStorage
     * @param {object} settings - Settings object
     * @returns {boolean} Success status
     */
    const saveSettings = (settings) => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Error saving settings:', e);
            return false;
        }
    };

    /**
     * Load tags from localStorage
     * @returns {array} Array of tag strings
     */
    const loadTags = () => {
        try {
            const data = localStorage.getItem(TAGS_KEY);
            return data ? JSON.parse(data) : [...defaultTags];
        } catch (e) {
            console.error('Error loading tags:', e);
            return [...defaultTags];
        }
    };

    /**
     * Save tags to localStorage
     * @param {array} tags - Array of tag strings
     * @returns {boolean} Success status
     */
    const saveTags = (tags) => {
        try {
            localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
            return true;
        } catch (e) {
            console.error('Error saving tags:', e);
            return false;
        }
    };

    /**
     * Clear all data from localStorage
     * @returns {boolean} Success status
     */
    const clearAll = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(SETTINGS_KEY);
            localStorage.removeItem(TAGS_KEY);
            return true;
        } catch (e) {
            console.error('Error clearing storage:', e);
            return false;
        }
    };

    /**
     * Export all data as JSON string
     * @returns {string} JSON string of all data
     */
    const exportData = () => {
        try {
            const data = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                tasks: loadTasks(),
                settings: loadSettings(),
                tags: loadTags()
            };
            return JSON.stringify(data, null, 2);
        } catch (e) {
            console.error('Error exporting data:', e);
            return null;
        }
    };

    /**
     * Import data from JSON string
     * @param {string} jsonString - JSON string to import
     * @returns {object} { success: boolean, error: string, data: object }
     */
    const importData = (jsonString) => {
        try {
            const data = JSON.parse(jsonString);

            // Validate structure
            if (!data.tasks || !Array.isArray(data.tasks)) {
                return { success: false, error: 'Invalid data: missing or invalid tasks array' };
            }

            if (!data.settings || typeof data.settings !== 'object') {
                return { success: false, error: 'Invalid data: missing or invalid settings' };
            }

            if (!data.tags || !Array.isArray(data.tags)) {
                return { success: false, error: 'Invalid data: missing or invalid tags array' };
            }

            // Validate each task
            for (let i = 0; i < data.tasks.length; i++) {
                const task = data.tasks[i];
                if (!task.id || !task.title || !task.dueDate || task.duration === undefined || !task.tag) {
                    return { success: false, error: `Invalid task at index ${i}: missing required fields` };
                }
            }

            // Save imported data
            saveTasks(data.tasks);
            saveSettings(data.settings);
            saveTags(data.tags);

            return { success: true, error: '', data };
        } catch (e) {
            return { success: false, error: `JSON parse error: ${e.message}` };
        }
    };

    /**
     * Get storage usage info
     * @returns {object} Storage info { used: number, available: number, percentage: number }
     */
    const getStorageInfo = () => {
        try {
            const used = new Blob(Object.values(localStorage)).size;
            const available = 5 * 1024 * 1024; // 5MB typical limit
            return {
                used,
                available,
                percentage: Math.round((used / available) * 100)
            };
        } catch (e) {
            console.error('Error getting storage info:', e);
            return { used: 0, available: 0, percentage: 0 };
        }
    };

    // Public API
    return {
        loadTasks,
        saveTasks,
        loadSettings,
        saveSettings,
        loadTags,
        saveTags,
        clearAll,
        exportData,
        importData,
        getStorageInfo,
        defaultSettings,
        defaultTags
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = storage;
}
