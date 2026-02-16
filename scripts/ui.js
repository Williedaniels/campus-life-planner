/**
 * UI Module
 * Handles DOM rendering and user interface updates
 */

const ui = (() => {
    /**
     * Render tasks table
     * @param {array} tasks - Array of tasks to render
     */
    const renderTasksTable = (tasks) => {
        const tbody = document.getElementById('tasksTableBody');
        if (!tbody) return;

        if (tasks.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="5" class="empty-state">No tasks yet. Add one to get started!</td></tr>';
            return;
        }

        const regex = state.getSearchRegex();
        tbody.innerHTML = tasks.map(task => `
            <tr>
                <td>${regex ? search.getHighlightedTitle(task, regex) : validators.escapeHtml(task.title)}</td>
                <td>${utils.formatDateDisplay(task.dueDate)}</td>
                <td>${utils.formatDuration(task.duration)}</td>
                <td>${regex ? search.getHighlightedTag(task, regex) : validators.escapeHtml(task.tag)}</td>
                <td>
                    <button class="action-btn edit" data-action="edit" data-id="${task.id}" aria-label="Edit task">Edit</button>
                    <button class="action-btn delete" data-action="delete" data-id="${task.id}" aria-label="Delete task">Delete</button>
                </td>
            </tr>
        `).join('');
    };

    /**
     * Render tasks cards (mobile view)
     * @param {array} tasks - Array of tasks to render
     */
    const renderTasksCards = (tasks) => {
        const container = document.getElementById('tasksCardContainer');
        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = '<p class="empty-state">No tasks yet. Add one to get started!</p>';
            return;
        }

        const regex = state.getSearchRegex();
        container.innerHTML = tasks.map(task => `
            <div class="task-card">
                <div class="task-card-header">
                    <h3 class="task-card-title">${regex ? search.getHighlightedTitle(task, regex) : validators.escapeHtml(task.title)}</h3>
                    <span class="task-card-tag">${validators.escapeHtml(task.tag)}</span>
                </div>
                <div class="task-card-body">
                    <div class="task-card-row">
                        <span class="task-card-label">Due:</span>
                        <span class="task-card-value">${utils.formatDateDisplay(task.dueDate)}</span>
                    </div>
                    <div class="task-card-row">
                        <span class="task-card-label">Duration:</span>
                        <span class="task-card-value">${utils.formatDuration(task.duration)}</span>
                    </div>
                </div>
                <div class="task-card-actions">
                    <button class="action-btn edit" data-action="edit" data-id="${task.id}">Edit</button>
                    <button class="action-btn delete" data-action="delete" data-id="${task.id}">Delete</button>
                </div>
            </div>
        `).join('');
    };

    /**
     * Render tasks (both table and cards)
     * @param {array} tasks - Array of tasks to render
     */
    const renderTasks = (tasks) => {
        renderTasksTable(tasks);
        renderTasksCards(tasks);
    };

    /**
     * Render dashboard stats
     */
    const renderDashboard = () => {
        const stats = state.getStats();

        // Update stat cards
        document.getElementById('totalTasks').textContent = stats.totalTasks;
        document.getElementById('weekTasks').textContent = stats.weekTasks;
        document.getElementById('totalHours').textContent = stats.totalHours.toFixed(1);
        document.getElementById('topTag').textContent = stats.topTag;

        // Update cap status
        updateCapStatus();

        // Render upcoming tasks
        renderUpcomingTasks();

        // Render tag chart
        renderTagChart(stats.tagCounts);
    };

    /**
     * Update cap/target status
     */
    const updateCapStatus = () => {
        const stats = state.getStats();
        const settings = state.getSettings();
        const cap = settings.weeklyCap || 20;
        const used = stats.weeklyHours;
        const remaining = cap - used;
        const percentage = Math.min((used / cap) * 100, 100);

        const capProgress = document.getElementById('capProgress');
        const capStatus = document.getElementById('capStatus');
        const capMessage = document.getElementById('capMessage');

        capProgress.style.width = percentage + '%';
        capStatus.textContent = `${used.toFixed(1)} / ${cap} hours`;

        // Update progress bar color
        capProgress.classList.remove('warning', 'danger');
        capMessage.classList.remove('warning', 'danger');

        if (used > cap) {
            capProgress.classList.add('danger');
            capMessage.classList.add('danger');
            capMessage.textContent = `⚠ Over cap by ${(used - cap).toFixed(1)} hours`;
            capMessage.setAttribute('role', 'alert');
            capMessage.setAttribute('aria-live', 'assertive');
        } else if (used > cap * 0.8) {
            capProgress.classList.add('warning');
            capMessage.classList.add('warning');
            capMessage.textContent = `${remaining.toFixed(1)} hours remaining`;
            capMessage.setAttribute('aria-live', 'polite');
        } else {
            capMessage.textContent = `${remaining.toFixed(1)} hours remaining`;
            capMessage.setAttribute('aria-live', 'polite');
        }
    };

    /**
     * Render upcoming tasks
     */
    const renderUpcomingTasks = () => {
        const upcomingList = document.getElementById('upcomingList');
        if (!upcomingList) return;

        const upcoming = state.getUpcomingTasks(7);

        if (upcoming.length === 0) {
            upcomingList.innerHTML = '<p class="empty-state">No upcoming tasks</p>';
            return;
        }

        upcomingList.innerHTML = upcoming.slice(0, 5).map(task => `
            <div class="upcoming-item">
                <div class="upcoming-item-title">${validators.escapeHtml(task.title)}</div>
                <div class="upcoming-item-date">${utils.formatDateDisplay(task.dueDate)} • ${utils.formatDuration(task.duration)}</div>
            </div>
        `).join('');
    };

    /**
     * Render tag distribution chart
     * @param {object} tagCounts - Tag count object
     */
    const renderTagChart = (tagCounts) => {
        const tagChart = document.getElementById('tagChart');
        if (!tagChart) return;

        if (Object.keys(tagCounts).length === 0) {
            tagChart.innerHTML = '<p class="empty-state">No data yet</p>';
            return;
        }

        const total = Object.values(tagCounts).reduce((a, b) => a + b, 0);
        const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

        tagChart.innerHTML = sorted.map(([tag, count]) => {
            const percentage = (count / total) * 100;
            return `
                <div class="tag-bar">
                    <div class="tag-bar-label">
                        <span>${validators.escapeHtml(tag)}</span>
                        <span>${count}</span>
                    </div>
                    <div class="tag-bar-fill">
                        <div class="tag-bar-progress" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    };

    /**
     * Populate tag select dropdown
     */
    const populateTagSelect = () => {
        const tagSelect = document.getElementById('tagSelect');
        if (!tagSelect) return;

        const tags = state.getTags();
        tagSelect.innerHTML = '<option value="">Select a tag...</option>' + tags.map(tag => `
            <option value="${validators.escapeHtml(tag)}">${validators.escapeHtml(tag)}</option>
        `).join('');
    };

    /**
     * Render tags list in settings
     */
    const renderTagsList = () => {
        const tagsList = document.getElementById('tagsList');
        if (!tagsList) return;

        const tags = state.getTags();
        tagsList.innerHTML = tags.map(tag => `
            <div class="tag-badge">
                <span>${validators.escapeHtml(tag)}</span>
                <button class="tag-badge-remove" data-tag="${validators.escapeHtml(tag)}" aria-label="Remove tag">×</button>
            </div>
        `).join('');
    };

    /**
     * Show task modal
     * @param {object} task - Task object (null for new task)
     */
    const showTaskModal = (task = null) => {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');

        if (task) {
            modalTitle.textContent = 'Edit Task';
            document.getElementById('titleInput').value = task.title;
            document.getElementById('dateInput').value = task.dueDate;
            document.getElementById('durationInput').value = task.duration;
            document.getElementById('tagSelect').value = task.tag;
            state.setEditingTaskId(task.id);
        } else {
            modalTitle.textContent = 'Add Task';
            form.reset();
            state.setEditingTaskId(null);
        }

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.getElementById('titleInput').focus();
    };

    /**
     * Hide task modal
     */
    const hideTaskModal = () => {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        state.setEditingTaskId(null);
    };

    /**
     * Show page
     * @param {string} pageName - Page name
     */
    const showPage = (pageName) => {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const page = document.getElementById(`${pageName}-page`);
        if (page) {
            page.classList.add('active');
        }

        // Update nav active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });

        state.setCurrentPage(pageName);

        // Render page content
        if (pageName === 'dashboard') {
            renderDashboard();
        } else if (pageName === 'tasks') {
            renderTasks(state.getFilteredTasks());
        } else if (pageName === 'settings') {
            populateTagSelect();
            renderTagsList();
            updateSettingsForm();
        }
    };

    /**
     * Update settings form with current values
     */
    const updateSettingsForm = () => {
        const settings = state.getSettings();
        const unitSelect = document.getElementById('unitSelect');
        const capInput = document.getElementById('capInput');

        if (unitSelect) unitSelect.value = settings.unit || 'minutes';
        if (capInput) capInput.value = settings.weeklyCap || 20;

        updateThemeToggle();
    };

    /**
     * Update theme toggle state
     */
    const updateThemeToggle = () => {
        const settings = state.getSettings();
        const themeToggle = document.getElementById('themeToggle');

        if (themeToggle) {
            themeToggle.checked = settings.theme === 'dark';
        }
    };

    /**
     * Clear form errors
     */
    const clearFormErrors = () => {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        document.querySelectorAll('.form-control.error').forEach(el => {
            el.classList.remove('error');
        });
    };

    /**
     * Show form errors
     * @param {object} errors - Error object with field names as keys
     */
    const showFormErrors = (errors) => {
        clearFormErrors();

        Object.entries(errors).forEach(([field, message]) => {
            const errorEl = document.getElementById(`${field}Error`);
            const inputEl = document.getElementById(`${field}Input`) || document.getElementById(`${field}Select`);

            if (errorEl) {
                errorEl.textContent = message;
            }
            if (inputEl) {
                inputEl.classList.add('error');
            }
        });
    };

    /**
     * Toggle navigation menu
     */
    const toggleMenu = () => {
        const nav = document.getElementById('mainNav');
        const toggle = document.getElementById('menuToggle');

        nav.classList.toggle('hidden');
        toggle.classList.toggle('active');
    };

    /**
     * Close navigation menu
     */
    const closeMenu = () => {
        const nav = document.getElementById('mainNav');
        const toggle = document.getElementById('menuToggle');

        nav.classList.add('hidden');
        toggle.classList.remove('active');
    };

    /**
     * Update sort button states
     */
    const updateSortButtons = () => {
        const { sortBy, sortOrder } = state.getSortOptions();

        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.sort === sortBy) {
                btn.classList.add('active');
                const icon = btn.querySelector('.sort-icon');
                if (icon) {
                    icon.textContent = sortOrder === 'asc' ? '↑' : '↓';
                }
            }
        });
    };

    // Public API
    return {
        renderTasks,
        renderTasksTable,
        renderTasksCards,
        renderDashboard,
        updateCapStatus,
        renderUpcomingTasks,
        renderTagChart,
        populateTagSelect,
        renderTagsList,
        showTaskModal,
        hideTaskModal,
        showPage,
        updateSettingsForm,
        updateThemeToggle,
        clearFormErrors,
        showFormErrors,
        toggleMenu,
        closeMenu,
        updateSortButtons
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ui;
}
