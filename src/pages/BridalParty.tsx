import { useState, useMemo } from 'react';
import { Search, Plus, Phone, MessageCircle, Check, X, Crown, Heart } from 'lucide-react';
import { Card, CardContent, Button, Modal, Input, Select, Textarea } from '../components/ui';
import { useBridalParty } from '../hooks/useBridalParty';
import type { BridalPartyMember } from '../shared/types';
import { getWhatsAppLink, getPhoneLink } from '../lib/utils';

const ROLES = [
    { section: 'Bride\'s Side', roles: ['Maid of Honor', 'Bridesmaid', 'Flower Girl', 'Mother of Bride', 'Sister of Bride'] },
    { section: 'Groom\'s Side', roles: ['Best Man', 'Groomsman', 'Ring Bearer', 'Father of Groom', 'Brother of Groom'] },
];

const ALL_ROLES = ROLES.flatMap(r => r.roles);

export function BridalParty() {
    const { members, addMember, deleteMember } = useBridalParty();
    const [search, setSearch] = useState('');
    const [sideFilter, setSideFilter] = useState<'all' | 'bride' | 'groom'>('all');
    const [selectedMember, setSelectedMember] = useState<BridalPartyMember | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
            if (sideFilter === 'all') return matchesSearch;

            const brideRoles = ROLES[0].roles;
            const isBrideSide = brideRoles.includes(m.role);
            return matchesSearch && (sideFilter === 'bride' ? isBrideSide : !isBrideSide);
        });
    }, [members, search, sideFilter]);

    const groupedMembers = useMemo(() => {
        const brideRoles = ROLES[0].roles;
        const brideSide = filteredMembers.filter(m => brideRoles.includes(m.role));
        const groomSide = filteredMembers.filter(m => !brideRoles.includes(m.role));
        return { brideSide, groomSide };
    }, [filteredMembers]);

    return (
        <div className="pb-24 px-4 pt-5 max-w-3xl mx-auto w-full">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-warm-800 heading-serif">Bridal Party</h1>
                <p className="text-sm text-warm-500 mt-1">{members.length} members</p>
            </div>

            {/* Search */}
            <div className="relative mb-5">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
                <input
                    type="text"
                    placeholder="Search members..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl text-sm border border-warm-200 focus:border-primary-400"
                />
            </div>

            {/* Side Filter */}
            <div className="flex gap-2 mb-6 bg-warm-100 p-1 rounded-2xl">
                <button
                    onClick={() => setSideFilter('all')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${sideFilter === 'all' ? 'bg-white text-warm-800 shadow-sm' : 'text-warm-500'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setSideFilter('bride')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${sideFilter === 'bride' ? 'bg-white text-warm-800 shadow-sm' : 'text-warm-500'
                        }`}
                >
                    <Crown className="w-4 h-4" /> Bride
                </button>
                <button
                    onClick={() => setSideFilter('groom')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${sideFilter === 'groom' ? 'bg-white text-warm-800 shadow-sm' : 'text-warm-500'
                        }`}
                >
                    <Heart className="w-4 h-4" /> Groom
                </button>
            </div>

            {/* Bride's Side */}
            {(sideFilter === 'all' || sideFilter === 'bride') && groupedMembers.brideSide.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <Crown className="w-4 h-4 text-primary-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-warm-800 heading-serif">Bride's Side</h2>
                        <span className="text-xs text-warm-400 bg-warm-100 px-2 py-0.5 rounded-full">{groupedMembers.brideSide.length}</span>
                    </div>
                    <div className="space-y-3">
                        {groupedMembers.brideSide.map(member => (
                            <MemberCard
                                key={member.member_id}
                                member={member}
                                onClick={() => setSelectedMember(member)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Groom's Side */}
            {(sideFilter === 'all' || sideFilter === 'groom') && groupedMembers.groomSide.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Heart className="w-4 h-4 text-blue-500" />
                        </div>
                        <h2 className="text-lg font-semibold text-warm-800 heading-serif">Groom's Side</h2>
                        <span className="text-xs text-warm-400 bg-warm-100 px-2 py-0.5 rounded-full">{groupedMembers.groomSide.length}</span>
                    </div>
                    <div className="space-y-3">
                        {groupedMembers.groomSide.map(member => (
                            <MemberCard
                                key={member.member_id}
                                member={member}
                                onClick={() => setSelectedMember(member)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {filteredMembers.length === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-warm-400">No members found</p>
                    </CardContent>
                </Card>
            )}

            {/* FAB */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fab fixed bottom-24 right-5"
            >
                <Plus className="w-6 h-6" />
            </button>

            <MemberDetailModal
                member={selectedMember}
                onClose={() => setSelectedMember(null)}
                onDelete={deleteMember}
            />

            <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={addMember}
            />
        </div>
    );
}

function MemberCard({ member, onClick }: { member: BridalPartyMember; onClick: () => void }) {
    const getInitials = (name: string) => {
        const names = name.split(' ');
        return names.length >= 2
            ? `${names[0][0]}${names[names.length - 1][0]}`
            : names[0].substring(0, 2);
    };

    const brideRoles = ROLES[0].roles;
    const isBrideSide = brideRoles.includes(member.role);

    return (
        <Card onClick={onClick}>
            <CardContent className="flex items-center gap-4 py-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${isBrideSide
                    ? 'bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600'
                    : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600'
                    }`}>
                    {getInitials(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-warm-800">{member.name}</h3>
                    <p className="text-xs text-warm-500 mt-0.5">{member.role}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1 text-xs ${member.outfit_status === 'Ready' ? 'text-green-600' :
                            member.outfit_status === 'In Progress' ? 'text-amber-600' : 'text-warm-400'
                            }`}>
                            {member.outfit_status === 'Ready' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Outfit
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs ${member.rehearsal_confirmed ? 'text-green-600' : 'text-warm-400'}`}>
                            {member.rehearsal_confirmed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Rehearsal
                        </span>
                    </div>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <a
                        href={getPhoneLink(member.phone)}
                        className="w-10 h-10 flex items-center justify-center bg-warm-50 rounded-xl text-warm-500 hover:bg-warm-100 transition-colors"
                    >
                        <Phone className="w-4 h-4" />
                    </a>
                    <a
                        href={getWhatsAppLink(member.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center bg-green-50 rounded-xl text-green-500 hover:bg-green-100 transition-colors"
                    >
                        <MessageCircle className="w-4 h-4" />
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}

function MemberDetailModal({
    member,
    onClose,
    onDelete
}: {
    member: BridalPartyMember | null;
    onClose: () => void;
    onDelete: (id: string) => void;
}) {
    if (!member) return null;

    const getInitials = (name: string) => {
        const names = name.split(' ');
        return names.length >= 2
            ? `${names[0][0]}${names[names.length - 1][0]}`
            : names[0].substring(0, 2);
    };

    const brideRoles = ROLES[0].roles;
    const isBrideSide = brideRoles.includes(member.role);

    return (
        <Modal isOpen={!!member} onClose={onClose} title="Member Details">
            <div className="p-5 space-y-5">
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl ${isBrideSide
                        ? 'bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600'
                        : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600'
                        }`}>
                        {getInitials(member.name)}
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-warm-800 heading-serif">{member.name}</h3>
                        <p className="text-sm text-warm-500">{member.role}</p>
                    </div>
                </div>

                <div className="space-y-3 bg-warm-50 rounded-2xl p-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-warm-500">Phone</span>
                        <span className="text-warm-700 font-medium">{member.phone}</span>
                    </div>
                    {member.email && (
                        <div className="flex justify-between">
                            <span className="text-warm-500">Email</span>
                            <span className="text-warm-700 font-medium">{member.email}</span>
                        </div>
                    )}
                    {member.shoe_size && (
                        <div className="flex justify-between">
                            <span className="text-warm-500">Shoe Size</span>
                            <span className="text-warm-700 font-medium">{member.shoe_size}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-3 bg-warm-50 rounded-2xl p-4 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-warm-500">Outfit Status</span>
                        <span className={`pill ${member.outfit_status === 'Ready' ? 'pill-sage' :
                            member.outfit_status === 'In Progress' ? 'pill-gold' : 'bg-warm-200 text-warm-600'
                            }`}>
                            {member.outfit_status}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-warm-500">Rehearsal</span>
                        <span className={`pill ${member.rehearsal_confirmed ? 'pill-sage' : 'bg-warm-200 text-warm-600'}`}>
                            {member.rehearsal_confirmed ? 'Confirmed' : 'Pending'}
                        </span>
                    </div>
                </div>

                {member.notes && (
                    <div>
                        <p className="text-sm text-warm-500 mb-2">Notes</p>
                        <p className="text-sm text-warm-700 bg-warm-50 p-4 rounded-2xl">{member.notes}</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <a
                        href={getPhoneLink(member.phone)}
                        className="flex-1 py-3 text-center bg-warm-100 rounded-2xl text-sm font-medium text-warm-700"
                    >
                        Call
                    </a>
                    <a
                        href={getWhatsAppLink(member.phone)}
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
                    onClick={() => { onDelete(member.member_id); onClose(); }}
                >
                    Remove Member
                </Button>
            </div>
        </Modal>
    );
}

function AddMemberModal({
    isOpen,
    onClose,
    onAdd
}: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (member: Omit<BridalPartyMember, 'member_id'>) => void;
}) {
    const [formData, setFormData] = useState({
        name: '',
        role: ALL_ROLES[0],
        phone: '',
        email: '',
        outfit_status: 'Not Started',
        shoe_size: '',
        rehearsal_confirmed: false,
        notes: '',
    });

    const handleSubmit = () => {
        if (!formData.name || !formData.phone) return;
        onAdd(formData);
        setFormData({
            name: '',
            role: ALL_ROLES[0],
            phone: '',
            email: '',
            outfit_status: 'Not Started',
            shoe_size: '',
            rehearsal_confirmed: false,
            notes: '',
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Member">
            <div className="p-5 space-y-4">
                <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Ada Williams"
                />
                <Select
                    label="Role"
                    value={formData.role}
                    onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    options={ALL_ROLES.map(r => ({ value: r, label: r }))}
                />
                <Input
                    label="Phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="08012345678"
                />
                <Input
                    label="Email (optional)"
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                    label="Shoe Size (optional)"
                    value={formData.shoe_size}
                    onChange={e => setFormData(prev => ({ ...prev, shoe_size: e.target.value }))}
                    placeholder="e.g., 39"
                />
                <Select
                    label="Outfit Status"
                    value={formData.outfit_status}
                    onChange={e => setFormData(prev => ({ ...prev, outfit_status: e.target.value }))}
                    options={[
                        { value: 'Not Started', label: 'Not Started' },
                        { value: 'In Progress', label: 'In Progress' },
                        { value: 'Ready', label: 'Ready' },
                    ]}
                />
                <Textarea
                    label="Notes (optional)"
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
                <div className="pt-2">
                    <Button fullWidth onClick={handleSubmit}>Add Member</Button>
                </div>
            </div>
        </Modal>
    );
}
