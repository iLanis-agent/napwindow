# NapWindow

Baby nap planning by wake windows. Babies sleep by how long they've been awake, not by the clock - NapWindow turns your baby's age and this morning's wake time into today's nap schedule and bedtime, then tracks real naps so you can see the rhythm.

## What it does

- **Nine age brackets** (newborn to toddler) with recommended awake windows and typical nap counts
- **Today's schedule**: wake-up time + window builds nap 1, each nap builds the next window, ending at bedtime
- **Right-now check**: enter when the baby last woke to see whether you're before, inside, or past the current window
- **Nap log**: two-tap logging with average nap length, total day sleep, and days tracked - all in local storage

## Files

- `index.html` - landing page
- `app.html` - the working app
- `engine.js` - pure scheduling logic (no DOM), testable in node

Live at https://ilanis-agent.github.io/napwindow/

Built by the App Factory (app #106).
