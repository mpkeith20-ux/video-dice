(() => {
  const backupFilesInput = document.getElementById('backupFiles');
  const gapMinutesInput = document.getElementById('gapMinutes');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const summary = document.getElementById('summary');
  const tableBody = document.querySelector('#resultsTable tbody');

  let latestRows = [];

  function projectNameFromFile(file) {
    const fromPath = (file.webkitRelativePath || '').split('/').find((segment) => {
      return segment && segment !== 'Session File Backups' && !segment.includes('.');
    });
    if (fromPath) {
      return fromPath;
    }

    const withoutExt = file.name.replace(/\.[^.]+$/, '');
    const cleaned = withoutExt
      .replace(/\s+\d{1,2}-\d{1,2}-\d{2,4}\s+\d{1,2}\.\d{2}\.\d{2}\s*(AM|PM)?$/i, '')
      .replace(/\s+Backup\s*$/i, '')
      .trim();

    return cleaned || 'Unknown Project';
  }

  function toDateKey(date) {
    return date.toISOString().slice(0, 10);
  }

  function fmtTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function analyzeBackups(files, idleGapMinutes) {
    const grouped = new Map();

    files.forEach((file) => {
      const stamp = new Date(file.lastModified);
      if (Number.isNaN(stamp.getTime())) {
        return;
      }

      const project = projectNameFromFile(file);
      const day = toDateKey(stamp);
      const key = `${project}::${day}`;

      if (!grouped.has(key)) {
        grouped.set(key, { project, day, times: [] });
      }

      grouped.get(key).times.push(stamp);
    });

    const idleMs = idleGapMinutes * 60 * 1000;
    const rows = [];

    grouped.forEach(({ project, day, times }) => {
      times.sort((a, b) => a - b);
      let minutesWorked = 0;
      let start = times[0];
      let prev = times[0];

      for (let i = 1; i < times.length; i += 1) {
        const current = times[i];
        if (current - prev > idleMs) {
          minutesWorked += (prev - start) / 60000;
          start = current;
        }
        prev = current;
      }

      minutesWorked += (prev - start) / 60000;

      rows.push({
        project,
        day,
        hours: +(minutesWorked / 60).toFixed(2),
        backupCount: times.length,
        firstBackup: times[0],
        lastBackup: times[times.length - 1],
      });
    });

    rows.sort((a, b) => {
      if (a.day === b.day) {
        return a.project.localeCompare(b.project);
      }
      return a.day.localeCompare(b.day);
    });

    return rows;
  }

  function render(rows) {
    tableBody.innerHTML = '';

    if (!rows.length) {
      summary.textContent = 'No usable backup file timestamps found.';
      downloadBtn.disabled = true;
      return;
    }

    const totalHours = rows.reduce((sum, row) => sum + row.hours, 0);
    const dayCount = new Set(rows.map((row) => row.day)).size;

    summary.textContent = `Tracked ${totalHours.toFixed(2)} total hours across ${rows.length} project/day entries and ${dayCount} day(s).`;

    rows.forEach((row) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.project}</td>
        <td>${row.day}</td>
        <td>${row.hours.toFixed(2)}</td>
        <td>${row.backupCount}</td>
        <td>${fmtTime(row.firstBackup)}</td>
        <td>${fmtTime(row.lastBackup)}</td>
      `;
      tableBody.appendChild(tr);
    });

    downloadBtn.disabled = false;
  }

  function csvFromRows(rows) {
    const header = ['Project', 'Date', 'Estimated Hours', 'Backup Count', 'First Backup', 'Last Backup'];
    const lines = rows.map((row) => {
      return [
        row.project,
        row.day,
        row.hours.toFixed(2),
        String(row.backupCount),
        row.firstBackup.toISOString(),
        row.lastBackup.toISOString(),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(',');
    });

    return [header.join(','), ...lines].join('\n');
  }

  analyzeBtn.addEventListener('click', () => {
    const files = Array.from(backupFilesInput.files || []);
    const gapMinutes = Number(gapMinutesInput.value);

    if (!files.length) {
      summary.textContent = 'Choose backup files first.';
      tableBody.innerHTML = '';
      downloadBtn.disabled = true;
      return;
    }

    if (!Number.isFinite(gapMinutes) || gapMinutes < 1) {
      summary.textContent = 'Idle gap must be at least 1 minute.';
      return;
    }

    latestRows = analyzeBackups(files, gapMinutes);
    render(latestRows);
  });

  downloadBtn.addEventListener('click', () => {
    if (!latestRows.length) {
      return;
    }

    const blob = new Blob([csvFromRows(latestRows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const dateLabel = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `pro-tools-hours-${dateLabel}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  });
})();
