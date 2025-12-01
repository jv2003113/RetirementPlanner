import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value?: string | number;
    onChange: (value: string) => void;
    className?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ value, onChange, className, ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState('');

        // Format number with commas
        const formatNumber = (numStr: string) => {
            if (!numStr) return '';
            const num = parseFloat(numStr.replace(/,/g, ''));
            if (isNaN(num)) return numStr;
            return num.toLocaleString('en-US');
        };

        // Update display value when prop value changes
        useEffect(() => {
            if (value !== undefined && value !== null) {
                setDisplayValue(formatNumber(String(value)));
            }
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;

            // Remove commas to get the raw number string
            const rawValue = inputValue.replace(/,/g, '');

            // Allow only numbers and one decimal point
            if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
                // Update parent with raw value
                onChange(rawValue);

                // Update local display value with formatting
                // We only format if it's a valid number, otherwise keep as is (e.g. "1.")
                if (rawValue === '' || rawValue.endsWith('.')) {
                    setDisplayValue(inputValue);
                } else {
                    setDisplayValue(formatNumber(rawValue));
                }
            }
        };

        const handleBlur = () => {
            // Ensure proper formatting on blur
            if (value) {
                setDisplayValue(formatNumber(String(value)));
            }
        };

        return (
            <Input
                {...props}
                ref={ref}
                type="text"
                inputMode="decimal"
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn("text-right", className)}
            />
        );
    }
);

CurrencyInput.displayName = "CurrencyInput";
