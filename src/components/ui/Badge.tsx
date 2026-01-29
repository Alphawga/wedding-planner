interface BadgeProps {
    variant: 'priority' | 'status' | 'custom';
    value: string;
    customClass?: string;
}

const PRIORITY_STYLES: Record<string, string> = {
    Low: 'bg-warm-100 text-warm-500',
    Medium: 'pill-sage',
    High: 'pill-gold',
    Urgent: 'pill-coral',
};

const STATUS_STYLES: Record<string, string> = {
    'Not Started': 'bg-warm-100 text-warm-500',
    'In Progress': 'pill-gold',
    'Completed': 'pill-sage',
};

export function Badge({ variant, value, customClass }: BadgeProps) {
    let className = 'pill ';

    if (variant === 'priority') {
        className += PRIORITY_STYLES[value] || 'bg-warm-100 text-warm-500';
    } else if (variant === 'status') {
        className += STATUS_STYLES[value] || 'bg-warm-100 text-warm-500';
    } else if (customClass) {
        className += customClass;
    }

    return <span className={className}>{value}</span>;
}
