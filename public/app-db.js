// TaskFlow Pro - Database Connected Application
class TaskFlowApp {
    constructor() {
        this.currentUser = null;
        this.tasks = [];
        this.categories = [];
        this.tags = [];
        this.filters = {
            search: '',
            category: '',
            priority: 'all',
            status: ''
        };
        this.sortBy = 'date';
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        // Check authentication
        try {
            this.currentUser = await apiClient.getCurrentUser();
            this.showMainApp();
            await this.loadInitialData();
        } catch (error) {
            this.showAuthModal();
        }

        this.setupEventListeners();
        this.applyTheme();
    }

    setupEventListeners() {
        // Auth form
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuth();
        });

        document.getElementById('authToggle').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthMode();
        });

        // Task form
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.loadTasks();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.loadTasks();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
    }

    // Authentication methods
    showAuthModal() {
        document.getElementById('authModal').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('themeToggle').style.display = 'none';
    }

    showMainApp() {
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('themeToggle').style.display = 'block';
        document.getElementById('welcomeUser').textContent = `환영합니다, ${this.currentUser.username}님`;
        this.updateDate();
    }

    toggleAuthMode() {
        const isLogin = document.getElementById('authTitle').textContent.includes('로그인');
        
        if (isLogin) {
            // Switch to register mode
            document.getElementById('authTitle').textContent = 'TaskFlow Pro 회원가입';
            document.getElementById('emailGroup').style.display = 'block';
            document.getElementById('authEmail').required = true;
            document.getElementById('authSubmitText').textContent = '회원가입';
            document.getElementById('authToggleText').textContent = '이미 계정이 있으신가요?';
            document.getElementById('authToggle').textContent = '로그인';
        } else {
            // Switch to login mode
            document.getElementById('authTitle').textContent = 'TaskFlow Pro 로그인';
            document.getElementById('emailGroup').style.display = 'none';
            document.getElementById('authEmail').required = false;
            document.getElementById('authSubmitText').textContent = '로그인';
            document.getElementById('authToggleText').textContent = '계정이 없으신가요?';
            document.getElementById('authToggle').textContent = '회원가입';
        }
    }

    async handleAuth() {
        const username = document.getElementById('authUsername').value;
        const password = document.getElementById('authPassword').value;
        const email = document.getElementById('authEmail').value;
        const isLogin = document.getElementById('authTitle').textContent.includes('로그인');

        try {
            if (isLogin) {
                this.currentUser = await apiClient.login(username, password);
            } else {
                this.currentUser = await apiClient.register(username, email, password);
            }

            this.showMainApp();
            await this.loadInitialData();
            this.showNotification('성공', isLogin ? '로그인되었습니다!' : '회원가입이 완료되었습니다!');
        } catch (error) {
            this.showNotification('오류', error.message, 'error');
        }
    }

    async loadInitialData() {
        try {
            // Load categories
            this.categories = await apiClient.getCategories();
            this.updateCategorySelects();

            // Load tags
            this.tags = await apiClient.getTags();

            // Load tasks
            await this.loadTasks();

            // Load stats
            await this.updateStats();
        } catch (error) {
            this.showNotification('오류', '데이터 로드 실패', 'error');
        }
    }

    updateCategorySelects() {
        const categoryFilter = document.getElementById('categoryFilter');
        const categorySelect = document.getElementById('categorySelect');

        const categoryOptions = this.categories.map(cat => 
            `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
        ).join('');

        categoryFilter.innerHTML = '<option value="">모든 카테고리</option>' + categoryOptions;
        categorySelect.innerHTML = '<option value="">카테고리 선택</option>' + categoryOptions;
    }

    async loadTasks() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const filters = {};
            if (this.filters.search) filters.search = this.filters.search;
            if (this.filters.category) filters.category = this.filters.category;
            if (this.filters.priority !== 'all') filters.priority = this.filters.priority;
            if (this.filters.status) filters.status = this.filters.status;

            this.tasks = await apiClient.getTasks(filters);
            this.renderTasks();
            await this.updateStats();
        } catch (error) {
            this.showNotification('오류', '업무 로드 실패', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        
        if (this.tasks.length === 0) {
            taskList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
                    <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <p>업무가 없습니다. 새로운 업무를 추가해보세요!</p>
                </div>
            `;
            return;
        }

        // Sort tasks
        const sortedTasks = this.sortTasksArray(this.tasks);

        taskList.innerHTML = sortedTasks.map((task, index) => this.createTaskHTML(task, index)).join('');

        // Add animations
        const taskElements = taskList.querySelectorAll('.task-item');
        taskElements.forEach((el, i) => {
            el.style.animationDelay = `${i * 50}ms`;
        });
    }

    createTaskHTML(task, index) {
        const priorityColors = {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#3b82f6'
        };

        const category = this.categories.find(cat => cat.id === task.category_id);
        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

        return `
            <div class="task-item list-item-modern ${task.status === 'completed' ? 'completed' : ''}" 
                 data-task-id="${task.id}"
                 style="background: var(--bg-primary); border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; 
                        border-left: 4px solid ${priorityColors[task.priority]}; 
                        display: flex; align-items: center; gap: 1rem; transition: all 0.3s;">
                
                <input type="checkbox" 
                       class="task-checkbox" 
                       ${task.status === 'completed' ? 'checked' : ''} 
                       onchange="app.toggleTask(${task.id})"
                       style="width: 20px; height: 20px; cursor: pointer;">
                
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        ${category ? `<span style="font-size: 1.2rem;">${category.icon}</span>` : ''}
                        <h3 style="font-size: 1.1rem; font-weight: 500; ${task.status === 'completed' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${this.escapeHtml(task.title)}</h3>
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                        ${task.tags.map(tag => `<span class="tag">#${this.escapeHtml(tag)}</span>`).join('')}
                        ${task.due_date ? `
                            <span style="font-size: 0.875rem; color: ${isOverdue ? '#ef4444' : 'var(--text-tertiary)'};">
                                <i class="fas fa-clock"></i> ${this.formatDate(task.due_date)}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-modern" onclick="app.deleteTask(${task.id})" 
                            style="padding: 0.5rem; background: #fee;">
                        <i class="fas fa-trash" style="color: #ef4444;"></i>
                    </button>
                </div>
            </div>
        `;
    }

    async addTask() {
        const title = document.getElementById('taskInput').value.trim();
        const priority = document.getElementById('prioritySelect').value;
        const category_id = document.getElementById('categorySelect').value || null;
        const tagsInput = document.getElementById('tagsInput').value;
        const due_date = document.getElementById('dueDateInput').value || null;

        if (!title) {
            this.showNotification('오류', '업무 내용을 입력해주세요!', 'error');
            return;
        }

        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);

        try {
            await apiClient.createTask({
                title,
                priority,
                category_id,
                tags,
                due_date
            });

            // Clear form
            document.getElementById('taskForm').reset();
            document.getElementById('prioritySelect').value = 'medium';

            // Reload tasks
            await this.loadTasks();
            this.showNotification('성공', '새 업무가 추가되었습니다!');
        } catch (error) {
            this.showNotification('오류', error.message, 'error');
        }
    }

    async toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newStatus = task.status === 'completed' ? 'pending' : 'completed';

        try {
            await apiClient.updateTask(taskId, { status: newStatus });
            await this.loadTasks();

            if (newStatus === 'completed') {
                this.showNotification('완료!', '업무를 완료했습니다! 🎉');
            }
        } catch (error) {
            this.showNotification('오류', error.message, 'error');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('이 업무를 삭제하시겠습니까?')) return;

        try {
            await apiClient.deleteTask(taskId);
            await this.loadTasks();
            this.showNotification('삭제됨', '업무가 삭제되었습니다.');
        } catch (error) {
            this.showNotification('오류', error.message, 'error');
        }
    }

    async updateStats() {
        try {
            const stats = await apiClient.getStats();
            
            // Update UI
            document.getElementById('todayTasks').textContent = stats.tasks.today || 0;
            document.getElementById('inProgressTasks').textContent = stats.tasks.in_progress || 0;
            
            const completionRate = stats.tasks.total > 0 
                ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) 
                : 0;
            document.getElementById('completionRate').textContent = completionRate + '%';
        } catch (error) {
            console.error('Stats update error:', error);
        }
    }

    sortTasksArray(tasks) {
        return [...tasks].sort((a, b) => {
            if (this.sortBy === 'priority') {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            } else {
                return new Date(b.created_at) - new Date(a.created_at);
            }
        });
    }

    sortTasks(sortBy) {
        this.sortBy = sortBy;
        this.renderTasks();
    }

    filterByPriority(priority) {
        this.filters.priority = priority;
        
        // Update active state
        document.querySelectorAll('[data-priority]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.priority === priority);
        });
        
        this.loadTasks();
    }

    toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        localStorage.setItem('theme', newTheme);
        this.applyTheme();
        
        // Update icon
        const icon = document.getElementById('themeIcon');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    applyTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }

    updateDate() {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        document.getElementById('currentDate').textContent = today.toLocaleDateString('ko-KR', options);
    }

    showNotification(title, message, type = 'success') {
        const toast = document.getElementById('notificationToast');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        const icon = toast.querySelector('i');
        
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        const iconClasses = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        
        const iconColors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };
        
        icon.className = iconClasses[type];
        icon.style.color = iconColors[type];
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
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
        
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async logout() {
        try {
            await apiClient.logout();
            this.currentUser = null;
            this.showAuthModal();
            this.showNotification('로그아웃', '안전하게 로그아웃되었습니다.');
        } catch (error) {
            this.showNotification('오류', error.message, 'error');
        }
    }

    async exportData() {
        try {
            const data = {
                tasks: this.tasks,
                categories: this.categories,
                exportDate: new Date().toISOString(),
                user: this.currentUser.username
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            this.showNotification('성공', '데이터를 내보냈습니다.');
        } catch (error) {
            this.showNotification('오류', '내보내기 실패', 'error');
        }
    }
}

// Global functions for inline event handlers
function filterByPriority(priority) {
    app.filterByPriority(priority);
}

function sortTasks(sortBy) {
    app.sortTasks(sortBy);
}

function logout() {
    app.logout();
}

function exportData() {
    app.exportData();
}

function loadTasks() {
    app.loadTasks();
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TaskFlowApp();
});