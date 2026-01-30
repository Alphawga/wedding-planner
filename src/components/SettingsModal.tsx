import { useState, useEffect } from 'react';
import { Modal, Input, Button } from './ui';
import type { Settings } from '../shared/types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: Settings;
    onUpdate: (settings: Partial<Settings>) => Promise<void>;
}

export function SettingsModal({ isOpen, onClose, settings, onUpdate }: SettingsModalProps) {
    const [formData, setFormData] = useState<Settings>(settings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(settings);
        }
    }, [isOpen, settings]);

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            await onUpdate(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Wedding Settings">
            <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Bride's Name"
                        value={formData.bride_name}
                        onChange={e => setFormData(prev => ({ ...prev, bride_name: e.target.value }))}
                    />
                    <Input
                        label="Groom's Name"
                        value={formData.groom_name}
                        onChange={e => setFormData(prev => ({ ...prev, groom_name: e.target.value }))}
                    />
                </div>

                <Input
                    label="Wedding Date"
                    type="date"
                    value={formData.wedding_date}
                    onChange={e => setFormData(prev => ({ ...prev, wedding_date: e.target.value }))}
                />

                <Input
                    label="Wedding Hashtag"
                    value={formData.wedding_hashtag}
                    onChange={e => setFormData(prev => ({ ...prev, wedding_hashtag: e.target.value }))}
                    placeholder="#HappilyEverAfter"
                />

                <Input
                    label="Total Budget (₦)"
                    type="number"
                    value={formData.total_budget || ''}
                    onChange={e => setFormData(prev => ({ ...prev, total_budget: parseFloat(e.target.value) || 0 }))}
                />

                <div className="pt-2">
                    <Button fullWidth onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
