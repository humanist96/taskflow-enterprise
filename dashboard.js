// 차트 인스턴스 저장
let charts = {};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    loadAndAnalyzeData();
});

// 현재 날짜 표시
function updateDate() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('currentDate').textContent = today.toLocaleDateString('ko-KR', options);
}

// 데이터 로드 및 분석
function loadAndAnalyzeData() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // 요약 카드 업데이트
    updateSummaryCards(tasks);
    
    // 차트 생성
    createPriorityChart(tasks);
    createTrendChart(tasks);
    createHourlyChart(tasks);
    createStatusChart(tasks);
    
    // 상세 통계 업데이트
    updateDetailedStats(tasks);
}

// 요약 카드 업데이트
function updateSummaryCards(tasks) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const activeTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // 일일 평균 계산
    const tasksByDate = {};
    tasks.forEach(task => {
        const date = new Date(task.createdAt).toDateString();
        tasksByDate[date] = (tasksByDate[date] || 0) + 1;
    });
    const dailyAverage = Object.keys(tasksByDate).length > 0 
        ? Math.round(totalTasks / Object.keys(tasksByDate).length) 
        : 0;
    
    document.getElementById('totalTasksCard').textContent = totalTasks;
    document.getElementById('completionRate').textContent = completionRate;
    document.getElementById('activeTasks').textContent = activeTasks;
    document.getElementById('dailyAverage').textContent = dailyAverage;
}

// 우선순위별 분포 도넛 차트
function createPriorityChart(tasks) {
    const ctx = document.getElementById('priorityChart').getContext('2d');
    
    const priorityCount = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
    };
    
    if (charts.priority) charts.priority.destroy();
    
    charts.priority = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['높음', '보통', '낮음'],
            datasets: [{
                data: [priorityCount.high, priorityCount.medium, priorityCount.low],
                backgroundColor: ['#e53e3e', '#dd6b20', '#2b6cb0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

// 최근 7일 업무 추세 라인 차트
function createTrendChart(tasks) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    // 최근 7일 데이터 준비
    const today = new Date();
    const labels = [];
    const createdData = [];
    const completedData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        labels.push(dateStr);
        
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const created = tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate >= dayStart && taskDate <= dayEnd;
        }).length;
        
        const completed = tasks.filter(task => {
            if (!task.completed) return false;
            const taskDate = new Date(task.createdAt);
            return taskDate >= dayStart && taskDate <= dayEnd;
        }).length;
        
        createdData.push(created);
        completedData.push(completed);
    }
    
    if (charts.trend) charts.trend.destroy();
    
    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '생성된 업무',
                data: createdData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.3
            }, {
                label: '완료된 업무',
                data: completedData,
                borderColor: '#48bb78',
                backgroundColor: 'rgba(72, 187, 120, 0.1)',
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// 시간대별 생산성 막대 차트
function createHourlyChart(tasks) {
    const ctx = document.getElementById('hourlyChart').getContext('2d');
    
    // 시간대별 데이터 집계
    const hourlyData = new Array(24).fill(0);
    tasks.forEach(task => {
        const hour = new Date(task.createdAt).getHours();
        hourlyData[hour]++;
    });
    
    // 주요 시간대만 표시 (6시~23시)
    const labels = [];
    const data = [];
    for (let i = 6; i < 24; i++) {
        labels.push(`${i}시`);
        data.push(hourlyData[i]);
    }
    
    if (charts.hourly) charts.hourly.destroy();
    
    charts.hourly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '생성된 업무 수',
                data: data,
                backgroundColor: '#764ba2',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// 업무 상태 분포 차트
function createStatusChart(tasks) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    const completed = tasks.filter(t => t.completed).length;
    const active = tasks.filter(t => !t.completed).length;
    
    if (charts.status) charts.status.destroy();
    
    charts.status = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['완료', '진행중'],
            datasets: [{
                data: [completed, active],
                backgroundColor: ['#48bb78', '#ed8936'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

// 상세 통계 업데이트
function updateDetailedStats(tasks) {
    // 우선순위별 완료율
    updatePriorityStats(tasks);
    
    // 최근 활동
    updateRecentActivity(tasks);
    
    // 생산성 지표
    updateProductivityMetrics(tasks);
    
    // 업무 처리 시간
    updateProcessingTime(tasks);
}

// 우선순위별 완료율
function updatePriorityStats(tasks) {
    const priorities = ['high', 'medium', 'low'];
    const priorityNames = { high: '높음', medium: '보통', low: '낮음' };
    
    let html = '';
    priorities.forEach(priority => {
        const priorityTasks = tasks.filter(t => t.priority === priority);
        const completed = priorityTasks.filter(t => t.completed).length;
        const total = priorityTasks.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        html += `
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${priorityNames[priority]}</span>
                    <span>${completed}/${total} (${rate}%)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${rate}%"></div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('priorityStats').innerHTML = html;
}

// 최근 활동
function updateRecentActivity(tasks) {
    const sortedTasks = [...tasks].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    ).slice(0, 5);
    
    let html = '';
    sortedTasks.forEach(task => {
        const date = new Date(task.createdAt);
        const timeStr = date.toLocaleString('ko-KR', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        html += `
            <div class="activity-item">
                <div class="activity-time">${timeStr}</div>
                <div class="activity-text">${escapeHtml(task.text)} 
                    ${task.completed ? '✅' : '⏳'}
                </div>
            </div>
        `;
    });
    
    document.getElementById('recentActivity').innerHTML = html || '<p>활동 내역이 없습니다.</p>';
}

// 생산성 지표
function updateProductivityMetrics(tasks) {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const weekStart = new Date(today.setDate(today.getDate() - 7));
    
    const todayTasks = tasks.filter(t => new Date(t.createdAt) >= todayStart);
    const weekTasks = tasks.filter(t => new Date(t.createdAt) >= weekStart);
    
    const todayCompleted = todayTasks.filter(t => t.completed).length;
    const weekCompleted = weekTasks.filter(t => t.completed).length;
    
    const avgCompletionRate = tasks.length > 0 
        ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
        : 0;
    
    const html = `
        <div class="metric-item">
            <span class="metric-label">오늘 완료</span>
            <span class="metric-value ${todayCompleted > 0 ? 'positive' : ''}">${todayCompleted}개</span>
        </div>
        <div class="metric-item">
            <span class="metric-label">주간 완료</span>
            <span class="metric-value">${weekCompleted}개</span>
        </div>
        <div class="metric-item">
            <span class="metric-label">전체 완료율</span>
            <span class="metric-value">${avgCompletionRate}%</span>
        </div>
    `;
    
    document.getElementById('productivityMetrics').innerHTML = html;
}

// 업무 처리 시간 (시뮬레이션)
function updateProcessingTime(tasks) {
    // 실제로는 완료 시간을 추적해야 하지만, 여기서는 시뮬레이션
    const priorities = {
        high: { avg: '2시간', total: tasks.filter(t => t.priority === 'high' && t.completed).length },
        medium: { avg: '1.5시간', total: tasks.filter(t => t.priority === 'medium' && t.completed).length },
        low: { avg: '1시간', total: tasks.filter(t => t.priority === 'low' && t.completed).length }
    };
    
    const html = `
        <div class="metric-item">
            <span class="metric-label">높음 평균</span>
            <span class="metric-value">${priorities.high.avg}</span>
        </div>
        <div class="metric-item">
            <span class="metric-label">보통 평균</span>
            <span class="metric-value">${priorities.medium.avg}</span>
        </div>
        <div class="metric-item">
            <span class="metric-label">낮음 평균</span>
            <span class="metric-value">${priorities.low.avg}</span>
        </div>
    `;
    
    document.getElementById('processingTime').innerHTML = html;
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}