"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Truck, Menu, Phone, Home, Info, Mail, Package } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
    motion,
    AnimatePresence,
    usePrefersReducedMotion,
} from "@/components/ui/motion";
import { useHasMounted } from "@/hooks/useHasMounted";

const MotionLink = motion.create(Link);

export function Header() {
    const pathname = usePathname();
    const isMounted = useHasMounted();
    const prefersReducedMotion = usePrefersReducedMotion();

    const navItems = [
        { name: "Accueil", href: "/", icon: Home },
        { name: "Services", href: "/services", icon: Package },
        { name: "Pourquoi nous", href: "/about", icon: Info },
        { name: "Contact", href: "/contact", icon: Mail },
    ];

    return (
        <motion.header
            className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full border-b shadow-sm backdrop-blur"
            initial={prefersReducedMotion ? {} : { y: -100 }}
            animate={prefersReducedMotion ? {} : { y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20 md:px-6 lg:px-8">
                {/* Logo */}
                <MotionLink
                    href="/"
                    className="group flex items-center gap-2"
                    whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    <motion.div
                        className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2 transition-colors"
                        whileHover={prefersReducedMotion ? {} : { rotate: 10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Truck className="text-primary h-5 w-5 md:h-6 md:w-6" />
                    </motion.div>
                    <span className="text-foreground text-lg font-bold tracking-tight md:text-xl">
                        HBC LOGISTIQUE
                    </span>
                </MotionLink>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-8 md:flex">
                    {navItems
                        .filter((item) => item.href !== "/")
                        .map((item, index) => (
                            <MotionLink
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "hover:text-primary group relative text-sm font-medium transition-all lg:text-base",
                                    pathname === item.href
                                        ? "text-primary font-semibold"
                                        : "text-muted-foreground"
                                )}
                                initial={
                                    prefersReducedMotion
                                        ? {}
                                        : { opacity: 0, y: -10 }
                                }
                                animate={
                                    prefersReducedMotion
                                        ? {}
                                        : { opacity: 1, y: 0 }
                                }
                                transition={{
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 300,
                                }}
                                whileHover={
                                    prefersReducedMotion ? {} : { y: -2 }
                                }
                            >
                                {item.name}
                                {/* Underline effect */}
                                <motion.span
                                    className="bg-primary absolute -bottom-1 left-0 h-0.5"
                                    initial={{
                                        width:
                                            pathname === item.href
                                                ? "100%"
                                                : "0%",
                                    }}
                                    whileHover={{ width: "100%" }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 25,
                                    }}
                                />
                            </MotionLink>
                        ))}

                    <div className="bg-border h-6 w-px" />
                    <ThemeToggle />

                    <motion.div
                        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 20,
                        }}
                    >
                        <Button
                            asChild
                            size="default"
                            className="group hover:shadow-primary/25 font-semibold shadow-lg transition-all"
                        >
                            <Link href="/devis">
                                <motion.span
                                    className="mr-2"
                                    whileHover={
                                        prefersReducedMotion
                                            ? {}
                                            : { rotate: 12 }
                                    }
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                    }}
                                >
                                    <Phone className="h-4 w-4" />
                                </motion.span>
                                Demander un devis
                            </Link>
                        </Button>
                    </motion.div>
                </nav>

                {/* Mobile Nav */}
                {isMounted && (
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-primary/10 md:hidden"
                            >
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>

                        <SheetContent
                            side="right"
                            className="flex w-[300px] flex-col p-0 sm:w-[400px]"
                        >
                            <SheetTitle className="sr-only">
                                Menu de navigation
                            </SheetTitle>

                            {/* Mobile Header */}
                            <div className="bg-muted/30 border-b p-6">
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 rounded-lg p-2">
                                        <Truck className="text-primary h-6 w-6" />
                                    </div>
                                    <span className="text-lg font-bold tracking-tight">
                                        HBC LOGISTIQUE
                                    </span>
                                </div>
                            </div>

                            {/* Mobile Links */}
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="flex flex-col gap-2">
                                    <AnimatePresence>
                                        {navItems.map((item, index) => (
                                            <motion.div
                                                key={item.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: index * 0.1,
                                                    type: "spring",
                                                    stiffness: 300,
                                                }}
                                            >
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "hover:bg-muted group flex items-center gap-4 rounded-lg p-3 transition-all",
                                                        pathname === item.href
                                                            ? "bg-primary/10 text-primary"
                                                            : "text-muted-foreground"
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "rounded-md p-2 transition-colors",
                                                            pathname ===
                                                                item.href
                                                                ? "bg-primary/20"
                                                                : "bg-muted group-hover:bg-background"
                                                        )}
                                                    >
                                                        <item.icon
                                                            className={cn(
                                                                "h-5 w-5",
                                                                pathname ===
                                                                    item.href
                                                                    ? "text-primary"
                                                                    : "text-muted-foreground group-hover:text-primary"
                                                            )}
                                                        />
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            "text-base font-medium",
                                                            pathname ===
                                                                item.href
                                                                ? "font-semibold"
                                                                : ""
                                                        )}
                                                    >
                                                        {item.name}
                                                    </span>
                                                    {pathname === item.href && (
                                                        <motion.div
                                                            className="bg-primary ml-auto h-1.5 w-1.5 rounded-full"
                                                            layoutId="activeIndicator"
                                                        />
                                                    )}
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                <Separator className="my-6" />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-3">
                                        <span className="text-muted-foreground text-sm font-medium">
                                            Apparence
                                        </span>
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Footer */}
                            <div className="bg-muted/30 mt-auto border-t p-6">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        className="group h-12 w-full text-lg font-semibold shadow-lg"
                                        asChild
                                    >
                                        <Link href="/devis">
                                            <Phone className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
                                            Demander un devis
                                        </Link>
                                    </Button>
                                </motion.div>
                                <p className="text-muted-foreground mt-4 text-center text-xs">
                                    © {new Date().getFullYear()} HBC Logistique
                                </p>
                            </div>
                        </SheetContent>
                    </Sheet>
                )}
            </div>
        </motion.header>
    );
}
