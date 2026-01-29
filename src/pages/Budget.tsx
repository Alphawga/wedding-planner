import { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, Button, Modal, Input, Select, ProgressBar } from '../components/ui';
import { useBudget } from '../hooks/useBudget';
import { BUDGET_CATEGORIES } from '../shared/constants';
import type { BudgetItem } from '../shared/types';
import { formatCurrency } from '../lib/utils';

export function Budget() {
    const { items, stats, getCategoryTotals, addItem, recordPayment, deleteItem } = useBudget();
    const [selectedItem, setSelectedItem] = useState<BudgetItem | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'items'>('overview');

    const categoryTotals = useMemo(() => getCategoryTotals(), [getCategoryTotals]);
    const budgetProgress = Math.round((stats.totalPaid / stats.totalBudget) * 100);


    return (
        <div className="pb-24 px-4 pt-5">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-warm-800 heading-serif">Budget</h1>
                <p className="text-sm text-warm-500 mt-1">Track your wedding expenses</p>
            </div>

            {/* Main Balance Card */}
            <Card elevated className="mb-6 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-400 to-primary-500 px-6 py-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-5 h-5 opacity-80" />
                        <span className="text-sm opacity-90">Total Balance</span>
                    </div>
                    <p className="text-3xl font-bold heading-serif">{formatCurrency(stats.totalBudget)}</p>
                    <div className="mt-4">
                        <ProgressBar value={budgetProgress} size="md" />
                    </div>
                </div>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-warm-500">Paid</p>
                                <p className="text-sm font-semibold text-warm-800">{formatCurrency(stats.totalPaid)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-primary-500" />
                            </div>
                            <div>
                                <p className="text-xs text-warm-500">Initial Budget</p>
                                <p className="text-sm font-semibold text-warm-800">{formatCurrency(stats.totalBudget)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6 bg-warm-100 p-1 rounded-2xl">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview'
                        ? 'bg-white text-warm-800 shadow-sm'
                        : 'text-warm-500'
                        }`}
                >
                    By Category
                </button>
                <button
                    onClick={() => setActiveTab('items')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'items'
                        ? 'bg-white text-warm-800 shadow-sm'
                        : 'text-warm-500'
                        }`}
                >
                    All Items
                </button>
            </div>

            {/* Content */}
            {activeTab === 'overview' ? (
                <div className="space-y-4">
                    {Object.entries(categoryTotals).map(([category, { estimated, paid }]) => (
                        <Card key={category}>
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-warm-700">{category}</span>
                                    <span className="text-xs text-warm-500">{formatCurrency(paid)} / {formatCurrency(estimated)}</span>
                                </div>
                                <ProgressBar value={paid} max={estimated || 1} size="sm" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map(item => (
                        <Card key={item.budget_id} onClick={() => setSelectedItem(item)}>
                            <CardContent className="py-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-warm-700">{item.item}</p>
                                        <p className="text-xs text-warm-400 mt-0.5">{item.category}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-warm-800">{formatCurrency(item.estimated_cost)}</p>
                                </div>
                                <div className="flex justify-between text-xs text-warm-500 mt-3 pt-3 border-t border-warm-100">
                                    <span>Paid: <span className="text-green-500 font-medium">{formatCurrency(item.amount_paid)}</span></span>
                                    {item.vendor && <span className="text-warm-400">{item.vendor}</span>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* FAB */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fab fixed bottom-24 right-5"
            >
                <Plus className="w-6 h-6" />
            </button>

            <BudgetItemModal
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
                onRecordPayment={recordPayment}
                onDelete={deleteItem}
            />

            <AddBudgetItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={addItem}
            />
        </div>
    );
}

function BudgetItemModal({
    item,
    onClose,
    onRecordPayment,
    onDelete
}: {
    item: BudgetItem | null;
    onClose: () => void;
    onRecordPayment: (id: string, amount: number, method: string) => void;
    onDelete: (id: string) => void;
}) {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Transfer');
    const [showPayment, setShowPayment] = useState(false);

    if (!item) return null;

    const handlePayment = () => {
        const amount = parseFloat(paymentAmount);
        if (amount > 0) {
            onRecordPayment(item.budget_id, amount, paymentMethod);
            setPaymentAmount('');
            setShowPayment(false);
        }
    };

    const balance = item.estimated_cost - item.amount_paid;

    return (
        <Modal isOpen={!!item} onClose={onClose} title="Budget Item">
            <div className="p-5 space-y-5">
                <div>
                    <h3 className="text-xl font-semibold text-warm-800 heading-serif">{item.item}</h3>
                    <p className="text-sm text-warm-500 mt-1">{item.category}</p>
                </div>

                <div className="bg-warm-50 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-warm-500">Estimated</span>
                        <span className="font-semibold text-warm-800">{formatCurrency(item.estimated_cost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-warm-500">Actual</span>
                        <span className="text-warm-700">{formatCurrency(item.actual_cost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-warm-500">Paid</span>
                        <span className="text-green-600 font-medium">{formatCurrency(item.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-warm-200">
                        <span className="text-warm-500">Balance</span>
                        <span className={balance > 0 ? 'text-primary-500 font-semibold' : 'text-warm-700'}>{formatCurrency(balance)}</span>
                    </div>
                </div>

                {item.vendor && (
                    <div className="text-sm">
                        <span className="text-warm-500">Vendor: </span>
                        <span className="text-warm-700 font-medium">{item.vendor}</span>
                    </div>
                )}

                {showPayment ? (
                    <div className="space-y-4 animate-fade-in">
                        <Input
                            type="number"
                            label="Amount"
                            placeholder="Enter amount"
                            value={paymentAmount}
                            onChange={e => setPaymentAmount(e.target.value)}
                        />
                        <Select
                            label="Payment Method"
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                            options={[
                                { value: 'Transfer', label: 'Bank Transfer' },
                                { value: 'Cash', label: 'Cash' },
                                { value: 'Card', label: 'Card' },
                                { value: 'Other', label: 'Other' },
                            ]}
                        />
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setShowPayment(false)} className="flex-1">Cancel</Button>
                            <Button onClick={handlePayment} className="flex-1">Record</Button>
                        </div>
                    </div>
                ) : (
                    <Button fullWidth variant="secondary" onClick={() => setShowPayment(true)}>
                        Record Payment
                    </Button>
                )}

                <Button
                    fullWidth
                    variant="danger"
                    onClick={() => { onDelete(item.budget_id); onClose(); }}
                >
                    Delete Item
                </Button>
            </div>
        </Modal>
    );
}

function AddBudgetItemModal({
    isOpen,
    onClose,
    onAdd
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: Omit<BudgetItem, 'budget_id'>) => void;
}) {
    const [formData, setFormData] = useState({
        category: BUDGET_CATEGORIES[0],
        item: '',
        estimated_cost: 0,
        actual_cost: 0,
        amount_paid: 0,
        payment_date: '',
        vendor: '',
        payment_method: '',
        notes: '',
    });

    const handleSubmit = () => {
        if (!formData.item) return;
        onAdd(formData);
        setFormData({
            category: BUDGET_CATEGORIES[0],
            item: '',
            estimated_cost: 0,
            actual_cost: 0,
            amount_paid: 0,
            payment_date: '',
            vendor: '',
            payment_method: '',
            notes: '',
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Budget Item">
            <div className="p-5 space-y-4">
                <Input
                    label="Item Name"
                    value={formData.item}
                    onChange={e => setFormData(prev => ({ ...prev, item: e.target.value }))}
                    placeholder="e.g., Wedding cake"
                />
                <Select
                    label="Category"
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    options={BUDGET_CATEGORIES.map(c => ({ value: c, label: c }))}
                />
                <Input
                    label="Estimated Cost (₦)"
                    type="number"
                    value={formData.estimated_cost || ''}
                    onChange={e => setFormData(prev => ({ ...prev, estimated_cost: parseFloat(e.target.value) || 0 }))}
                />
                <Input
                    label="Vendor (optional)"
                    value={formData.vendor}
                    onChange={e => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                />
                <div className="pt-2">
                    <Button fullWidth onClick={handleSubmit}>Add Item</Button>
                </div>
            </div>
        </Modal>
    );
}
