import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    elevated?: boolean;
}

export function Card({ children, className = '', onClick, elevated = false }: CardProps) {
    return (
        <div
            className={`${elevated ? 'card-elevated' : 'card'} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`px-5 py-4 border-b border-warm-100 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
