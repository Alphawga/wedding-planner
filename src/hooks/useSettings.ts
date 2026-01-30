import { useState, useEffect } from 'react';
import type { Settings } from '../shared/types';
import { settingsApi } from '../services/api';
import { useToast } from '../components/ui';

const DEFAULT_SETTINGS: Settings = {
    wedding_date: '2026-03-21',
    bride_name: 'Bride',
    groom_name: 'Groom',
    wedding_hashtag: '#Wedding2026',
    total_budget: 5000000,
};

export function useSettings() {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await settingsApi.get();
            setSettings({ ...DEFAULT_SETTINGS, ...data });
        } catch (err) {
            // Settings are optional, so we just use defaults on error
            console.warn('Could not load settings, using defaults:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSettings = async (newSettings: Partial<Settings>) => {
        try {
            setError(null);
            // Optimistic update
            setSettings(prev => ({ ...prev, ...newSettings }));

            await settingsApi.update(newSettings);
            showToast('Settings saved successfully', 'success');
        } catch (err) {
            console.error('Error updating settings:', err);
            setError('Failed to update settings');
            showToast('Failed to save settings', 'error');
            // Revert on error (reload)
            loadSettings();
        }
    };

    return {
        settings,
        isLoading,
        error,
        loadSettings,
        updateSettings,
    };
}
