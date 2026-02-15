# M1 - Specification & Wireframes: Campus Life Planner

## Project Overview

**Theme:** Campus Life Planner  
**Description:** A task and event management application for students to organize their academic and campus activities.  
**Target Users:** College/university students managing multiple courses, events, and deadlines.

---

## Data Model

### Task/Event Record Structure

```json
{
  "id": "task_0001",
  "title": "Finish CS101 Assignment",
  "dueDate": "2025-09-29",
  "duration": "120",
  "tag": "Academic",
  "createdAt": "2025-09-15T10:30:00Z",
  "updatedAt": "2025-09-15T10:30:00Z"
}
```

**Fields:**

- `id`: Unique identifier (auto-generated, format: `task_XXXX`)
- `title`: Task/event name (required, 1-100 chars)
- `dueDate`: Due date in YYYY-MM-DD format
- `duration`: Time estimate in minutes (numeric)
- `tag`: Category/tag (e.g., Academic, Personal, Social, Work)
- `createdAt`: ISO 8601 timestamp
- `updatedAt`: ISO 8601 timestamp

---

## Core Features

### A) Pages/Sections

1. **About Page**
   - Purpose statement: "Campus Life Planner helps you organize tasks, events, and deadlines"
   - Contact information (GitHub, email)
   - Feature overview

2. **Dashboard/Stats**
   - Total tasks count
   - Tasks by tag distribution
   - Upcoming tasks (next 7 days)
   - Completion rate
   - Time commitment summary
   - Cap/target logic (e.g., "Target: 20 hours/week")

3. **Tasks Table/Cards**
   - Display all records in table format (desktop) or cards (mobile)
   - Columns: Title, Due Date, Duration, Tag, Actions
   - Sortable by: Date (↑↓), Title (A↕Z), Duration (↑↓)
   - Inline edit and delete actions

4. **Add/Edit Form**
   - Modal or dedicated section
   - Fields: Title, Due Date, Duration, Tag
   - Real-time validation feedback
   - Submit and Cancel buttons

5. **Settings Page**
   - Unit conversion (minutes ↔ hours)
   - Tag management (add/edit/remove default tags)
   - Weekly time cap (target hours)
   - Import/Export JSON
   - Clear all data (with confirmation)

---

## Regex Validation Patterns

### Required Patterns (4+)

1. **Title Validation** (forbid leading/trailing spaces, collapse doubles)

   ```regex
   ^\S(?:.*\S)?$
   ```

   - Example: "Finish CS101 Assignment" ✓
   - Example: "  Invalid  " ✗

2. **Duration Validation** (numeric, optional decimals)

   ```regex
   ^(0|[1-9]\d*)(\.\d{1,2})?$
   ```

   - Example: "120" ✓, "90.5" ✓
   - Example: "-10" ✗, "abc" ✗

3. **Date Validation** (YYYY-MM-DD format)

   ```regex
   ^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$
   ```

   - Example: "2025-09-29" ✓
   - Example: "29-09-2025" ✗

4. **Tag Validation** (letters, spaces, hyphens)

   ```regex
   ^[A-Za-z]+(?:[ -][A-Za-z]+)*$
   ```

   - Example: "Computer Science" ✓, "Work-Related" ✓
   - Example: "Tag123" ✗

### Advanced Pattern (≥1)

1. **Duplicate Word Detection** (back-reference)

   ```regex
   \b(\w+)\s+\1\b
   ```

   - Detects repeated words in title
   - Example: "Finish finish assignment" ✗
   - Used for validation warning

---

## Search & Filtering

### Live Regex Search

- User types a regex pattern in search box
- Compile with try/catch for safety
- Case-insensitive toggle
- Highlight matches with `<mark>` tag
- Search across: title, tag, date

### Example Patterns

- `@tag:Academic` - Filter by tag
- `\d{2}:\d{2}` - Find time tokens
- `due|assignment|exam` - Multiple keywords

---

## Accessibility (a11y) Plan

### Semantic HTML

- `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` landmarks
- Proper heading hierarchy (h1, h2, h3)
- `<label>` bound to inputs via `for` attribute
- `<table>` with `<thead>`, `<tbody>`, `<th>`, `<td>`

### Keyboard Navigation

- Tab order through form fields and buttons
- Enter to submit, Escape to cancel
- Arrow keys for table navigation (optional enhancement)
- Skip-to-content link in header

### Focus & Visibility

- Visible focus ring on all interactive elements
- Focus outline color: high contrast (e.g., blue on white)
- No focus trap; logical tab order

### ARIA Live Regions

- `role="status"` for form validation messages
- `aria-live="polite"` for non-urgent updates (stats changes)
- `aria-live="assertive"` for urgent alerts (cap exceeded)
- `aria-label` for icon buttons

### Color Contrast

- Minimum 4.5:1 ratio for text
- Light background (#f8f9fa) with dark text (#1a1a1a)
- Links in distinct color (e.g., #0066cc)

### Mobile Accessibility

- Touch targets ≥44px × 44px
- Readable font size (≥16px base)
- Sufficient spacing between interactive elements

---

## Responsive Design Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | ~360px | Single column, stacked cards, hamburger nav |
| Tablet | ~768px | Two columns, flexible grid, sidebar nav |
| Desktop | ~1024px+ | Three columns, full table, fixed sidebar |

---

## Design System

### Color Palette

- **Primary:** #0066cc (blue, links, active states)
- **Background:** #f8f9fa (light gray, main bg)
- **Card:** #ffffff (white, card backgrounds)
- **Text:** #1a1a1a (dark gray, body text)
- **Border:** #e0e0e0 (light gray, dividers)
- **Success:** #28a745 (green, confirmations)
- **Warning:** #ffc107 (amber, alerts)
- **Error:** #dc3545 (red, errors)

### Typography

- **Display Font:** Georgia or serif (headings)
- **Body Font:** -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Font Sizes:** 12px (small), 14px (body), 16px (large), 20px (h3), 24px (h2), 32px (h1)

### Spacing

- **Base unit:** 8px
- **Padding:** 8px, 16px, 24px, 32px
- **Margin:** 8px, 16px, 24px, 32px
- **Gap:** 16px (flex/grid)

### Animations

- **Fade-in:** 300ms ease-in-out (page load, modals)
- **Slide:** 300ms ease-in-out (sidebar, dropdowns)
- **Bounce:** 200ms ease-out (button press)
- **Highlight:** 500ms ease-in-out (search results)

---

## Wireframe Layout

### Desktop Layout (1024px+)

```
┌─────────────────────────────────────────────────────┐
│ Header: Logo | Nav (About, Dashboard, Settings)     │
├──────────────┬──────────────────────────────────────┤
│ Sidebar Nav  │ Main Content Area                    │
│ - Dashboard  │ ┌────────────────────────────────┐   │
│ - Tasks      │ │ Page Title / Breadcrumb        │   │
│ - Settings   │ ├────────────────────────────────┤   │
│ - About      │ │ Content (Table/Cards/Form)     │   │
│              │ │                                │   │
│              │ │                                │   │
│              │ └────────────────────────────────┘   │
├──────────────┴──────────────────────────────────────┤
│ Footer: Copyright, Links                           │
└─────────────────────────────────────────────────────┘
```

### Tablet Layout (768px)

```
┌──────────────────────────────────┐
│ Header: Logo | Hamburger Menu    │
├──────────────────────────────────┤
│ Main Content (Full Width)        │
│ ┌────────────────────────────┐   │
│ │ Page Title                 │   │
│ ├────────────────────────────┤   │
│ │ Content (2-col grid)       │   │
│ │                            │   │
│ └────────────────────────────┘   │
├──────────────────────────────────┤
│ Footer                           │
└──────────────────────────────────┘
```

### Mobile Layout (360px)

```
┌──────────────────┐
│ Header: Logo | ☰ │
├──────────────────┤
│ Main Content     │
│ ┌──────────────┐ │
│ │ Page Title   │ │
│ ├──────────────┤ │
│ │ Content      │ │
│ │ (1 column)   │ │
│ │              │ │
│ └──────────────┘ │
├──────────────────┤
│ Footer           │
└──────────────────┘
```

---

## Key Interactions

### Add/Edit Task

1. User clicks "Add Task" button
2. Modal opens with form
3. Form validates on blur and submit
4. On submit: save to localStorage, update UI, show success toast
5. Modal closes, user returns to task list

### Search & Filter

1. User types regex pattern in search box
2. Live filtering updates task list
3. Matches highlighted with `<mark>` tag
4. Case-insensitive toggle available

### Sort Tasks

1. User clicks column header (Title, Date, Duration)
2. Sorting direction toggles (↑ ascending, ↓ descending)
3. Table/cards re-render in new order
4. Current sort indicator shown in header

### Import/Export

1. **Export:** User clicks "Export JSON" → downloads JSON file
2. **Import:** User clicks "Import JSON" → file picker → validation → load data
3. Validation checks: required fields, data types, structure

---

## Testing Strategy

### Regex Validation Tests (tests.html)

- Test each pattern with valid and invalid inputs
- Test edge cases (empty, special chars, boundaries)
- Test advanced pattern (duplicate word detection)

### Search Tests

- Test valid regex patterns
- Test invalid patterns (error handling)
- Test case-insensitive toggle
- Test highlight functionality

### Persistence Tests

- Test localStorage save/load
- Test import/export round-trip
- Test data validation on import

### Accessibility Tests

- Keyboard navigation (Tab, Enter, Escape)
- Screen reader compatibility (NVDA/JAWS)
- Color contrast check (WCAG AA)
- Focus visibility

---

## File Structure

```
campus-life-planner/
├── index.html              # Main page
├── tests.html              # Regex & validation tests
├── styles/
│   ├── main.css            # Global styles
│   ├── responsive.css      # Media queries
│   └── animations.css      # Transitions & animations
├── scripts/
│   ├── main.js             # Entry point
│   ├── storage.js          # localStorage operations
│   ├── state.js            # App state management
│   ├── ui.js               # DOM manipulation & rendering
│   ├── validators.js       # Regex validation rules
│   ├── search.js           # Search & filter logic
│   └── utils.js            # Helper functions
├── assets/
│   ├── icons/              # SVG icons
│   └── images/             # Background images
├── seed.json               # Sample data (≥10 records)
└── README.md               # Documentation
```

---

## Success Criteria

- ✓ All 7 milestones completed
- ✓ Semantic HTML with proper landmarks
- ✓ Mobile-first responsive design (3+ breakpoints)
- ✓ 4+ regex validation patterns (1 advanced)
- ✓ Full CRUD operations (create, read, update, delete)
- ✓ localStorage persistence
- ✓ Import/Export JSON with validation
- ✓ Accessible keyboard navigation
- ✓ ARIA live regions for status updates
- ✓ Comprehensive README with regex catalog
- ✓ Seed data with ≥10 diverse records
- ✓ Demo video showing all features
