import { useState, useEffect } from 'react';
import type { Settings } from '../shared/types';
import { settingsApi } from '../services/api';

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

    return {
        settings,
        isLoading,
        error,
        loadSettings,
    };
}
