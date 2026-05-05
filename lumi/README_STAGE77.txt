Stage 77 tab navigation stability patch

Base file: lumiphone_modular_stage75_home_statusbar_hardlock.zip
Stage 76 is intentionally not used.

Changes:
- app.js only.
- Keeps Stage 75 home statusbar hard-lock.
- Sets body[data-current-page] before page display toggles, so home-only CSS/statusbar does not lag during tab changes.
- Adds hashchange handling for direct #tab movement and browser hash updates.
- Adds an internal navigation check object for missing page/target detection.
- No localStorage keys, saved data, module content, CSS, or other tabs were changed.

Check order:
1. Mobile: Home -> Ticket -> Home.
2. Mobile: Home app buttons open each tab.
3. PC: First load and tab switching.
4. Other tabs should keep common LUMI PHONE / LB-0001 status.
