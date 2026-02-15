/**
 * Validators Module
 * Regex validation patterns and validation logic for Campus Life Planner
 * 
 * Patterns:
 * 1. Title: Forbid leading/trailing spaces, collapse doubles
 * 2. Duration: Numeric with optional decimals
 * 3. Date: YYYY-MM-DD format
 * 4. Tag: Letters, spaces, hyphens
 * 5. Advanced: Duplicate word detection (back-reference)
 */

const validators = (() => {
    // Regex patterns
    const patterns = {
        // Pattern 1: Title validation - forbid leading/trailing spaces, collapse doubles
        // Matches: "Valid Title", "Multi Word Title"
        // Rejects: "  Invalid  ", "Title  with  double"
        title: /^\S(?:.*\S)?$/,

        // Pattern 2: Duration validation - numeric with optional decimals (0-2 places)
        // Matches: "120", "90.5", "0", "999.99"
        // Rejects: "-10", "abc", "12.345"
        duration: /^(0|[1-9]\d*)(\.\d{1,2})?$/,

        // Pattern 3: Date validation - YYYY-MM-DD format
        // Matches: "2025-09-29", "2025-01-01", "2025-12-31"
        // Rejects: "29-09-2025", "2025/09/29", "2025-13-01"
        date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,

        // Pattern 4: Tag validation - letters, spaces, hyphens only
        // Matches: "Computer Science", "Work-Related", "Academic"
        // Rejects: "Tag123", "Tag@Work", "123"
        tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,

        // Pattern 5 (Advanced): Duplicate word detection using back-reference
        // Matches: "finish finish", "the the task", "hello hello world"
        // Rejects: "finish task", "the task"
        duplicateWord: /\b(\w+)\s+\1\b/i,

        // Additional pattern: Regex pattern validation for search
        // Used to validate user-entered regex patterns
        regexPattern: /^.+$/
    };

    /**
     * Validate title
     * @param {string} title - Title to validate
     * @returns {object} { valid: boolean, error: string }
     */
    const validateTitle = (title) => {
        if (!title || typeof title !== 'string') {
            return { valid: false, error: 'Title is required' };
        }

        const trimmed = title.trim();
        
        if (trimmed.length === 0) {
            return { valid: false, error: 'Title cannot be empty' };
        }

        if (trimmed.length > 100) {
            return { valid: false, error: 'Title must be 100 characters or less' };
        }

        if (!patterns.title.test(trimmed)) {
            return { valid: false, error: 'Title cannot have leading/trailing spaces or consecutive spaces' };
        }

        // Check for duplicate words (advanced pattern)
        if (patterns.duplicateWord.test(trimmed)) {
            return { valid: false, error: 'Title contains duplicate consecutive words' };
        }

        return { valid: true, error: '' };
    };

    /**
     * Validate duration
     * @param {string} duration - Duration to validate
     * @returns {object} { valid: boolean, error: string }
     */
    const validateDuration = (duration) => {
        if (!duration || typeof duration !== 'string') {
            return { valid: false, error: 'Duration is required' };
        }

        const trimmed = duration.trim();

        if (trimmed.length === 0) {
            return { valid: false, error: 'Duration cannot be empty' };
        }

        if (!patterns.duration.test(trimmed)) {
            return { valid: false, error: 'Duration must be a positive number with up to 2 decimal places' };
        }

        const num = parseFloat(trimmed);
        
        if (num < 0) {
            return { valid: false, error: 'Duration must be positive' };
        }

        if (num > 10000) {
            return { valid: false, error: 'Duration must be less than 10000' };
        }

        return { valid: true, error: '' };
    };

    /**
     * Validate date
     * @param {string} date - Date to validate in YYYY-MM-DD format
     * @returns {object} { valid: boolean, error: string }
     */
    const validateDate = (date) => {
        if (!date || typeof date !== 'string') {
            return { valid: false, error: 'Date is required' };
        }

        if (!patterns.date.test(date)) {
            return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
        }

        // Additional validation: check if date is valid
        const dateObj = new Date(date + 'T00:00:00Z');
        if (isNaN(dateObj.getTime())) {
            return { valid: false, error: 'Invalid date' };
        }

        return { valid: true, error: '' };
    };

    /**
     * Validate tag
     * @param {string} tag - Tag to validate
     * @returns {object} { valid: boolean, error: string }
     */
    const validateTag = (tag) => {
        if (!tag || typeof tag !== 'string') {
            return { valid: false, error: 'Tag is required' };
        }

        const trimmed = tag.trim();

        if (trimmed.length === 0) {
            return { valid: false, error: 'Tag cannot be empty' };
        }

        if (trimmed.length > 50) {
            return { valid: false, error: 'Tag must be 50 characters or less' };
        }

        if (!patterns.tag.test(trimmed)) {
            return { valid: false, error: 'Tag can only contain letters, spaces, and hyphens' };
        }

        return { valid: true, error: '' };
    };

    /**
     * Validate entire task object
     * @param {object} task - Task object with title, dueDate, duration, tag
     * @returns {object} { valid: boolean, errors: object }
     */
    const validateTask = (task) => {
        const errors = {};

        const titleValidation = validateTitle(task.title);
        if (!titleValidation.valid) {
            errors.title = titleValidation.error;
        }

        const dateValidation = validateDate(task.dueDate);
        if (!dateValidation.valid) {
            errors.dueDate = dateValidation.error;
        }

        const durationValidation = validateDuration(task.duration);
        if (!durationValidation.valid) {
            errors.duration = durationValidation.error;
        }

        const tagValidation = validateTag(task.tag);
        if (!tagValidation.valid) {
            errors.tag = tagValidation.error;
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    };

    /**
     * Compile and validate regex pattern
     * @param {string} pattern - Regex pattern string
     * @param {string} flags - Regex flags (default: 'i' for case-insensitive)
     * @returns {object} { regex: RegExp|null, error: string }
     */
    const compileRegex = (pattern, flags = 'i') => {
        if (!pattern || typeof pattern !== 'string') {
            return { regex: null, error: '' };
        }

        try {
            const regex = new RegExp(pattern, flags);
            return { regex, error: '' };
        } catch (e) {
            return { regex: null, error: `Invalid regex: ${e.message}` };
        }
    };

    /**
     * Validate JSON import data
     * @param {string} jsonString - JSON string to validate
     * @returns {object} { valid: boolean, data: array, error: string }
     */
    const validateImportJSON = (jsonString) => {
        try {
            const data = JSON.parse(jsonString);

            if (!Array.isArray(data)) {
                return { valid: false, data: null, error: 'Data must be an array' };
            }

            // Validate each record
            for (let i = 0; i < data.length; i++) {
                const record = data[i];

                if (!record.id || typeof record.id !== 'string') {
                    return { valid: false, data: null, error: `Record ${i}: Missing or invalid id` };
                }

                if (!record.title || typeof record.title !== 'string') {
                    return { valid: false, data: null, error: `Record ${i}: Missing or invalid title` };
                }

                if (!record.dueDate || typeof record.dueDate !== 'string') {
                    return { valid: false, data: null, error: `Record ${i}: Missing or invalid dueDate` };
                }

                if (record.duration === undefined || record.duration === null) {
                    return { valid: false, data: null, error: `Record ${i}: Missing duration` };
                }

                if (!record.tag || typeof record.tag !== 'string') {
                    return { valid: false, data: null, error: `Record ${i}: Missing or invalid tag` };
                }

                if (!record.createdAt || typeof record.createdAt !== 'string') {
                    return { valid: false, data: null, error: `Record ${i}: Missing or invalid createdAt` };
                }

                if (!record.updatedAt || typeof record.updatedAt !== 'string') {
                    return { valid: false, data: null, error: `Record ${i}: Missing or invalid updatedAt` };
                }
            }

            return { valid: true, data, error: '' };
        } catch (e) {
            return { valid: false, data: null, error: `JSON parse error: ${e.message}` };
        }
    };

    /**
     * Check if text matches regex and return matches with positions
     * @param {string} text - Text to search
     * @param {RegExp} regex - Compiled regex pattern
     * @returns {array} Array of match objects { text, index }
     */
    const findMatches = (text, regex) => {
        if (!regex || !text) return [];

        const matches = [];
        let match;
        const regexWithG = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');

        while ((match = regexWithG.exec(text)) !== null) {
            matches.push({
                text: match[0],
                index: match.index,
                length: match[0].length
            });
        }

        return matches;
    };

    /**
     * Highlight matches in text
     * @param {string} text - Text to highlight
     * @param {RegExp} regex - Compiled regex pattern
     * @returns {string} HTML with highlighted matches
     */
    const highlightMatches = (text, regex) => {
        if (!regex || !text) return text;

        return text.replace(regex, (match) => `<mark>${escapeHtml(match)}</mark>`);
    };

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Public API
    return {
        patterns,
        validateTitle,
        validateDuration,
        validateDate,
        validateTag,
        validateTask,
        compileRegex,
        validateImportJSON,
        findMatches,
        highlightMatches,
        escapeHtml
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = validators;
}
