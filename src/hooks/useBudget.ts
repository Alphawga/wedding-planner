import { useState, useCallback, useEffect } from 'react';
import type { BudgetItem } from '../shared/types';
import { budgetApi, settingsApi } from '../services/api';
import { useToast } from '../components/ui';

export function useBudget() {
    const [items, setItems] = useState<BudgetItem[]>([]);
    const [totalBudget, setTotalBudget] = useState(5000000); // Default fallback
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [budgetItems, settings] = await Promise.all([
                budgetApi.getAll(),
                settingsApi.get().catch(() => ({ total_budget: 5000000 }))
            ]);
            // Reverse to show newest first
            setItems(budgetItems.reverse());
            if (settings.total_budget) {
                setTotalBudget(settings.total_budget);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load budget');
            console.error('Error loading budget:', err);
            showToast('Failed to load budget', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const addItem = useCallback(async (item: Omit<BudgetItem, 'budget_id'>) => {
        try {
            const newItem = await budgetApi.create(item as Partial<BudgetItem>);
            setItems(prev => [newItem, ...prev]);
            showToast('Budget item added successfully', 'success');
            return newItem;
        } catch (err) {
            console.error('Error adding budget item:', err);
            showToast('Failed to add budget item', 'error');
            throw err;
        }
    }, [showToast]);

    const updateItem = useCallback(async (id: string, updates: Partial<BudgetItem>) => {
        try {
            const updated = await budgetApi.update(id, updates);
            setItems(prev => prev.map(i => i.budget_id === id ? { ...i, ...updated } : i));
            showToast('Budget item updated successfully', 'success');
            return updated;
        } catch (err) {
            console.error('Error updating budget item:', err);
            showToast('Failed to update budget item', 'error');
            throw err;
        }
    }, [showToast]);

    const deleteItem = useCallback(async (id: string) => {
        try {
            await budgetApi.delete(id);
            setItems(prev => prev.filter(i => i.budget_id !== id));
            showToast('Budget item deleted successfully', 'success');
        } catch (err) {
            console.error('Error deleting budget item:', err);
            showToast('Failed to delete budget item', 'error');
            throw err;
        }
    }, [showToast]);

    const recordPayment = useCallback(async (id: string, amount: number, method: string) => {
        const item = items.find(i => i.budget_id === id);
        if (!item) return;
        const newAmountPaid = item.amount_paid + amount;
        const paymentDate = new Date().toISOString().split('T')[0];
        return updateItem(id, { amount_paid: newAmountPaid, payment_method: method, payment_date: paymentDate });
    }, [items, updateItem]);

    const getCategoryTotals = useCallback(() => {
        const categories: Record<string, { estimated: number; paid: number }> = {};
        items.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = { estimated: 0, paid: 0 };
            }
            categories[item.category].estimated += item.estimated_cost;
            categories[item.category].paid += item.amount_paid;
        });
        return categories;
    }, [items]);

    const stats = {
        totalBudget,
        totalEstimated: items.reduce((sum, i) => sum + i.estimated_cost, 0),
        totalPaid: items.reduce((sum, i) => sum + i.amount_paid, 0),
        itemCount: items.length,
    };

    return {
        items,
        isLoading,
        error,
        stats,
        loadData,
        addItem,
        updateItem,
        deleteItem,
        recordPayment,
        getCategoryTotals,
    };
}
