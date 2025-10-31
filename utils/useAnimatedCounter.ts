import { useState, useEffect, useRef } from 'react';

interface UseAnimatedCounterOptions {
    duration?: number;
    startOnMount?: boolean;
    enabled?: boolean;
}

/**
 * Custom hook for animating numbers from 0 to target value
 */
export const useAnimatedCounter = (
    target: number,
    options: UseAnimatedCounterOptions = {}
): number => {
    const { duration = 2000, startOnMount = true, enabled = true } = options;
    const [count, setCount] = useState(0);
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const startedRef = useRef(false);
    const targetRef = useRef(target);

    useEffect(() => {
        targetRef.current = target;
    }, [target]);

    useEffect(() => {
        // Cleanup function
        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!enabled) {
            setCount(target);
            startedRef.current = false;
            return;
        }

        // Handle zero or negative values
        if (target === 0 || target < 0) {
            setCount(0);
            startedRef.current = false;
            return;
        }

        // If target changed during animation, reset
        if (startedRef.current && animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
            startedRef.current = false;
        }

        if (startOnMount) {
            startAnimation();
        }

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, enabled, startOnMount]);

    const startAnimation = () => {
        if (startedRef.current || targetRef.current <= 0) return;
        startedRef.current = true;
        
        setCount(0);
        const startTime = Date.now();
        startTimeRef.current = startTime;

        const animate = () => {
            const currentTarget = targetRef.current;
            if (currentTarget <= 0) {
                setCount(0);
                startedRef.current = false;
                return;
            }

            const elapsed = Date.now() - (startTimeRef.current || Date.now());
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.floor(currentTarget * easeOut);

            setCount(currentCount);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setCount(currentTarget);
                startedRef.current = false;
                animationFrameRef.current = null;
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);
    };

    return count;
};

/**
 * Hook for scroll-triggered counter animation
 */
export const useScrollTriggeredCounter = (
    target: number,
    options: UseAnimatedCounterOptions & { animationDelay?: number } = {}
): { count: number; isVisible: boolean; ref: React.RefObject<HTMLDivElement> } => {
    const { animationDelay = 0, ...counterOptions } = options;
    const [isVisible, setIsVisible] = useState(false);
    const [shouldStartCounter, setShouldStartCounter] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasTriggeredRef = useRef(false); // Track if animation has been triggered

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasTriggeredRef.current) {
                        hasTriggeredRef.current = true;
                        setIsVisible(true);
                        // Start counter after delay (sync with card fade-in)
                        if (animationDelay > 0) {
                            timeoutRef.current = setTimeout(() => {
                                setShouldStartCounter(true);
                            }, animationDelay);
                        } else {
                            setShouldStartCounter(true);
                        }
                        // Unobserve once triggered
                        if (elementRef.current && observerRef.current) {
                            observerRef.current.unobserve(elementRef.current);
                        }
                    }
                });
            },
            {
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px',
            }
        );

        observerRef.current = observer;
        const currentElement = elementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (currentElement && observerRef.current) {
                observerRef.current.unobserve(currentElement);
            }
            observerRef.current = null;
        };
    }, []); // Remove isVisible from dependencies to prevent re-observing

    const count = useAnimatedCounter(target, {
        ...counterOptions,
        startOnMount: shouldStartCounter,
        enabled: shouldStartCounter,
    });

    return { count, isVisible, ref: elementRef };
};

