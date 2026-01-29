import { useState, useCallback, useEffect } from 'react';
import type { BridalPartyMember } from '../shared/types';
import { partyApi } from '../services/api';

export function useBridalParty() {
    const [members, setMembers] = useState<BridalPartyMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await partyApi.getAll();
            setMembers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load bridal party');
            console.error('Error loading bridal party:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const addMember = useCallback(async (member: Omit<BridalPartyMember, 'member_id'>) => {
        try {
            const newMember = await partyApi.create(member as Partial<BridalPartyMember>);
            setMembers(prev => [...prev, newMember]);
            return newMember;
        } catch (err) {
            console.error('Error adding member:', err);
            throw err;
        }
    }, []);

    const updateMember = useCallback(async (id: string, updates: Partial<BridalPartyMember>) => {
        try {
            const updated = await partyApi.update(id, updates);
            setMembers(prev => prev.map(m => m.member_id === id ? { ...m, ...updated } : m));
            return updated;
        } catch (err) {
            console.error('Error updating member:', err);
            throw err;
        }
    }, []);

    const deleteMember = useCallback(async (id: string) => {
        try {
            await partyApi.delete(id);
            setMembers(prev => prev.filter(m => m.member_id !== id));
        } catch (err) {
            console.error('Error deleting member:', err);
            throw err;
        }
    }, []);

    const getMembersBySide = useCallback((side: 'bride' | 'groom') => {
        const brideRoles = ['Maid of Honor', 'Bridesmaid', 'Flower Girl', 'Mother of Bride', 'Sister of Bride'];
        if (side === 'bride') {
            return members.filter(m => brideRoles.includes(m.role));
        }
        return members.filter(m => !brideRoles.includes(m.role));
    }, [members]);

    return {
        members,
        isLoading,
        error,
        loadMembers,
        addMember,
        updateMember,
        deleteMember,
        getMembersBySide,
    };
}
