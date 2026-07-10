# Second Project Scan — New Issues

Scan date: 2026-07-11

Scope: second-pass review of first-party HTML, CSS, JavaScript, client-side workflows, internal references, accessibility, responsive behavior, and the new validation tooling. Previously documented demo constraints were not repeated.

Validation baseline: `npm test` passes, but this scan found gaps that the current checker does not cover.

## Critical Issues

### 1. Shared back-to-top script crashes on pages without its button — Resolved

- **Category:** Important
- **Fix type:** Component fix
- **Evidence:** `All pages/assest/js/home-about.js:1-8` dereferences `btn.style` from the global scroll handler. Only `index.html` and `about.html` define `id="btn"`, while several other pages load the script.
- **Impact:** Scrolling Profile, Feedback, Services, Privacy Policy, or Edit Profile throws a runtime error.
- **Suggested fix:** Make the handler null-safe and attach the click behavior only when the control exists.

### 2. Stored feedback can execute arbitrary HTML — Resolved

- **Category:** Critical
- **Fix type:** Component fix
- **Evidence:** `All pages/assets/javascripts/feedback.js:16`, `:34-35`, and `:41-44` interpolate locally stored subject, message, name, title, and email values into `innerHTML`. Those values originate from the contact form and are saved directly at `contact_us.html:640-652`.
- **Impact:** A feedback entry containing malicious markup can execute in the protected feedback page, access browser-stored HR data, and alter the demo session.
- **Suggested fix:** Build feedback cards with DOM nodes and `textContent`. Do not insert feedback fields through `innerHTML`.

### 3. The Services page loads invalid JavaScript — Resolved

- **Category:** Critical
- **Fix type:** Component fix
- **Evidence:** `All pages/Services.html:498` loads `services asset/index.js` as a classic script, while `services asset/index.js:2` uses an ES-module `import` from the unresolved bare package name `mdb-ui-kit`.
- **Impact:** Browsers report a syntax/module-resolution error on every Services page load. The imported library is neither installed nor mapped, and the initialization is unnecessary for the Bootstrap navbar already used by the page.
- **Suggested fix:** Remove the unused script or replace it with valid local code. Do not convert it to `type="module"` unless the dependency is actually installed and bundled.

## Important Functional Issues

### 4. Dashboard tables share mutable module-level state — Resolved

- **Category:** Important
- **Fix type:** Component fix
- **Evidence:** `table_maker.js:2-7` stores the active table, data, headings, filter, and sort option in module-level variables. `dashboard.html:348-352` imports employee, task, and leave table modules, and each calls `createTable`, overwriting that shared state.
- **Impact:** Filtering, sorting, or changing columns can operate on whichever table initialized last rather than the visible table. Multiple table instances cannot work independently.
- **Suggested fix:** Replace the singleton globals with a `TableController` instance per table, or make `createTable` return closures bound to that table and dataset.

### 5. Task edit state leaks between modal sessions — Resolved

- **Category:** Important
- **Fix type:** Interaction-state fix
- **Evidence:** `create_new_task.js:85` pushes selected employees into `selectedEmployees`, while `restForm()` at `:165-169` clears only the form and rendered badges—not the array or hidden employee options. Editing a task calls `selectEmployeeToTheTask` again at `:263-265`.
- **Impact:** Previously selected employees can silently carry into new tasks, edited employees can accumulate, and hidden dropdown options may remain unavailable.
- **Suggested fix:** Reset `selectedEmployees = []`, restore all employee options, and populate edit state from a fresh copy each time the modal opens.

### 6. Moving a task during edit leaves the old status count incorrect — Resolved

- **Category:** Important
- **Fix type:** Interaction-state fix
- **Evidence:** When an edited task changes status, `create_new_task.js:119-121` removes the old card and adds the new card. `addTaskToPage()` increments the new group counter at `:231-233`, but `deleteTaskCard()` at `:154-157` never decrements the old group counter.
- **Impact:** Task-column totals become inaccurate until the page is reloaded.
- **Suggested fix:** Recalculate both counters from the task collection after every create, edit, and drag operation rather than incrementing DOM text manually.

### 7. Leave “Edit” buttons open a blank add form — Resolved

- **Category:** Important
- **Fix type:** Interaction-state fix
- **Evidence:** Row editing is inferred from `event.target.parentNode` at `leave_aplications.js:268-277`. Clicking the generated Edit button makes the parent a `TD`, so that handler does not set `editMode` or load the leave. The button’s own listener at `:310-312` only opens the modal.
- **Impact:** The visible Edit action can create a new leave instead of editing the intended row.
- **Suggested fix:** Give each Edit button the leave ID and call one explicit `beginEdit(leaveId)` function. Avoid document-wide click inference.

### 8. Internal navigation contains confirmed broken links — Resolved

- **Category:** Important
- **Fix type:** Content fix
- **Evidence:** `feedback.html:75` links to `All pages/Services.html` and `feedback.html:82` links to `All pages/contact_us.html`; from within `All pages`, both resolve to a nonexistent nested directory. The root footer links at `index.html:526` and `:545-547` point to `../index.html`, `about.html`, and `contact_us.html`, which are also incorrect from the repository root.
- **Impact:** Several navbar/footer links lead to 404 pages.
- **Suggested fix:** Correct the references and extend the project checker to validate every local `href` and `src` from the containing document.

### 9. Authentication forms and feedback cards overflow on mobile — Resolved

- **Category:** Important
- **Fix type:** Layout fix
- **Evidence:** `login assets/login.css:18-19` fixes the login panel at `600px × 450px`; `register assets/register.css:18` also fixes its width at `600px`. Neither stylesheet contains a responsive media query. `assets/css/feedback.css:25-26` fixes cards at `440px × 260px` without a narrow-screen override.
- **Impact:** Content overflows viewports below those widths, especially after padding and borders are included.
- **Suggested fix:** Use `width: min(100% - 2rem, 600px)`, content-driven height, responsive padding, and mobile card layouts without fixed dimensions.

### 10. Login, registration, and contact fields lack proper labels — Resolved

- **Category:** Important
- **Fix type:** Accessibility fix
- **Evidence:** Login fields at `login.html:142-159` and registration fields at `register.html:148-171` rely on placeholders. Contact-field captions at `contact_us.html:489-518` are `<p>` elements rather than `<label for="...">`. Error containers lack `aria-live`/`aria-describedby` relationships.
- **Impact:** Screen-reader users lack reliable field names and error association; placeholders disappear while typing. Browser autofill behavior is also weaker without `name` and `autocomplete` metadata.
- **Suggested fix:** Add visible labels, stable `name` attributes, correct `autocomplete` tokens, `aria-describedby`, and polite live regions for validation errors.

### 11. Custom authentication controls remove focus outlines — Resolved

- **Category:** Important
- **Fix type:** Accessibility fix
- **Evidence:** `login assets/login.css:48,87` and `register assets/register.css:48,86` set `outline: none` on inputs/buttons without adding an equivalent `:focus-visible` treatment.
- **Impact:** Keyboard users cannot reliably see which field or button is focused.
- **Suggested fix:** Restore the browser outline or add a high-contrast `:focus-visible` ring that meets contrast requirements.

### 12. Feedback content is hover-only and inaccessible on touch/keyboards — Resolved

- **Category:** Important
- **Fix type:** Accessibility fix
- **Evidence:** `assets/css/feedback.css:43-71` hides `.FeedbackText` with `opacity: 0` and reveals it only through `.FullCard:hover`. Cards are non-focusable `<div>` elements created at `feedback.js:20-21`.
- **Impact:** Touch users and keyboard-only users may be unable to reveal the feedback message.
- **Suggested fix:** Keep feedback text visible in the normal card flow, or use an actual button controlling an expandable region with keyboard and focus support.

### 13. Date ranges are not validated — Resolved

- **Category:** Important
- **Fix type:** Interaction-state fix
- **Evidence:** Task submission copies start/due dates directly at `create_new_task.js:160-163`; leave submission does the same at `leave_aplications.js:138-145`. There is no check that the due/end date is on or after the start date.
- **Impact:** The application accepts logically invalid tasks and leave periods.
- **Suggested fix:** Set the end field’s `min` when the start date changes, validate again on submission, and show a field-associated error.

### 14. Storage and fetch failures are handled inconsistently — Resolved

- **Category:** Important
- **Fix type:** Interaction-state fix
- **Evidence:** Several entry points parse storage without recovery, including `login.js:22`, `register.js:19`, `create_new_task.js:9`, `dashboard.js:1,158`, `leave_aplications.js:12`, `leaves_table.js:7`, `feedback.js:2`, and the inline contact script at `contact_us.html:650`. Employee/task/leave fetches generally do not check `response.ok`.
- **Impact:** One malformed storage value or failed JSON request can stop an entire page with no user-visible recovery.
- **Suggested fix:** Introduce shared safe-storage and fetch helpers, validate array/object shapes, and provide loading, empty, and error states.

## Maintainability and Design Smells

### 15. The automated check does not validate links, HTML, or behavior — Partially resolved

- **Category:** Important
- **Fix type:** Component fix
- **Evidence:** `scripts/check-project.mjs` checks JavaScript syntax, JSON parsing, and four required files only. It passes even though issue 8 contains reproducible broken links and issue 3 is invalid in browser script context.
- **Impact:** `npm test` gives a stronger sense of safety than it currently provides.
- **Suggested fix:** Add local-link/asset validation, HTML validation, and browser smoke tests for login, guarded routes, task editing, leave editing, feedback rendering, and dashboard table switching.

### 16. Important empty/loading/error states are missing — Empty states resolved

- **Category:** Nice to improve
- **Fix type:** Interaction-state fix
- **Evidence:** `table_maker.js:59-70` renders no row when data is empty; `feedback.js` clears its container and renders nothing for zero entries; fetch-driven pages do not expose loading status.
- **Impact:** Empty or failed screens look broken rather than intentionally empty.
- **Suggested fix:** Add reusable loading, empty, and error components for tables, cards, profile data, and policy content.

### 17. Multiple controls and dependencies are placeholders or dead code — Resolved

- **Category:** Nice to improve
- **Fix type:** Content fix
- **Evidence:** The forgot-password link is `href="#"` at `login.html:163`; social footer links on many pages also point to `#`; `exportLeaves.js` is empty but loaded by `leave_application.html:408`; and `index.html:17` loads OwlCarousel without jQuery or any `owlCarousel` initialization.
- **Impact:** Users encounter controls that do nothing, while unnecessary dependencies add console/network noise.
- **Suggested fix:** Implement or remove placeholder controls, remove the empty leave-export script, and remove OwlCarousel unless a working carousel needs it.

## Recommended Resolution Order

1. Remove the competing authentication/navigation code and fix feedback injection.
2. Remove the invalid Services script and repair broken internal links.
3. Isolate table state; then fix task and leave edit workflows.
4. Add safe storage/fetch helpers and date validation.
5. Repair labels, focus states, mobile layouts, and feedback interaction.
6. Expand automated checks and add deliberate loading/empty/error states.
7. Remove or implement placeholder controls and unused dependencies.

## Suggested Design-System Improvements

- Introduce shared tokens for focus rings, field spacing, panel width, mobile gutters, error/success colors, and motion duration.
- Create reusable form-field, validation-message, empty-state, table-controller, and authenticated-navbar components.
- Prefer content-driven sizing and responsive `min()`/`max()`/grid layouts over fixed panel/card dimensions.
