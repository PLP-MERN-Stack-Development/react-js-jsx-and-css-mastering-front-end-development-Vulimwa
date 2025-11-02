const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // User endpoints
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
  async createUser(user) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  // Task endpoints
  async getTasks(userId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  async createTask(userId, taskData) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  async updateTask(userId, taskId, taskData) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  async deleteTask(userId, taskId) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete task');
    return response.json();
  },

  // Comment endpoints
  async getComments(taskId) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
  },

  async createComment(taskId, commentData) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });
    if (!response.ok) {
      let message = 'Failed to create comment';
      try {
        const err = await response.json();
        if (err && err.message) message = err.message;
      } catch (_)
      {
        // ignore non-JSON error bodies
        void _;
      }
      throw new Error(message);
    }
    return response.json();
  },

  async deleteComment(taskId, commentId) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      let message = 'Failed to delete comment';
      try {
        const err = await response.json();
        if (err && err.message) message = err.message;
      } catch (_)
      {
        void _;
      }
      throw new Error(message);
    }
    return response.json();
  }
};
