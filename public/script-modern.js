// Modern Task Management System
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.selectedCategory = '';
        this.selectedPriority = 'all';
        this.sortBy = 'date';
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.updateUI();
        this.startRealtimeUpdates();
        this.initDragAndDrop();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Task input
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) this.addTask();
        });
        
        // Search and filters
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderTasks();
        });
        
        // Sort buttons
        document.getElementById('sortByDate').addEventListener('click', () => {
            this.sortBy = 'date';
            this.renderTasks();
        });
        
        document.getElementById('sortByPriority').addEventListener('click', () => {
            this.sortBy = 'priority';
            this.renderTasks();
        });
        
        // Category filter
        document.querySelector('select.input-modern').addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            this.renderTasks();
        });
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.theme);
        
        // Animate theme icon
        const icon = document.getElementById('themeIcon');
        icon.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            icon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            icon.style.transform = 'rotate(0deg)';
        }, 300);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const prioritySelect = document.getElementById('prioritySelect');
        const categorySelect = document.getElementById('categorySelect');
        const tagsInput = document.getElementById('tagsInput');
        const dueDateInput = document.getElementById('dueDateInput');
        
        const taskText = taskInput.value.trim();
        if (!taskText) {
            this.showNotification('오류', '업무 내용을 입력해주세요!', 'error');
            return;
        }
        
        const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            priority: prioritySelect.value,
            category: categorySelect.value,
            tags: tags,
            dueDate: dueDateInput.value,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        this.tasks.unshift(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        // Clear inputs
        taskInput.value = '';
        prioritySelect.value = 'medium';
        categorySelect.value = '';
        tagsInput.value = '';
        dueDateInput.value = '';
        
        // Show success notification
        this.showNotification('성공', '새 업무가 추가되었습니다!', 'success');
        
        // Animate new task
        setTimeout(() => {
            const newTaskEl = document.querySelector(`[data-task-id="${newTask.id}"]`);
            if (newTaskEl) {
                newTaskEl.style.animation = 'pulse 0.5s ease-in-out';
            }
        }, 100);
    }

    deleteTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;
        
        // Animate removal
        const taskEl = document.querySelector(`[data-task-id="${id}"]`);
        if (taskEl) {
            taskEl.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
                this.showNotification('삭제됨', '업무가 삭제되었습니다.', 'info');
            }, 300);
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;
        
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        // Celebrate completion
        if (task.completed) {
            this.showNotification('완료!', '업무를 완료했습니다! 🎉', 'success');
            this.playCompletionAnimation(id);
        }
    }

    playCompletionAnimation(taskId) {
        const taskEl = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskEl) {
            taskEl.style.animation = 'bounce 0.5s ease-in-out';
        }
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        const sortedTasks = this.sortTasks(filteredTasks);
        
        const taskList = document.getElementById('taskList');
        
        if (sortedTasks.length === 0) {
            taskList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
                    <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <p>업무가 없습니다. 새로운 업무를 추가해보세요!</p>
                </div>
            `;
            return;
        }
        
        taskList.innerHTML = sortedTasks.map((task, index) => this.createTaskHTML(task, index)).join('');
        
        // Add stagger animation
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
        
        const categoryIcons = {
            work: '💼',
            personal: '👤',
            project: '📁',
            meeting: '🤝'
        };
        
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        
        return `
            <div class="task-item list-item-modern draggable ${task.completed ? 'completed' : ''}" 
                 data-task-id="${task.id}"
                 draggable="true"
                 style="background: var(--bg-primary); border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; 
                        border-left: 4px solid ${priorityColors[task.priority]}; cursor: move;
                        display: flex; align-items: center; gap: 1rem; transition: all 0.3s;">
                
                <input type="checkbox" 
                       class="task-checkbox" 
                       ${task.completed ? 'checked' : ''} 
                       onchange="taskManager.toggleTask(${task.id})"
                       style="width: 20px; height: 20px; cursor: pointer;">
                
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        ${task.category ? `<span style="font-size: 1.2rem;">${categoryIcons[task.category]}</span>` : ''}
                        <h3 style="font-size: 1.1rem; font-weight: 500; ${task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${this.escapeHtml(task.text)}</h3>
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                        ${task.tags.map(tag => `<span class="tag">#${this.escapeHtml(tag)}</span>`).join('')}
                        ${task.dueDate ? `
                            <span style="font-size: 0.875rem; color: ${isOverdue ? '#ef4444' : 'var(--text-tertiary)'};">
                                <i class="fas fa-clock"></i> ${this.formatDate(task.dueDate)}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-modern" onclick="taskManager.editTask(${task.id})" 
                            style="padding: 0.5rem; background: var(--bg-tertiary);">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-modern" onclick="taskManager.deleteTask(${task.id})" 
                            style="padding: 0.5rem; background: #fee;">
                        <i class="fas fa-trash" style="color: #ef4444;"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getFilteredTasks() {
        return this.tasks.filter(task => {
            // Search filter
            if (this.searchQuery) {
                const searchIn = `${task.text} ${task.tags.join(' ')} ${task.category}`.toLowerCase();
                if (!searchIn.includes(this.searchQuery)) return false;
            }
            
            // Category filter
            if (this.selectedCategory && task.category !== this.selectedCategory) return false;
            
            // Priority filter
            if (this.selectedPriority !== 'all' && task.priority !== this.selectedPriority) return false;
            
            return true;
        });
    }

    sortTasks(tasks) {
        return [...tasks].sort((a, b) => {
            if (this.sortBy === 'priority') {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            } else {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
    }

    updateStats() {
        const today = new Date().toDateString();
        const todayTasks = this.tasks.filter(task => 
            new Date(task.createdAt).toDateString() === today
        );
        
        const completedTasks = this.tasks.filter(task => task.completed);
        const completionRate = this.tasks.length > 0 
            ? Math.round((completedTasks.length / this.tasks.length) * 100) 
            : 0;
        
        // Calculate productivity score (simple algorithm)
        const highPriorityCompleted = completedTasks.filter(t => t.priority === 'high').length;
        const productivityScore = Math.min(100, 
            completionRate + (highPriorityCompleted * 5)
        );
        
        // Update UI with animations
        this.animateNumber('todayTasks', todayTasks.length);
        this.animateNumber('completionRate', completionRate, '%');
        this.animateNumber('productivityScore', productivityScore);
    }

    animateNumber(elementId, target, suffix = '') {
        const element = document.getElementById(elementId);
        const current = parseInt(element.textContent) || 0;
        const increment = (target - current) / 20;
        let value = current;
        
        const animation = setInterval(() => {
            value += increment;
            if ((increment > 0 && value >= target) || (increment < 0 && value <= target)) {
                value = target;
                clearInterval(animation);
            }
            element.textContent = Math.round(value) + suffix;
        }, 30);
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
        
        // Set content and style based on type
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
        
        // Show toast
        toast.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    initDragAndDrop() {
        const taskList = document.getElementById('taskList');
        
        taskList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('draggable')) {
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', e.target.innerHTML);
            }
        });
        
        taskList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('draggable')) {
                e.target.classList.remove('dragging');
            }
        });
        
        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = taskList.querySelector('.dragging');
            const afterElement = this.getDragAfterElement(taskList, e.clientY);
            
            if (afterElement == null) {
                taskList.appendChild(draggingItem);
            } else {
                taskList.insertBefore(draggingItem, afterElement);
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    startRealtimeUpdates() {
        // Update date every minute
        setInterval(() => this.updateDate(), 60000);
        
        // Auto-save every 30 seconds
        setInterval(() => this.saveTasks(), 30000);
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

    saveTasks() {
        localStorage.setItem('modernTasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        return JSON.parse(localStorage.getItem('modernTasks') || '[]');
    }

    updateUI() {
        this.updateDate();
        this.renderTasks();
        this.updateStats();
    }
}

// Priority filter function for global scope
function filterByPriority(priority) {
    taskManager.selectedPriority = priority;
    
    // Update active state
    document.querySelectorAll('[data-priority]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.priority === priority);
    });
    
    taskManager.renderTasks();
}

// Initialize on DOM load
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
    
    // Add smooth scroll
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            document.getElementById('taskInput').focus();
        }
    });
});