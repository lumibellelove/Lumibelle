Stage 46 - iPhone songbook emoji alignment fix

Base: Stage 45 songbook UI second
Scope: songbook.css only

Fix:
- Prevent iPhone from wrapping two emoji marks vertically in songbook icon boxes.
- Force songbook icons to render as centered no-wrap flex boxes.
- Other tabs are untouched.

Check mobile first:
- iPhone songbook member emoji marks should sit side-by-side/centered, not vertical.
- Galaxy should remain centered.
- Songbook detail modal and tab filters should still work.
