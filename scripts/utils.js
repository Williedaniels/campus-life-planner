/**
 * Utility Functions Module
 * Common helper functions for Campus Life Planner
 */

const utils = (() => {
    /**
     * Generate unique ID
     * @param {string} prefix - ID prefix (e.g., 'task')
     * @returns {string} Unique ID
     */
    const generateId = (prefix = 'task') => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}_${timestamp}${random}`;
    };

    /**
     * Format date to YYYY-MM-DD
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date
     */
    const formatDate = (date) => {
        if (typeof date === 'string') {
            return date;
        }

        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
    };

    /**
     * Format date for display
     * @param {string} dateStr - Date string in YYYY-MM-DD format
     * @returns {string} Formatted date (e.g., "Sep 29, 2025")
     */
    const formatDateDisplay = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00Z');
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    /**
     * Convert minutes to hours and minutes
     * @param {number} minutes - Minutes to convert
     * @returns {string} Formatted time (e.g., "2h 30m")
     */
    const formatDuration = (minutes) => {
        const num = parseFloat(minutes);
        if (isNaN(num)) return '0m';

        if (num < 60) {
            return `${Math.round(num)}m`;
        }

        const hours = Math.floor(num / 60);
        const mins = Math.round(num % 60);

        if (mins === 0) {
            return `${hours}h`;
        }

        return `${hours}h ${mins}m`;
    };

    /**
     * Convert minutes to hours
     * @param {number} minutes - Minutes to convert
     * @returns {number} Hours
     */
    const minutesToHours = (minutes) => {
        return parseFloat((minutes / 60).toFixed(2));
    };

    /**
     * Convert hours to minutes
     * @param {number} hours - Hours to convert
     * @returns {number} Minutes
     */
    const hoursToMinutes = (hours) => {
        return parseFloat((hours * 60).toFixed(2));
    };

    /**
     * Get days until date
     * @param {string} dateStr - Date string in YYYY-MM-DD format
     * @returns {number} Days until date (negative if past)
     */
    const daysUntil = (dateStr) => {
        const targetDate = new Date(dateStr + 'T00:00:00Z');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const timeDiff = targetDate - today;
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    };

    /**
     * Check if date is within next N days
     * @param {string} dateStr - Date string in YYYY-MM-DD format
     * @param {number} days - Number of days
     * @returns {boolean} True if within next N days
     */
    const isWithinDays = (dateStr, days = 7) => {
        const daysLeft = daysUntil(dateStr);
        return daysLeft >= 0 && daysLeft <= days;
    };

    /**
     * Sort array of objects by property
     * @param {array} arr - Array to sort
     * @param {string} prop - Property to sort by
     * @param {string} order - 'asc' or 'desc'
     * @returns {array} Sorted array
     */
    const sortBy = (arr, prop, order = 'asc') => {
        return [...arr].sort((a, b) => {
            let aVal = a[prop];
            let bVal = b[prop];

            // Handle different types
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (order === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
    };

    /**
     * Group array by property
     * @param {array} arr - Array to group
     * @param {string} prop - Property to group by
     * @returns {object} Grouped object
     */
    const groupBy = (arr, prop) => {
        return arr.reduce((groups, item) => {
            const key = item[prop];
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    };

    /**
     * Count occurrences of property values
     * @param {array} arr - Array to count
     * @param {string} prop - Property to count
     * @returns {object} Count object
     */
    const countBy = (arr, prop) => {
        return arr.reduce((counts, item) => {
            const key = item[prop];
            counts[key] = (counts[key] || 0) + 1;
            return counts;
        }, {});
    };

    /**
     * Debounce function
     * @param {function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {function} Debounced function
     */
    const debounce = (func, delay = 300) => {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    /**
     * Throttle function
     * @param {function} func - Function to throttle
     * @param {number} delay - Delay in milliseconds
     * @returns {function} Throttled function
     */
    const throttle = (func, delay = 300) => {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    };

    /**
     * Deep clone object
     * @param {object} obj - Object to clone
     * @returns {object} Cloned object
     */
    const deepClone = (obj) => {
        return JSON.parse(JSON.stringify(obj));
    };

    /**
     * Check if object is empty
     * @param {object} obj - Object to check
     * @returns {boolean} True if empty
     */
    const isEmpty = (obj) => {
        return Object.keys(obj).length === 0;
    };

    /**
     * Merge objects
     * @param {...object} objects - Objects to merge
     * @returns {object} Merged object
     */
    const merge = (...objects) => {
        return Object.assign({}, ...objects);
    };

    /**
     * Create element with attributes
     * @param {string} tag - HTML tag
     * @param {object} attrs - Attributes
     * @param {string} html - Inner HTML
     * @returns {HTMLElement} Created element
     */
    const createElement = (tag, attrs = {}, html = '') => {
        const el = document.createElement(tag);
        
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'class') {
                el.className = value;
            } else if (key === 'style') {
                Object.assign(el.style, value);
            } else if (key.startsWith('data-')) {
                el.dataset[key.slice(5)] = value;
            } else if (key.startsWith('aria-')) {
                el.setAttribute(key, value);
            } else {
                el[key] = value;
            }
        });

        if (html) {
            el.innerHTML = html;
        }

        return el;
    };

    /**
     * Add event listener with delegation
     * @param {HTMLElement} parent - Parent element
     * @param {string} selector - CSS selector
     * @param {string} event - Event name
     * @param {function} handler - Event handler
     */
    const delegate = (parent, selector, event, handler) => {
        parent.addEventListener(event, (e) => {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e);
            }
        });
    };

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in milliseconds
     */
    const showToast = (message, type = 'info', duration = 3000) => {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - 'polite' or 'assertive'
     */
    const announce = (message, priority = 'polite') => {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => announcement.remove(), 1000);
    };

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise} Promise that resolves when copied
     */
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    };

    /**
     * Download file
     * @param {string} content - File content
     * @param {string} filename - File name
     * @param {string} type - MIME type
     */
    const downloadFile = (content, filename, type = 'text/plain') => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    /**
     * Get query parameter
     * @param {string} param - Parameter name
     * @returns {string|null} Parameter value
     */
    const getQueryParam = (param) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(param);
    };

    /**
     * Set page title
     * @param {string} title - Page title
     */
    const setPageTitle = (title) => {
        document.title = title ? `${title} - Campus Life Planner` : 'Campus Life Planner';
    };

    // Public API
    return {
        generateId,
        formatDate,
        formatDateDisplay,
        formatDuration,
        minutesToHours,
        hoursToMinutes,
        daysUntil,
        isWithinDays,
        sortBy,
        groupBy,
        countBy,
        debounce,
        throttle,
        deepClone,
        isEmpty,
        merge,
        createElement,
        delegate,
        showToast,
        announce,
        copyToClipboard,
        downloadFile,
        getQueryParam,
        setPageTitle
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
}
