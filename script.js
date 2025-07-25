// 전역 변수
let tasks = [];
let currentFilter = 'all';

// DOM 요소
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');
const currentDateEl = document.getElementById('currentDate');
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const remainingTasksEl = document.getElementById('remainingTasks');

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    updateDate();
    renderTasks();
    updateStats();
    
    // 이벤트 리스너 설정
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
});

// 현재 날짜 표시
function updateDate() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    currentDateEl.textContent = today.toLocaleDateString('ko-KR', options);
}

// 업무 추가
function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) {
        alert('업무 내용을 입력해주세요!');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        priority: prioritySelect.value,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    updateStats();
    
    // 입력 필드 초기화
    taskInput.value = '';
    prioritySelect.value = 'medium';
}

// 업무 삭제
function deleteTask(id) {
    if (confirm('이 업무를 삭제하시겠습니까?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 업무 완료 토글
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 업무 목록 렌더링
function renderTasks() {
    const filteredTasks = filterTasks();
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state">업무가 없습니다.</div>';
        return;
    }
    
    taskList.innerHTML = filteredTasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" 
                   class="task-checkbox" 
                   ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id})">
            <span class="task-content">${escapeHtml(task.text)}</span>
            <span class="task-priority priority-${task.priority}">
                ${getPriorityText(task.priority)}
            </span>
            <button class="task-delete" onclick="deleteTask(${task.id})">삭제</button>
        </li>
    `).join('');
}

// 업무 필터링
function filterTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// 통계 업데이트
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const remainingTasks = totalTasks - completedTasks;
    
    totalTasksEl.textContent = totalTasks;
    completedTasksEl.textContent = completedTasks;
    remainingTasksEl.textContent = remainingTasks;
}

// 우선순위 텍스트 변환
function getPriorityText(priority) {
    const priorityMap = {
        'high': '높음',
        'medium': '보통',
        'low': '낮음'
    };
    return priorityMap[priority] || '보통';
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 로컬 스토리지에 저장
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 로컬 스토리지에서 불러오기
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}