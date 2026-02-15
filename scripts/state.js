/**
 * State Module
 * Manages application state for Campus Life Planner
 */

const state = (() => {
    // Application state
    let appState = {
        tasks: [],
        settings: {},
        tags: [],
        currentPage: 'dashboard',
        editingTaskId: null,
        searchQuery: '',
        searchRegex: null,
        caseSensitive: false,
        sortBy: 'dueDate',
        sortOrder: 'asc'
    };

    /**
     * Initialize application state
     */
    const init = () => {
        appState.tasks = storage.loadTasks();
        appState.settings = storage.loadSettings();
        appState.tags = storage.loadTags();
    };

    /**
     * Get current state
     * @returns {object} Current application state
     */
    const getState = () => {
        return { ...appState };
    };

    /**
     * Get all tasks
     * @returns {array} Array of tasks
     */
    const getTasks = () => {
        return [...appState.tasks];
    };

    /**
     * Get task by ID
     * @param {string} id - Task ID
     * @returns {object|null} Task object or null
     */
    const getTaskById = (id) => {
        return appState.tasks.find(task => task.id === id) || null;
    };

    /**
     * Add new task
     * @param {object} task - Task object
     * @returns {boolean} Success status
     */
    const addTask = (task) => {
        if (!task.id) {
            task.id = utils.generateId('task');
        }
        if (!task.createdAt) {
            task.createdAt = new Date().toISOString();
        }
        if (!task.updatedAt) {
            task.updatedAt = new Date().toISOString();
        }

        appState.tasks.push(task);
        storage.saveTasks(appState.tasks);
        return true;
    };

    /**
     * Update task
     * @param {string} id - Task ID
     * @param {object} updates - Fields to update
     * @returns {boolean} Success status
     */
    const updateTask = (id, updates) => {
        const taskIndex = appState.tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) {
            return false;
        }

        appState.tasks[taskIndex] = {
            ...appState.tasks[taskIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        storage.saveTasks(appState.tasks);
        return true;
    };

    /**
     * Delete task
     * @param {string} id - Task ID
     * @returns {boolean} Success status
     */
    const deleteTask = (id) => {
        const taskIndex = appState.tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) {
            return false;
        }

        appState.tasks.splice(taskIndex, 1);
        storage.saveTasks(appState.tasks);
        return true;
    };

    /**
     * Get filtered tasks
     * @returns {array} Filtered and sorted tasks
     */
    const getFilteredTasks = () => {
        let filtered = [...appState.tasks];

        // Apply search filter
        if (appState.searchRegex) {
            filtered = filtered.filter(task => {
                const searchText = `${task.title} ${task.tag} ${task.dueDate}`;
                return appState.searchRegex.test(searchText);
            });
        }

        // Apply sorting
        filtered = utils.sortBy(
            filtered,
            appState.sortBy,
            appState.sortOrder
        );

        return filtered;
    };

    /**
     * Get tasks for next N days
     * @param {number} days - Number of days
     * @returns {array} Upcoming tasks
     */
    const getUpcomingTasks = (days = 7) => {
        return appState.tasks.filter(task => {
            return utils.isWithinDays(task.dueDate, days);
        }).sort((a, b) => {
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    };

    /**
     * Get settings
     * @returns {object} Settings object
     */
    const getSettings = () => {
        return { ...appState.settings };
    };

    /**
     * Update settings
     * @param {object} updates - Settings to update
     * @returns {boolean} Success status
     */
    const updateSettings = (updates) => {
        appState.settings = { ...appState.settings, ...updates };
        storage.saveSettings(appState.settings);
        return true;
    };

    /**
     * Get tags
     * @returns {array} Array of tags
     */
    const getTags = () => {
        return [...appState.tags];
    };

    /**
     * Add tag
     * @param {string} tag - Tag name
     * @returns {boolean} Success status
     */
    const addTag = (tag) => {
        if (!appState.tags.includes(tag)) {
            appState.tags.push(tag);
            appState.tags.sort();
            storage.saveTags(appState.tags);
            return true;
        }
        return false;
    };

    /**
     * Remove tag
     * @param {string} tag - Tag name
     * @returns {boolean} Success status
     */
    const removeTag = (tag) => {
        const index = appState.tags.indexOf(tag);
        if (index !== -1) {
            appState.tags.splice(index, 1);
            storage.saveTags(appState.tags);
            return true;
        }
        return false;
    };

    /**
     * Set current page
     * @param {string} page - Page name
     */
    const setCurrentPage = (page) => {
        appState.currentPage = page;
    };

    /**
     * Get current page
     * @returns {string} Current page name
     */
    const getCurrentPage = () => {
        return appState.currentPage;
    };

    /**
     * Set editing task ID
     * @param {string|null} id - Task ID or null
     */
    const setEditingTaskId = (id) => {
        appState.editingTaskId = id;
    };

    /**
     * Get editing task ID
     * @returns {string|null} Task ID or null
     */
    const getEditingTaskId = () => {
        return appState.editingTaskId;
    };

    /**
     * Set search query
     * @param {string} query - Search query
     * @param {boolean} caseSensitive - Case sensitive flag
     */
    const setSearchQuery = (query, caseSensitive = false) => {
        appState.searchQuery = query;
        appState.caseSensitive = caseSensitive;

        if (query) {
            const { regex } = validators.compileRegex(query, caseSensitive ? 'g' : 'gi');
            appState.searchRegex = regex;
        } else {
            appState.searchRegex = null;
        }
    };

    /**
     * Get search query
     * @returns {string} Search query
     */
    const getSearchQuery = () => {
        return appState.searchQuery;
    };

    /**
     * Get search regex
     * @returns {RegExp|null} Compiled regex or null
     */
    const getSearchRegex = () => {
        return appState.searchRegex;
    };

    /**
     * Set sort options
     * @param {string} field - Field to sort by
     * @param {string} order - Sort order ('asc' or 'desc')
     */
    const setSortOptions = (field, order = null) => {
        if (appState.sortBy === field && order === null) {
            // Toggle order if clicking same field
            appState.sortOrder = appState.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            appState.sortBy = field;
            appState.sortOrder = order || 'asc';
        }
    };

    /**
     * Get sort options
     * @returns {object} { sortBy: string, sortOrder: string }
     */
    const getSortOptions = () => {
        return {
            sortBy: appState.sortBy,
            sortOrder: appState.sortOrder
        };
    };

    /**
     * Get statistics
     * @returns {object} Statistics object
     */
    const getStats = () => {
        const tasks = appState.tasks;
        const upcomingTasks = getUpcomingTasks(7);

        // Calculate total hours
        const totalMinutes = tasks.reduce((sum, task) => {
            return sum + parseFloat(task.duration || 0);
        }, 0);
        const totalHours = utils.minutesToHours(totalMinutes);

        // Count tasks by tag
        const tagCounts = utils.countBy(tasks, 'tag');
        const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];

        // Weekly hours
        const weeklyMinutes = upcomingTasks.reduce((sum, task) => {
            return sum + parseFloat(task.duration || 0);
        }, 0);
        const weeklyHours = utils.minutesToHours(weeklyMinutes);

        return {
            totalTasks: tasks.length,
            weekTasks: upcomingTasks.length,
            totalHours,
            weeklyHours,
            topTag: topTag ? topTag[0] : 'N/A',
            tagCounts
        };
    };

    /**
     * Import data
     * @param {string} jsonString - JSON string to import
     * @returns {object} { success: boolean, error: string }
     */
    const importData = (jsonString) => {
        const result = storage.importData(jsonString);
        if (result.success) {
            init(); // Reload state from storage
        }
        return result;
    };

    /**
     * Export data
     * @returns {string} JSON string of all data
     */
    const exportData = () => {
        return storage.exportData();
    };

    /**
     * Clear all data
     * @returns {boolean} Success status
     */
    const clearAllData = () => {
        const success = storage.clearAll();
        if (success) {
            appState.tasks = [];
            appState.tags = [...storage.defaultTags];
            appState.settings = { ...storage.defaultSettings };
        }
        return success;
    };

    // Public API
    return {
        init,
        getState,
        getTasks,
        getTaskById,
        addTask,
        updateTask,
        deleteTask,
        getFilteredTasks,
        getUpcomingTasks,
        getSettings,
        updateSettings,
        getTags,
        addTag,
        removeTag,
        setCurrentPage,
        getCurrentPage,
        setEditingTaskId,
        getEditingTaskId,
        setSearchQuery,
        getSearchQuery,
        getSearchRegex,
        setSortOptions,
        getSortOptions,
        getStats,
        importData,
        exportData,
        clearAllData
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = state;
}
