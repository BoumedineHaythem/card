document.addEventListener('DOMContentLoaded', () => {
    // ════════════════════════════════════════════
    // 1. SPLASH SCREEN & LOGIN LOGIC
    // ════════════════════════════════════════════
    const splashScreen = document.getElementById('splash-screen');
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app');
    
    // Fade out splash screen after 1.5 seconds
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
            loginScreen.classList.remove('hidden');
        }, 500);
    }, 1500);

    // Click 'Sign In' to enter the app
    document.getElementById('login-btn').addEventListener('click', (e) => {
        e.preventDefault();
        loginScreen.style.display = 'none';
        appScreen.classList.remove('hidden');
        
        // Load data and charts when entering the app
        renderCharts();
        populateTransactions();
    });

    // Password Eye Toggle
    document.getElementById('toggle-pw').addEventListener('click', function() {
        const pwInput = document.getElementById('login-password');
        if (pwInput.type === 'password') {
            pwInput.type = 'text';
            this.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            pwInput.type = 'password';
            this.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });

    // ════════════════════════════════════════════
    // 2. BOTTOM NAVIGATION LOGIC
    // ════════════════════════════════════════════
    const navBtns = document.querySelectorAll('.nav-btn');
    const screens = document.querySelectorAll('.app-screen');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-screen');
            
            // Update button states
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show target screen, hide others
            screens.forEach(screen => {
                screen.classList.remove('active');
                if(screen.id === `screen-${target}`) {
                    screen.classList.add('active');
                }
            });
        });
    });

    // Global function for inline HTML onclicks (e.g., "See All" buttons)
    window.navigateTo = (target) => {
        document.querySelector(`.nav-btn[data-screen="${target}"]`).click();
    };

    // ════════════════════════════════════════════
    // 3. TRANSFER MODAL & NUMPAD LOGIC
    // ════════════════════════════════════════════
    const modal = document.getElementById('transfer-modal');
    const amountDisplay = document.getElementById('transfer-amount-display');
    const confirmSend = document.getElementById('confirm-send');
    let currentAmount = "0";
    
    // Open/Close Modal
    document.getElementById('send-btn').addEventListener('click', () => modal.classList.remove('hidden'));
    document.getElementById('modal-close').addEventListener('click', () => {
        modal.classList.add('hidden');
        currentAmount = "0";
        updateAmountDisplay();
    });

    // Select Payees
    document.querySelectorAll('.recipient').forEach(rec => {
        rec.addEventListener('click', function() {
            document.querySelectorAll('.recipient').forEach(r => r.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Numpad Logic
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = e.currentTarget.getAttribute('data-val');
            
            if (val === 'del') {
                currentAmount = currentAmount.slice(0, -1) || "0";
            } else if (val === '.') {
                if (!currentAmount.includes('.')) currentAmount += '.';
            } else {
                // Limit to 2 decimal places
                if (currentAmount.includes('.') && currentAmount.split('.')[1].length >= 2) return;
                
                if (currentAmount === "0") currentAmount = val;
                else if (currentAmount.replace('.', '').length < 8) currentAmount += val;
            }
            updateAmountDisplay();
        });
    });

    function updateAmountDisplay() {
        let parts = currentAmount.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        amountDisplay.textContent = parts.join('.');
    }

    // Success Toast
    confirmSend.addEventListener('click', () => {
        if(parseFloat(currentAmount) > 0) {
            modal.classList.add('hidden');
            const toast = document.getElementById('success-toast');
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('show'), 10);
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.classList.add('hidden'), 400);
            }, 3000);
            
            currentAmount = "0";
            updateAmountDisplay();
        }
    });

    // ════════════════════════════════════════════
    // 4. CHARTS & CATEGORIES (Analytics Screen)
    // ════════════════════════════════════════════
    let chartsRendered = false;
    function renderCharts() {
        if (chartsRendered) return; // Prevent duplicate rendering
        
        Chart.defaults.color = '#8E8E93';
        Chart.defaults.font.family = "'Inter', sans-serif";

        const ctxArea = document.getElementById('area-chart').getContext('2d');
        let grad = ctxArea.createLinearGradient(0, 0, 0, 200);
        grad.addColorStop(0, 'rgba(10, 122, 255, 0.4)');
        grad.addColorStop(1, 'rgba(10, 122, 255, 0.0)');

        new Chart(ctxArea, {
            type: 'line',
            data: {
                labels: ['1st', '8th', '15th', '22nd', '30th'],
                datasets: [{
                    data: [1200, 3100, 2800, 5400, 8143],
                    borderColor: '#0A7AFF',
                    backgroundColor: grad,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } }, 
                scales: { 
                    y: { display: false, min: 0 }, 
                    x: { grid: { display: false, drawBorder: false } } 
                } 
            }
        });

        // Apple-style category progress bars
        const categories = [
            { name: "Groceries", amt: "€2,400.50", pct: 65, color: "#0A7AFF", icon: "fa-basket-shopping" },
            { name: "Transport", amt: "€1,200.00", pct: 35, color: "#34C759", icon: "fa-train" },
            { name: "Entertainment", amt: "€943.00", pct: 20, color: "#FF9F0A", icon: "fa-ticket" }
        ];

        document.getElementById('category-breakdown').innerHTML = categories.map(c => `
            <div class="cat-row">
                <div class="cat-icon-box" style="background: ${c.color}"><i class="fa-solid ${c.icon}"></i></div>
                <div class="cat-details">
                    <div class="cat-top">
                        <span>${c.name}</span>
                        <span class="cat-amt">${c.amt}</span>
                    </div>
                    <div class="cat-bar-bg">
                        <div class="cat-bar-fill" style="width: ${c.pct}%; background: ${c.color}"></div>
                    </div>
                </div>
            </div>
        `).join('');

        chartsRendered = true;
    }

    // ════════════════════════════════════════════
    // 5. TRANSACTIONS (Grouped iOS Style)
    // ════════════════════════════════════════════
// ════════════════════════════════════════════
    // 5. TRANSACTIONS (Ultra-Clean Fintech Style)
    // ════════════════════════════════════════════
    function populateTransactions() {
        const historyHTML = `
            <div class="clean-history-date">Today</div>
            <div class="clean-txn-list">
                <div class="clean-txn-item">
                    <div class="clean-icon" style="background: #1C1C1E; color: #FFF"><i class="fa-brands fa-apple"></i></div>
                    <div class="clean-info">
                        <div class="clean-name">Apple Store</div>
                        <div class="clean-sub">14:32 • Electronics</div>
                    </div>
                    <div class="clean-right">
                        <div class="clean-amount negative font-numbers">-€1,299.00</div>
                    </div>
                </div>
                <div class="clean-txn-item">
                    <div class="clean-icon" style="background: #1C1C1E; color: #FFF"><i class="fa-solid fa-mug-hot"></i></div>
                    <div class="clean-info">
                        <div class="clean-name">Starbucks</div>
                        <div class="clean-sub">08:15 • Food</div>
                    </div>
                    <div class="clean-right">
                        <div class="clean-amount negative font-numbers">-€5.40</div>
                    </div>
                </div>
            </div>

            <div class="clean-history-date">Yesterday</div>
            <div class="clean-txn-list">
                <div class="clean-txn-item">
                    <div class="clean-icon" style="background: rgba(52, 199, 89, 0.15); color: #34C759"><i class="fa-solid fa-building-columns"></i></div>
                    <div class="clean-info">
                        <div class="clean-name">Salary</div>
                        <div class="clean-sub">09:00 • Transfer</div>
                    </div>
                    <div class="clean-right">
                        <div class="clean-amount positive font-numbers">+€4,532.12</div>
                    </div>
                </div>
                <div class="clean-txn-item">
                    <div class="clean-icon" style="background: rgba(255, 59, 48, 0.15); color: #FF3B30"><i class="fa-solid fa-play"></i></div>
                    <div class="clean-info">
                        <div class="clean-name">Netflix</div>
                        <div class="clean-sub">10:00 • Subscription</div>
                    </div>
                    <div class="clean-right">
                        <div class="clean-amount negative font-numbers">-€15.99</div>
                    </div>
                </div>
            </div>
        `;

        const recentBox = document.getElementById('recent-txns');
        const allBox = document.getElementById('all-txns');
        
        if (recentBox) recentBox.innerHTML = historyHTML;
        if (allBox) allBox.innerHTML = historyHTML;
    }
    // ════════════════════════════════════════════
    // 6. SETTINGS TOGGLES
    // ════════════════════════════════════════════
    document.querySelectorAll('.ios-toggle').forEach(t => {
        t.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
});