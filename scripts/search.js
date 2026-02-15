/**
 * Search Module
 * Handles regex-based search and filtering for Campus Life Planner
 */

const search = (() => {
    /**
     * Search tasks by regex pattern
     * @param {array} tasks - Array of tasks to search
     * @param {RegExp} regex - Compiled regex pattern
     * @param {array} fields - Fields to search in
     * @returns {array} Matching tasks
     */
    const searchTasks = (tasks, regex, fields = ['title', 'tag', 'dueDate']) => {
        if (!regex) {
            return tasks;
        }

        return tasks.filter(task => {
            return fields.some(field => {
                const value = String(task[field] || '');
                return regex.test(value);
            });
        });
    };

    /**
     * Highlight matches in text
     * @param {string} text - Text to highlight
     * @param {RegExp} regex - Compiled regex pattern
     * @returns {string} HTML with highlighted matches
     */
    const highlightText = (text, regex) => {
        if (!regex || !text) {
            return text;
        }

        return validators.highlightMatches(String(text), regex);
    };

    /**
     * Get highlighted task title
     * @param {object} task - Task object
     * @param {RegExp} regex - Compiled regex pattern
     * @returns {string} HTML with highlighted title
     */
    const getHighlightedTitle = (task, regex) => {
        return highlightText(task.title, regex);
    };

    /**
     * Get highlighted task tag
     * @param {object} task - Task object
     * @param {RegExp} regex - Compiled regex pattern
     * @returns {string} HTML with highlighted tag
     */
    const getHighlightedTag = (task, regex) => {
        return highlightText(task.tag, regex);
    };

    /**
     * Get highlighted task date
     * @param {object} task - Task object
     * @param {RegExp} regex - Compiled regex pattern
     * @returns {string} HTML with highlighted date
     */
    const getHighlightedDate = (task, regex) => {
        return highlightText(task.dueDate, regex);
    };

    /**
     * Validate search pattern
     * @param {string} pattern - Regex pattern string
     * @returns {object} { valid: boolean, error: string, regex: RegExp|null }
     */
    const validatePattern = (pattern) => {
        if (!pattern) {
            return { valid: true, error: '', regex: null };
        }

        const { regex, error } = validators.compileRegex(pattern);

        if (!regex) {
            return { valid: false, error, regex: null };
        }

        return { valid: true, error: '', regex };
    };

    /**
     * Get search suggestions based on tasks
     * @param {array} tasks - Array of tasks
     * @returns {array} Array of suggestion objects
     */
    const getSuggestions = (tasks) => {
        const suggestions = [];

        // Get unique tags
        const tags = [...new Set(tasks.map(t => t.tag))];
        tags.forEach(tag => {
            suggestions.push({
                type: 'tag',
                text: `@tag:${tag}`,
                label: `Filter by tag: ${tag}`,
                pattern: `@tag:${tag}`
            });
        });

        // Common search patterns
        suggestions.push({
            type: 'pattern',
            text: 'upcoming',
            label: 'Find upcoming tasks',
            pattern: '^[^0-9]*$' // Tasks without numbers
        });

        suggestions.push({
            type: 'pattern',
            text: 'today',
            label: 'Find today\'s tasks',
            pattern: utils.formatDate(new Date())
        });

        return suggestions;
    };

    /**
     * Parse search query for special commands
     * @param {string} query - Search query
     * @returns {object} { command: string|null, pattern: string }
     */
    const parseQuery = (query) => {
        if (!query) {
            return { command: null, pattern: '' };
        }

        // Check for tag filter: @tag:Academic
        const tagMatch = query.match(/^@tag:(\w+)$/i);
        if (tagMatch) {
            return { command: 'tag', pattern: tagMatch[1] };
        }

        // Check for date filter: @date:2025-09-29
        const dateMatch = query.match(/^@date:(\d{4}-\d{2}-\d{2})$/);
        if (dateMatch) {
            return { command: 'date', pattern: dateMatch[1] };
        }

        // Default: treat as regex pattern
        return { command: null, pattern: query };
    };

    /**
     * Apply search command
     * @param {array} tasks - Array of tasks
     * @param {string} command - Command type
     * @param {string} pattern - Pattern/value
     * @returns {array} Filtered tasks
     */
    const applyCommand = (tasks, command, pattern) => {
        switch (command) {
            case 'tag':
                return tasks.filter(task => task.tag === pattern);
            case 'date':
                return tasks.filter(task => task.dueDate === pattern);
            default:
                return tasks;
        }
    };

    /**
     * Perform advanced search
     * @param {array} tasks - Array of tasks
     * @param {string} query - Search query
     * @param {boolean} caseSensitive - Case sensitivity flag
     * @returns {object} { tasks: array, error: string }
     */
    const performSearch = (tasks, query, caseSensitive = false) => {
        if (!query) {
            return { tasks, error: '' };
        }

        const { command, pattern } = parseQuery(query);

        if (command) {
            const filtered = applyCommand(tasks, command, pattern);
            return { tasks: filtered, error: '' };
        }

        // Treat as regex pattern
        const { regex, error } = validators.compileRegex(pattern, caseSensitive ? 'g' : 'gi');

        if (!regex) {
            return { tasks: [], error };
        }

        const filtered = searchTasks(tasks, regex);
        return { tasks: filtered, error: '' };
    };

    /**
     * Get search stats
     * @param {array} allTasks - All tasks
     * @param {array} searchResults - Search result tasks
     * @returns {object} Statistics object
     */
    const getSearchStats = (allTasks, searchResults) => {
        return {
            total: allTasks.length,
            results: searchResults.length,
            percentage: allTasks.length > 0 ? Math.round((searchResults.length / allTasks.length) * 100) : 0
        };
    };

    // Public API
    return {
        searchTasks,
        highlightText,
        getHighlightedTitle,
        getHighlightedTag,
        getHighlightedDate,
        validatePattern,
        getSuggestions,
        parseQuery,
        applyCommand,
        performSearch,
        getSearchStats
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = search;
}
