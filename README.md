# Calc Coffee

A lightweight Progressive Web App for coffee brewing calculations and timing.

## Features

- **Coffee Calculator**: iOS-style scroll wheels with native momentum scrolling
  - Coffee: 1-100g
  - Ratio: 1:1 to 1:50
  - Water: 50-2000g
  - Auto-calculation: Coffee × Ratio = Water
- **Timer**: Precise brew timer with start/pause/reset
- **PWA**: Installable as a native app on mobile devices
- **Offline Support**: Works without internet after first load
- **Lightweight**: Pure vanilla JavaScript (~12KB total)

## Getting Started

### Local Development

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## Usage

### Calculator
- **Scroll**: Drag or flick to scroll through values
- **Tap**: Click a number to jump to it directly
- **Desktop**: Use mouse wheel to adjust values
- Logic: Coffee × Ratio = Water (automatically calculated)

### Timer
1. **Slide to Start**: Drag the play button to start
2. **Pause**: Tap to pause/resume
3. **Reset**: Tap to reset to 00:00

## Technical Details

### Architecture
- **Native Scrolling**: Uses browser scroll-snap for smooth iOS-style pickers
- **No Framework**: Pure JavaScript, HTML, and CSS
- **Service Worker**: Offline-first PWA architecture
- **Responsive**: Edge-to-edge on mobile, centered on desktop

### Browser Support
- Chrome/Edge (Android & Desktop)
- Safari (iOS 11.3+)
- Firefox (Android & Desktop)

### File Structure
```
calc-coffee/
├── index.html          # Main structure
├── styles.css          # All styling
├── app.js              # Calculator & timer logic
├── manifest.json       # PWA manifest
├── sw.js               # Service worker
├── logo.svg            # App logo
├── icon-*.svg          # UI icons
├── icon-192.png        # PWA icon (192×192)
├── icon-512.png        # PWA icon (512×512)
└── README.md           # Documentation
```

## Performance

- **Bundle Size**: ~12KB (HTML + CSS + JS)
- **First Load**: <100ms
- **Offline**: Fully functional after first visit
- **No Dependencies**: Zero npm packages
