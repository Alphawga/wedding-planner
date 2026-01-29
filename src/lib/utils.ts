import { differenceInDays, format, parseISO, isAfter, isBefore } from 'date-fns';

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: string): string {
    if (!date) return '';
    return format(parseISO(date), 'MMM d, yyyy');
}

export function formatShortDate(date: string): string {
    if (!date) return '';
    return format(parseISO(date), 'MMM d');
}

export function getDaysUntil(date: string): number {
    if (!date) return 0;
    return differenceInDays(parseISO(date), new Date());
}

export function isOverdue(dueDate: string, status: string): boolean {
    if (!dueDate || status === 'Completed') return false;
    return isBefore(parseISO(dueDate), new Date());
}

export function isDueSoon(dueDate: string, daysThreshold = 7): boolean {
    if (!dueDate) return false;
    const days = getDaysUntil(dueDate);
    return days >= 0 && days <= daysThreshold;
}

export function calculateProgress(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
}

export function generateId(prefix: string, existingIds: string[]): string {
    const maxNum = existingIds
        .filter(id => id.startsWith(prefix))
        .map(id => parseInt(id.replace(prefix, ''), 10))
        .reduce((max, num) => Math.max(max, num), 0);
    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

export function getWhatsAppLink(phone: string, message = ''): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const ngPhone = cleanPhone.startsWith('0') ? `234${cleanPhone.slice(1)}` : cleanPhone;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${ngPhone}${message ? `?text=${encodedMessage}` : ''}`;
}

export function getPhoneLink(phone: string): string {
    return `tel:${phone}`;
}
