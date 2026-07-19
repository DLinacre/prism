import { create } from 'zustand';
import useAuthStore from './authStore';

const API_BASE = '/api';

const useAppStore = create((set, get) => ({
  // Projects
  projects: [],
  currentProject: null,
  projectsLoading: false,

  // Tasks
  tasks: [],
  tasksLoading: false,

  // Team
  team: [],
  teamLoading: false,

  // Analytics
  analytics: null,
  analyticsLoading: false,

  // Notifications
  notifications: [],
  unreadCount: 0,

  // Activity
  activity: [],

  // UI State
  sidebarCollapsed: false,
  toasts: [],

  // API Helper
  api: (path, options = {}) => {
    const token = useAuthStore.getState().token;
    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      credentials: 'include',
      ...options
    }).then(res => res.json());
  },

  // Toast management
  addToast: (toast) => {
    const id = Date.now();
    set(state => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));
    setTimeout(() => {
      set(state => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, toast.duration || 5000);
    return id;
  },

  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  },

  // Projects
  fetchProjects: async () => {
    set({ projectsLoading: true });
    try {
      const data = await get().api('/projects');
      if (data.success) {
        set({ projects: data.data });
      }
    } finally {
      set({ projectsLoading: false });
    }
  },

  fetchProject: async (id) => {
    set({ tasksLoading: true });
    try {
      const data = await get().api(`/projects/${id}`);
      if (data.success) {
        set({ currentProject: data.data });
        return data.data;
      }
    } finally {
      set({ tasksLoading: false });
    }
  },

  createProject: async (project) => {
    const data = await get().api('/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
    if (data.success) {
      set(state => ({ projects: [data.data, ...state.projects] }));
      get().addToast({ type: 'success', message: 'Project created successfully' });
      return data.data;
    }
    throw new Error(data.error.message);
  },

  updateProject: async (id, updates) => {
    const data = await get().api(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (data.success) {
      set(state => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...data.data } : p),
        currentProject: state.currentProject?.id === id ? { ...state.currentProject, ...data.data } : state.currentProject
      }));
      return data.data;
    }
    throw new Error(data.error.message);
  },

  deleteProject: async (id) => {
    const data = await get().api(`/projects/${id}`, { method: 'DELETE' });
    if (data.success) {
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject
      }));
      get().addToast({ type: 'success', message: 'Project deleted' });
    } else {
      throw new Error(data.error.message);
    }
  },

  // Tasks
  fetchTasks: async (projectId) => {
    set({ tasksLoading: true });
    try {
      const data = await get().api(`/projects/${projectId}/tasks`);
      if (data.success) {
        set({ tasks: data.data });
      }
    } finally {
      set({ tasksLoading: false });
    }
  },

  createTask: async (projectId, task) => {
    const data = await get().api(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task)
    });
    if (data.success) {
      set(state => ({ tasks: [...state.tasks, data.data] }));
      get().addToast({ type: 'success', message: 'Task created' });
      return data.data;
    }
    throw new Error(data.error.message);
  },

  updateTask: async (taskId, updates) => {
    const data = await get().api(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (data.success) {
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? data.data : t)
      }));
      return data.data;
    }
    throw new Error(data.error.message);
  },

  moveTask: async (taskId, status, position) => {
    const data = await get().api(`/tasks/${taskId}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ status, position })
    });
    if (data.success) {
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? data.data : t)
      }));
      return data.data;
    }
    throw new Error(data.error.message);
  },

  deleteTask: async (taskId) => {
    const data = await get().api(`/tasks/${taskId}`, { method: 'DELETE' });
    if (data.success) {
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId)
      }));
      get().addToast({ type: 'success', message: 'Task deleted' });
    } else {
      throw new Error(data.error.message);
    }
  },

  // Team
  fetchTeam: async () => {
    set({ teamLoading: true });
    try {
      const data = await get().api('/team');
      if (data.success) {
        set({ team: data.data });
      }
    } finally {
      set({ teamLoading: false });
    }
  },

  inviteMember: async (email, projectId, role) => {
    const data = await get().api('/team/invite', {
      method: 'POST',
      body: JSON.stringify({ email, project_id: projectId, role })
    });
    if (data.success) {
      get().addToast({ type: 'success', message: `${data.data.name} added to project` });
      return data.data;
    }
    throw new Error(data.error.message);
  },

  // Analytics
  fetchAnalytics: async () => {
    set({ analyticsLoading: true });
    try {
      const data = await get().api('/analytics/overview');
      if (data.success) {
        set({ analytics: data.data });
      }
    } finally {
      set({ analyticsLoading: false });
    }
  },

  // Notifications
  fetchNotifications: async () => {
    const data = await get().api('/notifications');
    if (data.success) {
      set({ notifications: data.data.notifications, unreadCount: data.data.unreadCount });
    }
  },

  markNotificationRead: async (id) => {
    const data = await get().api(`/notifications/${id}/read`, { method: 'PUT' });
    if (data.success) {
      set(state => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    }
  },

  markAllNotificationsRead: async () => {
    const data = await get().api('/notifications/read-all', { method: 'PUT' });
    if (data.success) {
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }));
    }
  },

  // Activity
  fetchActivity: async () => {
    const data = await get().api('/notifications/activity');
    if (data.success) {
      set({ activity: data.data });
    }
  },

  // UI
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed })
}));

export default useAppStore;
