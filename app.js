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
        
        const ITEM_HEIGHT = 50;
        
        // Add top padding to center first item
        const topPadding = document.createElement('div');
        topPadding.style.height = `calc(50% - ${ITEM_HEIGHT / 2}px)`;
        topPadding.style.flexShrink = '0';
        numbersContainer.appendChild(topPadding);
        
        // Create numbers
        for (let i = min; i <= max; i++) {
            const numberEl = document.createElement('button');
            numberEl.className = 'picker-number';
            numberEl.textContent = i;
            numberEl.dataset.value = i;
            numberEl.dataset.index = i - min;
            numbersContainer.appendChild(numberEl);
        }
        
        // Add bottom padding to center last item
        const bottomPadding = document.createElement('div');
        bottomPadding.style.height = `calc(50% - ${ITEM_HEIGHT / 2}px)`;
        bottomPadding.style.flexShrink = '0';
        numbersContainer.appendChild(bottomPadding);
        
        // Set initial position immediately
        const numbers = Array.from(numbersContainer.querySelectorAll('.picker-number'));
        const initialIndex = numbers.findIndex(el => parseInt(el.dataset.value) === initialValue);
        
        if (initialIndex !== -1) {
            const ITEM_HEIGHT = 50;
            // Set scroll position directly without animation for initial load
            requestAnimationFrame(() => {
                numbersContainer.scrollTop = initialIndex * ITEM_HEIGHT;
                this.updateActiveState(type, initialIndex);
            });
        }
        
        // Setup interaction
        this.setupPickerInteraction(type, min, max);
    }
    
    updatePickerPosition(type, value) {
        const numbersContainer = document.getElementById(`${type}-numbers`);
        const numbers = Array.from(numbersContainer.querySelectorAll('.picker-number'));
        const activeIndex = numbers.findIndex(el => parseInt(el.dataset.value) === value);
        
        if (activeIndex !== -1 && numbersContainer) {
            const ITEM_HEIGHT = 50;
            const targetScroll = activeIndex * ITEM_HEIGHT;
            
            // Use immediate scroll for programmatic updates, smooth for user interactions
            numbersContainer.scrollTop = targetScroll;
            
            // Update active state
            setTimeout(() => {
                this.updateActiveState(type, activeIndex);
            }, 0);
        }
    }
    
    updateActiveState(type, activeIndex) {
        const numbersContainer = document.getElementById(`${type}-numbers`);
        const numbers = Array.from(numbersContainer.querySelectorAll('.picker-number'));
        const containerRect = numbersContainer.getBoundingClientRect();
        const containerCenterY = containerRect.top + containerRect.height / 2;
        
        numbers.forEach((el, idx) => {
            const elRect = el.getBoundingClientRect();
            const elCenterY = elRect.top + elRect.height / 2;
            const distance = Math.abs(elCenterY - containerCenterY) / 50; // Distance in item units
            
            // Update opacity and scale based on distance
            if (distance === 0) {
                el.classList.add('active');
                el.style.opacity = '1';
                el.style.transform = 'scale(1.3)';
            } else if (distance === 1) {
                el.classList.remove('active');
                el.style.opacity = '0.6';
                el.style.transform = 'scale(1)';
            } else if (distance === 2) {
                el.classList.remove('active');
                el.style.opacity = '0.4';
                el.style.transform = 'scale(0.85)';
            } else {
                el.classList.remove('active');
                el.style.opacity = '0.25';
                el.style.transform = 'scale(0.85)';
            }
        });
    }
    
    setupPickerInteraction(type, min, max) {
        const container = document.getElementById(`${type}-picker`);
        const numbersContainer = document.getElementById(`${type}-numbers`);
        let scrollTimeout = null;
        const ITEM_HEIGHT = 50;
        
        const triggerHaptic = () => {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(10);
            }
        };
        
        const handleScroll = () => {
            if (!numbersContainer) return;
            
            // Clear existing timeout
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            
            const scrollTop = numbersContainer.scrollTop;
            const index = Math.round(scrollTop / ITEM_HEIGHT);
            const numbers = Array.from(numbersContainer.querySelectorAll('.picker-number'));
            const clampedIndex = Math.max(0, Math.min(numbers.length - 1, index));
            
            // Update visual state during scroll
            this.updateActiveState(type, clampedIndex);
            
            // Debounce the final snap and value update
            scrollTimeout = setTimeout(() => {
                if (!numbersContainer) return;
                
                const finalScrollTop = numbersContainer.scrollTop;
                const finalIndex = Math.round(finalScrollTop / ITEM_HEIGHT);
                const finalClampedIndex = Math.max(0, Math.min(numbers.length - 1, finalIndex));
                
                const targetScroll = finalClampedIndex * ITEM_HEIGHT;
                numbersContainer.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
                
                // Update value
                const targetNumber = numbers[finalClampedIndex];
                if (targetNumber) {
                    const value = parseInt(targetNumber.dataset.value);
                    this.updateValue(type, value);
                    triggerHaptic();
                }
            }, 150);
        };
        
        const handleClick = (itemIndex) => {
            if (!numbersContainer) return;
            
            triggerHaptic();
            const numbers = Array.from(numbersContainer.querySelectorAll('.picker-number'));
            const targetNumber = numbers[itemIndex];
            
            if (targetNumber) {
                const value = parseInt(targetNumber.dataset.value);
                this.updateValue(type, value);
                
                const targetScroll = itemIndex * ITEM_HEIGHT;
                numbersContainer.scrollTo({
                    top: targetScroll,
                    behavior: 'smooth'
                });
            }
        };
        
        // Add click handlers to number buttons
        const numbers = numbersContainer.querySelectorAll('.picker-number');
        numbers.forEach((el, idx) => {
            el.addEventListener('click', () => handleClick(idx));
        });
        
        // Add scroll handler
        numbersContainer.addEventListener('scroll', handleScroll);
        
        // Handle tap above/below center
        container.addEventListener('click', (e) => {
            // Only handle if clicking on the container itself, not a number button
            if (e.target === container || e.target.classList.contains('picker-overlay')) {
                const containerRect = container.getBoundingClientRect();
                const containerCenterY = containerRect.top + containerRect.height / 2;
                const clickY = e.clientY;
                
                const current = this[type];
                let newValue = current;
                
                // If clicked above center, decrement
                if (clickY < containerCenterY - 15) {
                    newValue = Math.max(min, current - 1);
                }
                // If clicked below center, increment
                else if (clickY > containerCenterY + 15) {
                    newValue = Math.min(max, current + 1);
                }
                
                if (newValue !== current) {
                    this.updatePickerPosition(type, newValue);
                }
            }
        });
        
        // Wheel events for desktop
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 1 : -1;
            const current = this[type];
            const newValue = Math.max(min, Math.min(max, current + delta));
            this.updatePickerPosition(type, newValue);
        }, { passive: false });
    }
    
    updateValue(type, value) {
        this[type] = value;
        
        if (type === 'coffee') {
            // Coffee changed: water = coffee × ratio
            this.water = this.coffee * this.ratio;
            this.updatePickerPosition('water', this.water);
        } else if (type === 'ratio') {
            // Ratio changed: water = coffee × ratio
            this.water = this.coffee * this.ratio;
            this.updatePickerPosition('water', this.water);
        } else if (type === 'water') {
            // Water changed: coffee = water ÷ ratio (rounded)
            this.coffee = Math.round(this.water / this.ratio);
            // Ensure coffee is within valid range
            if (this.coffee < 1) this.coffee = 1;
            if (this.coffee > 100) this.coffee = 100;
            this.updatePickerPosition('coffee', this.coffee);
        }
    }
    
    setPickerHeight(height) {
        const pickers = document.querySelectorAll('.number-picker');
        pickers.forEach(picker => {
            picker.style.height = `${height}px`;
        });
        
        // Update picker-numbers min-height to match
        const numbersContainers = document.querySelectorAll('.picker-numbers');
        numbersContainers.forEach(container => {
            container.style.minHeight = `${height}px`;
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
        this.isSliding = false;
        
        this.slider = document.getElementById('timer-slider');
        this.active = document.getElementById('timer-active');
        this.display = document.getElementById('timer-display');
        this.playBtn = document.getElementById('timer-play-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        
        this.setupEventListeners();
        this.update(); // Initialize display
    }
    
    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.slideAndStart());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.pauseBtn.addEventListener('click', () => this.toggle());
    }
    
    slideAndStart() {
        if (this.isSliding || this.isRunning) return;
        
        this.isSliding = true;
        const sliderRect = this.slider.getBoundingClientRect();
        const sliderWidth = sliderRect.width;
        
        // Slide button to the right
        this.playBtn.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.playBtn.style.transform = `translateX(${sliderWidth - 80}px)`;
        
        // After slide completes, expand container and start timer
        setTimeout(() => {
            this.slider.style.display = 'none';
            this.active.style.display = 'flex';
            this.active.style.opacity = '0';
            this.active.style.transform = 'scale(0.95)';
            
            // Force reflow
            this.active.offsetHeight;
            
            // Animate in
            this.active.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            this.active.style.opacity = '1';
            this.active.style.transform = 'scale(1)';
            
            // Start timer
            this.start();
            
            // Update picker heights with animation
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
        this.interval = setInterval(() => this.update(), 10);
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
        
        // Animate out
        this.active.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        this.active.style.opacity = '0';
        this.active.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            // Switch back to initial state
            this.active.style.display = 'none';
            this.slider.style.display = 'flex';
            
            // Reset button position
            this.playBtn.style.transition = 'transform 0.3s ease';
            this.playBtn.style.transform = 'translateX(0)';
            
            document.body.classList.remove('timer-active');
            
            // Restore picker heights with animation
            if (window.calculator) {
                window.calculator.setPickerHeight(250);
            }
        }, 300);
    }
    
    update() {
        if (this.isRunning) {
            this.elapsed = Date.now() - this.startTime;
        }
        
        const totalMs = this.elapsed;
        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        
        // Update separate elements for minutes and seconds
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
