import { useState, useEffect, useRef } from 'react';

interface UseScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

/**
 * Hook for detecting when an element enters the viewport (for animations)
 */
export const useScrollAnimation = (
    options: UseScrollAnimationOptions = {}
): { isVisible: boolean; ref: React.RefObject<HTMLDivElement> } => {
    const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        if (triggerOnce && elementRef.current) {
                            observer.unobserve(elementRef.current);
                        }
                    } else if (!triggerOnce) {
                        setIsVisible(false);
                    }
                });
            },
            {
                threshold,
                rootMargin,
            }
        );

        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { isVisible, ref: elementRef };
};

