# Calc Coffee - PWA

A lightweight, fast Progressive Web App for coffee brewing calculations and timing.

## Features

- **Coffee Calculator**: Scrollable number pickers for coffee, ratio, and water
- **Timer**: Precise timer with start/pause/reset functionality
- **PWA**: Installable as a native app on mobile devices
- **Lightweight**: Pure vanilla JavaScript, no framework overhead (~10KB total)

## Getting Started

### Local Development

Simply open `index.html` in a browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

### PWA Icons

To complete the PWA setup, you'll need to add icon files:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

You can generate these from your Figma design or use any image editor.

## Usage

### Calculator
- Scroll or drag the number pickers to adjust coffee, ratio, or water values
- The calculator automatically updates: `Coffee × Ratio = Water`
- Adjusting coffee or ratio updates water
- Adjusting water updates the ratio

### Timer
- Click **START** to begin the timer
- Click **PAUSE** to pause/resume
- Click **RESET** to reset to 00:00.00

## Browser Support

Works on all modern browsers with PWA support:
- Chrome/Edge (Android & Desktop)
- Safari (iOS 11.3+)
- Firefox (Android)

## File Structure

```
calc-coffee/
├── index.html      # Main HTML structure
├── styles.css      # All styling
├── app.js          # Calculator and timer logic
├── manifest.json   # PWA manifest
├── sw.js          # Service worker for offline support
└── README.md      # This file
```

## Performance

- **Bundle Size**: ~10KB (HTML + CSS + JS)
- **Runtime**: Zero framework overhead
- **Load Time**: <100ms on modern devices
- **Offline**: Fully functional offline after first load
