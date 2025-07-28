// TaskFlow Enterprise - Team Collaboration Module
class TeamCollaboration {
    constructor() {
        this.currentUser = null;
        this.currentTeam = null;
        this.teams = [];
        this.teamMembers = [];
        this.socket = null;
        
        this.init();
    }

    async init() {
        this.currentUser = await apiClient.getCurrentUser();
        await this.loadTeams();
        this.setupWebSocket();
    }

    // WebSocket for real-time collaboration
    setupWebSocket() {
        // In production, use actual WebSocket server
        // this.socket = new WebSocket('wss://your-websocket-server.com');
        
        // For now, simulate real-time updates
        this.simulateRealTimeUpdates();
    }

    simulateRealTimeUpdates() {
        // Simulate new comment notification
        setTimeout(() => {
            this.onNewComment({
                taskId: 1,
                user: { username: 'TeamMember1', avatar: 'TM' },
                content: '이 작업에 대한 의견이 있습니다.',
                timestamp: new Date()
            });
        }, 10000);

        // Simulate task assignment
        setTimeout(() => {
            this.onTaskAssigned({
                taskId: 2,
                assignedTo: this.currentUser.username,
                assignedBy: 'ProjectManager',
                taskTitle: '새로운 기능 개발'
            });
        }, 20000);
    }

    // Team Management
    async loadTeams() {
        try {
            this.teams = await apiClient.getTeams();
            if (this.teams.length > 0) {
                this.currentTeam = this.teams[0];
                await this.loadTeamMembers(this.currentTeam.id);
            }
        } catch (error) {
            console.error('Failed to load teams:', error);
        }
    }

    async loadTeamMembers(teamId) {
        try {
            this.teamMembers = await apiClient.getTeamMembers(teamId);
            this.updateTeamUI();
        } catch (error) {
            console.error('Failed to load team members:', error);
        }
    }

    async createTeam(teamData) {
        try {
            const team = await apiClient.createTeam(teamData);
            this.teams.push(team);
            app.showNotification('팀이 생성되었습니다', 'success');
            return team;
        } catch (error) {
            app.showNotification('팀 생성 실패: ' + error.message, 'error');
        }
    }

    async inviteTeamMember(email, role = 'member') {
        try {
            await apiClient.inviteTeamMember(this.currentTeam.id, { email, role });
            app.showNotification(`${email}님을 팀에 초대했습니다`, 'success');
            await this.loadTeamMembers(this.currentTeam.id);
        } catch (error) {
            app.showNotification('팀원 초대 실패: ' + error.message, 'error');
        }
    }

    // Task Assignment
    async assignTask(taskId, userId) {
        try {
            await apiClient.assignTask(taskId, userId);
            const user = this.teamMembers.find(m => m.id === userId);
            app.showNotification(`${user.username}님에게 업무를 할당했습니다`, 'success');
            
            // Send real-time notification
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({
                    type: 'task_assigned',
                    taskId,
                    assignedTo: userId,
                    assignedBy: this.currentUser.id
                }));
            }
        } catch (error) {
            app.showNotification('업무 할당 실패: ' + error.message, 'error');
        }
    }

    // Comments
    async addComment(taskId, content) {
        try {
            const comment = await apiClient.addTaskComment(taskId, { content });
            
            // Update UI
            this.renderComment(comment);
            
            // Send real-time notification
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({
                    type: 'new_comment',
                    taskId,
                    comment
                }));
            }
            
            return comment;
        } catch (error) {
            app.showNotification('댓글 추가 실패: ' + error.message, 'error');
        }
    }

    async loadTaskComments(taskId) {
        try {
            const comments = await apiClient.getTaskComments(taskId);
            this.renderComments(comments);
            return comments;
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    }

    // File Attachments
    async uploadAttachment(taskId, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('taskId', taskId);
            
            const attachment = await apiClient.uploadTaskAttachment(formData);
            app.showNotification('파일이 업로드되었습니다', 'success');
            return attachment;
        } catch (error) {
            app.showNotification('파일 업로드 실패: ' + error.message, 'error');
        }
    }

    // Real-time Event Handlers
    onNewComment(data) {
        // Show notification
        app.showNotification(`${data.user.username}님이 댓글을 남겼습니다`, 'info');
        
        // Update comment count in UI
        const taskElement = document.querySelector(`[data-task-id="${data.taskId}"]`);
        if (taskElement) {
            const commentBadge = taskElement.querySelector('.comment-count');
            if (commentBadge) {
                const currentCount = parseInt(commentBadge.textContent) || 0;
                commentBadge.textContent = currentCount + 1;
            }
        }
    }

    onTaskAssigned(data) {
        app.showNotification(`${data.assignedBy}님이 "${data.taskTitle}" 업무를 할당했습니다`, 'info');
        
        // Refresh task list
        if (window.app) {
            window.app.loadDashboard();
        }
    }

    // UI Rendering
    updateTeamUI() {
        const teamSection = document.getElementById('teamSection');
        if (!teamSection) return;

        teamSection.innerHTML = `
            <div class="team-header">
                <h3>${this.currentTeam.name}</h3>
                <button class="btn-enterprise btn-ghost btn-sm" onclick="collaboration.showTeamSettings()">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
            <div class="team-members">
                ${this.teamMembers.map(member => `
                    <div class="team-member">
                        <div class="member-avatar" style="background: ${this.getAvatarColor(member.username)}">
                            ${this.getInitials(member.username)}
                        </div>
                        <div class="member-info">
                            <div class="member-name">${member.username}</div>
                            <div class="member-role">${member.role}</div>
                        </div>
                        ${member.is_online ? '<span class="online-status"></span>' : ''}
                    </div>
                `).join('')}
            </div>
            <button class="btn-enterprise btn-secondary" style="width: 100%; margin-top: 1rem;" onclick="collaboration.showInviteModal()">
                <i class="fas fa-user-plus"></i>
                팀원 초대
            </button>
        `;
    }

    renderComments(comments) {
        const commentsContainer = document.getElementById('taskComments');
        if (!commentsContainer) return;

        commentsContainer.innerHTML = comments.map(comment => this.createCommentHTML(comment)).join('');
    }

    renderComment(comment) {
        const commentsContainer = document.getElementById('taskComments');
        if (!commentsContainer) return;

        const commentHTML = this.createCommentHTML(comment);
        commentsContainer.insertAdjacentHTML('beforeend', commentHTML);
    }

    createCommentHTML(comment) {
        return `
            <div class="comment animate-fadeIn">
                <div class="comment-header">
                    <div class="comment-author">
                        <div class="member-avatar small" style="background: ${this.getAvatarColor(comment.username)}">
                            ${this.getInitials(comment.username)}
                        </div>
                        <span class="author-name">${comment.username}</span>
                    </div>
                    <span class="comment-time">${this.formatRelativeTime(comment.created_at)}</span>
                </div>
                <div class="comment-content">${this.escapeHtml(comment.content)}</div>
            </div>
        `;
    }

    // Helper Methods
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    getAvatarColor(name) {
        const colors = ['#5A63EA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}시간 전`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}일 전`;
        
        return date.toLocaleDateString('ko-KR');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Modal Handlers
    showInviteModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content animate-scaleIn" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>팀원 초대</h2>
                    <button class="btn-enterprise btn-ghost" onclick="this.closest('.modal-backdrop').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">이메일 주소</label>
                        <input type="email" class="form-input" id="inviteEmail" placeholder="team@example.com">
                    </div>
                    <div class="form-group">
                        <label class="form-label">역할</label>
                        <select class="form-input" id="inviteRole">
                            <option value="member">팀원</option>
                            <option value="admin">관리자</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-enterprise btn-secondary" onclick="this.closest('.modal-backdrop').remove()">
                        취소
                    </button>
                    <button class="btn-enterprise btn-primary" onclick="collaboration.sendInvite()">
                        초대 보내기
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async sendInvite() {
        const email = document.getElementById('inviteEmail').value;
        const role = document.getElementById('inviteRole').value;
        
        if (!email) {
            app.showNotification('이메일을 입력하세요', 'error');
            return;
        }
        
        await this.inviteTeamMember(email, role);
        document.querySelector('.modal-backdrop').remove();
    }

    showTeamSettings() {
        app.showNotification('팀 설정은 준비 중입니다', 'info');
    }
}

// Initialize collaboration module
let collaboration;
document.addEventListener('DOMContentLoaded', () => {
    if (window.apiClient) {
        collaboration = new TeamCollaboration();
        window.collaboration = collaboration;
    }
});

// Add collaboration styles
const collabStyle = document.createElement('style');
collabStyle.textContent = `
/* Team Collaboration Styles */
.team-section {
    background: white;
    border-radius: var(--radius-xl);
    padding: var(--space-6);
    margin-bottom: var(--space-6);
}

.team-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
}

.team-members {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.team-member {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border-radius: var(--radius-lg);
    transition: all var(--transition-fast);
    position: relative;
}

.team-member:hover {
    background: var(--gray-50);
}

.member-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: var(--text-sm);
}

.member-avatar.small {
    width: 32px;
    height: 32px;
    font-size: var(--text-xs);
}

.member-info {
    flex: 1;
}

.member-name {
    font-weight: 500;
    color: var(--gray-900);
}

.member-role {
    font-size: var(--text-sm);
    color: var(--gray-600);
}

.online-status {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
    width: 8px;
    height: 8px;
    background: var(--success-main);
    border-radius: 50%;
    border: 2px solid white;
}

/* Comments Section */
.comments-section {
    margin-top: var(--space-6);
    padding-top: var(--space-6);
    border-top: 1px solid var(--gray-200);
}

.comments-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
}

.comment-count {
    background: var(--gray-100);
    color: var(--gray-700);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    font-weight: 500;
}

.comment {
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-3);
}

.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
}

.comment-author {
    display: flex;
    align-items: center;
    gap: var(--space-2);
}

.author-name {
    font-weight: 500;
    color: var(--gray-900);
}

.comment-time {
    font-size: var(--text-sm);
    color: var(--gray-500);
}

.comment-content {
    color: var(--gray-700);
    line-height: 1.6;
}

.comment-input {
    display: flex;
    gap: var(--space-3);
    margin-top: var(--space-4);
}

.comment-input textarea {
    flex: 1;
    min-height: 80px;
    resize: vertical;
}

/* Task Assignment */
.task-assignee {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--gray-100);
    border-radius: var(--radius-full);
    font-size: var(--text-sm);
    color: var(--gray-700);
}

.assignee-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--primary-500);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xs);
    font-weight: 600;
}

/* Attachments */
.attachments-section {
    margin-top: var(--space-4);
    padding: var(--space-4);
    background: var(--gray-50);
    border-radius: var(--radius-lg);
}

.attachment {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    background: white;
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-2);
    transition: all var(--transition-fast);
}

.attachment:hover {
    border-color: var(--primary-300);
    box-shadow: var(--shadow-sm);
}

.attachment-icon {
    width: 40px;
    height: 40px;
    background: var(--gray-100);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-600);
}

.attachment-info {
    flex: 1;
}

.attachment-name {
    font-weight: 500;
    color: var(--gray-900);
}

.attachment-size {
    font-size: var(--text-sm);
    color: var(--gray-600);
}

/* Collaboration Animations */
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.animate-slideInRight {
    animation: slideInRight 0.3s ease-out;
}
`;
document.head.appendChild(collabStyle);