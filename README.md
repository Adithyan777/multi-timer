# Time Tracker

A clean, modern time tracking application that helps you manage your goals and track time spent on different tasks. Features automatic period resets (daily, weekly, monthly) and detailed logging of your work history.

## Features

### ⏱️ Timer Management
- Create timers with custom durations (hours and minutes)
- Set automatic reset periods (daily, weekly, or monthly)
- Real-time countdown with visual progress indicators
- Start, pause, reset, and edit timers
- Status indicators (Running, Paused, Completed, Not Started)

### 📊 Logs & Analytics
- Automatic time logging as you work
- Daily view of completed tasks
- Navigate through historical data
- Time aggregation by task name
- Clean, readable time format display

### 🎨 Modern UI
- Dark theme with beautiful gradients
- Responsive design for desktop and mobile
- Tab-based navigation between Timers and Logs
- Smooth animations and transitions
- Intuitive controls and feedback

### 💾 Data Persistence
- All data stored locally in your browser
- No server required - works offline
- Automatic saving of progress
- Backward compatibility with existing data

## File Structure

```
time-tracker/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles and themes
├── js/
│   ├── config.js       # Configuration constants
│   ├── utils.js        # Utility functions
│   ├── storage.js      # LocalStorage management
│   ├── timer.js        # Timer logic and operations
│   ├── ui.js          # UI rendering and interactions
│   └── app.js         # Main application controller
└── README.md          # This file
```

## Usage

### Getting Started
1. Open `index.html` in your web browser
2. Create your first timer by entering:
   - Goal name (e.g., "Study", "Exercise")
   - Target hours and/or minutes
   - Reset period (day/week/month)
3. Click "Add" to create the timer

### Using Timers
- **Start**: Begin tracking time for a task
- **Pause**: Temporarily stop the timer
- **Reset**: Reset timer to full duration
- **Edit**: Modify timer settings
- **Delete**: Remove a timer permanently

### Viewing Logs
1. Click the "Logs" tab
2. Use Previous/Next buttons to navigate dates
3. View daily summaries and task breakdowns
4. See total time spent per day

## GitHub Pages Deployment

This project is designed to work seamlessly with GitHub Pages:

1. Create a new repository on GitHub
2. Upload all files to the repository
3. Go to repository Settings → Pages
4. Select "Deploy from a branch" and choose "main"
5. Your app will be available at `https://yourusername.github.io/repository-name`

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Technical Details

### Architecture
- **Modular Design**: Separated concerns across multiple JavaScript files
- **No Dependencies**: Pure vanilla JavaScript, HTML5, and CSS3
- **MVC Pattern**: Clear separation between data (storage), logic (timer), and presentation (UI)
- **Event-Driven**: Responsive to user interactions with proper event handling

### Storage
- Uses localStorage for persistence
- JSON serialization for complex data structures
- Automatic backup and restore
- Separate storage for timers and logs

### Performance
- Efficient 1-second update cycle
- Minimal DOM manipulation
- CSS transitions for smooth animations
- Responsive design with mobile optimization

## Customization

### Themes
Colors can be customized by modifying CSS custom properties in `css/styles.css`:

```css
:root {
  --bg: #0b0f16;        /* Background */
  --accent: #22c55e;    /* Primary accent */
  --text: #e5e7eb;      /* Text color */
  /* ... more variables */
}
```

### Functionality
- Adjust update interval in `js/config.js`
- Modify time formatting in `js/utils.js`
- Customize storage keys and behavior in `js/storage.js`

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Built with 💚 for productivity and time management.
