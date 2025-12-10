import { Variants, Transition } from "framer-motion";

// ============================================
// TRANSITION PRESETS
// ============================================

export const transitions = {
    spring: { type: "spring", stiffness: 300, damping: 30 } as Transition,
    springBouncy: { type: "spring", stiffness: 400, damping: 25 } as Transition,
    smooth: { type: "tween", ease: "easeOut", duration: 0.4 } as Transition,
    snappy: { type: "tween", ease: [0.25, 0.1, 0.25, 1], duration: 0.3 } as Transition,
    slow: { type: "tween", ease: "easeOut", duration: 0.6 } as Transition,
} as const;

// ============================================
// ENTRANCE VARIANTS
// ============================================

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: transitions.smooth
    }
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: transitions.spring
    }
};

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: transitions.spring
    }
};

export const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -24 },
    visible: {
        opacity: 1,
        x: 0,
        transition: transitions.spring
    }
};

export const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 24 },
    visible: {
        opacity: 1,
        x: 0,
        transition: transitions.spring
    }
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: transitions.spring
    }
};

export const scaleInBounce: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: transitions.springBouncy
    }
};

// ============================================
// STAGGER CONTAINERS
// ============================================

export const staggerContainer: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

export const staggerContainerFast: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05
        }
    }
};

export const staggerContainerSlow: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

// ============================================
// HOVER VARIANTS
// ============================================

export const cardHover: Variants = {
    rest: {
        scale: 1,
        y: 0,
        transition: transitions.spring
    },
    hover: {
        scale: 1.02,
        y: -4,
        transition: transitions.spring
    }
};

export const cardHoverSubtle: Variants = {
    rest: {
        scale: 1,
        transition: transitions.smooth
    },
    hover: {
        scale: 1.01,
        transition: transitions.smooth
    }
};

export const buttonHover: Variants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.98 }
};

export const iconFloat: Variants = {
    rest: { y: 0 },
    hover: {
        y: -4,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 10
        }
    }
};

export const iconRotate: Variants = {
    rest: { rotate: 0 },
    hover: { rotate: 12 }
};

export const glowPulse: Variants = {
    rest: {
        opacity: 0.5,
        scale: 1
    },
    hover: {
        opacity: 0.8,
        scale: 1.1,
        transition: {
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1
        }
    }
};

// ============================================
// SCROLL REVEAL VARIANTS
// ============================================

export const revealOnScroll: Variants = {
    offscreen: {
        y: 50,
        opacity: 0
    },
    onscreen: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            bounce: 0.3,
            duration: 0.8
        }
    }
};

export const revealFromLeft: Variants = {
    offscreen: {
        x: -100,
        opacity: 0
    },
    onscreen: {
        x: 0,
        opacity: 1,
        transition: {
            type: "spring",
            bounce: 0.3,
            duration: 0.8
        }
    }
};

export const revealFromRight: Variants = {
    offscreen: {
        x: 100,
        opacity: 0
    },
    onscreen: {
        x: 0,
        opacity: 1,
        transition: {
            type: "spring",
            bounce: 0.3,
            duration: 0.8
        }
    }
};

// ============================================
// PAGE TRANSITION VARIANTS
// ============================================

export const pageTransition: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: {
        opacity: 1,
        y: 0,
        transition: transitions.smooth
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: { duration: 0.2 }
    }
};

export const slideInFromBottom: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: transitions.spring
    },
    exit: { opacity: 0, y: 20 }
};

// ============================================
// SPECIAL EFFECTS
// ============================================

export const shimmer: Variants = {
    rest: {
        backgroundPosition: "-200% 0"
    },
    hover: {
        backgroundPosition: "200% 0",
        transition: {
            duration: 1.5,
            ease: "linear",
            repeat: Infinity
        }
    }
};

// Text character stagger for hero headings
export const textRevealContainer: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.1
        }
    }
};

export const textRevealChild: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
        rotateX: -90
    },
    visible: {
        opacity: 1,
        y: 0,
        rotateX: 0,
        transition: {
            type: "spring",
            damping: 12,
            stiffness: 200
        }
    }
};

// ============================================
// COUNTER ANIMATION HELPER
// ============================================

export const counterVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: transitions.springBouncy
    }
};
