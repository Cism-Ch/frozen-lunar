"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Truck, Search, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
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
import {
    motion,
    AnimatePresence,
    usePrefersReducedMotion,
} from "@/components/ui/motion";
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
        <div className="bg-muted/10 flex h-screen">
            {/* Desktop Sidebar */}
            <motion.aside
                className="bg-background/95 fixed inset-y-0 z-50 hidden w-64 flex-col border-r backdrop-blur md:flex"
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
            <div className="flex min-h-screen flex-1 flex-col md:ml-64">
                {/* Header */}
                <motion.header
                    className="bg-background/95 sticky top-0 z-40 flex h-16 items-center gap-4 border-b px-6 shadow-sm backdrop-blur"
                    initial={prefersReducedMotion ? {} : { y: -20, opacity: 0 }}
                    animate={prefersReducedMotion ? {} : { y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                >
                    <div className="flex items-center gap-2 md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px] p-0">
                                <SheetTitle className="sr-only">
                                    Menu Admin
                                </SheetTitle>
                                <SidebarContent
                                    pathname={pathname}
                                    isLoggingOut={isLoggingOut}
                                    onLogout={handleLogout}
                                />
                            </SheetContent>
                        </Sheet>
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-2 text-lg font-bold"
                        >
                            <div className="bg-primary/10 rounded-md p-1">
                                <Truck className="text-primary h-4 w-4" />
                            </div>
                            <span className="hidden sm:inline-block">
                                HBC Admin
                            </span>
                        </Link>
                    </div>

                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <form className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="search"
                                placeholder="Rechercher..."
                                className="bg-background w-full pl-8 md:w-[300px] lg:w-[400px]"
                            />
                        </form>
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <AdminNotifications />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <motion.div
                                    whileHover={
                                        prefersReducedMotion
                                            ? {}
                                            : { scale: 1.05 }
                                    }
                                    whileTap={
                                        prefersReducedMotion
                                            ? {}
                                            : { scale: 0.95 }
                                    }
                                >
                                    <Button
                                        variant="ghost"
                                        className="relative h-9 w-9 rounded-full"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage
                                                src="/avatars/01.png"
                                                alt="Admin"
                                            />
                                            <AvatarFallback>AD</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56"
                                align="end"
                                forceMount
                            >
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm leading-none font-medium">
                                            Admin
                                        </p>
                                        <p className="text-muted-foreground text-xs leading-none">
                                            admin@hbclogistique.com
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/admin/contacts"
                                        className="flex w-full cursor-pointer"
                                    >
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>Carnet d&apos;adresses</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/admin/settings"
                                        className="flex w-full cursor-pointer"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Paramètres</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-500 focus:text-red-500"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>
                                        {isLoggingOut
                                            ? "Déconnexion..."
                                            : "Déconnexion"}
                                    </span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </motion.header>

                {/* Page Content with Animation */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            className="mx-auto max-w-6xl space-y-8"
                            initial={
                                prefersReducedMotion
                                    ? {}
                                    : { opacity: 0, y: 20 }
                            }
                            animate={
                                prefersReducedMotion ? {} : { opacity: 1, y: 0 }
                            }
                            exit={
                                prefersReducedMotion
                                    ? {}
                                    : { opacity: 0, y: -10 }
                            }
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
