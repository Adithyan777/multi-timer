// Timer management
const Timer = {
  create({ name, hours, minutes, period }) {
    const ms = ((Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60) * 1000;
    const start = currentStart(period);
    return {
      id: uuid(),
      name: name?.trim() || 'Untitled',
      targetMs: ms,
      period,
      remainingMs: ms,
      running: false,
      lastTick: null,
      periodStart: start,
      completedMs: 0
    };
  },

  ensurePeriod(timer, ts = now()) {
    const cur = currentStart(timer.period, ts);
    if (cur > timer.periodStart) {
      timer.periodStart = cur;
      timer.remainingMs = timer.targetMs;
      timer.completedMs = 0;
      timer.lastTick = timer.running ? ts : null;
    }
  },

  tick(timer, ts = now()) {
    this.ensurePeriod(timer, ts);
    if (timer.running && timer.remainingMs > 0) {
      if (timer.lastTick == null) timer.lastTick = ts;
      const dt = ts - timer.lastTick;
      timer.lastTick = ts;
      const prevRemaining = timer.remainingMs;
      timer.remainingMs = Math.max(0, timer.remainingMs - dt);
      const actualWorked = prevRemaining - timer.remainingMs;
      timer.completedMs = Math.min(timer.targetMs, timer.completedMs + actualWorked);

      // Log the time worked for today
      if (actualWorked > 0) {
        Storage.logTime(timer.name, actualWorked);
      }
    }
  },

  setRunning(timer, running) {
    this.ensurePeriod(timer);
    timer.running = running;
    timer.lastTick = running ? now() : null;
  },

  reset(timer) {
    timer.remainingMs = timer.targetMs;
    timer.completedMs = 0;
    timer.lastTick = timer.running ? now() : null;
  },

  update(timer, { name, hours, minutes, period }) {
    const newTarget = ((Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60) * 1000;
    const periodChanged = period && period !== timer.period;
    timer.name = name?.trim() || timer.name;
    if (!Number.isNaN(newTarget)) {
      timer.targetMs = newTarget;
      timer.remainingMs = Math.min(timer.remainingMs, newTarget);
    }
    if (periodChanged) {
      timer.period = period;
      timer.periodStart = currentStart(period);
      timer.remainingMs = Math.min(timer.remainingMs, timer.targetMs);
    }
    timer.lastTick = timer.running ? now() : null;
  },

  getTargetLabel(timer) {
    const totalSec = Math.round(timer.targetMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (!parts.length) parts.push('0m');
    return parts.join(' ');
  },

  getStatus(timer) {
    if (timer.remainingMs <= 0) {
      return { class: 'completed', text: 'Completed' };
    } else if (timer.running) {
      return { class: '', text: 'Running' };
    } else if (timer.remainingMs === timer.targetMs) {
      return { class: 'not-started', text: 'Not Started' };
    } else {
      return { class: 'paused', text: 'Paused' };
    }
  },

  getProgress(timer) {
    return timer.targetMs > 0 ? (1 - (timer.remainingMs / timer.targetMs)) * 100 : 0;
  }
};
