import { useState, useMemo } from 'react';
import { Search, Plus, Phone, MessageCircle, Check, X, Star } from 'lucide-react';
import { Card, CardContent, Button, Modal, Input, Select, Textarea, ProgressBar } from '../components/ui';
import { useVendors } from '../hooks/useVendors';
import { VENDOR_CATEGORIES } from '../shared/constants';
import type { Vendor } from '../shared/types';
import { formatCurrency, getWhatsAppLink, getPhoneLink } from '../lib/utils';

export function Vendors() {
    const { vendors, addVendor, deleteVendor, recordPayment } = useVendors();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const filteredVendors = useMemo(() => {
        return vendors.filter(v => {
            const matchesSearch = v.vendor_name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [vendors, search, categoryFilter]);

    const categories = useMemo(() => {
        const cats = new Set(vendors.map(v => v.category));
        return Array.from(cats).sort();
    }, [vendors]);

    return (
        <div className="pb-24 px-5 pt-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-warm-800 heading-serif">Vendors</h1>
                <p className="text-sm text-warm-500 mt-1">{vendors.length} vendors booked</p>
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
                <input
                    type="text"
                    placeholder="Search vendors..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl text-sm border border-warm-200 focus:border-primary-400"
                />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${categoryFilter === 'all'
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-warm-600 border border-warm-200'
                        }`}
                >
                    All
                </button>
                {categories.slice(0, 5).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${categoryFilter === cat
                                ? 'bg-primary-500 text-white'
                                : 'bg-white text-warm-600 border border-warm-200'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Vendor Cards */}
            <div className="space-y-4">
                {filteredVendors.map(vendor => (
                    <Card key={vendor.vendor_id} onClick={() => setSelectedVendor(vendor)}>
                        <CardContent className="py-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-500 font-semibold text-lg">
                                        {vendor.vendor_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-warm-800">{vendor.vendor_name}</h3>
                                        <p className="text-xs text-warm-500 mt-0.5">{vendor.category}</p>
                                        {vendor.rating > 0 && (
                                            <div className="flex items-center gap-1 mt-1">
                                                {Array.from({ length: vendor.rating }).map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <span className={`inline-flex items-center gap-1 text-xs font-medium ${vendor.contract_signed ? 'text-green-600' : 'text-warm-400'}`}>
                                    {vendor.contract_signed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                    Contract
                                </span>
                                <span className={`inline-flex items-center gap-1 text-xs font-medium ${vendor.deposit_paid ? 'text-green-600' : 'text-warm-400'}`}>
                                    {vendor.deposit_paid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                    Deposit
                                </span>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-warm-500 mb-2">
                                    <span>Payment Progress</span>
                                    <span className="font-medium text-warm-700">{formatCurrency(vendor.amount_paid)} / {formatCurrency(vendor.total_cost)}</span>
                                </div>
                                <ProgressBar
                                    value={vendor.amount_paid}
                                    max={vendor.total_cost || 1}
                                    size="sm"
                                />
                            </div>

                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                <a
                                    href={getPhoneLink(vendor.phone)}
                                    className="flex-1 py-2.5 text-center bg-warm-50 rounded-xl text-sm font-medium text-warm-600 flex items-center justify-center gap-2 hover:bg-warm-100 transition-colors"
                                >
                                    <Phone className="w-4 h-4" /> Call
                                </a>
                                <a
                                    href={getWhatsAppLink(vendor.phone)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2.5 text-center bg-green-50 rounded-xl text-sm font-medium text-green-600 flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" /> WhatsApp
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredVendors.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <p className="text-warm-400">No vendors found</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fab fixed bottom-24 right-5"
            >
                <Plus className="w-6 h-6" />
            </button>

            <VendorDetailModal
                vendor={selectedVendor}
                onClose={() => setSelectedVendor(null)}
                onDelete={deleteVendor}
                onRecordPayment={recordPayment}
            />

            <AddVendorModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={addVendor}
            />
        </div>
    );
}

function VendorDetailModal({
    vendor,
    onClose,
    onDelete,
    onRecordPayment
}: {
    vendor: Vendor | null;
    onClose: () => void;
    onDelete: (id: string) => void;
    onRecordPayment: (id: string, amount: number) => void;
}) {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [showPayment, setShowPayment] = useState(false);

    if (!vendor) return null;

    const handlePayment = () => {
        const amount = parseFloat(paymentAmount);
        if (amount > 0) {
            onRecordPayment(vendor.vendor_id, amount);
            setPaymentAmount('');
            setShowPayment(false);
        }
    };

    return (
        <Modal isOpen={!!vendor} onClose={onClose} title="Vendor Details">
            <div className="p-5 space-y-5">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-500 font-bold text-2xl heading-serif">
                        {vendor.vendor_name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-warm-800 heading-serif">{vendor.vendor_name}</h3>
                        <p className="text-sm text-warm-500">{vendor.category}</p>
                        {vendor.rating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                                {Array.from({ length: vendor.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3 bg-warm-50 rounded-2xl p-4 text-sm">
                    {vendor.contact_person && (
                        <div className="flex justify-between">
                            <span className="text-warm-500">Contact</span>
                            <span className="text-warm-700 font-medium">{vendor.contact_person}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-warm-500">Phone</span>
                        <span className="text-warm-700 font-medium">{vendor.phone}</span>
                    </div>
                    {vendor.email && (
                        <div className="flex justify-between">
                            <span className="text-warm-500">Email</span>
                            <span className="text-warm-700 font-medium">{vendor.email}</span>
                        </div>
                    )}
                    {vendor.instagram && (
                        <div className="flex justify-between">
                            <span className="text-warm-500">Instagram</span>
                            <a href={`https://instagram.com/${vendor.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-primary-500 font-medium">{vendor.instagram}</a>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-warm-500">Contract</span>
                        <span className={vendor.contract_signed ? 'text-green-600 font-medium' : 'text-warm-400'}>{vendor.contract_signed ? 'Signed' : 'Not Signed'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-warm-500">Deposit</span>
                        <span className={vendor.deposit_paid ? 'text-green-600 font-medium' : 'text-warm-400'}>{vendor.deposit_paid ? 'Paid' : 'Not Paid'}</span>
                    </div>
                </div>

                <div className="bg-warm-50 rounded-2xl p-4">
                    <div className="flex justify-between text-sm mb-3">
                        <span className="text-warm-500">Total Cost</span>
                        <span className="font-semibold text-warm-800">{formatCurrency(vendor.total_cost)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                        <span className="text-warm-500">Amount Paid</span>
                        <span className="text-green-600 font-medium">{formatCurrency(vendor.amount_paid)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-3 border-t border-warm-200">
                        <span className="text-warm-500">Balance</span>
                        <span className={vendor.balance > 0 ? 'text-primary-500 font-semibold' : 'text-warm-700'}>{formatCurrency(vendor.balance)}</span>
                    </div>
                </div>

                {showPayment ? (
                    <div className="space-y-3 animate-fade-in">
                        <Input
                            type="number"
                            placeholder="Enter amount"
                            value={paymentAmount}
                            onChange={e => setPaymentAmount(e.target.value)}
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

                <div className="flex gap-3">
                    <a
                        href={getPhoneLink(vendor.phone)}
                        className="flex-1 py-3 text-center bg-warm-100 rounded-2xl text-sm font-medium text-warm-700"
                    >
                        Call
                    </a>
                    <a
                        href={getWhatsAppLink(vendor.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 text-center bg-green-100 rounded-2xl text-sm font-medium text-green-700"
                    >
                        WhatsApp
                    </a>
                </div>

                <Button
                    fullWidth
                    variant="danger"
                    onClick={() => { onDelete(vendor.vendor_id); onClose(); }}
                >
                    Delete Vendor
                </Button>
            </div>
        </Modal>
    );
}

function AddVendorModal({
    isOpen,
    onClose,
    onAdd
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (vendor: Omit<Vendor, 'vendor_id' | 'balance'>) => void;
}) {
    const [formData, setFormData] = useState({
        vendor_name: '',
        category: VENDOR_CATEGORIES[0],
        contact_person: '',
        phone: '',
        email: '',
        instagram: '',
        contract_signed: false,
        deposit_paid: false,
        total_cost: 0,
        amount_paid: 0,
        payment_due_date: '',
        rating: 0,
        notes: '',
    });

    const handleSubmit = () => {
        if (!formData.vendor_name || !formData.phone) return;
        onAdd(formData);
        setFormData({
            vendor_name: '',
            category: VENDOR_CATEGORIES[0],
            contact_person: '',
            phone: '',
            email: '',
            instagram: '',
            contract_signed: false,
            deposit_paid: false,
            total_cost: 0,
            amount_paid: 0,
            payment_due_date: '',
            rating: 0,
            notes: '',
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Vendor">
            <div className="p-5 space-y-4">
                <Input
                    label="Vendor Name"
                    value={formData.vendor_name}
                    onChange={e => setFormData(prev => ({ ...prev, vendor_name: e.target.value }))}
                    placeholder="e.g., Flash Studios"
                />
                <Select
                    label="Category"
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    options={VENDOR_CATEGORIES.map(c => ({ value: c, label: c }))}
                />
                <Input
                    label="Contact Person"
                    value={formData.contact_person}
                    onChange={e => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                />
                <Input
                    label="Phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="08012345678"
                />
                <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                    label="Instagram"
                    value={formData.instagram}
                    onChange={e => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="@username"
                />
                <Input
                    label="Total Cost (₦)"
                    type="number"
                    value={formData.total_cost || ''}
                    onChange={e => setFormData(prev => ({ ...prev, total_cost: parseFloat(e.target.value) || 0 }))}
                />
                <Textarea
                    label="Notes"
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
                <div className="pt-2">
                    <Button fullWidth onClick={handleSubmit}>Add Vendor</Button>
                </div>
            </div>
        </Modal>
    );
}
