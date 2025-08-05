// Storage management
const Storage = {
  load() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  save(state) {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
  },

  loadLogs() {
    try {
      const raw = localStorage.getItem(CONFIG.LOGS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },

  saveLogs(logs) {
    localStorage.setItem(CONFIG.LOGS_KEY, JSON.stringify(logs));
  },

  logTime(timerName, completedMs, date = dateKey(now())) {
    const logs = this.loadLogs();
    if (!logs[date]) logs[date] = {};
    if (!logs[date][timerName]) logs[date][timerName] = 0;
    logs[date][timerName] += completedMs;
    this.saveLogs(logs);
    return logs;
  }
};
