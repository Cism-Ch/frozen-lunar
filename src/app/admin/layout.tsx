"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Settings, LogOut, Menu, Truck, Search, User, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { AdminNotifications } from "@/components/features/AdminNotifications";
import { motion, AnimatePresence, usePrefersReducedMotion } from "@/components/ui/motion";
import { fadeInUp, staggerContainer, transitions } from "@/lib/animations";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const prefersReducedMotion = usePrefersReducedMotion();

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
            title: "Paramètres",
            href: "/admin/settings",
            icon: Settings,
        },
    ];

    const MotionLink = motion.create(Link);

    const SidebarContent = () => (
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
                    <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                    </Button>
                </motion.div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-muted/10">
            {/* Desktop Sidebar */}
            <motion.aside
                className="hidden w-64 flex-col border-r bg-background/95 backdrop-blur md:flex fixed inset-y-0 z-50"
                initial={prefersReducedMotion ? {} : { x: -100, opacity: 0 }}
                animate={prefersReducedMotion ? {} : { x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <SidebarContent />
            </motion.aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <motion.header
                    className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-6 shadow-sm"
                    initial={prefersReducedMotion ? {} : { y: -20, opacity: 0 }}
                    animate={prefersReducedMotion ? {} : { y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                >
                    <div className="flex items-center gap-2 md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="shrink-0">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px] p-0">
                                <SheetTitle className="sr-only">Menu Admin</SheetTitle>
                                <SidebarContent />
                            </SheetContent>
                        </Sheet>
                        <Link href="/admin/dashboard" className="font-bold text-lg flex items-center gap-2">
                            <div className="p-1 rounded-md bg-primary/10">
                                <Truck className="h-4 w-4 text-primary" />
                            </div>
                            <span className="hidden sm:inline-block">HBC Admin</span>
                        </Link>
                    </div>

                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <form className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Rechercher..."
                                className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
                            />
                        </form>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <AdminNotifications />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.div
                                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                                >
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src="/avatars/01.png" alt="Admin" />
                                            <AvatarFallback>AD</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">Admin</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            admin@hbclogistique.com
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/admin/contacts" className="cursor-pointer flex w-full">
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>Carnet d&apos;adresses</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/admin/settings" className="cursor-pointer flex w-full">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Paramètres</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Déconnexion</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </motion.header>

                {/* Page Content with Animation */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            className="mx-auto max-w-6xl space-y-8"
                            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                            exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                            transition={transitions.smooth}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
