# Project Scan — Issues

Scan date: 2026-07-10

Scope: first-party HTML, CSS, JavaScript, JSON, repository structure, and documentation. Vendored Bootstrap/Popper source was excluded from code-quality findings. JavaScript syntax checks passed, but the repository has no automated test or lint command.

## Critical

### 1. Authentication and authorization are entirely client-controlled — Resolved for demo scope

- **Evidence:** `All pages/login assets/login.js:21-50` reads the user list from `localStorage`, compares credentials in the browser, and sets `loggedIn = "true"`. `All pages/assest/js/navbar.js:3` trusts that same flag.
- **Impact:** Any visitor can edit browser storage to become “logged in,” read or change HR data, or impersonate another user. There is no server-side session or role enforcement.
- **Resolution:** Added a centralized demo-auth session, active-user validation, an eight-hour session expiry, consistent logout cleanup, and guards on every HR-only page. Client storage remains editable by design and is accepted as a limitation of this front-end-only demo.

### 2. Passwords are stored in plaintext in browser storage — Resolved

- **Evidence:** `All pages/register assets/register.js:16-27` saves passwords directly; `All pages/login assets/login.js:31-33` also stores the remembered password; `All pages/login assets/login.js:47-50` retains the password inside `loggedInUser`.
- **Impact:** Any script running on the origin, browser extension, shared-computer user, or successful XSS can recover every registered credential.
- **Resolution:** Passwords now use per-user random salts and PBKDF2-SHA256 with 210,000 iterations. Remember-me stores only the email, active-user objects exclude password data, old remembered plaintext is removed, and legacy accounts migrate after a successful login.

## High

### 3. Profile password handling is inconsistent and can break login — Resolved

- **Evidence:** Registration/login use plaintext comparisons (`register.js:16-27`, `login.js:27`), while `All pages/edit profile assets/edit.js:213-214` Base64-encodes a changed password and describes it as encryption.
- **Impact:** After a password change, entering the actual password on the login page will not match the encoded stored value. Base64 also provides no security.
- **Resolution:** Registration, login, migration, and password changes now share the same salted PBKDF2-SHA256 implementation; Base64 is used only to serialize random salt/hash bytes, not as encryption.

### 4. Stored-data HTML injection is possible — Resolved

- **Evidence:** `All pages/profile assets/profile.js:65` interpolates education descriptions into `innerHTML`. `All pages/Privacy and Policy page/script.js:12-27` also interpolates JSON values into markup.
- **Impact:** If stored/profile/JSON content becomes attacker-controlled, arbitrary markup and scripts can execute in the application origin and steal HR data and credentials.
- **Resolution:** Profile education and privacy-policy content are now constructed with DOM APIs and inserted through `textContent`.

### 5. Application data is not durable or shared — Accepted demo limitation

- **Evidence:** Users, tasks, actions, profiles, and feedback are stored in `localStorage` throughout the app (for example `register.js`, `tasks_table.js`, `profile.js`, and `contact_us.html:649-651`).
- **Impact:** Data is isolated to one browser, disappears when storage is cleared, cannot be safely shared between employees, and has no concurrency, backup, integrity, or audit controls.
- **Resolution:** No code change. Browser-local data is an explicit constraint of this front-end-only demo and is not presented as production persistence.

## Medium

### 6. Tasks table can crash on a fresh browser — Resolved

- **Evidence:** `All pages/assets/javascripts/tasks_table.js:19` assigns `null` when the `tasks` key is absent, then `table_maker.js:63` calls `table_data.forEach(...)`.
- **Impact:** Opening the task table before another script seeds storage produces a runtime error instead of an empty state.
- **Resolution:** Task storage now safely defaults to an empty array and recovers from malformed or incorrectly shaped JSON.

### 7. Privacy-policy data path is likely incorrect — Resolved

- **Evidence:** `All pages/Privacy and Policy page/script.js:2` fetches `Privacy and Policy page/policy.JSON`. From an HTML page already inside `All pages`, this resolves differently depending on which page loads the script and can become a duplicated nested path.
- **Impact:** The policy accordion can remain empty with an unhandled fetch/JSON error.
- **Resolution:** Corrected the document-relative URL and added HTTP status validation, error handling, and a visible fallback message.

### 8. Root-relative links make non-root deployments fragile — Documented deployment constraint

- **Evidence:** Many pages use paths such as `/index.html` and `/All pages/...` (for example `index.html:32-75` and `All pages/about.html:42-123`).
- **Impact:** Hosting under a repository subpath or opening pages directly from disk breaks navigation and assets. The README explicitly recommends opening `index.html` directly.
- **Resolution:** The README now requires HTTP serving and explicitly documents web-root deployment. Root deployment matches the existing Netlify demo and avoids a risky rewrite of every navigation URL.

### 9. Conflicting framework versions are loaded together — Resolved

- **Evidence:** `index.html:7-19` loads three Bootstrap stylesheets (5.0.2, 5.3.3, and a derivative). `All pages/Edit profile.html:19-40` loads Bootstrap 5.3.3 and 4.5.2 together.
- **Impact:** CSS precedence becomes unpredictable, payload size increases, and components can render differently across pages.
- **Resolution:** Removed duplicate Bootstrap 4/5/derivative styles from the affected pages and standardized them on the vendored `assets/css/bootstrap.css` build.

### 10. External dependencies lack a coherent integrity/security policy — Mitigated for demo hosting

- **Evidence:** Pages load scripts/styles from several CDNs, including unpkg and cdnjs (for example `index.html:7-21`), generally without Subresource Integrity metadata.
- **Impact:** Availability depends on multiple third parties, versions can drift where URLs are not immutable, and a compromised dependency/CDN can execute code in the application origin.
- **Resolution:** Core Bootstrap assets are self-hosted and duplicate versions were removed. Added Netlify security headers with an explicit CDN allow-list, restricted frames/connections, disabled plugins and unnecessary browser permissions, and enabled MIME sniffing protection.

### 11. Navigation and filename casing are inconsistent — Resolved for navigable files

- **Evidence:** The file is `All pages/Edit profile.html`, while `All pages/Profile.html:170` navigates to `Edit Profile.html` (capital `P`). There are also both `assest` and `assets` directories.
- **Impact:** These references may work on Windows but fail on case-sensitive Linux/Netlify hosts; the near-duplicate directory names invite broken imports.
- **Resolution:** Renamed the case-sensitive `Edit profile.html` route to `edit-profile.html` and updated its caller. Legacy asset-directory spelling remains stable to avoid breaking hundreds of static references.

## Low / Engineering Quality

### 12. No automated tests, linting, formatting, or build validation — Baseline resolved

- **Evidence:** There is no `package.json`, test directory, CI workflow, or documented validation command. The README only instructs users to open the HTML file.
- **Impact:** Broken paths, browser runtime failures, accessibility regressions, and behavior changes are easy to merge unnoticed.
- **Resolution:** Added a dependency-free `npm test`/`npm run check` baseline that syntax-checks first-party JavaScript, parses every JSON file, and verifies critical application entry points. Browser behavior tests remain a future enhancement.

### 13. Accessibility semantics need a systematic audit — Initial findings resolved

- **Evidence:** Placeholder alternative text such as `alt="..."` appears at `index.html:95-112`; icon-only/social links use `href="#"` and lack useful accessible names around `index.html:555-557`; several forms rely heavily on placeholders and visual error text.
- **Impact:** Screen-reader and keyboard users may not understand controls or content, and placeholder-only labeling is fragile.
- **Resolution:** Replaced known placeholder image alternatives and added accessible names to icon-only links. A full WCAG audit remains recommended before production use.

### 14. Repository contains a very large copied icon set — Resolved

- **Evidence:** `All pages/assets/bootstrap-icons/` contains thousands of individual SVG files although the app uses only a subset.
- **Impact:** Repository size, scan time, deployment payload risk, and maintenance noise increase.
- **Resolution:** Removed the 2,000+ unused standalone SVG copies while retaining the Bootstrap Icons webfont and stylesheet actually referenced by the application.

## Follow-up Ideas Beyond Demo Scope

1. Add browser-level smoke tests for the main authentication and HR workflows.
2. Run a manual keyboard and screen-reader review plus automated axe checks.
3. If the project becomes a real multi-user product, replace browser persistence and demo authentication with a backend API, database, and server-enforced sessions.
