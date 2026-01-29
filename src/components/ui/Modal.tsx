import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div
                className="absolute inset-0 bg-warm-800/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[90vh] overflow-auto animate-slide-up safe-area-bottom">
                <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-warm-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-warm-800 heading-serif">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-warm-100 text-warm-500 hover:bg-warm-200 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
