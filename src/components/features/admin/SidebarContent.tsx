"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Settings, LogOut, Menu, Truck, Search, User, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { motion, usePrefersReducedMotion } from "@/components/ui/motion";
import { fadeInUp, staggerContainer, transitions } from "@/lib/animations";

interface SidebarContentProps {
    pathname: string;
    isLoggingOut: boolean;
    onLogout: () => void;
}

const navItems = [
    {
        title: "Tableau de bord",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Devis",
        href: "/admin/quotes",
        icon: FileText,
    },
    {
        title: "Contacts",
        href: "/admin/contacts",
        icon: User,
    },
    {
        title: "Utilisateurs",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Paramètres",
        href: "/admin/settings",
        icon: Settings,
    },
];

export function SidebarContent({ pathname, isLoggingOut, onLogout }: SidebarContentProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const MotionLink = motion.create(Link);

    return (
        <div className="flex flex-col h-full">
            <div className="flex h-16 items-center px-6 border-b">
                <MotionLink
                    href="/admin/dashboard"
                    className="flex items-center gap-2 font-bold text-xl"
                    whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                    transition={transitions.spring}
                >
                    <motion.div
                        className="p-1.5 rounded-md bg-primary/10"
                        whileHover={prefersReducedMotion ? {} : { rotate: 10 }}
                        transition={transitions.spring}
                    >
                        <Truck className="h-5 w-5 text-primary" />
                    </motion.div>
                    <span>HBC Admin</span>
                </MotionLink>
            </div>
            <motion.div
                className="flex-1 py-6 px-4 space-y-1"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
            >
                {navItems.map((item, index) => (
                    <motion.div
                        key={item.href}
                        variants={fadeInUp}
                        custom={index}
                    >
                        <Link
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-primary/5 hover:text-primary relative overflow-hidden",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-muted-foreground"
                            )}
                        >
                            <motion.div
                                whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }}
                                transition={transitions.spring}
                            >
                                <item.icon className="h-4 w-4" />
                            </motion.div>
                            {item.title}
                            {pathname === item.href && (
                                <motion.div
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                                    layoutId="adminActiveNav"
                                    transition={transitions.spring}
                                />
                            )}
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
            <div className="p-4 border-t space-y-4">
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-medium text-muted-foreground">Thème</span>
                    <ThemeToggle />
                </div>
                <Separator />
                <motion.div
                    whileHover={prefersReducedMotion ? {} : { x: 2 }}
                    transition={transitions.spring}
                >
                    <Button variant="ghost" className="w-full justify-start gap-3" asChild>
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            Retour au site
                        </Link>
                    </Button>
                </motion.div>
                <motion.div
                    whileHover={prefersReducedMotion ? {} : { x: 2 }}
                    transition={transitions.spring}
                >
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={onLogout}
                        disabled={isLoggingOut}
                    >
                        <LogOut className="h-4 w-4" />
                        {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
