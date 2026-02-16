/**
 * Main Module
 * Event handlers and application initialization
 */

// Initialize application on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize state
    state.init();

    // Apply theme
    setupTheme();

    // Render initial page
    ui.showPage('dashboard');

    // Populate tag select
    ui.populateTagSelect();

    // Setup event listeners
    setupEventListeners();

    // Announce page ready to screen readers
    utils.announce('Campus Life Planner loaded and ready');
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Navigation
    setupNavigationListeners();

    // Tasks page
    setupTasksPageListeners();

    // Modal
    setupModalListeners();

    // Settings page
    setupSettingsListeners();

    // Search
    setupSearchListeners();

    // Sort
    setupSortListeners();

    // Menu toggle
    setupMenuListeners();

    // Theme toggle
    setupThemeListeners();
}

/**
 * Setup navigation event listeners
 */
function setupNavigationListeners() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            ui.showPage(page);
            ui.closeMenu();
        });
    });
}

/**
 * Setup tasks page event listeners
 */
function setupTasksPageListeners() {
    // Add task button
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            ui.showTaskModal();
        });
    }

    // Task actions (edit/delete) - using event delegation
    utils.delegate(document, '[data-action="edit"]', 'click', function(e) {
        e.preventDefault();
        const taskId = this.dataset.id;
        const task = state.getTaskById(taskId);
        if (task) {
            ui.showTaskModal(task);
        }
    });

    utils.delegate(document, '[data-action="delete"]', 'click', function(e) {
        e.preventDefault();
        const taskId = this.dataset.id;
        if (confirm('Are you sure you want to delete this task?')) {
            state.deleteTask(taskId);
            const tasks = state.getFilteredTasks();
            ui.renderTasks(tasks);
            ui.renderDashboard();
            utils.showToast('Task deleted successfully', 'success');
            utils.announce('Task deleted');
        }
    });
}

/**
 * Setup modal event listeners
 */
function setupModalListeners() {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');

    // Close button
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            ui.hideTaskModal();
        });
    }

    // Cancel button
    if (modalCancel) {
        modalCancel.addEventListener('click', () => {
            ui.hideTaskModal();
        });
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            ui.hideTaskModal();
        }
    });

    // Form submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get form values
            const title = document.getElementById('titleInput').value;
            const dueDate = document.getElementById('dateInput').value;
            const duration = document.getElementById('durationInput').value;
            const tag = document.getElementById('tagSelect').value;

            // Validate form
            const validation = validators.validateTask({
                title,
                dueDate,
                duration,
                tag
            });

            if (!validation.valid) {
                ui.showFormErrors(validation.errors);
                return;
            }

            // Clear errors
            ui.clearFormErrors();

            // Get editing task ID
            const editingId = state.getEditingTaskId();

            if (editingId) {
                // Update existing task
                state.updateTask(editingId, {
                    title,
                    dueDate,
                    duration: parseFloat(duration),
                    tag
                });
                utils.showToast('Task updated successfully', 'success');
                utils.announce('Task updated');
            } else {
                // Add new task
                state.addTask({
                    title,
                    dueDate,
                    duration: parseFloat(duration),
                    tag
                });
                utils.showToast('Task added successfully', 'success');
                utils.announce('Task added');
            }

            // Close modal and refresh UI
            ui.hideTaskModal();
            const tasks = state.getFilteredTasks();
            ui.renderTasks(tasks);
            ui.renderDashboard();
        });
    }
}

/**
 * Setup settings page event listeners
 */
function setupSettingsListeners() {
    // Unit select
    const unitSelect = document.getElementById('unitSelect');
    if (unitSelect) {
        unitSelect.addEventListener('change', (e) => {
            state.updateSettings({ unit: e.target.value });
            utils.showToast('Settings saved', 'success');
        });
    }

    // Cap input
    const capInput = document.getElementById('capInput');
    if (capInput) {
        capInput.addEventListener('change', (e) => {
            const value = parseFloat(e.target.value);
            if (value > 0 && value <= 168) {
                state.updateSettings({ weeklyCap: value });
                ui.renderDashboard();
                utils.showToast('Weekly cap updated', 'success');
            } else {
                e.target.value = state.getSettings().weeklyCap;
                utils.showToast('Invalid value', 'error');
            }
        });
    }

    // Add tag button
    const addTagBtn = document.getElementById('addTagBtn');
    const newTagInput = document.getElementById('newTagInput');
    if (addTagBtn) {
        addTagBtn.addEventListener('click', () => {
            const tag = newTagInput.value.trim();
            if (tag) {
                const validation = validators.validateTag(tag);
                if (validation.valid) {
                    if (state.addTag(tag)) {
                        ui.renderTagsList();
                        ui.populateTagSelect();
                        newTagInput.value = '';
                        utils.showToast(`Tag "${tag}" added`, 'success');
                    } else {
                        utils.showToast('Tag already exists', 'warning');
                    }
                } else {
                    utils.showToast(validation.error, 'error');
                }
            }
        });
    }

    // Remove tag - using event delegation
    utils.delegate(document, '.tag-badge-remove', 'click', function(e) {
        e.preventDefault();
        const tag = this.dataset.tag;
        if (confirm(`Remove tag "${tag}"?`)) {
            state.removeTag(tag);
            ui.renderTagsList();
            ui.populateTagSelect();
            utils.showToast(`Tag "${tag}" removed`, 'success');
        }
    });

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = state.exportData();
            if (data) {
                utils.downloadFile(data, 'campus-life-planner-export.json', 'application/json');
                utils.showToast('Data exported successfully', 'success');
            } else {
                utils.showToast('Export failed', 'error');
            }
        });
    }

    // Import button
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            importFile.click();
        });
    }

    if (importFile) {
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = state.importData(event.target.result);
                    if (result.success) {
                        ui.showPage('dashboard');
                        utils.showToast('Data imported successfully', 'success');
                        utils.announce('Data imported successfully');
                    } else {
                        utils.showToast(`Import failed: ${result.error}`, 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
    }

    // Clear button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
                state.clearAllData();
                ui.showPage('dashboard');
                utils.showToast('All data cleared', 'success');
                utils.announce('All data cleared');
            }
        });
    }
}

/**
 * Setup search event listeners
 */
function setupSearchListeners() {
    const searchInput = document.getElementById('searchInput');
    const caseToggle = document.getElementById('caseToggle');

    if (searchInput) {
        // Debounce search to avoid too many updates
        const debouncedSearch = utils.debounce(() => {
            const query = searchInput.value;
            const caseSensitive = caseToggle ? caseToggle.checked : false;
            state.setSearchQuery(query, caseSensitive);
            const tasks = state.getFilteredTasks();
            ui.renderTasks(tasks);

            // Update search status
            if (query) {
                const stats = search.getSearchStats(state.getTasks(), tasks);
                utils.announce(`Search found ${stats.results} of ${stats.total} tasks`);
            }
        }, 300);

        searchInput.addEventListener('input', debouncedSearch);
    }

    if (caseToggle) {
        caseToggle.addEventListener('change', () => {
            const query = searchInput.value;
            const caseSensitive = caseToggle.checked;
            state.setSearchQuery(query, caseSensitive);
            const tasks = state.getFilteredTasks();
            ui.renderTasks(tasks);
        });
    }
}

/**
 * Setup sort event listeners
 */
function setupSortListeners() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sortField = btn.dataset.sort;
            state.setSortOptions(sortField);
            ui.updateSortButtons();
            const tasks = state.getFilteredTasks();
            ui.renderTasks(tasks);
            utils.announce(`Sorted by ${sortField}`);
        });
    });
}

/**
 * Setup menu toggle listeners
 */
function setupMenuListeners() {
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            ui.toggleMenu();
        });
    }

    // Close menu when clicking on a nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            ui.closeMenu();
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const nav = document.getElementById('mainNav');
        const toggle = document.getElementById('menuToggle');
        if (nav && toggle && !nav.contains(e.target) && !toggle.contains(e.target)) {
            ui.closeMenu();
        }
    });
}

/**
 * Setup theme toggle listeners
 */
function setupThemeListeners() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            const isChecked = themeToggle.checked;
            const theme = isChecked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            state.updateSettings({ theme });
        });
    }
}

/**
 * Set initial theme
 */
function setupTheme() {
    const settings = state.getSettings();
    const savedTheme = settings.theme;
    const themeToggle = document.getElementById('themeToggle');

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (themeToggle) {
            themeToggle.checked = savedTheme === 'dark';
        }
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        if (themeToggle) {
            themeToggle.checked = prefersDark;
        }
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupEventListeners,
        setupNavigationListeners,
        setupTasksPageListeners,
        setupModalListeners,
        setupSettingsListeners,
        setupSearchListeners,
        setupSortListeners,
        setupMenuListeners,
        setupThemeListeners,
        setupTheme
    };
}
