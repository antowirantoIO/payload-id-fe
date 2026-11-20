# Foundation verification

Previously verified with Playwright against the running IAM backend, not a mock login. That run used a temporary loopback forwarding container, since removed. Login through the configured HTTPS gateway has not been reverified and requires Node to trust its local certificate:

- Unauthenticated dashboard redirects to login.
- Empty login remains on the form using native required-field validation.
- Keyboard Tab moves from email to password to submit.
- Light, dark and system controls update theme state.
- Locale menu switches English to Indonesian; Portuguese route renders translated content; menu switches back to English.
- Admin login navigates to dashboard and displays the real IAM profile.
- An intercepted profile outage shows the error state; Retry retrieves the real profile again.
- Client session response does not contain the backendToken field.
- At 375px the mobile navigation opens and closes, Overview navigates, and document width does not overflow.
- Logout redirects to login; Escape dismisses the language menu.
- No uncaught browser page errors in that scenario.

Known warning: development navigation can emit React's script-tag warning from the theme provider. This is not counted as an uncaught page error. A complete automated WCAG audit and visual comparison against every source-template page have not been performed.

Design delivery review:

- Functional controls, routes and retry behavior: PASS, exercised above.
- Real content and no fabricated financial metrics: PASS, account fields come from IAM.
- Purpose and direction: PASS, decisions recorded in DESIGN.md; source styling retained.
- Responsive scenario and keyboard focus: PASS for the tested 375px scenario and login tab sequence only.
- Full visual/accessibility delivery gate: pending broader contrast and viewport checks. This is a working application foundation, not production UI certification.
