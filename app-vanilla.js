/**
 * ==========================================
 * FOCUSLY - MODERN PRODUCTIVITY TRACKER
 * Pure Vanilla JavaScript (No Framework)
 * COMPLETE WITH ALL FEATURES
 * ==========================================
 */

// ==========================================
// STATE MANAGEMENT
// ==========================================

const AppState = {
    currentView: 'login',
    user: null,
    tasks: [],
    habits: [],
    goals: [],
    teamProjects: [],
    notifications: [],
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDate: new Date(),
    focusTimer: {
        mode: 'pomodoro',
        timeLeft: 25 * 60,
        isRunning: false,
        isPaused: false,
        interval: null,
        completedPomodoros: 0,
        totalFocusTime: 0
    }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function createElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

function formatDate(date) {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getRandomColor() {
    const colors = ['#6C63FF', '#2DD4BF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Save to localStorage
function saveToStorage() {
    try {
        localStorage.setItem('focuslyData', JSON.stringify({
            user: AppState.user,
            tasks: AppState.tasks,
            habits: AppState.habits,
            goals: AppState.goals,
            teamProjects: AppState.teamProjects,
            notifications: AppState.notifications,
            focusTimer: {
                completedPomodoros: AppState.focusTimer.completedPomodoros,
                totalFocusTime: AppState.focusTimer.totalFocusTime
            }
        }));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// Load from localStorage
function loadFromStorage() {
    try {
        const data = localStorage.getItem('focuslyData');
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed.user) AppState.user = parsed.user;
            if (parsed.tasks) AppState.tasks = parsed.tasks;
            if (parsed.habits) AppState.habits = parsed.habits;
            if (parsed.goals) AppState.goals = parsed.goals;
            if (parsed.teamProjects) AppState.teamProjects = parsed.teamProjects;
            if (parsed.notifications) AppState.notifications = parsed.notifications;
            if (parsed.focusTimer) {
                AppState.focusTimer.completedPomodoros = parsed.focusTimer.completedPomodoros || 0;
                AppState.focusTimer.totalFocusTime = parsed.focusTimer.totalFocusTime || 0;
            }
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = $('#toast-container');
    const icons = {
        success: '<i data-lucide="check-circle"></i>',
        error: '<i data-lucide="alert-circle"></i>',
        warning: '<i data-lucide="alert-triangle"></i>',
        info: '<i data-lucide="info"></i>'
    };
    
    const toast = createElement(`
        <div class="toast toast-${type} animate-slide-in">
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i data-lucide="x" style="width: 1rem; height: 1rem;"></i>
            </button>
        </div>
    `);
    
    toastContainer.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==========================================
// MODAL FUNCTIONS
// ==========================================

function showModal(content) {
    const modalContainer = $('#modal-container');
    modalContainer.innerHTML = `
        <div class="modal-overlay" onclick="if(event.target === this) closeModal()">
            ${content}
        </div>
    `;
    lucide.createIcons();
}

function closeModal() {
    $('#modal-container').innerHTML = '';
}

// ==========================================
// AUTHENTICATION
// ==========================================

function renderLogin() {
    const app = $('#app');
    app.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-logo animate-float">
                    <h1>Focusly</h1>
                    <p>Focus on what matters</p>
                </div>
                
                <form class="auth-form" onsubmit="handleLogin(event)">
                    <div class="input-group">
                        <label class="label">Email</label>
                        <input type="email" class="input" placeholder="Enter your email" required>
                    </div>
                    
                    <div class="input-group">
                        <label class="label">Password</label>
                        <input type="password" class="input" placeholder="Enter your password" required>
                    </div>
                    
                    <button type="submit" class="btn btn-gradient w-full">
                        <i data-lucide="log-in"></i>
                        Sign In
                    </button>
                </form>
                
                <div class="auth-footer">
                    Don't have an account? 
                    <a class="auth-link" onclick="renderSignup()">Sign up</a>
                </div>
                
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border); text-align: center; font-size: 0.875rem; color: var(--color-gray-600);">
                    Demo: test@focusly.com / password
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function renderSignup() {
    const app = $('#app');
    app.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-logo animate-float">
                    <h1>Focusly</h1>
                    <p>Create your account</p>
                </div>
                
                <form class="auth-form" onsubmit="handleSignup(event)">
                    <div class="input-group">
                        <label class="label">Full Name</label>
                        <input type="text" class="input" placeholder="Enter your name" required>
                    </div>
                    
                    <div class="input-group">
                        <label class="label">Email</label>
                        <input type="email" class="input" placeholder="Enter your email" required>
                    </div>
                    
                    <div class="input-group">
                        <label class="label">Password</label>
                        <input type="password" class="input" placeholder="Create a password" required>
                    </div>
                    
                    <button type="submit" class="btn btn-gradient w-full">
                        <i data-lucide="user-plus"></i>
                        Create Account
                    </button>
                </form>
                
                <div class="auth-footer">
                    Already have an account? 
                    <a class="auth-link" onclick="renderLogin()">Sign in</a>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

function handleLogin(event) {
    event.preventDefault();
    const email = event.target[0].value;
    const password = event.target[1].value;
    
    // Demo account
    if (email === 'test@focusly.com' && password === 'password') {
        AppState.user = {
            id: 'demo',
            name: 'Demo User',
            email: email,
            exp: 1250,
            level: 5,
            streak: 7
        };
    } else {
        AppState.user = {
            id: generateId(),
            name: 'User',
            email: email,
            exp: 0,
            level: 1,
            streak: 0
        };
    }
    
    saveToStorage();
    showToast('Welcome back!', 'success');
    AppState.currentView = 'dashboard';
    renderDashboard();
}

function handleSignup(event) {
    event.preventDefault();
    const name = event.target[0].value;
    const email = event.target[1].value;
    
    AppState.user = {
        id: generateId(),
        name: name,
        email: email,
        exp: 0,
        level: 1,
        streak: 0
    };
    
    saveToStorage();
    showToast('Account created successfully!', 'success');
    AppState.currentView = 'dashboard';
    renderDashboard();
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        AppState.user = null;
        AppState.currentView = 'login';
        saveToStorage();
        renderLogin();
        showToast('Logged out successfully', 'info');
    }
}

// ==========================================
// DASHBOARD
// ==========================================

function renderDashboard() {
    const today = new Date();
    const todaysTasks = AppState.tasks.filter(t => {
        const taskDate = new Date(t.date);
        return taskDate.toDateString() === today.toDateString();
    });
    
    const completedToday = todaysTasks.filter(t => t.completed).length;
    
    const app = $('#app');
    app.innerHTML = `
        <!-- Desktop Navbar -->
        <nav class="navbar">
            <div class="container">
                <div class="nav-content">
                    <div class="nav-brand">Focusly</div>
                    <div class="nav-menu">
                        <div class="nav-item active" onclick="renderDashboard()">
                            <i data-lucide="layout-dashboard"></i>
                            Dashboard
                        </div>
                        <div class="nav-item" onclick="renderFocusMode()">
                            <i data-lucide="timer"></i>
                            Focus
                        </div>
                        <div class="nav-item" onclick="renderHabits()">
                            <i data-lucide="calendar-check"></i>
                            Habits
                        </div>
                        <div class="nav-item" onclick="renderGoals()">
                            <i data-lucide="target"></i>
                            Goals
                        </div>
                        <div class="nav-item" onclick="renderTeam()">
                            <i data-lucide="users"></i>
                            Team
                        </div>
                        <div class="nav-item" onclick="renderNotifications()">
                            <i data-lucide="bell"></i>
                            ${AppState.notifications.filter(n => !n.read).length > 0 ? `<span class="badge badge-error">${AppState.notifications.filter(n => !n.read).length}</span>` : ''}
                        </div>
                        <button class="btn btn-ghost btn-icon" onclick="logout()">
                            <i data-lucide="log-out"></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
        
        <!-- Main Content -->
        <div class="dashboard">
            <div class="container">
                <!-- Header -->
                <div class="dashboard-header">
                    <h2 class="dashboard-greeting">Hello, ${AppState.user.name}! 👋</h2>
                    <p class="dashboard-date">${formatDate(today)}</p>
                </div>
                
                <!-- Stats Cards -->
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: rgba(108, 99, 255, 0.1); color: var(--color-primary);">
                            <i data-lucide="check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Tasks Today</div>
                            <div class="stat-value">${completedToday}/${todaysTasks.length}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--color-warning);">
                            <i data-lucide="flame"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Streak</div>
                            <div class="stat-value">${AppState.user.streak} days</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon" style="background: rgba(45, 212, 191, 0.1); color: var(--color-secondary);">
                            <i data-lucide="zap"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">EXP Points</div>
                            <div class="stat-value">${AppState.user.exp}</div>
                        </div>
                    </div>
                    
                    <div class="stat-card cursor-pointer" onclick="openAddTaskModal()">
                        <div class="stat-icon gradient-primary" style="color: white;">
                            <i data-lucide="plus"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-label">Quick Action</div>
                            <div class="stat-value" style="font-size: 1rem;">Add Task</div>
                        </div>
                    </div>
                </div>
                
                <!-- Calendar -->
                ${renderCalendar()}
                
                <!-- Today's Tasks -->
                <div class="tasks-section">
                    <div class="tasks-header">
                        <h3>Today's Tasks</h3>
                        <button class="btn btn-primary btn-sm" onclick="openAddTaskModal()">
                            <i data-lucide="plus"></i>
                            Add Task
                        </button>
                    </div>
                    
                    ${todaysTasks.length > 0 ? `
                        <div class="tasks-list">
                            ${todaysTasks.map(task => `
                                <div class="task-item">
                                    <input type="checkbox" class="task-checkbox checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}')">
                                    <div class="task-content">
                                        <div class="task-title ${task.completed ? 'completed' : ''}">${task.title}</div>
                                        <div class="task-meta">
                                            <span class="badge badge-${task.priority}">${task.priority}</span>
                                            ${task.hasLocation ? '<span><i data-lucide="map-pin"></i> Location</span>' : ''}
                                            ${task.hasVoice ? '<span><i data-lucide="mic"></i> Voice</span>' : ''}
                                            ${task.hasImage ? '<span><i data-lucide="image"></i> Image</span>' : ''}
                                        </div>
                                    </div>
                                    <div class="task-actions">
                                        <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteTask('${task.id}')">
                                            <i data-lucide="trash-2"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <div class="empty-state-icon">
                                <i data-lucide="inbox"></i>
                            </div>
                            <div class="empty-state-title">No tasks for today</div>
                            <div class="empty-state-message">Start by adding your first task</div>
                            <button class="btn btn-primary" onclick="openAddTaskModal()">
                                <i data-lucide="plus"></i>
                                Add Task
                            </button>
                        </div>
                    `}
                </div>
            </div>
        </div>
        
        <!-- Mobile Navigation -->
        <nav class="mobile-nav">
            <div class="mobile-nav-content">
                <div class="mobile-nav-item active" onclick="renderDashboard()">
                    <i data-lucide="layout-dashboard"></i>
                    <span>Dashboard</span>
                </div>
                <div class="mobile-nav-item" onclick="renderFocusMode()">
                    <i data-lucide="timer"></i>
                    <span>Focus</span>
                </div>
                <div class="mobile-nav-item" onclick="renderHabits()">
                    <i data-lucide="calendar-check"></i>
                    <span>Habits</span>
                </div>
                <div class="mobile-nav-item" onclick="renderGoals()">
                    <i data-lucide="target"></i>
                    <span>Goals</span>
                </div>
                <div class="mobile-nav-item" onclick="renderTeam()">
                    <i data-lucide="users"></i>
                    <span>Team</span>
                </div>
            </div>
        </nav>
    `;
    lucide.createIcons();
}

// ==========================================
// CALENDAR
// ==========================================

function renderCalendar() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const firstDay = new Date(AppState.currentYear, AppState.currentMonth, 1);
    const lastDay = new Date(AppState.currentYear, AppState.currentMonth + 1, 0);
    const prevLastDay = new Date(AppState.currentYear, AppState.currentMonth, 0);
    
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();
    const nextDays = 7 - lastDayIndex - 1;
    
    let days = [];
    
    // Previous month days
    for (let x = firstDayIndex; x > 0; x--) {
        days.push({
            day: prevLastDay.getDate() - x + 1,
            isOtherMonth: true,
            hasTasks: false
        });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(AppState.currentYear, AppState.currentMonth, i);
        const hasTasks = AppState.tasks.some(task => {
            const taskDate = new Date(task.date);
            return taskDate.toDateString() === date.toDateString();
        });
        
        days.push({
            day: i,
            isOtherMonth: false,
            isToday: date.toDateString() === new Date().toDateString(),
            hasTasks: hasTasks
        });
    }
    
    // Next month days
    for (let j = 1; j <= nextDays; j++) {
        days.push({
            day: j,
            isOtherMonth: true,
            hasTasks: false
        });
    }
    
    return `
        <div class="calendar">
            <div class="calendar-header">
                <h3 class="calendar-title">${months[AppState.currentMonth]} ${AppState.currentYear}</h3>
                <div class="calendar-nav">
                    <button class="calendar-nav-btn" onclick="changeMonth(-1)">
                        <i data-lucide="chevron-left"></i>
                    </button>
                    <button class="calendar-nav-btn" onclick="changeMonth(1)">
                        <i data-lucide="chevron-right"></i>
                    </button>
                </div>
            </div>
            
            <div class="calendar-grid">
                ${daysOfWeek.map(day => `<div class="calendar-day-header">${day}</div>`).join('')}
                ${days.map(d => `
                    <div class="calendar-day ${d.isToday ? 'today' : ''} ${d.isOtherMonth ? 'other-month' : ''} ${d.hasTasks ? 'has-tasks' : ''}">
                        ${d.day}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function changeMonth(direction) {
    AppState.currentMonth += direction;
    
    if (AppState.currentMonth < 0) {
        AppState.currentMonth = 11;
        AppState.currentYear--;
    } else if (AppState.currentMonth > 11) {
        AppState.currentMonth = 0;
        AppState.currentYear++;
    }
    
    renderDashboard();
}

// ==========================================
// TASK MODAL WITH LOCATION, VOICE, IMAGE
// ==========================================

function openAddTaskModal() {
    const modalContent = `
        <div class="modal animate-fade-in">
            <div class="modal-header">
                <h3 class="modal-title">Add New Task</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            
            <form onsubmit="handleAddTask(event)" class="modal-body">
                <div class="input-group">
                    <label class="label required">Task Title</label>
                    <input type="text" name="title" class="input" placeholder="Enter task title" required>
                </div>
                
                <div class="input-group">
                    <label class="label">Description</label>
                    <textarea name="description" class="input textarea" placeholder="Add description (optional)"></textarea>
                </div>
                
                <div class="input-group">
                    <label class="label">Priority</label>
                    <select name="priority" class="select">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label class="label">Date & Time</label>
                    <input type="datetime-local" name="date" class="input" value="${new Date().toISOString().slice(0, 16)}" required>
                </div>
                
                <!-- Location Section -->
                <div class="input-group">
                    <label class="label">
                        <input type="checkbox" id="add-location" class="checkbox" style="width: auto; margin-right: 0.5rem;">
                        Add Location Reminder
                    </label>
                    <div id="location-section" class="hidden" style="margin-top: 1rem;">
                        <input type="text" name="location" class="input" placeholder="Enter location address">
                        <div style="margin-top: 0.5rem; padding: 1rem; background: var(--color-gray-100); border-radius: var(--radius-lg); text-align: center; color: var(--color-gray-600); font-size: 0.875rem;">
                            <i data-lucide="map-pin"></i>
                            <div style="margin-top: 0.5rem;">Map preview will appear here</div>
                        </div>
                    </div>
                </div>
                
                <!-- Voice Note Section -->
                <div class="input-group">
                    <label class="label">
                        <input type="checkbox" id="add-voice" class="checkbox" style="width: auto; margin-right: 0.5rem;">
                        Add Voice Note
                    </label>
                    <div id="voice-section" class="hidden" style="margin-top: 1rem;">
                        <button type="button" class="btn btn-outline w-full" onclick="handleVoiceRecord(this)">
                            <i data-lucide="mic"></i>
                            <span>Start Recording</span>
                        </button>
                        <div class="text-xs text-center" style="margin-top: 0.5rem; color: var(--color-gray-600);">
                            Click to record voice reminder
                        </div>
                    </div>
                </div>
                
                <!-- Image Upload Section -->
                <div class="input-group">
                    <label class="label">
                        <input type="checkbox" id="add-image" class="checkbox" style="width: auto; margin-right: 0.5rem;">
                        Add Image
                    </label>
                    <div id="image-section" class="hidden" style="margin-top: 1rem;">
                        <label class="file-upload w-full">
                            <input type="file" accept="image/*" name="image" onchange="previewImage(this)">
                            <i data-lucide="upload"></i>
                            <span>Choose image file</span>
                        </label>
                        <div id="image-preview" class="hidden" style="margin-top: 1rem;">
                            <img src="" alt="Preview" style="max-width: 100%; border-radius: var(--radius-lg);">
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i data-lucide="plus"></i>
                        Add Task
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    // Toggle sections
    $('#add-location').addEventListener('change', (e) => {
        $('#location-section').classList.toggle('hidden', !e.target.checked);
        lucide.createIcons();
    });
    
    $('#add-voice').addEventListener('change', (e) => {
        $('#voice-section').classList.toggle('hidden', !e.target.checked);
        lucide.createIcons();
    });
    
    $('#add-image').addEventListener('change', (e) => {
        $('#image-section').classList.toggle('hidden', !e.target.checked);
        lucide.createIcons();
    });
}

function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = $('#image-preview');
            preview.querySelector('img').src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function handleVoiceRecord(btn) {
    const isRecording = btn.classList.contains('recording');
    
    if (!isRecording) {
        btn.classList.add('recording');
        btn.style.background = 'var(--color-error)';
        btn.style.color = 'white';
        btn.querySelector('span').textContent = 'Stop Recording';
        showToast('Recording started...', 'info');
    } else {
        btn.classList.remove('recording');
        btn.style.background = '';
        btn.style.color = '';
        btn.querySelector('span').textContent = 'Recorded (Click to play)';
        showToast('Voice note recorded!', 'success');
    }
}

function handleAddTask(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const task = {
        id: generateId(),
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        date: formData.get('date'),
        completed: false,
        hasLocation: $('#add-location').checked,
        location: formData.get('location'),
        hasVoice: $('#add-voice').checked,
        hasImage: $('#add-image').checked,
        imageUrl: $('#image-preview').classList.contains('hidden') ? null : $('#image-preview img').src,
        createdAt: new Date().toISOString()
    };
    
    AppState.tasks.push(task);
    saveToStorage();
    
    // Add notification
    if (task.hasLocation) {
        addNotification({
            type: 'location',
            title: 'Location Reminder',
            message: `Task: ${task.title} - ${task.location}`,
            taskId: task.id,
            location: task.location
        });
    }
    
    closeModal();
    showToast('Task added successfully!', 'success');
    renderDashboard();
}

function toggleTask(taskId) {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        
        if (task.completed) {
            AppState.user.exp += 10;
            showToast('+10 EXP earned!', 'success');
            
            addNotification({
                type: 'achievement',
                title: 'Task Completed! 🎉',
                message: `You completed: ${task.title}`,
                taskId: task.id
            });
        }
        
        saveToStorage();
        renderDashboard();
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        AppState.tasks = AppState.tasks.filter(t => t.id !== taskId);
        saveToStorage();
        showToast('Task deleted', 'info');
        renderDashboard();
    }
}

// ==========================================
// FOCUS MODE (POMODORO TIMER)
// ==========================================

function renderFocusMode() {
    const app = $('#app');
    const timer = AppState.focusTimer;
    
    app.innerHTML = `
        <div class="focus-mode">
            <button class="btn btn-ghost" onclick="renderDashboard()" style="position: absolute; top: 2rem; left: 2rem;">
                <i data-lucide="arrow-left"></i>
                Back
            </button>
            
            <div class="timer-card">
                <h2 style="margin-bottom: 1rem;">Focus Mode</h2>
                
                <!-- Timer Modes -->
                <div class="timer-modes">
                    <button class="timer-mode-btn ${timer.mode === 'pomodoro' ? 'active' : ''}" onclick="setTimerMode('pomodoro')">
                        Pomodoro (25)
                    </button>
                    <button class="timer-mode-btn ${timer.mode === 'shortBreak' ? 'active' : ''}" onclick="setTimerMode('shortBreak')">
                        Short Break (5)
                    </button>
                    <button class="timer-mode-btn ${timer.mode === 'longBreak' ? 'active' : ''}" onclick="setTimerMode('longBreak')">
                        Long Break (15)
                    </button>
                </div>
                
                <!-- Custom Timer Presets -->
                <div class="timer-preset-btns">
                    <button class="btn btn-sm btn-outline" onclick="setCustomTime(15)">15 min</button>
                    <button class="btn btn-sm btn-outline" onclick="setCustomTime(30)">30 min</button>
                    <button class="btn btn-sm btn-outline" onclick="setCustomTime(45)">45 min</button>
                    <button class="btn btn-sm btn-outline" onclick="setCustomTime(60)">60 min</button>
                </div>
                
                <!-- Custom Input -->
                <div class="timer-custom-input">
                    <input type="number" id="custom-minutes" class="input" placeholder="Custom minutes" min="1" max="120" style="max-width: 150px;">
                    <button class="btn btn-sm btn-primary" onclick="setCustomTime(document.getElementById('custom-minutes').value)">
                        Set Custom
                    </button>
                </div>
                
                <!-- Timer Circle -->
                <div class="timer-circle">
                    <svg class="timer-svg" width="300" height="300">
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#6C63FF;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#2DD4BF;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <circle class="timer-circle-bg" cx="150" cy="150" r="140"></circle>
                        <circle class="timer-circle-progress" cx="150" cy="150" r="140" id="timer-progress"></circle>
                    </svg>
                    <div class="timer-time" id="timer-display">${formatTime(timer.timeLeft)}</div>
                </div>
                
                <!-- Timer Controls -->
                <div class="timer-controls">
                    <button class="btn btn-lg ${timer.isRunning ? 'btn-warning' : 'btn-gradient'}" onclick="toggleTimer()">
                        <i data-lucide="${timer.isRunning ? 'pause' : 'play'}"></i>
                        ${timer.isRunning ? 'Pause' : 'Start'}
                    </button>
                    <button class="btn btn-lg btn-outline" onclick="resetTimer()">
                        <i data-lucide="rotate-ccw"></i>
                        Reset
                    </button>
                </div>
                
                <!-- Stats -->
                <div class="timer-stats">
                    <div class="timer-stat">
                        <div class="timer-stat-value">${timer.completedPomodoros}</div>
                        <div class="timer-stat-label">Completed</div>
                    </div>
                    <div class="timer-stat">
                        <div class="timer-stat-value">${Math.floor(timer.totalFocusTime / 60)}m</div>
                        <div class="timer-stat-label">Total Focus</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Mobile Nav -->
        <nav class="mobile-nav">
            <div class="mobile-nav-content">
                <div class="mobile-nav-item" onclick="renderDashboard()">
                    <i data-lucide="layout-dashboard"></i>
                    <span>Dashboard</span>
                </div>
                <div class="mobile-nav-item active" onclick="renderFocusMode()">
                    <i data-lucide="timer"></i>
                    <span>Focus</span>
                </div>
                <div class="mobile-nav-item" onclick="renderHabits()">
                    <i data-lucide="calendar-check"></i>
                    <span>Habits</span>
                </div>
                <div class="mobile-nav-item" onclick="renderGoals()">
                    <i data-lucide="target"></i>
                    <span>Goals</span>
                </div>
                <div class="mobile-nav-item" onclick="renderTeam()">
                    <i data-lucide="users"></i>
                    <span>Team</span>
                </div>
            </div>
        </nav>
    `;
    
    lucide.createIcons();
    updateTimerDisplay();
}

function setTimerMode(mode) {
    stopTimer();
    AppState.focusTimer.mode = mode;
    
    switch(mode) {
        case 'pomodoro':
            AppState.focusTimer.timeLeft = 25 * 60;
            break;
        case 'shortBreak':
            AppState.focusTimer.timeLeft = 5 * 60;
            break;
        case 'longBreak':
            AppState.focusTimer.timeLeft = 15 * 60;
            break;
    }
    
    renderFocusMode();
}

function setCustomTime(minutes) {
    const mins = parseInt(minutes);
    if (isNaN(mins) || mins < 1 || mins > 120) {
        showToast('Please enter a valid time (1-120 minutes)', 'error');
        return;
    }
    
    stopTimer();
    AppState.focusTimer.timeLeft = mins * 60;
    AppState.focusTimer.mode = 'custom';
    renderFocusMode();
}

function toggleTimer() {
    if (AppState.focusTimer.isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    AppState.focusTimer.isRunning = true;
    AppState.focusTimer.interval = setInterval(() => {
        AppState.focusTimer.timeLeft--;
        AppState.focusTimer.totalFocusTime++;
        
        updateTimerDisplay();
        
        if (AppState.focusTimer.timeLeft <= 0) {
            timerComplete();
        }
    }, 1000);
    
    renderFocusMode();
}

function stopTimer() {
    AppState.focusTimer.isRunning = false;
    if (AppState.focusTimer.interval) {
        clearInterval(AppState.focusTimer.interval);
        AppState.focusTimer.interval = null;
    }
    renderFocusMode();
}

function resetTimer() {
    stopTimer();
    setTimerMode(AppState.focusTimer.mode === 'custom' ? 'pomodoro' : AppState.focusTimer.mode);
}

function timerComplete() {
    stopTimer();
    AppState.focusTimer.completedPomodoros++;
    AppState.user.exp += 25;
    saveToStorage();
    
    showToast('Focus session completed! +25 EXP', 'success');
    
    addNotification({
        type: 'achievement',
        title: 'Focus Session Complete! 🎯',
        message: 'Great job! Take a break and recharge.',
    });
    
    // Auto switch to break
    if (AppState.focusTimer.mode === 'pomodoro') {
        setTimerMode('shortBreak');
    }
}

function updateTimerDisplay() {
    const display = $('#timer-display');
    const progress = $('#timer-progress');
    
    if (display) {
        display.textContent = formatTime(AppState.focusTimer.timeLeft);
    }
    
    if (progress) {
        const totalTime = AppState.focusTimer.mode === 'pomodoro' ? 25 * 60 :
                          AppState.focusTimer.mode === 'shortBreak' ? 5 * 60 :
                          AppState.focusTimer.mode === 'longBreak' ? 15 * 60 :
                          AppState.focusTimer.timeLeft + 1;
        
        const circumference = 2 * Math.PI * 140;
        const offset = circumference - (AppState.focusTimer.timeLeft / totalTime) * circumference;
        
        progress.style.strokeDasharray = circumference;
        progress.style.strokeDashoffset = offset;
    }
}

// ==========================================
// HABITS (WITH STREAK & WEEKLY VIEW)
// ==========================================

function renderHabits() {
    const app = $('#app');
    
    app.innerHTML = `
        <nav class="navbar">
            <div class="container">
                <div class="nav-content">
                    <div class="nav-brand">Focusly</div>
                    <div class="nav-menu">
                        <div class="nav-item" onclick="renderDashboard()">
                            <i data-lucide="layout-dashboard"></i>
                            Dashboard
                        </div>
                        <div class="nav-item" onclick="renderFocusMode()">
                            <i data-lucide="timer"></i>
                            Focus
                        </div>
                        <div class="nav-item active" onclick="renderHabits()">
                            <i data-lucide="calendar-check"></i>
                            Habits
                        </div>
                        <div class="nav-item" onclick="renderGoals()">
                            <i data-lucide="target"></i>
                            Goals
                        </div>
                        <div class="nav-item" onclick="renderTeam()">
                            <i data-lucide="users"></i>
                            Team
                        </div>
                        <button class="btn btn-ghost btn-icon" onclick="logout()">
                            <i data-lucide="log-out"></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
        
        <div class="dashboard">
            <div class="container">
                <div class="dashboard-header">
                    <h2>Habit Tracker</h2>
                    <button class="btn btn-primary" onclick="openAddHabitModal()">
                        <i data-lucide="plus"></i>
                        Add Habit
                    </button>
                </div>
                
                ${AppState.habits.length > 0 ? `
                    ${AppState.habits.map(habit => renderHabitCard(habit)).join('')}
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i data-lucide="calendar-check"></i>
                        </div>
                        <div class="empty-state-title">No habits yet</div>
                        <div class="empty-state-message">Start building good habits today</div>
                        <button class="btn btn-primary" onclick="openAddHabitModal()">
                            <i data-lucide="plus"></i>
                            Add Your First Habit
                        </button>
                    </div>
                `}
            </div>
        </div>
        
        <nav class="mobile-nav">
            <div class="mobile-nav-content">
                <div class="mobile-nav-item" onclick="renderDashboard()">
                    <i data-lucide="layout-dashboard"></i>
                    <span>Dashboard</span>
                </div>
                <div class="mobile-nav-item" onclick="renderFocusMode()">
                    <i data-lucide="timer"></i>
                    <span>Focus</span>
                </div>
                <div class="mobile-nav-item active" onclick="renderHabits()">
                    <i data-lucide="calendar-check"></i>
                    <span>Habits</span>
                </div>
                <div class="mobile-nav-item" onclick="renderGoals()">
                    <i data-lucide="target"></i>
                    <span>Goals</span>
                </div>
                <div class="mobile-nav-item" onclick="renderTeam()">
                    <i data-lucide="users"></i>
                    <span>Team</span>
                </div>
            </div>
        </nav>
    `;
    
    lucide.createIcons();
}

function renderHabitCard(habit) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekDays = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        weekDays.push({
            date: date,
            day: daysOfWeek[date.getDay()],
            isToday: date.toDateString() === today.toDateString(),
            isCompleted: habit.completedDates?.includes(date.toDateString()) || false
        });
    }
    
    const completedThisWeek = weekDays.filter(d => d.isCompleted).length;
    const progress = (completedThisWeek / 7) * 100;
    
    return `
        <div class="habit-card">
            <div class="habit-header">
                <div class="habit-title-group">
                    <div class="habit-icon" style="background: ${habit.color};">
                        ${habit.icon}
                    </div>
                    <div class="habit-info">
                        <h4>${habit.name}</h4>
                        <div class="habit-frequency">${habit.frequency}</div>
                    </div>
                </div>
                <div class="habit-streak">
                    <i data-lucide="flame"></i>
                    ${habit.streak || 0} day streak
                </div>
            </div>
            
            <div class="habit-week">
                ${weekDays.map(day => `
                    <div class="habit-day ${day.isCompleted ? 'completed' : ''}" 
                         onclick="toggleHabitDay('${habit.id}', '${day.date.toDateString()}')">
                        <div class="habit-day-label">${day.day}</div>
                        <div style="font-weight: 600;">${day.date.getDate()}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="habit-footer">
                <div class="habit-progress">
                    <div class="habit-progress-bar" style="width: ${progress}%;"></div>
                </div>
                <div class="habit-best-streak">
                    Best: ${habit.bestStreak || 0} days
                </div>
            </div>
        </div>
    `;
}

function openAddHabitModal() {
    const emojis = ['💪', '📚', '🏃', '🧘', '💧', '🥗', '😴', '📝', '🎵', '🎨'];
    const colors = ['#6C63FF', '#2DD4BF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#F97316'];
    
    const modalContent = `
        <div class="modal animate-fade-in">
            <div class="modal-header">
                <h3 class="modal-title">Add New Habit</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            
            <form onsubmit="handleAddHabit(event)" class="modal-body">
                <div class="input-group">
                    <label class="label required">Habit Name</label>
                    <input type="text" name="name" class="input" placeholder="e.g., Morning Exercise" required>
                </div>
                
                <div class="input-group">
                    <label class="label">Choose Icon</label>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${emojis.map((emoji, i) => `
                            <label style="cursor: pointer;">
                                <input type="radio" name="icon" value="${emoji}" ${i === 0 ? 'checked' : ''} style="display: none;">
                                <div class="habit-icon" style="background: var(--color-gray-100); cursor: pointer; transition: all 0.2s;">
                                    ${emoji}
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="input-group">
                    <label class="label">Choose Color</label>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${colors.map((color, i) => `
                            <label style="cursor: pointer;">
                                <input type="radio" name="color" value="${color}" ${i === 0 ? 'checked' : ''} style="display: none;">
                                <div style="width: 3rem; height: 3rem; background: ${color}; border-radius: var(--radius-lg); cursor: pointer; border: 3px solid transparent; transition: all 0.2s;"></div>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="input-group">
                    <label class="label">Frequency</label>
                    <select name="frequency" class="select">
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                    </select>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i data-lucide="plus"></i>
                        Add Habit
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    // Add radio button styling
    $$('input[name="icon"]').forEach(input => {
        input.addEventListener('change', function() {
            $$('input[name="icon"]').forEach(i => {
                i.nextElementSibling.style.transform = '';
                i.nextElementSibling.style.boxShadow = '';
            });
            this.nextElementSibling.style.transform = 'scale(1.1)';
            this.nextElementSibling.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });
    });
    
    $$('input[name="color"]').forEach(input => {
        input.addEventListener('change', function() {
            $$('input[name="color"]').forEach(i => {
                i.nextElementSibling.style.borderColor = 'transparent';
            });
            this.nextElementSibling.style.borderColor = this.value;
        });
    });
}

function handleAddHabit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const habit = {
        id: generateId(),
        name: formData.get('name'),
        icon: formData.get('icon'),
        color: formData.get('color'),
        frequency: formData.get('frequency'),
        streak: 0,
        bestStreak: 0,
        completedDates: [],
        createdAt: new Date().toISOString()
    };
    
    AppState.habits.push(habit);
    saveToStorage();
    
    closeModal();
    showToast('Habit added successfully!', 'success');
    renderHabits();
}

function toggleHabitDay(habitId, dateString) {
    const habit = AppState.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    if (!habit.completedDates) habit.completedDates = [];
    
    const index = habit.completedDates.indexOf(dateString);
    if (index > -1) {
        habit.completedDates.splice(index, 1);
        habit.streak = Math.max(0, habit.streak - 1);
        showToast('Progress removed', 'info');
    } else {
        habit.completedDates.push(dateString);
        habit.streak = (habit.streak || 0) + 1;
        if (habit.streak > (habit.bestStreak || 0)) {
            habit.bestStreak = habit.streak;
        }
        AppState.user.exp += 5;
        showToast('+5 EXP earned!', 'success');
    }
    
    saveToStorage();
    renderHabits();
}

// ==========================================
// GOALS (WITH MILESTONE TRACKING)
// ==========================================

function renderGoals() {
    const app = $('#app');
    
    app.innerHTML = `
        <nav class="navbar">
            <div class="container">
                <div class="nav-content">
                    <div class="nav-brand">Focusly</div>
                    <div class="nav-menu">
                        <div class="nav-item" onclick="renderDashboard()">
                            <i data-lucide="layout-dashboard"></i>
                            Dashboard
                        </div>
                        <div class="nav-item" onclick="renderFocusMode()">
                            <i data-lucide="timer"></i>
                            Focus
                        </div>
                        <div class="nav-item" onclick="renderHabits()">
                            <i data-lucide="calendar-check"></i>
                            Habits
                        </div>
                        <div class="nav-item active" onclick="renderGoals()">
                            <i data-lucide="target"></i>
                            Goals
                        </div>
                        <div class="nav-item" onclick="renderTeam()">
                            <i data-lucide="users"></i>
                            Team
                        </div>
                        <button class="btn btn-ghost btn-icon" onclick="logout()">
                            <i data-lucide="log-out"></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
        
        <div class="dashboard">
            <div class="container">
                <div class="dashboard-header">
                    <h2>Goal Builder</h2>
                    <button class="btn btn-primary" onclick="openAddGoalModal()">
                        <i data-lucide="plus"></i>
                        Add Goal
                    </button>
                </div>
                
                ${AppState.goals.length > 0 ? `
                    ${AppState.goals.map(goal => renderGoalCard(goal)).join('')}
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i data-lucide="target"></i>
                        </div>
                        <div class="empty-state-title">No goals yet</div>
                        <div class="empty-state-message">Set your first goal and start achieving</div>
                        <button class="btn btn-primary" onclick="openAddGoalModal()">
                            <i data-lucide="plus"></i>
                            Create Your First Goal
                        </button>
                    </div>
                `}
            </div>
        </div>
        
        <nav class="mobile-nav">
            <div class="mobile-nav-content">
                <div class="mobile-nav-item" onclick="renderDashboard()">
                    <i data-lucide="layout-dashboard"></i>
                    <span>Dashboard</span>
                </div>
                <div class="mobile-nav-item" onclick="renderFocusMode()">
                    <i data-lucide="timer"></i>
                    <span>Focus</span>
                </div>
                <div class="mobile-nav-item" onclick="renderHabits()">
                    <i data-lucide="calendar-check"></i>
                    <span>Habits</span>
                </div>
                <div class="mobile-nav-item active" onclick="renderGoals()">
                    <i data-lucide="target"></i>
                    <span>Goals</span>
                </div>
                <div class="mobile-nav-item" onclick="renderTeam()">
                    <i data-lucide="users"></i>
                    <span>Team</span>
                </div>
            </div>
        </nav>
    `;
    
    lucide.createIcons();
}

function renderGoalCard(goal) {
    const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
    const totalMilestones = goal.milestones?.length || 1;
    const progress = Math.round((completedMilestones / totalMilestones) * 100);
    
    return `
        <div class="goal-card">
            <div class="goal-header">
                <div class="goal-info">
                    <h4>${goal.title}</h4>
                    <div class="goal-category">
                        <span class="badge badge-primary">${goal.category}</span>
                    </div>
                    <div class="goal-deadline">
                        <i data-lucide="calendar"></i>
                        Due: ${formatDate(goal.deadline)}
                    </div>
                </div>
                <div class="goal-progress-circle" style="--progress: ${progress};">
                    <div class="goal-progress-inner">
                        ${progress}%
                    </div>
                </div>
            </div>
            
            <div id="milestones-${goal.id}" class="milestones-list hidden">
                ${goal.milestones && goal.milestones.length > 0 ? `
                    ${goal.milestones.map(milestone => `
                        <div class="milestone-item ${milestone.completed ? 'completed' : ''}">
                            <input type="checkbox" class="milestone-checkbox checkbox" 
                                   ${milestone.completed ? 'checked' : ''}
                                   onchange="toggleMilestone('${goal.id}', '${milestone.id}')">
                            <div class="milestone-text ${milestone.completed ? 'completed' : ''}">
                                ${milestone.title}
                            </div>
                        </div>
                    `).join('')}
                ` : '<div style="text-align: center; color: var(--color-gray-600); padding: 1rem;">No milestones yet</div>'}
            </div>
            
            <div class="milestones-toggle">
                <button class="milestones-toggle-btn" onclick="toggleMilestones('${goal.id}')">
                    <span id="toggle-text-${goal.id}">Show Milestones (${totalMilestones})</span>
                    <i data-lucide="chevron-down" id="toggle-icon-${goal.id}"></i>
                </button>
            </div>
        </div>
    `;
}

function toggleMilestones(goalId) {
    const milestonesDiv = $(`#milestones-${goalId}`);
    const toggleText = $(`#toggle-text-${goalId}`);
    const toggleIcon = $(`#toggle-icon-${goalId}`);
    
    milestonesDiv.classList.toggle('hidden');
    
    if (milestonesDiv.classList.contains('hidden')) {
        toggleText.textContent = `Show Milestones (${AppState.goals.find(g => g.id === goalId).milestones?.length || 0})`;
        toggleIcon.setAttribute('data-lucide', 'chevron-down');
    } else {
        toggleText.textContent = 'Hide Milestones';
        toggleIcon.setAttribute('data-lucide', 'chevron-up');
    }
    
    lucide.createIcons();
}

function openAddGoalModal() {
    const modalContent = `
        <div class="modal animate-fade-in" style="max-width: 700px;">
            <div class="modal-header">
                <h3 class="modal-title">Create New Goal</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            
            <form onsubmit="handleAddGoal(event)" class="modal-body">
                <div class="input-group">
                    <label class="label required">Goal Title</label>
                    <input type="text" name="title" class="input" placeholder="e.g., Learn Web Development" required>
                </div>
                
                <div class="input-group">
                    <label class="label">Description</label>
                    <textarea name="description" class="input textarea" placeholder="Describe your goal (optional)"></textarea>
                </div>
                
                <div class="input-group">
                    <label class="label">Category</label>
                    <select name="category" class="select">
                        <option value="Personal">Personal</option>
                        <option value="Career">Career</option>
                        <option value="Health">Health</option>
                        <option value="Education">Education</option>
                        <option value="Finance">Finance</option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label class="label">Deadline</label>
                    <input type="date" name="deadline" class="input" required>
                </div>
                
                <div class="input-group">
                    <label class="label">Milestones</label>
                    <div id="milestones-container">
                        <div class="flex gap-2" style="margin-bottom: 0.5rem;">
                            <input type="text" class="input milestone-input" placeholder="Milestone 1" style="flex: 1;">
                            <button type="button" class="btn btn-ghost btn-icon" onclick="this.parentElement.remove()">
                                <i data-lucide="x"></i>
                            </button>
                        </div>
                    </div>
                    <button type="button" class="btn btn-outline btn-sm w-full" onclick="addMilestoneInput()">
                        <i data-lucide="plus"></i>
                        Add Milestone
                    </button>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i data-lucide="target"></i>
                        Create Goal
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
}

function addMilestoneInput() {
    const container = $('#milestones-container');
    const count = container.children.length + 1;
    const newInput = createElement(`
        <div class="flex gap-2" style="margin-bottom: 0.5rem;">
            <input type="text" class="input milestone-input" placeholder="Milestone ${count}" style="flex: 1;">
            <button type="button" class="btn btn-ghost btn-icon" onclick="this.parentElement.remove()">
                <i data-lucide="x"></i>
            </button>
        </div>
    `);
    container.appendChild(newInput);
    lucide.createIcons();
}

function handleAddGoal(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const milestoneInputs = $$('.milestone-input');
    const milestones = Array.from(milestoneInputs)
        .map(input => input.value.trim())
        .filter(value => value !== '')
        .map(title => ({
            id: generateId(),
            title: title,
            completed: false
        }));
    
    const goal = {
        id: generateId(),
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        deadline: formData.get('deadline'),
        milestones: milestones,
        createdAt: new Date().toISOString()
    };
    
    AppState.goals.push(goal);
    saveToStorage();
    
    closeModal();
    showToast('Goal created successfully!', 'success');
    renderGoals();
}

function toggleMilestone(goalId, milestoneId) {
    const goal = AppState.goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const milestone = goal.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;
    
    milestone.completed = !milestone.completed;
    
    if (milestone.completed) {
        AppState.user.exp += 15;
        showToast('+15 EXP earned!', 'success');
        
        // Check if all milestones completed
        if (goal.milestones.every(m => m.completed)) {
            showToast('🎉 Goal completed! Amazing work!', 'success', 5000);
            AppState.user.exp += 50;
            
            addNotification({
                type: 'achievement',
                title: 'Goal Achieved! 🏆',
                message: `Congratulations! You completed: ${goal.title}`,
            });
        }
    }
    
    saveToStorage();
    renderGoals();
}

// ==========================================
// TEAM COLLABORATION
// ==========================================

function renderTeam() {
    const app = $('#app');
    
    app.innerHTML = `
        <nav class="navbar">
            <div class="container">
                <div class="nav-content">
                    <div class="nav-brand">Focusly</div>
                    <div class="nav-menu">
                        <div class="nav-item" onclick="renderDashboard()">
                            <i data-lucide="layout-dashboard"></i>
                            Dashboard
                        </div>
                        <div class="nav-item" onclick="renderFocusMode()">
                            <i data-lucide="timer"></i>
                            Focus
                        </div>
                        <div class="nav-item" onclick="renderHabits()">
                            <i data-lucide="calendar-check"></i>
                            Habits
                        </div>
                        <div class="nav-item" onclick="renderGoals()">
                            <i data-lucide="target"></i>
                            Goals
                        </div>
                        <div class="nav-item active" onclick="renderTeam()">
                            <i data-lucide="users"></i>
                            Team
                        </div>
                        <button class="btn btn-ghost btn-icon" onclick="logout()">
                            <i data-lucide="log-out"></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
        
        <div class="dashboard">
            <div class="container">
                <div class="dashboard-header">
                    <h2>Team Collaboration</h2>
                    <button class="btn btn-primary" onclick="openAddProjectModal()">
                        <i data-lucide="plus"></i>
                        New Project
                    </button>
                </div>
                
                ${AppState.teamProjects.length > 0 ? `
                    ${AppState.teamProjects.map(project => renderProjectCard(project)).join('')}
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i data-lucide="users"></i>
                        </div>
                        <div class="empty-state-title">No projects yet</div>
                        <div class="empty-state-message">Create a project and invite your team</div>
                        <button class="btn btn-primary" onclick="openAddProjectModal()">
                            <i data-lucide="plus"></i>
                            Create Your First Project
                        </button>
                    </div>
                `}
            </div>
        </div>
        
        <nav class="mobile-nav">
            <div class="mobile-nav-content">
                <div class="mobile-nav-item" onclick="renderDashboard()">
                    <i data-lucide="layout-dashboard"></i>
                    <span>Dashboard</span>
                </div>
                <div class="mobile-nav-item" onclick="renderFocusMode()">
                    <i data-lucide="timer"></i>
                    <span>Focus</span>
                </div>
                <div class="mobile-nav-item" onclick="renderHabits()">
                    <i data-lucide="calendar-check"></i>
                    <span>Habits</span>
                </div>
                <div class="mobile-nav-item" onclick="renderGoals()">
                    <i data-lucide="target"></i>
                    <span>Goals</span>
                </div>
                <div class="mobile-nav-item active" onclick="renderTeam()">
                    <i data-lucide="users"></i>
                    <span>Team</span>
                </div>
            </div>
        </nav>
    `;
    
    lucide.createIcons();
}

function renderProjectCard(project) {
    const completedTasks = project.tasks?.filter(t => t.status === 'completed').length || 0;
    const totalTasks = project.tasks?.length || 1;
    const progress = Math.round((completedTasks / totalTasks) * 100);
    
    const now = new Date();
    const overdueTasks = project.tasks?.filter(t => {
        return t.status !== 'completed' && new Date(t.deadline) < now;
    }).length || 0;
    
    return `
        <div class="project-card">
            <div class="project-header">
                <div>
                    <div class="project-title">
                        <span class="project-color" style="background: ${project.color};"></span>
                        <h4>${project.name}</h4>
                    </div>
                    ${project.description ? `<div class="project-description">${project.description}</div>` : ''}
                </div>
            </div>
            
            <div class="members-section">
                <div class="members-header">
                    <h5>Team Members (${project.members?.length || 0})</h5>
                    <button class="btn btn-sm btn-outline" onclick="openAddFriendModal('${project.id}')">
                        <i data-lucide="user-plus"></i>
                        Add Member
                    </button>
                </div>
                <div class="members-list">
                    ${project.members?.map(member => `
                        <div class="member-avatar" style="background: ${getRandomColor()};" title="${member.name}">
                            ${getInitials(member.name)}
                        </div>
                    `).join('') || '<div style="color: var(--color-gray-600); font-size: 0.875rem;">No members yet</div>'}
                </div>
            </div>
            
            <div class="project-progress">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-size: 0.875rem; color: var(--color-gray-600);">Progress</span>
                    <span style="font-weight: 600; color: var(--color-primary);">${progress}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%;"></div>
                </div>
                ${overdueTasks > 0 ? `
                    <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--color-error);">
                        <i data-lucide="alert-circle"></i>
                        ${overdueTasks} task${overdueTasks > 1 ? 's' : ''} overdue
                    </div>
                ` : ''}
            </div>
            
            <div class="project-tasks">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <h5 style="font-size: 0.875rem; color: var(--color-gray-600); margin: 0;">Tasks (${totalTasks})</h5>
                    <button class="btn btn-sm btn-ghost" onclick="openAddTaskToProjectModal('${project.id}')">
                        <i data-lucide="plus"></i>
                    </button>
                </div>
                
                ${project.tasks && project.tasks.length > 0 ? `
                    ${project.tasks.map(task => `
                        <div class="team-task-item">
                            <div class="team-task-info">
                                <div class="team-task-title">${task.title}</div>
                                <div class="team-task-meta">
                                    <span class="badge badge-${task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : 'primary'}">
                                        ${task.status}
                                    </span>
                                    ${task.assignedTo ? `
                                        <span class="team-task-assignee">
                                            <i data-lucide="user"></i>
                                            ${task.assignedTo}
                                        </span>
                                    ` : ''}
                                    <span>
                                        <i data-lucide="calendar"></i>
                                        ${formatDate(task.deadline)}
                                    </span>
                                </div>
                            </div>
                            <button class="btn btn-ghost btn-icon btn-sm" onclick="cycleTaskStatus('${project.id}', '${task.id}')">
                                <i data-lucide="${task.status === 'completed' ? 'check-circle' : task.status === 'in-progress' ? 'play-circle' : 'circle'}"></i>
                            </button>
                        </div>
                    `).join('')}
                ` : '<div style="text-align: center; color: var(--color-gray-600); padding: 1rem; font-size: 0.875rem;">No tasks yet</div>'}
            </div>
        </div>
    `;
}

function openAddProjectModal() {
    const modalContent = `
        <div class="modal animate-fade-in">
            <div class="modal-header">
                <h3 class="modal-title">Create New Project</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            
            <form onsubmit="handleAddProject(event)" class="modal-body">
                <div class="input-group">
                    <label class="label required">Project Name</label>
                    <input type="text" name="name" class="input" placeholder="e.g., Website Redesign" required>
                </div>
                
                <div class="input-group">
                    <label class="label">Description</label>
                    <textarea name="description" class="input textarea" placeholder="Project description (optional)"></textarea>
                </div>
                
                <div class="input-group">
                    <label class="label">Project Color</label>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${['#6C63FF', '#2DD4BF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#F97316'].map((color, i) => `
                            <label style="cursor: pointer;">
                                <input type="radio" name="color" value="${color}" ${i === 0 ? 'checked' : ''} style="display: none;">
                                <div style="width: 3rem; height: 3rem; background: ${color}; border-radius: var(--radius-lg); cursor: pointer; border: 3px solid transparent; transition: all 0.2s;"></div>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="input-group">
                    <label class="label">Initial Tasks (Optional)</label>
                    <div id="project-tasks-container">
                        <input type="text" class="input project-task-input" placeholder="Task 1" style="margin-bottom: 0.5rem;">
                    </div>
                    <button type="button" class="btn btn-outline btn-sm w-full" onclick="addProjectTaskInput()">
                        <i data-lucide="plus"></i>
                        Add Task
                    </button>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i data-lucide="folder-plus"></i>
                        Create Project
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
    
    // Add radio styling
    $$('input[name="color"]').forEach(input => {
        input.addEventListener('change', function() {
            $$('input[name="color"]').forEach(i => {
                i.nextElementSibling.style.borderColor = 'transparent';
            });
            this.nextElementSibling.style.borderColor = this.value;
        });
    });
}

function addProjectTaskInput() {
    const container = $('#project-tasks-container');
    const count = container.children.length + 1;
    const newInput = createElement(`
        <input type="text" class="input project-task-input" placeholder="Task ${count}" style="margin-bottom: 0.5rem;">
    `);
    container.appendChild(newInput);
}

function handleAddProject(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const taskInputs = $$('.project-task-input');
    const tasks = Array.from(taskInputs)
        .map(input => input.value.trim())
        .filter(value => value !== '')
        .map(title => ({
            id: generateId(),
            title: title,
            status: 'to-do',
            assignedTo: null,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }));
    
    const project = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description'),
        color: formData.get('color'),
        members: [{ name: AppState.user.name, email: AppState.user.email }],
        tasks: tasks,
        createdAt: new Date().toISOString()
    };
    
    AppState.teamProjects.push(project);
    saveToStorage();
    
    closeModal();
    showToast('Project created successfully!', 'success');
    renderTeam();
}

function openAddFriendModal(projectId) {
    const modalContent = `
        <div class="modal animate-fade-in">
            <div class="modal-header">
                <h3 class="modal-title">Add Team Member</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="input-group">
                    <label class="label">Invite by Email</label>
                    <input type="email" id="invite-email" class="input" placeholder="colleague@example.com">
                    <button class="btn btn-primary w-full" style="margin-top: 0.5rem;" onclick="handleInviteByEmail('${projectId}')">
                        <i data-lucide="send"></i>
                        Send Invite
                    </button>
                </div>
                
                <div style="margin: 1.5rem 0; text-align: center; color: var(--color-gray-500); font-size: 0.875rem;">
                    OR
                </div>
                
                <div class="input-group">
                    <label class="label">Search Contacts</label>
                    <input type="text" id="search-contacts" class="input" placeholder="Search by name or email" onkeyup="searchContacts(this.value)">
                </div>
                
                <div id="contacts-list" style="margin-top: 1rem; max-height: 300px; overflow-y: auto;">
                    ${renderContactsList(projectId)}
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
    
    showModal(modalContent);
}

function renderContactsList(projectId) {
    // Demo contacts
    const contacts = [
        { name: 'John Doe', email: 'john@example.com' },
        { name: 'Jane Smith', email: 'jane@example.com' },
        { name: 'Mike Johnson', email: 'mike@example.com' },
        { name: 'Sarah Williams', email: 'sarah@example.com' }
    ];
    
    return `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${contacts.map(contact => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--color-gray-50); border-radius: var(--radius-lg);">
                    <div>
                        <div style="font-weight: 500;">${contact.name}</div>
                        <div style="font-size: 0.75rem; color: var(--color-gray-600);">${contact.email}</div>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="addMemberToProject('${projectId}', '${contact.name}', '${contact.email}')">
                        <i data-lucide="user-plus"></i>
                        Add
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function handleInviteByEmail(projectId) {
    const email = $('#invite-email').value;
    if (!email) {
        showToast('Please enter an email address', 'error');
        return;
    }
    
    const name = email.split('@')[0];
    addMemberToProject(projectId, name, email);
}

function addMemberToProject(projectId, name, email) {
    const project = AppState.teamProjects.find(p => p.id === projectId);
    if (!project) return;
    
    if (!project.members) project.members = [];
    
    // Check if already member
    if (project.members.some(m => m.email === email)) {
        showToast('Member already in project', 'warning');
        return;
    }
    
    project.members.push({ name, email });
    saveToStorage();
    
    closeModal();
    showToast(`${name} added to project!`, 'success');
    renderTeam();
}

function openAddTaskToProjectModal(projectId) {
    const project = AppState.teamProjects.find(p => p.id === projectId);
    if (!project) return;
    
    const modalContent = `
        <div class="modal animate-fade-in">
            <div class="modal-header">
                <h3 class="modal-title">Add Task to Project</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            
            <form onsubmit="handleAddTaskToProject(event, '${projectId}')" class="modal-body">
                <div class="input-group">
                    <label class="label required">Task Title</label>
                    <input type="text" name="title" class="input" placeholder="Task title" required>
                </div>
                
                <div class="input-group">
                    <label class="label">Assign To</label>
                    <select name="assignedTo" class="select">
                        <option value="">Unassigned</option>
                        ${project.members?.map(member => `
                            <option value="${member.name}">${member.name}</option>
                        `).join('') || ''}
                    </select>
                </div>
                
                <div class="input-group">
                    <label class="label">Deadline</label>
                    <input type="date" name="deadline" class="input" required>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i data-lucide="plus"></i>
                        Add Task
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal(modalContent);
}

function handleAddTaskToProject(event, projectId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const project = AppState.teamProjects.find(p => p.id === projectId);
    if (!project) return;
    
    if (!project.tasks) project.tasks = [];
    
    const task = {
        id: generateId(),
        title: formData.get('title'),
        assignedTo: formData.get('assignedTo') || null,
        deadline: formData.get('deadline'),
        status: 'to-do',
        createdAt: new Date().toISOString()
    };
    
    project.tasks.push(task);
    saveToStorage();
    
    closeModal();
    showToast('Task added to project!', 'success');
    renderTeam();
}

function cycleTaskStatus(projectId, taskId) {
    const project = AppState.teamProjects.find(p => p.id === projectId);
    if (!project) return;
    
    const task = project.tasks?.find(t => t.id === taskId);
    if (!task) return;
    
    const statuses = ['to-do', 'in-progress', 'completed'];
    const currentIndex = statuses.indexOf(task.status);
    task.status = statuses[(currentIndex + 1) % statuses.length];
    
    if (task.status === 'completed') {
        AppState.user.exp += 20;
        showToast('+20 EXP earned!', 'success');
    }
    
    saveToStorage();
    renderTeam();
}

// ==========================================
// NOTIFICATIONS
// ==========================================

function renderNotifications() {
    const app = $('#app');
    
    app.innerHTML = `
        <nav class="navbar">
            <div class="container">
                <div class="nav-content">
                    <div class="nav-brand">Focusly</div>
                    <div class="nav-menu">
                        <div class="nav-item" onclick="renderDashboard()">
                            <i data-lucide="layout-dashboard"></i>
                            Dashboard
                        </div>
                        <div class="nav-item" onclick="renderFocusMode()">
                            <i data-lucide="timer"></i>
                            Focus
                        </div>
                        <div class="nav-item" onclick="renderHabits()">
                            <i data-lucide="calendar-check"></i>
                            Habits
                        </div>
                        <div class="nav-item" onclick="renderGoals()">
                            <i data-lucide="target"></i>
                            Goals
                        </div>
                        <div class="nav-item" onclick="renderTeam()">
                            <i data-lucide="users"></i>
                            Team
                        </div>
                        <button class="btn btn-ghost btn-icon" onclick="logout()">
                            <i data-lucide="log-out"></i>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
        
        <div class="dashboard">
            <div class="container">
                <div class="dashboard-header">
                    <h2>Notifications</h2>
                    ${AppState.notifications.length > 0 ? `
                        <button class="btn btn-outline btn-sm" onclick="markAllAsRead()">
                            <i data-lucide="check-check"></i>
                            Mark All Read
                        </button>
                    ` : ''}
                </div>
                
                ${AppState.notifications.length > 0 ? `
                    ${AppState.notifications.map(notification => renderNotificationItem(notification)).join('')}
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i data-lucide="bell-off"></i>
                        </div>
                        <div class="empty-state-title">No notifications</div>
                        <div class="empty-state-message">You're all caught up!</div>
                    </div>
                `}
            </div>
        </div>
        
        <nav class="mobile-nav">
            <div class="mobile-nav-content">
                <div class="mobile-nav-item" onclick="renderDashboard()">
                    <i data-lucide="layout-dashboard"></i>
                    <span>Dashboard</span>
                </div>
                <div class="mobile-nav-item" onclick="renderFocusMode()">
                    <i data-lucide="timer"></i>
                    <span>Focus</span>
                </div>
                <div class="mobile-nav-item" onclick="renderHabits()">
                    <i data-lucide="calendar-check"></i>
                    <span>Habits</span>
                </div>
                <div class="mobile-nav-item" onclick="renderGoals()">
                    <i data-lucide="target"></i>
                    <span>Goals</span>
                </div>
                <div class="mobile-nav-item" onclick="renderTeam()">
                    <i data-lucide="users"></i>
                    <span>Team</span>
                </div>
            </div>
        </nav>
    `;
    
    lucide.createIcons();
}

function renderNotificationItem(notification) {
    const iconMap = {
        reminder: 'bell',
        location: 'map-pin',
        deadline: 'clock',
        achievement: 'trophy'
    };
    
    const colorMap = {
        reminder: 'rgba(108, 99, 255, 0.1)',
        location: 'rgba(45, 212, 191, 0.1)',
        deadline: 'rgba(245, 158, 11, 0.1)',
        achievement: 'rgba(16, 185, 129, 0.1)'
    };
    
    return `
        <div class="notification-item ${notification.read ? '' : 'unread'}" onclick="showNotificationDetail('${notification.id}')">
            <div class="notification-icon" style="background: ${colorMap[notification.type]};">
                <i data-lucide="${iconMap[notification.type]}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${formatDate(notification.createdAt || new Date())}</div>
                
                ${notification.location ? `
                    <div class="notification-map-preview">
                        <i data-lucide="map"></i>
                        <span>${notification.location}</span>
                    </div>
                ` : ''}
                
                ${notification.hasVoice ? `
                    <div class="notification-voice-player">
                        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); playVoiceNote('${notification.id}')">
                            <i data-lucide="play"></i>
                            Play Voice Note
                        </button>
                    </div>
                ` : ''}
                
                ${notification.imageUrl ? `
                    <img src="${notification.imageUrl}" class="notification-image-preview" alt="Notification image">
                ` : ''}
            </div>
            <div class="notification-actions">
                <button class="btn btn-ghost btn-icon btn-sm" onclick="event.stopPropagation(); deleteNotification('${notification.id}')">
                    <i data-lucide="x"></i>
                </button>
            </div>
        </div>
    `;
}

function addNotification(notification) {
    AppState.notifications.unshift({
        id: generateId(),
        ...notification,
        read: false,
        createdAt: new Date().toISOString()
    });
    saveToStorage();
}

function showNotificationDetail(notificationId) {
    const notification = AppState.notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    notification.read = true;
    saveToStorage();
    
    const modalContent = `
        <div class="modal animate-fade-in">
            <div class="modal-header">
                <h3 class="modal-title">${notification.title}</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <p>${notification.message}</p>
                
                ${notification.location ? `
                    <div style="margin-top: 1rem;">
                        <h4 style="font-size: 0.875rem; margin-bottom: 0.5rem;">Location</h4>
                        <div class="notification-map-preview" style="height: 200px;">
                            <i data-lucide="map"></i>
                            <div>${notification.location}</div>
                            <div style="font-size: 0.75rem; margin-top: 0.5rem;">Interactive map preview</div>
                        </div>
                    </div>
                ` : ''}
                
                ${notification.hasVoice ? `
                    <div style="margin-top: 1rem;">
                        <h4 style="font-size: 0.875rem; margin-bottom: 0.5rem;">Voice Note</h4>
                        <button class="btn btn-outline w-full" onclick="playVoiceNote('${notification.id}')">
                            <i data-lucide="play"></i>
                            Play Recording
                        </button>
                    </div>
                ` : ''}
                
                ${notification.imageUrl ? `
                    <div style="margin-top: 1rem;">
                        <h4 style="font-size: 0.875rem; margin-bottom: 0.5rem;">Image</h4>
                        <img src="${notification.imageUrl}" style="width: 100%; border-radius: var(--radius-lg);" alt="Notification image">
                    </div>
                ` : ''}
                
                <div style="margin-top: 1rem; font-size: 0.75rem; color: var(--color-gray-600);">
                    ${formatDate(notification.createdAt)}
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal()">Close</button>
                <button class="btn btn-error" onclick="deleteNotification('${notification.id}'); closeModal();">
                    <i data-lucide="trash-2"></i>
                    Delete
                </button>
            </div>
        </div>
    `;
    
    showModal(modalContent);
    renderNotifications();
}

function playVoiceNote(notificationId) {
    showToast('Playing voice note...', 'info');
    // In real app, would play actual audio
}

function deleteNotification(notificationId) {
    AppState.notifications = AppState.notifications.filter(n => n.id !== notificationId);
    saveToStorage();
    renderNotifications();
    showToast('Notification deleted', 'info');
}

function markAllAsRead() {
    AppState.notifications.forEach(n => n.read = true);
    saveToStorage();
    renderNotifications();
    showToast('All notifications marked as read', 'success');
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    
    if (AppState.user) {
        renderDashboard();
    } else {
        renderLogin();
    }
    
    // Demo data for testing (only if no data exists)
    if (AppState.tasks.length === 0) {
        AppState.tasks = [
            {
                id: 'demo1',
                title: 'Review project proposal',
                description: 'Check the design mockups',
                priority: 'high',
                date: new Date().toISOString(),
                completed: false,
                hasLocation: true,
                location: 'Office Building, Downtown',
                hasVoice: true,
                hasImage: false
            }
        ];
        
        AppState.notifications = [
            {
                id: 'notif1',
                type: 'achievement',
                title: 'Welcome to Focusly! 🎉',
                message: 'Start your productivity journey today',
                read: false,
                createdAt: new Date().toISOString()
            }
        ];
        
        saveToStorage();
    }
});

// Make functions globally accessible
window.renderLogin = renderLogin;
window.renderSignup = renderSignup;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.logout = logout;
window.renderDashboard = renderDashboard;
window.changeMonth = changeMonth;
window.openAddTaskModal = openAddTaskModal;
window.handleAddTask = handleAddTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.previewImage = previewImage;
window.handleVoiceRecord = handleVoiceRecord;
window.renderFocusMode = renderFocusMode;
window.setTimerMode = setTimerMode;
window.setCustomTime = setCustomTime;
window.toggleTimer = toggleTimer;
window.stopTimer = stopTimer;
window.resetTimer = resetTimer;
window.renderHabits = renderHabits;
window.openAddHabitModal = openAddHabitModal;
window.handleAddHabit = handleAddHabit;
window.toggleHabitDay = toggleHabitDay;
window.renderGoals = renderGoals;
window.openAddGoalModal = openAddGoalModal;
window.addMilestoneInput = addMilestoneInput;
window.handleAddGoal = handleAddGoal;
window.toggleMilestones = toggleMilestones;
window.toggleMilestone = toggleMilestone;
window.renderTeam = renderTeam;
window.openAddProjectModal = openAddProjectModal;
window.addProjectTaskInput = addProjectTaskInput;
window.handleAddProject = handleAddProject;
window.openAddFriendModal = openAddFriendModal;
window.handleInviteByEmail = handleInviteByEmail;
window.addMemberToProject = addMemberToProject;
window.openAddTaskToProjectModal = openAddTaskToProjectModal;
window.handleAddTaskToProject = handleAddTaskToProject;
window.cycleTaskStatus = cycleTaskStatus;
window.renderNotifications = renderNotifications;
window.showNotificationDetail = showNotificationDetail;
window.playVoiceNote = playVoiceNote;
window.deleteNotification = deleteNotification;
window.markAllAsRead = markAllAsRead;
window.closeModal = closeModal;

console.log('Focusly loaded successfully! 🚀');
