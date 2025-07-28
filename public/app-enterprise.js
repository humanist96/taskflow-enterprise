// TaskFlow Enterprise - Professional Application
class TaskFlowEnterprise {
    constructor() {
        this.currentUser = null;
        this.tasks = [];
        this.stats = {
            total: 0,
            completed: 0,
            inProgress: 0,
            completionRate: 0,
            productivity: 85
        };
        this.charts = {};
        this.theme = localStorage.getItem('theme') || 'light';
        this.language = localStorage.getItem('language') || 'ko';
        
        this.init();
    }

    async init() {
        // Check authentication
        try {
            this.currentUser = await apiClient.getCurrentUser();
            this.showApp();
            await this.loadDashboard();
        } catch (error) {
            this.showLogin();
        }

        this.setupEventListeners();
        this.initCharts();
        this.startRealtimeUpdates();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // New task form
        document.getElementById('newTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTask();
        });

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.filterTasks(e.target.dataset.filter);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: New task
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.openNewTaskModal();
            }
            // Ctrl/Cmd + K: Quick search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openQuickSearch();
            }
        });
    }

    // Authentication
    showLogin() {
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }

    showApp() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
        this.updateUserInfo();
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            this.currentUser = await apiClient.login(username, password);
            this.showApp();
            await this.loadDashboard();
            this.showNotification('로그인 성공', 'success');
        } catch (error) {
            this.showNotification('로그인 실패: ' + error.message, 'error');
        }
    }

    updateUserInfo() {
        const welcomeMsg = this.getGreeting();
        document.getElementById('welcomeMessage').textContent = `${welcomeMsg}, ${this.currentUser?.username || 'User'}님`;
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });

        // Update avatar
        if (this.currentUser) {
            const avatarUrl = `https://ui-avatars.com/api/?name=${this.currentUser.username}&background=5A63EA&color=fff`;
            document.getElementById('userAvatar').src = avatarUrl;
        }
    }

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return '좋은 아침입니다';
        if (hour < 18) return '좋은 오후입니다';
        return '좋은 저녁입니다';
    }

    // Dashboard
    async loadDashboard() {
        try {
            // Load tasks
            this.tasks = await apiClient.getTasks();
            
            // Calculate stats
            this.calculateStats();
            
            // Update UI
            this.updateStatsCards();
            this.updateCharts();
            this.renderTasks();
        } catch (error) {
            this.showNotification('데이터 로드 실패', 'error');
        }
    }

    calculateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.status === 'completed').length;
        const inProgress = this.tasks.filter(t => t.status === 'in_progress').length;
        
        this.stats = {
            total,
            completed,
            inProgress,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            productivity: this.calculateProductivity()
        };
    }

    calculateProductivity() {
        // Complex productivity calculation
        const today = new Date();
        const todayTasks = this.tasks.filter(t => {
            const taskDate = new Date(t.created_at);
            return taskDate.toDateString() === today.toDateString();
        });

        const completedToday = todayTasks.filter(t => t.status === 'completed').length;
        const highPriorityCompleted = this.tasks.filter(t => 
            t.status === 'completed' && t.priority === 'high'
        ).length;

        // Weighted calculation
        const base = this.stats.completionRate * 0.5;
        const todayScore = (completedToday / Math.max(todayTasks.length, 1)) * 30;
        const priorityScore = (highPriorityCompleted / Math.max(this.tasks.length, 1)) * 20;

        return Math.min(100, Math.round(base + todayScore + priorityScore));
    }

    updateStatsCards() {
        // Animate numbers
        this.animateNumber('totalTasksStat', this.stats.total);
        this.animateNumber('completionRateStat', this.stats.completionRate, '%');
        this.animateNumber('productivityStat', this.stats.productivity);
    }

    animateNumber(elementId, target, suffix = '') {
        const element = document.getElementById(elementId);
        const current = parseInt(element.textContent) || 0;
        const increment = (target - current) / 30;
        let value = current;

        const animation = setInterval(() => {
            value += increment;
            if ((increment > 0 && value >= target) || (increment < 0 && value <= target)) {
                value = target;
                clearInterval(animation);
            }
            element.textContent = Math.round(value) + suffix;
        }, 20);
    }

    // Charts
    initCharts() {
        // Trend Chart
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        this.charts.trend = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: this.getLast7Days(),
                datasets: [{
                    label: '생성된 업무',
                    data: [12, 19, 15, 25, 22, 30, 28],
                    borderColor: '#5A63EA',
                    backgroundColor: 'rgba(90, 99, 234, 0.1)',
                    tension: 0.3
                }, {
                    label: '완료된 업무',
                    data: [10, 15, 13, 20, 18, 25, 24],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Category Chart
        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        this.charts.category = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['개발', '디자인', '마케팅', '지원'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: ['#5A63EA', '#10B981', '#F59E0B', '#EF4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateCharts() {
        // Update with real data
        const last7Days = this.getLast7Days();
        const createdByDay = new Array(7).fill(0);
        const completedByDay = new Array(7).fill(0);

        this.tasks.forEach(task => {
            const taskDate = new Date(task.created_at);
            const dayIndex = this.getDayIndex(taskDate);
            if (dayIndex >= 0) {
                createdByDay[dayIndex]++;
                if (task.status === 'completed') {
                    completedByDay[dayIndex]++;
                }
            }
        });

        this.charts.trend.data.datasets[0].data = createdByDay;
        this.charts.trend.data.datasets[1].data = completedByDay;
        this.charts.trend.update();
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
        }
        return days;
    }

    getDayIndex(date) {
        const today = new Date();
        const diffTime = today - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 6 ? 6 - diffDays : -1;
    }

    // Tasks
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const tasksToShow = this.tasks.filter(t => t.status !== 'completed').slice(0, 10);

        if (tasksToShow.length === 0) {
            taskList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--gray-500);">
                    <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <p>모든 업무를 완료했습니다! 🎉</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = tasksToShow.map(task => this.createTaskHTML(task)).join('');
    }

    createTaskHTML(task) {
        const priorityColors = {
            high: 'priority-high',
            medium: 'priority-medium',
            low: 'priority-low'
        };

        return `
            <div class="task-enterprise animate-fadeIn">
                <div class="task-checkbox-wrapper">
                    <input type="checkbox" class="task-checkbox" 
                           onchange="app.toggleTask(${task.id})"
                           ${task.status === 'completed' ? 'checked' : ''}>
                </div>
                
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-meta">
                        <span class="task-priority-badge ${priorityColors[task.priority]}">
                            ${task.priority}
                        </span>
                        ${task.category_name ? `<span><i class="fas fa-folder"></i> ${task.category_name}</span>` : ''}
                        ${task.due_date ? `<span><i class="fas fa-clock"></i> ${this.formatDate(task.due_date)}</span>` : ''}
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="btn-enterprise btn-ghost btn-sm" onclick="app.showTaskDetail(${task.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-enterprise btn-ghost btn-sm" onclick="app.editTask(${task.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-enterprise btn-ghost btn-sm" onclick="app.deleteTask(${task.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    async toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newStatus = task.status === 'completed' ? 'pending' : 'completed';

        try {
            await apiClient.updateTask(taskId, { status: newStatus });
            await this.loadDashboard();
            
            if (newStatus === 'completed') {
                this.showNotification('업무를 완료했습니다! 🎉', 'success');
                this.playCompletionSound();
            }
        } catch (error) {
            this.showNotification('업무 업데이트 실패', 'error');
        }
    }

    async createTask() {
        const formData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            category_id: document.getElementById('taskCategory').value || null,
            due_date: document.getElementById('taskDueDate').value || null,
            tags: document.getElementById('taskTags').value.split(',').map(t => t.trim()).filter(t => t)
        };

        try {
            await apiClient.createTask(formData);
            this.closeNewTaskModal();
            document.getElementById('newTaskForm').reset();
            await this.loadDashboard();
            this.showNotification('새 업무가 추가되었습니다', 'success');
        } catch (error) {
            this.showNotification('업무 추가 실패: ' + error.message, 'error');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('이 업무를 삭제하시겠습니까?')) return;

        try {
            await apiClient.deleteTask(taskId);
            await this.loadDashboard();
            this.showNotification('업무가 삭제되었습니다', 'info');
        } catch (error) {
            this.showNotification('업무 삭제 실패', 'error');
        }
    }

    showTaskDetail(taskId) {
        // Create iframe to load task detail
        const detailFrame = document.createElement('iframe');
        detailFrame.src = 'task-detail.html';
        detailFrame.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; border: none; z-index: 9999;';
        
        detailFrame.onload = function() {
            // Pass task ID to the detail view
            detailFrame.contentWindow.showTaskDetail(taskId);
        };
        
        document.body.appendChild(detailFrame);
        
        // Store reference for cleanup
        window.currentDetailFrame = detailFrame;
    }

    editTask(taskId) {
        this.showTaskDetail(taskId);
    }

    // UI Helpers
    openNewTaskModal() {
        document.getElementById('newTaskModal').style.display = 'flex';
        document.getElementById('taskTitle').focus();
    }

    closeNewTaskModal() {
        document.getElementById('newTaskModal').style.display = 'none';
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} animate-slideIn`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    playCompletionSound() {
        // Play a subtle completion sound
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9r0yHUoBSh+zPLaizsIGGS56+iqWBQKSJ/h8b9pIAUthM7y2IcyBBtu');
        audio.volume = 0.3;
        audio.play();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return '오늘';
        if (diffDays === 1) return '내일';
        if (diffDays === -1) return '어제';
        if (diffDays > 0 && diffDays <= 7) return `${diffDays}일 후`;

        return date.toLocaleDateString('ko-KR');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Realtime updates
    startRealtimeUpdates() {
        // Simulate realtime updates
        setInterval(() => {
            this.updateUserInfo();
        }, 60000); // Update every minute

        // Simulate notifications
        setTimeout(() => {
            this.showNotificationBadge(3);
        }, 5000);
    }

    showNotificationBadge(count) {
        const badge = document.getElementById('notificationBadge');
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }

    async logout() {
        try {
            await apiClient.logout();
            this.currentUser = null;
            this.showLogin();
            this.showNotification('로그아웃되었습니다', 'info');
        } catch (error) {
            this.showNotification('로그아웃 실패', 'error');
        }
    }
}

// Global functions
function openNewTaskModal() {
    window.app.openNewTaskModal();
}

function closeNewTaskModal() {
    window.app.closeNewTaskModal();
}

function toggleUserMenu() {
    window.app.toggleUserMenu();
}

function logout() {
    window.app.logout();
}

function openNotifications() {
    window.app.showNotification('알림 기능은 준비 중입니다', 'info');
}

function showTeamView() {
    window.location.href = 'team-view.html';
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TaskFlowEnterprise();
    window.app = app;
});

// Add required CSS for components
const style = document.createElement('style');
style.textContent = `
    /* Additional Enterprise Styles */
    .app-container {
        display: flex;
        height: 100vh;
        background: var(--gray-50);
    }

    .sidebar-enterprise {
        width: 260px;
        background: white;
        border-right: 1px solid var(--gray-200);
        padding: var(--space-6);
        overflow-y: auto;
    }

    .sidebar-section {
        margin-bottom: var(--space-8);
    }

    .sidebar-title {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--gray-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--space-3);
    }

    .sidebar-link {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        color: var(--gray-700);
        text-decoration: none;
        border-radius: var(--radius-lg);
        transition: all var(--transition-fast);
        margin-bottom: var(--space-1);
    }

    .sidebar-link:hover {
        background: var(--gray-100);
        color: var(--gray-900);
    }

    .sidebar-link.active {
        background: var(--primary-100);
        color: var(--primary-700);
        font-weight: 500;
    }

    .main-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--space-8);
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-8);
    }

    .page-title {
        margin-bottom: var(--space-2);
    }

    .page-subtitle {
        color: var(--gray-600);
        font-size: var(--text-lg);
    }

    .page-actions {
        display: flex;
        gap: var(--space-3);
    }

    .charts-row {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: var(--space-6);
        margin-bottom: var(--space-8);
    }

    .flex-between {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .filter-tabs {
        display: flex;
        gap: var(--space-2);
    }

    .filter-tab {
        padding: var(--space-2) var(--space-4);
        border: 1px solid var(--gray-300);
        background: white;
        border-radius: var(--radius-lg);
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--gray-600);
        cursor: pointer;
        transition: all var(--transition-fast);
    }

    .filter-tab:hover {
        border-color: var(--gray-400);
        color: var(--gray-800);
    }

    .filter-tab.active {
        background: var(--primary-600);
        border-color: var(--primary-600);
        color: white;
    }

    .task-list-enterprise {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }

    .task-actions {
        display: flex;
        gap: var(--space-2);
    }

    .btn-sm {
        padding: var(--space-2) var(--space-3);
        font-size: var(--text-sm);
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-4);
    }

    .user-menu {
        position: relative;
    }

    .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid var(--gray-200);
        transition: all var(--transition-fast);
    }

    .user-avatar:hover {
        border-color: var(--primary-400);
    }

    .user-avatar img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
    }

    .dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: var(--space-2);
        background: white;
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        min-width: 200px;
        z-index: var(--z-dropdown);
    }

    .dropdown-item {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        color: var(--gray-700);
        text-decoration: none;
        transition: all var(--transition-fast);
    }

    .dropdown-item:hover {
        background: var(--gray-50);
        color: var(--gray-900);
    }

    .dropdown-divider {
        margin: var(--space-2) 0;
        border: none;
        border-top: 1px solid var(--gray-200);
    }

    .notification {
        position: fixed;
        bottom: var(--space-6);
        right: var(--space-6);
        background: white;
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
        padding: var(--space-4) var(--space-6);
        box-shadow: var(--shadow-xl);
        display: flex;
        align-items: center;
        gap: var(--space-3);
        max-width: 400px;
        z-index: var(--z-tooltip);
    }

    .notification-success {
        border-color: var(--success-main);
        color: var(--success-dark);
    }

    .notification-error {
        border-color: var(--error-main);
        color: var(--error-dark);
    }

    .notification-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: var(--error-main);
        color: white;
        font-size: var(--text-xs);
        font-weight: 600;
        padding: 2px 6px;
        border-radius: var(--radius-full);
        min-width: 18px;
        text-align: center;
    }

    @media (max-width: 1024px) {
        .sidebar-enterprise {
            display: none;
        }
        
        .charts-row {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 640px) {
        .main-content {
            padding: var(--space-4);
        }
        
        .page-header {
            flex-direction: column;
            gap: var(--space-4);
        }
        
        .form-row {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(style);