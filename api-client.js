// API Client for TaskFlow Pro
class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = null;
        this.user = null;
    }

    // Helper method for API requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include' // For session cookies
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async register(username, email, password) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        this.user = data;
        return data;
    }

    async login(username, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        this.user = data;
        return data;
    }

    async logout() {
        const data = await this.request('/auth/logout', {
            method: 'POST'
        });
        this.user = null;
        return data;
    }

    async getCurrentUser() {
        const data = await this.request('/auth/me');
        this.user = data;
        return data;
    }

    // Task methods
    async getTasks(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return await this.request(`/tasks${queryParams ? '?' + queryParams : ''}`);
    }

    async createTask(taskData) {
        return await this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }

    async updateTask(taskId, updates) {
        return await this.request(`/tasks/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    async deleteTask(taskId) {
        return await this.request(`/tasks/${taskId}`, {
            method: 'DELETE'
        });
    }

    // Statistics methods
    async getStats() {
        return await this.request('/stats/overview');
    }

    // Category methods
    async getCategories() {
        return await this.request('/categories');
    }

    // Tag methods
    async getTags() {
        return await this.request('/tags');
    }
}

// Export for use in other files
const apiClient = new APIClient();