import React, { useMemo } from 'react';
import { useScrollTriggeredCounter } from '../utils/useAnimatedCounter';

interface AnimatedStatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    gradient?: string;
    suffix?: string;
    prefix?: string;
    description?: string;
    delay?: number;
}

const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({
    title,
    value,
    icon,
    gradient = 'from-teal-500 to-teal-600',
    suffix = '',
    prefix = '',
    description,
    delay = 0,
}) => {
    const { count, isVisible, ref } = useScrollTriggeredCounter(value, { 
        duration: 2000,
        animationDelay: delay // Sync counter start with card fade-in
    });

    const formatValue = (num: number): string => {
        // Handle edge cases
        if (num === 0) return '0';
        if (num < 0) return '0';
        
        // Format millions
        if (num >= 1000000) {
            const millions = num / 1000000;
            // If it's a whole number, don't show decimal
            if (millions % 1 === 0) {
                return millions.toFixed(0) + 'M';
            }
            // Otherwise, show one decimal place, but round intelligently
            return Math.round(millions * 10) / 10 + 'M';
        }
        
        // Format thousands
        if (num >= 1000) {
            const thousands = num / 1000;
            // If it's a whole number, don't show decimal
            if (thousands % 1 === 0) {
                return thousands.toFixed(0) + 'K';
            }
            // Round to one decimal place, avoiding awkward numbers like 999.9K
            const rounded = Math.round(thousands * 10) / 10;
            // If rounding results in whole number (e.g., 10.0), show as whole
            if (rounded % 1 === 0) {
                return rounded.toFixed(0) + 'K';
            }
            return rounded.toFixed(1) + 'K';
        }
        
        // Return whole number for values less than 1000
        return Math.floor(num).toString();
    };

    const formattedValue = useMemo(() => formatValue(count), [count]);
    const fullFormattedValue = useMemo(() => {
        return `${prefix}${formattedValue}${suffix}`;
    }, [prefix, formattedValue, suffix]);

    return (
        <article
            ref={ref}
            className={`bg-gradient-to-br ${gradient} rounded-lg shadow-lg p-4 sm:p-6 text-white transform transition-all duration-700 ${
                isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
            }`}
            style={{
                transitionDelay: `${delay}ms`,
            }}
            role="region"
            aria-label={`${title}: ${fullFormattedValue}`}
        >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-white/80 text-xs sm:text-sm font-medium">{title}</h3>
                <div className="text-white/60 flex-shrink-0" aria-hidden="true">{icon}</div>
            </div>
            <div 
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2"
                aria-live="polite"
                aria-atomic="true"
            >
                {fullFormattedValue}
            </div>
            {description && (
                <p className="text-white/80 text-xs sm:text-sm mt-2">{description}</p>
            )}
        </article>
    );
};

export default AnimatedStatCard;

