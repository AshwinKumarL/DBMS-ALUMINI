const API_BASE = '/api';

function getAuthHeaders() {
    const token = localStorage.getItem('alumlink_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        ...getAuthHeaders(),
        ...(options.headers || {})
    };

    const config = {
        ...options,
        headers
    };

    try {
        const res = await fetch(url, config);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            const error = new Error(data.error || `Request failed with status ${res.status}`);
            error.status = res.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        console.error(`[API Error] ${options.method || 'GET'} ${endpoint}`, err);
        throw err;
    }
}

export const api = {
    // Auth
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me'),
    demoLogin: (email) => request('/auth/demo-login', { method: 'POST', body: JSON.stringify({ email }) }),

    // Alumni & Search
    getAlumni: (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
            if (val !== undefined && val !== null && val !== '' && val !== 'all') {
                query.append(key, val);
            }
        });
        const qs = query.toString();
        return request(`/alumni${qs ? `?${qs}` : ''}`);
    },
    getRecommendations: () => request('/alumni/recommendations'),

    // Users & Profiles
    getProfile: (userId) => request(`/users/profile/${userId}`),
    getStudents: () => request('/users/students'),
    insertStudent: (data) => request('/users/students', { method: 'POST', body: JSON.stringify(data) }),
    deleteStudent: (id) => request(`/users/students/${id}`, { method: 'DELETE' }),
    insertMentor: (data) => request('/alumni', { method: 'POST', body: JSON.stringify(data) }),
    deleteMentor: (id) => request(`/alumni/${id}`, { method: 'DELETE' }),
    updateStudentProfile: (data) => request('/users/profile/student', { method: 'PUT', body: JSON.stringify(data) }),
    updateAlumniProfile: (data) => request('/users/profile/alumni', { method: 'PUT', body: JSON.stringify(data) }),
    getSkills: () => request('/users/skills'),
    insertSkill: (data) => request('/users/skills/insert', { method: 'POST', body: JSON.stringify(data) }),
    deleteSkill: (id) => request(`/users/skills/${id}`, { method: 'DELETE' }),
    getAllSessions: () => request('/mentorship/all-sessions'),
    insertSession: (data) => request('/mentorship/direct-insert', { method: 'POST', body: JSON.stringify(data) }),
    deleteSession: (id) => request(`/mentorship/sessions/${id}`, { method: 'DELETE' }),
    updateSkills: (skills) => request('/users/skills', { method: 'POST', body: JSON.stringify({ skills }) }),

    // Mentorship
    getRequests: (status) => request(`/mentorship/requests${status ? `?status=${status}` : ''}`),
    createRequest: (data) => request('/mentorship/requests', { method: 'POST', body: JSON.stringify(data) }),
    respondRequest: (id, action, responseNote) => request(`/mentorship/requests/${id}/respond`, {
        method: 'PATCH',
        body: JSON.stringify({ action, responseNote })
    }),
    cancelRequest: (id) => request(`/mentorship/requests/${id}/cancel`, { method: 'PATCH' }),
    getSessions: () => request('/mentorship/sessions'),
    scheduleSession: (data) => request('/mentorship/sessions', { method: 'POST', body: JSON.stringify(data) }),
    completeSession: (id) => request(`/mentorship/sessions/${id}/complete`, { method: 'PATCH' }),
    submitFeedback: (sessionId, feedback) => request(`/mentorship/sessions/${sessionId}/feedback`, {
        method: 'POST',
        body: JSON.stringify(feedback)
    }),

    // Connections
    getConnections: () => request('/connections'),
    getConnectionStatus: (userId) => request(`/connections/status/${userId}`),
    sendConnectionRequest: (targetUserId, note) => request('/connections/request', {
        method: 'POST',
        body: JSON.stringify({ targetUserId, note })
    }),
    respondConnection: (id, action) => request(`/connections/${id}/respond`, {
        method: 'PATCH',
        body: JSON.stringify({ action })
    }),
    removeConnection: (id) => request(`/connections/${id}`, { method: 'DELETE' }),

    // Messages
    getConversations: () => request('/messages/conversations'),
    getMessages: (contactId) => request(`/messages/${contactId}`),
    sendMessage: (recipientId, content) => request('/messages', {
        method: 'POST',
        body: JSON.stringify({ recipientId, content })
    }),
    markMessagesRead: (contactId) => request(`/messages/read/${contactId}`, { method: 'PATCH' }),

    // Notifications
    getNotifications: () => request('/notifications'),
    markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
    deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),

    // Admin
    getMetrics: () => request('/admin/metrics'),
    getVerifications: (status) => request(`/admin/alumni-verifications${status ? `?status=${status}` : ''}`),
    verifyAlumni: (userId, action, reason) => request(`/admin/verify-alumni/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action, reason })
    }),
    getAdminUsers: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/admin/users${query ? `?${query}` : ''}`);
    },
    toggleUserStatus: (userId, isActive) => request(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive })
    }),
    getReports: () => request('/admin/reports'),
    resolveReport: (reportId, resolution, resolutionNotes) => request(`/admin/reports/${reportId}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ resolution, resolutionNotes })
    }),
    submitReport: (data) => request('/admin/reports', { method: 'POST', body: JSON.stringify(data) }),

    // SQL Console & DBMS Introspection
    executeSql: (query) => request('/sql/execute', {
        method: 'POST',
        body: JSON.stringify({ query })
    }),
    getSchema: () => request('/sql/schema'),
    getDbStats: () => request('/sql/stats')
};

