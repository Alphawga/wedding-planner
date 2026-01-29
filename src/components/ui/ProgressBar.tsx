interface ProgressBarProps {
    value: number;
    max?: number;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showAmount?: boolean;
    formatValue?: (value: number) => string;
}

export function ProgressBar({
    value,
    max = 100,
    showLabel = false,
    size = 'md',
    showAmount = false,
    formatValue
}: ProgressBarProps) {
    const percentage = Math.min(Math.round((value / max) * 100), 100);

    const heights = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-3.5',
    };

    return (
        <div className="w-full">
            {(showLabel || showAmount) && (
                <div className="flex justify-between items-center mb-1.5">
                    {showAmount && formatValue && (
                        <span className="text-xs text-warm-500">{formatValue(value)}</span>
                    )}
                    {showLabel && (
                        <span className="text-xs font-medium text-warm-600 ml-auto">{percentage}%</span>
                    )}
                </div>
            )}
            <div className={`progress-elegant ${heights[size]}`}>
                <div
                    className="progress-elegant-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
