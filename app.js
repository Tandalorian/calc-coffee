/**
 * Calc Coffee - PWA
 * A lightweight coffee brewing calculator and timer
 */

/* ===================================
   Coffee Calculator
   =================================== */

class CoffeeCalculator {
    constructor() {
        this.coffee = 20;
        this.ratio = 15;
        this.water = 300;
        
        this.initPickers();
    }
    
    initPickers() {
        this.createPicker('coffee', 1, 100, this.coffee);
        this.createPicker('ratio', 1, 50, this.ratio);
        this.createPicker('water', 50, 2000, this.water);
    }
    
    createPicker(type, min, max, initialValue) {
        const numbersContainer = document.getElementById(`${type}-numbers`);
        const ITEM_HEIGHT = 50;
        
        // Create padding and numbers
        const fragment = document.createDocumentFragment();
        
        // Top padding
        const topPadding = document.createElement('div');
        topPadding.className = 'picker-padding';
        fragment.appendChild(topPadding);
        
        // Numbers
        for (let i = min; i <= max; i++) {
            const numberEl = document.createElement('button');
            numberEl.className = 'picker-number';
            numberEl.textContent = i;
            numberEl.dataset.value = i;
            if (i === initialValue) {
                numberEl.classList.add('active');
            }
            fragment.appendChild(numberEl);
        }
        
        // Bottom padding
        const bottomPadding = document.createElement('div');
        bottomPadding.className = 'picker-padding';
        fragment.appendChild(bottomPadding);
        
        numbersContainer.appendChild(fragment);
        
        // Set initial position without animation
        const initialIndex = initialValue - min;
        numbersContainer.scrollTop = initialIndex * ITEM_HEIGHT;
        
        // Setup interaction
        this.setupPickerInteraction(type, min, max);
    }
    
    setupPickerInteraction(type, min, max) {
        const numbersContainer = document.getElementById(`${type}-numbers`);
        let scrollTimeout = null;
        let isScrolling = false;
        const ITEM_HEIGHT = 50;
        
        const updateValue = () => {
            const scrollTop = numbersContainer.scrollTop;
            const index = Math.round(scrollTop / ITEM_HEIGHT);
            const value = Math.max(min, Math.min(max, min + index));
            
            // Only update if value changed
            if (this[type] !== value) {
                this[type] = value;
                this.calculate(type);
                
                // Update active class efficiently
                const numbers = numbersContainer.querySelectorAll('.picker-number');
                const targetIndex = value - min;
                numbers.forEach((el, idx) => {
                    el.classList.toggle('active', idx === targetIndex);
                });
            }
        };
        
        // Scroll handler with debouncing
        numbersContainer.addEventListener('scroll', () => {
            isScrolling = true;
            
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            
            scrollTimeout = setTimeout(() => {
                const scrollTop = numbersContainer.scrollTop;
                const index = Math.round(scrollTop / ITEM_HEIGHT);
                
                // Snap to position
                numbersContainer.scrollTo({
                    top: index * ITEM_HEIGHT,
                    behavior: 'smooth'
                });
                
                updateValue();
                isScrolling = false;
            }, 150);
        }, { passive: true });
        
        // Click handler
        numbersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('picker-number')) {
                const value = parseInt(e.target.dataset.value);
                const index = value - min;
                
                numbersContainer.scrollTo({
                    top: index * ITEM_HEIGHT,
                    behavior: 'smooth'
                });
                
                this[type] = value;
                this.calculate(type);
            }
        });
    }
    
    calculate(changedType) {
        if (changedType === 'coffee' || changedType === 'ratio') {
            // Calculate water
            this.water = this.coffee * this.ratio;
            this.syncPicker('water');
        } else if (changedType === 'water') {
            // Calculate coffee
            this.coffee = Math.round(this.water / this.ratio);
            this.coffee = Math.max(1, Math.min(100, this.coffee));
            this.syncPicker('coffee');
        }
    }
    
    syncPicker(type) {
        const numbersContainer = document.getElementById(`${type}-numbers`);
        const numbers = numbersContainer.querySelectorAll('.picker-number');
        
        // Find the value index
        let targetIndex = 0;
        numbers.forEach((el, idx) => {
            const value = parseInt(el.dataset.value);
            if (value === this[type]) {
                targetIndex = idx;
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
        
        // Update scroll position
        numbersContainer.scrollTop = targetIndex * 50;
    }
    
    setPickerHeight(height) {
        const pickers = document.querySelectorAll('.number-picker');
        pickers.forEach(picker => {
            picker.style.height = `${height}px`;
        });
    }
}

/* ===================================
   Coffee Timer
   =================================== */

class CoffeeTimer {
    constructor() {
        this.elapsed = 0;
        this.isRunning = false;
        this.isSliding = false;
        this.interval = null;
        this.startTime = 0;
        
        this.slider = document.getElementById('timer-slider');
        this.active = document.getElementById('timer-active');
        this.playBtn = document.getElementById('timer-play-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.resetBtn.addEventListener('click', () => this.reset());
        this.pauseBtn.addEventListener('click', () => this.toggle());
        
        // Slide-to-start drag functionality
        let isDragging = false;
        let startX = 0;
        let currentX = 0;
        
        const handleStart = (e) => {
            if (this.isSliding || this.isRunning) return;
            
            isDragging = true;
            startX = e.touches ? e.touches[0].clientX : e.clientX;
            this.playBtn.style.transition = 'none';
        };
        
        const handleMove = (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            currentX = e.touches ? e.touches[0].clientX : e.clientX;
            const deltaX = currentX - startX;
            
            const sliderRect = this.slider.getBoundingClientRect();
            const maxSlide = sliderRect.width - 80;
            
            // Constrain movement
            const slideAmount = Math.max(0, Math.min(maxSlide, deltaX));
            this.playBtn.style.transform = `translateX(${slideAmount}px)`;
        };
        
        const handleEnd = (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            const deltaX = currentX - startX;
            const sliderRect = this.slider.getBoundingClientRect();
            const maxSlide = sliderRect.width - 80;
            
            // If dragged more than 70% of the way, trigger start
            if (deltaX > maxSlide * 0.7) {
                this.slideAndStart();
            } else {
                // Snap back
                this.playBtn.style.transition = 'transform 0.3s ease';
                this.playBtn.style.transform = 'translateX(0)';
            }
        };
        
        // Mouse events
        this.playBtn.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        
        // Touch events
        this.playBtn.addEventListener('touchstart', handleStart, { passive: false });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd);
        document.addEventListener('touchcancel', handleEnd);
    }
    
    slideAndStart() {
        if (this.isSliding || this.isRunning) return;
        
        this.isSliding = true;
        const sliderRect = this.slider.getBoundingClientRect();
        const sliderWidth = sliderRect.width;
        
        // Slide animation
        this.playBtn.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.playBtn.style.transform = `translateX(${sliderWidth - 80}px)`;
        
        setTimeout(() => {
            this.slider.style.display = 'none';
            this.active.style.display = 'flex';
            this.active.style.opacity = '0';
            this.active.style.transform = 'scale(0.95)';
            
            this.active.offsetHeight; // Force reflow
            
            this.active.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            this.active.style.opacity = '1';
            this.active.style.transform = 'scale(1)';
            
            this.start();
            
            if (window.calculator) {
                window.calculator.setPickerHeight(100);
            }
            
            document.body.classList.add('timer-active');
            this.isSliding = false;
        }, 400);
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now() - this.elapsed;
        this.interval = setInterval(() => this.update(), 100); // Reduced frequency
    }
    
    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.interval);
        this.elapsed = Date.now() - this.startTime;
    }
    
    toggle() {
        if (this.isRunning) {
            this.pause();
            this.pauseBtn.querySelector('span').textContent = 'Resume';
        } else {
            this.start();
            this.pauseBtn.querySelector('span').textContent = 'Pause';
        }
    }
    
    reset() {
        this.pause();
        this.elapsed = 0;
        this.startTime = 0;
        this.update();
        
        this.active.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        this.active.style.opacity = '0';
        this.active.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            this.active.style.display = 'none';
            this.slider.style.display = 'flex';
            this.playBtn.style.transition = 'none';
            this.playBtn.style.transform = 'translateX(0)';
            
            if (window.calculator) {
                window.calculator.setPickerHeight(250);
            }
            
            document.body.classList.remove('timer-active');
            this.pauseBtn.querySelector('span').textContent = 'Pause';
        }, 300);
    }
    
    update() {
        if (this.isRunning) {
            this.elapsed = Date.now() - this.startTime;
        }
        
        const totalMs = this.elapsed;
        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        
        const minutesEl = document.getElementById('timer-minutes');
        const secondsEl = document.getElementById('timer-seconds');
        
        if (minutesEl) {
            minutesEl.textContent = String(minutes).padStart(2, '0');
        }
        if (secondsEl) {
            secondsEl.textContent = String(seconds).padStart(2, '0');
        }
    }
}

/* ===================================
   Initialize App
   =================================== */

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
