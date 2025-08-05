// Main application
const App = {
  state: null,
  tickInterval: null,

  init() {
    // Load state from storage
    this.state = Storage.load() || { timers: [] };
    
    // Initialize UI
    UI.init();
    
    // Ensure backward compatibility and period sync
    this.bootstrap();
    
    // Start the update loop
    this.startTicking();
  },

  bootstrap() {
    // Ensure all timers have completedMs property for backward compatibility
    this.state.timers.forEach(timer => {
      if (timer.completedMs === undefined) timer.completedMs = 0;
      Timer.ensurePeriod(timer);
    });
    
    UI.render();
  },

  startTicking() {
    this.tickInterval = setInterval(() => {
      const timestamp = now();
      this.state.timers.forEach(timer => Timer.tick(timer, timestamp));
      Storage.save(this.state);
      UI.render();
    }, CONFIG.UPDATE_INTERVAL);
  },

  stop() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
};

// Initialize the app when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  App.stop();
});
