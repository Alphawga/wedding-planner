import type { Task, Vendor, BudgetItem, BridalPartyMember, Settings } from '../shared/types';

const API_BASE = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
}

// Tasks
export const tasksApi = {
    getAll: () => fetchApi<Task[]>('/tasks'),
    create: (task: Partial<Task>) =>
        fetchApi<Task>('/tasks', { method: 'POST', body: JSON.stringify(task) }),
    update: (id: string, updates: Partial<Task>) =>
        fetchApi<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id: string) =>
        fetchApi<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),
};

// Vendors
export const vendorsApi = {
    getAll: () => fetchApi<Vendor[]>('/vendors'),
    create: (vendor: Partial<Vendor>) =>
        fetchApi<Vendor>('/vendors', { method: 'POST', body: JSON.stringify(vendor) }),
    update: (id: string, updates: Partial<Vendor>) =>
        fetchApi<Vendor>(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id: string) =>
        fetchApi<{ success: boolean }>(`/vendors/${id}`, { method: 'DELETE' }),
};

// Budget
export const budgetApi = {
    getAll: () => fetchApi<BudgetItem[]>('/budget'),
    create: (item: Partial<BudgetItem>) =>
        fetchApi<BudgetItem>('/budget', { method: 'POST', body: JSON.stringify(item) }),
    update: (id: string, updates: Partial<BudgetItem>) =>
        fetchApi<BudgetItem>(`/budget/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id: string) =>
        fetchApi<{ success: boolean }>(`/budget/${id}`, { method: 'DELETE' }),
};

// Bridal Party
export const partyApi = {
    getAll: () => fetchApi<BridalPartyMember[]>('/party'),
    create: (member: Partial<BridalPartyMember>) =>
        fetchApi<BridalPartyMember>('/party', { method: 'POST', body: JSON.stringify(member) }),
    update: (id: string, updates: Partial<BridalPartyMember>) =>
        fetchApi<BridalPartyMember>(`/party/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id: string) =>
        fetchApi<{ success: boolean }>(`/party/${id}`, { method: 'DELETE' }),
};

// Settings
export const settingsApi = {
    get: () => fetchApi<Settings>('/settings'),
    update: (settings: Partial<Settings>) =>
        fetchApi<Settings>('/settings', { method: 'POST', body: JSON.stringify(settings) }),
};
