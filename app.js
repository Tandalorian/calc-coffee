// Calculator Logic
class CoffeeCalculator {
    constructor() {
        this.coffee = 20;
        this.ratio = 20;
        this.water = 400;
        
        this.initPickers();
    }
    
    initPickers() {
        this.createPicker('coffee', 1, 100, this.coffee);
        this.createPicker('ratio', 1, 50, this.ratio);
        this.createPicker('water', 50, 2000, this.water);
    }
    
    createPicker(type, min, max, initialValue) {
        const container = document.getElementById(`${type}-picker`);
        const numbersContainer = document.getElementById(`${type}-numbers`);
        numbersContainer.innerHTML = '';
        
        // Create numbers
        for (let i = min; i <= max; i++) {
            const numberEl = document.createElement('div');
            numberEl.className = 'picker-number';
            numberEl.textContent = i;
            numberEl.dataset.value = i;
            numbersContainer.appendChild(numberEl);
        }
        
        // Set initial position
        this.updatePickerPosition(type, initialValue);
        
        // Setup interaction
        this.setupPickerInteraction(type, min, max);
    }
    
    updatePickerPosition(type, value) {
        const numbersContainer = document.getElementById(`${type}-numbers`);
        const numbers = Array.from(numbersContainer.children);
        const activeIndex = numbers.findIndex(el => parseInt(el.dataset.value) === value);
        
        if (activeIndex !== -1) {
            // Center the active number: move container up by activeIndex * 50px
            const offset = -activeIndex * 50;
            numbersContainer.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;
            numbersContainer.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Update active class
            numbers.forEach((el, idx) => {
                el.classList.toggle('active', idx === activeIndex);
            });
        }
    }
    
    setupPickerInteraction(type, min, max) {
        const container = document.getElementById(`${type}-picker`);
        const numbersContainer = document.getElementById(`${type}-numbers`);
        let isDragging = false;
        let startY = 0;
        let currentY = 0;
        let currentOffset = 0;
        let currentActiveIndex = 0;
        
        const getCurrentValue = () => {
            const numbers = Array.from(numbersContainer.children);
            const containerRect = container.getBoundingClientRect();
            const centerY = containerRect.top + containerRect.height / 2;
            let closest = null;
            let closestDist = Infinity;
            
            numbers.forEach((el, idx) => {
                const rect = el.getBoundingClientRect();
                const elCenterY = rect.top + rect.height / 2;
                const dist = Math.abs(elCenterY - centerY);
                if (dist < closestDist) {
                    closestDist = dist;
                    closest = { el, idx, value: parseInt(el.dataset.value) };
                }
            });
            
            return closest;
        };
        
        const snapToValue = (value) => {
            const numbers = Array.from(numbersContainer.children);
            const targetIndex = numbers.findIndex(el => parseInt(el.dataset.value) === value);
            
            if (targetIndex !== -1) {
                currentActiveIndex = targetIndex;
                currentOffset = -targetIndex * 50;
                numbersContainer.style.transform = `translate(-50%, calc(-50% + ${currentOffset}px))`;
                numbersContainer.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                
                numbers.forEach((el, idx) => {
                    el.classList.toggle('active', idx === targetIndex);
                });
            }
        };
        
        const handleStart = (e) => {
            isDragging = true;
            startY = e.touches ? e.touches[0].clientY : e.clientY;
            numbersContainer.style.transition = 'none';
            
            // Get current active index to calculate offset
            const active = numbersContainer.querySelector('.active');
            if (active) {
                currentActiveIndex = Array.from(numbersContainer.children).indexOf(active);
                currentOffset = -currentActiveIndex * 50;
            }
        };
        
        const handleMove = (e) => {
            if (!isDragging) return;
            
            currentY = e.touches ? e.touches[0].clientY : e.clientY;
            const deltaY = currentY - startY;
            currentOffset += deltaY;
            
            // Constrain scrolling (negative offsets move up, 0 is first item centered)
            const maxOffset = 0;
            const minOffset = -(numbersContainer.children.length - 1) * 50;
            currentOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset));
            
            numbersContainer.style.transform = `translate(-50%, calc(-50% + ${currentOffset}px))`;
            startY = currentY;
        };
        
        const handleEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            
            const closest = getCurrentValue();
            if (closest) {
                snapToValue(closest.value);
                this.updateValue(type, closest.value);
            }
        };
        
        // Mouse events
        container.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        
        // Touch events
        container.addEventListener('touchstart', handleStart, { passive: true });
        container.addEventListener('touchmove', handleMove, { passive: true });
        container.addEventListener('touchend', handleEnd);
        
        // Wheel events
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 1 : -1;
            const current = this[type];
            const newValue = Math.max(min, Math.min(max, current + delta));
            this.updateValue(type, newValue);
            snapToValue(newValue);
        });
    }
    
    updateValue(type, value) {
        this[type] = value;
        
        if (type === 'coffee' || type === 'ratio') {
            this.water = this.coffee * this.ratio;
            this.updatePickerPosition('water', this.water);
        } else if (type === 'water') {
            // If water is changed, adjust ratio
            this.ratio = Math.round(this.water / this.coffee);
            this.updatePickerPosition('ratio', this.ratio);
        }
    }
    
    setPickerHeight(height) {
        const pickers = document.querySelectorAll('.number-picker');
        pickers.forEach(picker => {
            picker.style.height = `${height}px`;
        });
    }
}

// Timer Logic
class CoffeeTimer {
    constructor() {
        this.startTime = 0;
        this.elapsed = 0;
        this.isRunning = false;
        this.interval = null;
        
        this.slider = document.getElementById('timer-slider');
        this.active = document.getElementById('timer-active');
        this.display = document.getElementById('timer-display');
        this.playBtn = document.getElementById('timer-play-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.start());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.pauseBtn.addEventListener('click', () => this.toggle());
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now() - this.elapsed;
        this.interval = setInterval(() => this.update(), 10);
        
        // Switch to active state
        this.slider.style.display = 'none';
        this.active.style.display = 'flex';
        document.body.classList.add('timer-active');
        
        // Update picker heights
        if (window.calculator) {
            window.calculator.setPickerHeight(100);
        }
    }
    
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.interval);
    }
    
    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }
    
    reset() {
        this.pause();
        this.elapsed = 0;
        this.update();
        
        // Switch back to initial state
        this.slider.style.display = 'flex';
        this.active.style.display = 'none';
        document.body.classList.remove('timer-active');
        
        // Restore picker heights
        if (window.calculator) {
            window.calculator.setPickerHeight(250);
        }
    }
    
    update() {
        if (this.isRunning) {
            this.elapsed = Date.now() - this.startTime;
        }
        
        const totalMs = this.elapsed;
        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        const centiseconds = Math.floor((totalMs % 1000) / 10);
        
        // Format: 00 : 00 : 00 (matching Figma design)
        this.display.innerHTML = 
            `<span>${String(minutes).padStart(2, '0')}</span>` +
            `<span class="colon"> : </span>` +
            `<span>${String(seconds).padStart(2, '0')}</span>` +
            `<span class="colon"> : </span>` +
            `<span>${String(centiseconds).padStart(2, '0')}</span>`;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new CoffeeCalculator();
    new CoffeeTimer();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    }
});
