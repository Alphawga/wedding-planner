import type { Phase } from '../types';

export const PHASES: Phase[] = [
    { phase_id: 'P01', phase_name: 'Planning & Traditional', phase_order: 1, color_code: '#FF6B6B' },
    { phase_id: 'P02', phase_name: 'Traditional Attire', phase_order: 2, color_code: '#4ECDC4' },
    { phase_id: 'P03', phase_name: 'Traditional Vendors', phase_order: 3, color_code: '#45B7D1' },
    { phase_id: 'P04', phase_name: 'Church Wedding', phase_order: 4, color_code: '#96CEB4' },
    { phase_id: 'P05', phase_name: 'Wedding Attire', phase_order: 5, color_code: '#FFEAA7' },
    { phase_id: 'P06', phase_name: 'Reception Planning', phase_order: 6, color_code: '#DDA0DD' },
    { phase_id: 'P07', phase_name: 'Food & Drinks', phase_order: 7, color_code: '#F7DC6F' },
    { phase_id: 'P08', phase_name: 'Entertainment', phase_order: 8, color_code: '#BB8FCE' },
    { phase_id: 'P09', phase_name: 'Media & Memories', phase_order: 9, color_code: '#85C1E9' },
    { phase_id: 'P10', phase_name: 'Guest Management', phase_order: 10, color_code: '#82E0AA' },
    { phase_id: 'P11', phase_name: 'Bridal Train', phase_order: 11, color_code: '#F8B500' },
    { phase_id: 'P12', phase_name: 'Final Details', phase_order: 12, color_code: '#E74C3C' },
    { phase_id: 'P13', phase_name: 'After Wedding', phase_order: 13, color_code: '#1ABC9C' },
];

export const VENDOR_CATEGORIES = [
    'Venue (Traditional)',
    'Venue (Reception)',
    'Caterer (Traditional)',
    'Caterer (Reception)',
    'Photographer',
    'Videographer',
    'Decorator',
    'DJ',
    'Live Band',
    'MC (Traditional)',
    'MC (Reception)',
    'Makeup Artist',
    'Hair Stylist',
    'Cake Baker',
    'Small Chops',
    'Car Rental',
    'Security',
    'Ushers',
];

export const BUDGET_CATEGORIES = [
    'Venue',
    'Catering',
    'Drinks',
    'Attire',
    'Beauty',
    'Decoration',
    'Media',
    'Entertainment',
    'Logistics',
    'Stationery',
    'Traditional',
    'Cake',
    'Miscellaneous',
    'Travel',
];

export const TASK_CATEGORIES = [
    'Venue',
    'Catering',
    'Attire',
    'Beauty',
    'Decoration',
    'Media',
    'Entertainment',
    'Logistics',
    'Documents',
    'Traditional',
    'Gifts',
    'Other',
];

export const PRIORITY_COLORS: Record<string, string> = {
    Low: 'bg-gray-100 text-gray-700',
    Medium: 'bg-blue-100 text-blue-700',
    High: 'bg-orange-100 text-orange-700',
    Urgent: 'bg-red-100 text-red-700',
};

export const STATUS_COLORS: Record<string, string> = {
    'Not Started': 'bg-gray-100 text-gray-600',
    'In Progress': 'bg-yellow-100 text-yellow-700',
    'Completed': 'bg-green-100 text-green-700',
};
