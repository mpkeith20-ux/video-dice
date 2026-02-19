# Pro Tools Session Time Tracker

A tiny browser tool that estimates how many hours you worked per Pro Tools project by using backup file timestamps.

## How to use

1. Open the app in your browser.
2. Click **Choose backup files** and select files from one or more `Session File Backups` folders.
3. Set the idle threshold (default 45 min). If gaps between backups are larger than this, the app starts a new work session.
4. Click **Analyze Files**.
5. Review your table and optionally click **Download CSV**.

## Notes on accuracy

- The app uses each file's modified timestamp (`lastModified`) from your filesystem.
- If autosave was turned off, paused, or infrequent, estimated hours may be lower than actual.
- You can tune the idle threshold to better match your workflow.

## Local run

Just open `index.html` directly in a modern browser.
