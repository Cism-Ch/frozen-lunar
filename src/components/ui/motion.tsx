"use client";

import { motion, HTMLMotionProps, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import * as animations from "@/lib/animations";

// ============================================
// REDUCED MOTION HOOK
// ============================================

export function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);

        const handler = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches);
        };

        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    return prefersReducedMotion;
}

// ============================================
// FADE IN COMPONENT
// ============================================

interface FadeInProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    direction?: "up" | "down" | "left" | "right" | "none";
    delay?: number;
    duration?: number;
    className?: string;
}

export function FadeIn({
    children,
    direction = "up",
    delay = 0,
    duration,
    className,
    ...props
}: FadeInProps) {
    const prefersReducedMotion = usePrefersReducedMotion();

    const directionVariants = {
        up: animations.fadeInUp,
        down: animations.fadeInDown,
        left: animations.fadeInLeft,
        right: animations.fadeInRight,
        none: animations.fadeIn
    };

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={directionVariants[direction]}
            transition={{ delay, duration }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ============================================
// SCROLL REVEAL COMPONENT
// ============================================

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    direction?: "up" | "left" | "right";
    delay?: number;
    className?: string;
    once?: boolean;
    amount?: number;
}

export function ScrollReveal({
    children,
    direction = "up",
    delay = 0,
    className,
    once = true,
    amount = 0.3,
    ...props
}: ScrollRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, amount });
    const prefersReducedMotion = usePrefersReducedMotion();

    const directionVariants = {
        up: animations.revealOnScroll,
        left: animations.revealFromLeft,
        right: animations.revealFromRight
    };

    if (prefersReducedMotion) {
        return <div ref={ref} className={className}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            initial="offscreen"
            animate={isInView ? "onscreen" : "offscreen"}
            variants={directionVariants[direction]}
            transition={{ delay }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ============================================
// STAGGER CONTAINER
// ============================================

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    staggerSpeed?: "fast" | "normal" | "slow";
    className?: string;
    delay?: number;
}

export function StaggerContainer({
    children,
    staggerSpeed = "normal",
    className,
    delay = 0,
    ...props
}: StaggerContainerProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    const prefersReducedMotion = usePrefersReducedMotion();

    const speedVariants = {
        fast: animations.staggerContainerFast,
        normal: animations.staggerContainer,
        slow: animations.staggerContainerSlow
    };

    if (prefersReducedMotion) {
        return <div ref={ref} className={className}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={speedVariants[staggerSpeed]}
            transition={{ delay }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ============================================
// STAGGER ITEM
// ============================================

interface StaggerItemProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            variants={animations.fadeInUp}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ============================================
// ANIMATED CARD
// ============================================

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
    hoverEffect?: "lift" | "subtle" | "none";
}

export function AnimatedCard({
    children,
    className,
    hoverEffect = "lift",
    ...props
}: AnimatedCardProps) {
    const prefersReducedMotion = usePrefersReducedMotion();

    const hoverVariants = {
        lift: animations.cardHover,
        subtle: animations.cardHoverSubtle,
        none: { rest: {}, hover: {} }
    };

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial="rest"
            whileHover="hover"
            variants={hoverVariants[hoverEffect]}
            className={cn("cursor-pointer", className)}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ============================================
// SCALE ON HOVER
// ============================================

interface ScaleOnHoverProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    scale?: number;
    className?: string;
}

export function ScaleOnHover({
    children,
    scale = 1.05,
    className,
    ...props
}: ScaleOnHoverProps) {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            whileHover={{ scale }}
            whileTap={{ scale: 0.98 }}
            transition={animations.transitions.spring}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ============================================
// ANIMATED COUNTER
// ============================================

interface CountUpProps {
    to: number;
    from?: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export function CountUp({
    to,
    from = 0,
    duration = 2,
    suffix = "",
    prefix = "",
    className
}: CountUpProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const [displayValue, setDisplayValue] = useState(from);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        if (isInView && !prefersReducedMotion) {
            const controls = animate(count, to, {
                duration,
                ease: "easeOut"
            });

            const unsubscribe = rounded.on("change", (latest) => {
                setDisplayValue(latest);
            });

            return () => {
                controls.stop();
                unsubscribe();
            };
        } else if (prefersReducedMotion) {
            setDisplayValue(to);
        }
    }, [isInView, to, count, rounded, duration, prefersReducedMotion]);

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={animations.transitions.springBouncy}
        >
            {prefix}{displayValue}{suffix}
        </motion.span>
    );
}

// ============================================
// ICON FLOAT
// ============================================

interface IconFloatProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
}

export function IconFloat({ children, className, ...props }: IconFloatProps) {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial="rest"
            whileHover="hover"
            variants={animations.iconFloat}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ============================================
// PAGE WRAPPER
// ============================================

interface PageWrapperProps {
    children: ReactNode;
    className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animations.pageTransition}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ============================================
// SECTION HEADER
// ============================================

interface SectionHeaderProps {
    badge?: string;
    title: string;
    description?: string;
    className?: string;
}

export function AnimatedSectionHeader({
    badge,
    title,
    description,
    className
}: SectionHeaderProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const prefersReducedMotion = usePrefersReducedMotion();

    if (prefersReducedMotion) {
        return (
            <div ref={ref} className={cn("text-center space-y-4", className)}>
                {badge && <span className="mb-2">{badge}</span>}
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    {title}
                </h2>
                {description && (
                    <p className="max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
        );
    }

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={animations.staggerContainer}
            className={cn("text-center space-y-4", className)}
        >
            {badge && (
                <motion.div variants={animations.fadeInUp}>
                    {badge}
                </motion.div>
            )}
            <motion.h2
                variants={animations.fadeInUp}
                className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            >
                {title}
            </motion.h2>
            {description && (
                <motion.p
                    variants={animations.fadeInUp}
                    className="max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground"
                >
                    {description}
                </motion.p>
            )}
        </motion.div>
    );
}

// Re-export motion for convenience
export { motion, AnimatePresence } from "framer-motion";
