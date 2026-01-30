import { useState, useCallback, useEffect } from 'react';
import type { Vendor } from '../shared/types';
import { vendorsApi } from '../services/api';
import { useToast } from '../components/ui';

export function useVendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await vendorsApi.getAll();
            // Reverse to show newest first (assuming Sheets appends to bottom)
            setVendors(data.reverse());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load vendors');
            console.error('Error loading vendors:', err);
            showToast('Failed to load vendors', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const addVendor = useCallback(async (vendor: Omit<Vendor, 'vendor_id' | 'balance'>) => {
        try {
            const newVendor = await vendorsApi.create(vendor as Partial<Vendor>);
            setVendors(prev => [newVendor, ...prev]);
            showToast('Vendor added successfully', 'success');
            return newVendor;
        } catch (err) {
            console.error('Error adding vendor:', err);
            showToast('Failed to add vendor', 'error');
            throw err;
        }
    }, [showToast]);

    const updateVendor = useCallback(async (id: string, updates: Partial<Vendor>) => {
        try {
            const updated = await vendorsApi.update(id, updates);
            setVendors(prev => prev.map(v => v.vendor_id === id ? { ...v, ...updated } : v));
            showToast('Vendor updated successfully', 'success');
            return updated;
        } catch (err) {
            console.error('Error updating vendor:', err);
            showToast('Failed to update vendor', 'error');
            throw err;
        }
    }, [showToast]);

    const deleteVendor = useCallback(async (id: string) => {
        try {
            await vendorsApi.delete(id);
            setVendors(prev => prev.filter(v => v.vendor_id !== id));
            showToast('Vendor deleted successfully', 'success');
        } catch (err) {
            console.error('Error deleting vendor:', err);
            showToast('Failed to delete vendor', 'error');
            throw err;
        }
    }, [showToast]);

    const recordPayment = useCallback(async (id: string, amount: number) => {
        const vendor = vendors.find(v => v.vendor_id === id);
        if (!vendor) return;
        const newAmountPaid = vendor.amount_paid + amount;
        return updateVendor(id, { amount_paid: newAmountPaid });
    }, [vendors, updateVendor]);

    const stats = {
        total: vendors.length,
        totalCost: vendors.reduce((sum, v) => sum + v.total_cost, 0),
        totalPaid: vendors.reduce((sum, v) => sum + v.amount_paid, 0),
        contractsSigned: vendors.filter(v => v.contract_signed).length,
        depositsPaid: vendors.filter(v => v.deposit_paid).length,
    };

    return {
        vendors,
        isLoading,
        error,
        stats,
        loadVendors,
        addVendor,
        updateVendor,
        deleteVendor,
        recordPayment,
    };
}
