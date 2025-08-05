// UI management
const UI = {
  elements: {
    list: null,
    activeTitle: null,
    logsContent: null,
    currentDate: null
  },

  currentView: 'timers',
  currentLogDate: dateKey(now()),

  init() {
    this.elements = {
      list: $('#list'),
      activeTitle: $('#activeTitle'),
      logsContent: $('#logs-content'),
      currentDate: $('#currentDate')
    };

    this.setupEventListeners();
  },

  setupEventListeners() {
    // Add timer form
    $('#addBtn').addEventListener('click', () => this.addTimerFromForm());

    // Control buttons
    $('#pauseAll').addEventListener('click', () => this.pauseAllTimers());
    $('#resetAll').addEventListener('click', () => this.resetAllTimers());
    $('#clearStorage').addEventListener('click', () => this.clearAllData());

    // Tab navigation
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    // Date navigation for logs
    $('#prevDay').addEventListener('click', () => this.changeLogDate(-1));
    $('#nextDay').addEventListener('click', () => this.changeLogDate(1));

    // Timer actions
    this.elements.list.addEventListener('click', (e) => this.handleTimerAction(e));
  },

  switchTab(tabName) {
    this.currentView = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Update pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.toggle('active', page.id === `${tabName}-page`);
    });

    if (tabName === 'logs') {
      this.renderLogs();
    }
  },

  addTimerFromForm() {
    const name = $('#name').value;
    const hours = parseFloat($('#hours').value || '0');
    const minutes = parseFloat($('#minutes').value || '0');
    const period = $('#period').value;

    if ((hours <= 0 && minutes <= 0) || isNaN(hours) || isNaN(minutes)) {
      alert('Enter a positive duration (hours or minutes).');
      return;
    }

    const timer = Timer.create({ name, hours, minutes, period });
    App.state.timers.push(timer);
    Storage.save(App.state);
    this.render();

    // Clear form
    $('#name').value = '';
    $('#hours').value = '';
    $('#minutes').value = '';
  },

  pauseAllTimers() {
    App.state.timers.forEach(t => Timer.setRunning(t, false));
    Storage.save(App.state);
    this.render();
  },

  resetAllTimers() {
    if (!confirm('Reset all timers to full duration for this period?')) return;
    App.state.timers.forEach(Timer.reset);
    Storage.save(App.state);
    this.render();
  },

  clearAllData() {
    if (!confirm('This will permanently delete all timers and logs. Are you sure?')) return;
    localStorage.clear();
    App.state = { timers: [] };
    this.render();
    if (this.currentView === 'logs') {
      this.renderLogs();
    }
  },

  handleTimerAction(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    const timer = App.state.timers.find(x => x.id === id);
    if (!timer) return;

    switch (action) {
      case 'start':
        if (timer.remainingMs <= 0) Timer.reset(timer);
        Timer.setRunning(timer, true);
        break;
      case 'pause':
        Timer.setRunning(timer, false);
        break;
      case 'reset':
        Timer.reset(timer);
        break;
      case 'delete':
        if (confirm('Delete this timer?')) {
          App.state.timers = App.state.timers.filter(x => x.id !== id);
        }
        break;
      case 'edit':
        this.editTimer(timer);
        break;
    }

    Storage.save(App.state);
    this.render();
  },

  editTimer(timer) {
    const name = prompt('Name:', timer.name);
    if (name === null) return;

    const totalMin = Math.round(timer.targetMs / 60000);
    const defH = Math.floor(totalMin / 60);
    const defM = totalMin % 60;

    const hStr = prompt('Hours:', defH);
    if (hStr === null) return;

    const mStr = prompt('Minutes (0-59):', defM);
    if (mStr === null) return;

    let h = parseFloat(hStr);
    let m = parseFloat(mStr);
    if (isNaN(h) || isNaN(m) || h < 0 || m < 0) {
      alert('Invalid duration.');
      return;
    }
    m = Math.min(59, m);

    const pStr = prompt('Period: day | week | month', timer.period);
    if (pStr === null) return;

    const p = (pStr || '').toLowerCase();
    if (!['day', 'week', 'month'].includes(p)) {
      alert('Invalid period.');
      return;
    }

    Timer.update(timer, { name, hours: h, minutes: m, period: p });
    Storage.save(App.state);
    this.render();
  },

  render() {
    if (this.currentView !== 'timers') return;

    this.elements.list.innerHTML = '';

    // Show header if any timers exist
    this.elements.activeTitle.style.display = App.state.timers.length > 0 ? '' : 'none';

    if (!App.state.timers.length) {
      const empty = document.createElement('div');
      empty.className = 'panel';
      empty.innerHTML = '<div class="sub">No timers yet. Add one above.</div>';
      this.elements.list.appendChild(empty);
      return;
    }

    App.state.timers.forEach(timer => {
      const percent = Timer.getProgress(timer);
      const status = Timer.getStatus(timer);
      
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-header">
          <div>
            <div class="name">${escapeHtml(timer.name)}</div>
            <div class="meta">${Timer.getTargetLabel(timer)} • Per ${timer.period}</div>
          </div>
          <span class="badge ${status.class}">
            <span class="dot"></span>${status.text}
          </span>
        </div>

        <div class="remaining">${fmtHMS(timer.remainingMs)}</div>

        <div>
          <div class="progress-wrap">
            <div class="progress" style="width:${Math.max(0, Math.min(100, percent)).toFixed(1)}%"></div>
          </div>
          <div class="pct">${Math.max(0, Math.min(100, percent)).toFixed(0)}%</div>
        </div>

        <div class="card-actions">
          ${timer.remainingMs <= 0
            ? `<button class="btn small" data-action="reset" data-id="${timer.id}">Start New Period</button>`
            : timer.running
              ? `<button class="btn small ghost" data-action="pause" data-id="${timer.id}">Pause</button>`
              : `<button class="btn small" data-action="start" data-id="${timer.id}">Start</button>`
          }
          ${timer.remainingMs > 0 
            ? `<button class="btn small ghost" data-action="reset" data-id="${timer.id}">Reset</button>`
            : ''
          }
          <button class="btn small secondary" data-action="edit" data-id="${timer.id}">Edit</button>
          <button class="btn small danger" data-action="delete" data-id="${timer.id}">Delete</button>
        </div>

        <div class="row">
          <div class="muted">Starts: ${new Date(timer.periodStart).toLocaleDateString()}</div>
          <div class="muted">Resets: ${new Date(nextStart(timer.period)).toLocaleDateString()}</div>
        </div>
      `;
      this.elements.list.appendChild(card);
    });
  },

  renderLogs() {
    const logs = Storage.loadLogs();
    // Parse the date safely
    const parts = this.currentLogDate.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in Date constructor
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    
    this.elements.currentDate.textContent = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const dayLogs = logs[this.currentLogDate];

    if (!dayLogs || Object.keys(dayLogs).length === 0) {
      this.elements.logsContent.innerHTML = '<div class="log-empty">No time logged for this day.</div>';
      return;
    }

    const totalMs = Object.values(dayLogs).reduce((sum, ms) => sum + ms, 0);
    const sortedTasks = Object.entries(dayLogs)
      .sort(([, a], [, b]) => b - a) // Sort by time descending
      .filter(([, ms]) => ms > 0);

    const logDay = document.createElement('div');
    logDay.className = 'log-day';
    logDay.innerHTML = `
      <div class="log-day-header">
        <div class="log-date">${date.toLocaleDateString()}</div>
        <div class="log-total">Total: ${fmtHMSVerbose(totalMs)}</div>
      </div>
      <div class="log-tasks">
        ${sortedTasks.map(([taskName, ms]) => `
          <div class="log-task">
            <div class="log-task-name">${escapeHtml(taskName)}</div>
            <div class="log-task-time">${fmtHMSVerbose(ms)}</div>
          </div>
        `).join('')}
      </div>
    `;

    this.elements.logsContent.innerHTML = '';
    this.elements.logsContent.appendChild(logDay);
  },

  changeLogDate(days) {
    // Create a new date from the current log date
    const parts = this.currentLogDate.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in Date constructor
    const day = parseInt(parts[2], 10);
    
    const currentDate = new Date(year, month, day);
    currentDate.setDate(currentDate.getDate() + days);
    
    // Format back to YYYY-MM-DD
    const newYear = currentDate.getFullYear();
    const newMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const newDay = String(currentDate.getDate()).padStart(2, '0');
    
    this.currentLogDate = `${newYear}-${newMonth}-${newDay}`;
    this.renderLogs();
  }
};
