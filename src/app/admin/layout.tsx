"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Truck, Search, Users, Settings } from "lucide-react";
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
import { AdminNotifications } from "@/components/features/AdminNotifications";
import { SidebarContent } from "@/components/features/admin/SidebarContent";
import { motion, AnimatePresence, usePrefersReducedMotion } from "@/components/ui/motion";
import { transitions } from "@/lib/animations";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const prefersReducedMotion = usePrefersReducedMotion();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authClient.signOut();
            toast.success("Déconnexion réussie");
            router.push("/admin/login");
            router.refresh();
        } catch (error: unknown) {
            console.error("Logout error:", error);
            toast.error("Erreur lors de la déconnexion");
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="flex h-screen bg-muted/10">
            {/* Desktop Sidebar */}
            <motion.aside
                className="hidden w-64 flex-col border-r bg-background/95 backdrop-blur md:flex fixed inset-y-0 z-50"
                initial={prefersReducedMotion ? {} : { x: -100, opacity: 0 }}
                animate={prefersReducedMotion ? {} : { x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <SidebarContent 
                    pathname={pathname} 
                    isLoggingOut={isLoggingOut} 
                    onLogout={handleLogout} 
                />
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
                                <SidebarContent 
                                    pathname={pathname} 
                                    isLoggingOut={isLoggingOut} 
                                    onLogout={handleLogout} 
                                />
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
                                <DropdownMenuItem 
                                    className="text-red-500 focus:text-red-500 cursor-pointer"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>{isLoggingOut ? "Déconnexion..." : "Déconnexion"}</span>
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
