// Calculator Logic
class CoffeeCalculator {
    constructor() {
        this.coffee = 20;
        this.ratio = 20;
        this.water = 400;
        
        this.initPickers();
        this.setupEventListeners();
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
        
        // Create numbers with extra padding for smooth scrolling
        for (let i = min - 5; i <= max + 5; i++) {
            if (i < min || i > max) continue;
            
            const numberEl = document.createElement('div');
            numberEl.className = 'picker-number';
            numberEl.textContent = i;
            numberEl.dataset.value = i;
            numbersContainer.appendChild(numberEl);
        }
        
        // Set initial position
        this.updatePickerPosition(type, initialValue);
        
        // Setup interaction for all pickers
        this.setupPickerInteraction(type, min, max);
    }
    
    updatePickerPosition(type, value) {
        const numbersContainer = document.getElementById(`${type}-numbers`);
        const numbers = Array.from(numbersContainer.children);
        const activeIndex = numbers.findIndex(el => parseInt(el.dataset.value) === value);
        
        if (activeIndex !== -1) {
            const offset = activeIndex * 50;
            numbersContainer.style.transform = `translateY(${100 - offset}px)`;
            
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
        
        const getCurrentValue = () => {
            const numbers = Array.from(numbersContainer.children);
            const centerY = container.offsetHeight / 2;
            let closest = null;
            let closestDist = Infinity;
            
            numbers.forEach((el, idx) => {
                const elY = el.offsetTop + currentOffset;
                const dist = Math.abs(elY - centerY);
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
                const offset = targetIndex * 50;
                currentOffset = 100 - offset;
                numbersContainer.style.transform = `translateY(${currentOffset}px)`;
                
                numbers.forEach((el, idx) => {
                    el.classList.toggle('active', idx === targetIndex);
                });
            }
        };
        
        const handleStart = (e) => {
            isDragging = true;
            startY = e.touches ? e.touches[0].clientY : e.clientY;
            numbersContainer.style.transition = 'none';
        };
        
        const handleMove = (e) => {
            if (!isDragging) return;
            
            currentY = e.touches ? e.touches[0].clientY : e.clientY;
            const deltaY = currentY - startY;
            currentOffset += deltaY;
            
            // Constrain scrolling
            const maxOffset = 100;
            const minOffset = 100 - (numbersContainer.children.length - 1) * 50;
            currentOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset));
            
            numbersContainer.style.transform = `translateY(${currentOffset}px)`;
            startY = currentY;
        };
        
        const handleEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            numbersContainer.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
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
}

// Timer Logic
class CoffeeTimer {
    constructor() {
        this.startTime = 0;
        this.elapsed = 0;
        this.isRunning = false;
        this.interval = null;
        
        this.display = document.getElementById('timer-display');
        this.resetBtn = document.getElementById('reset-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.resetBtn.addEventListener('click', () => this.reset());
        this.pauseBtn.addEventListener('click', () => this.toggle());
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now() - this.elapsed;
        this.interval = setInterval(() => this.update(), 10);
        
        this.pauseBtn.querySelector('span').textContent = 'PAUSE';
    }
    
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.interval);
        this.pauseBtn.querySelector('span').textContent = 'START';
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
    }
    
    update() {
        if (this.isRunning) {
            this.elapsed = Date.now() - this.startTime;
        }
        
        const totalMs = this.elapsed;
        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        const centiseconds = Math.floor((totalMs % 1000) / 10);
        
        this.display.textContent = 
            `${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')} . ${String(centiseconds).padStart(2, '0')}`;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new CoffeeCalculator();
    new CoffeeTimer();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    }
});
