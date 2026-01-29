import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
    error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-warm-600 mb-2">{label}</label>
            )}
            <input
                className={`w-full bg-warm-50 border-warm-200 rounded-2xl px-4 py-3.5 text-sm text-warm-700 placeholder:text-warm-400 focus:bg-white ${error ? 'border-red-400' : ''} ${className}`}
                {...props}
            />
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>
    );
}

export function Select({ label, options, error, className = '', ...props }: SelectProps) {
    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-warm-600 mb-2">{label}</label>
            )}
            <select
                className={`w-full bg-warm-50 border-warm-200 rounded-2xl px-4 py-3.5 text-sm text-warm-700 focus:bg-white ${error ? 'border-red-400' : ''} ${className}`}
                {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>
    );
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-warm-600 mb-2">{label}</label>
            )}
            <textarea
                className={`w-full bg-warm-50 border-warm-200 rounded-2xl px-4 py-3.5 text-sm text-warm-700 placeholder:text-warm-400 focus:bg-white resize-none ${error ? 'border-red-400' : ''} ${className}`}
                rows={3}
                {...props}
            />
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </div>
    );
}
