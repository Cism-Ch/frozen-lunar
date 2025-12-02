"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Settings, LogOut, Menu, Truck, Bell, Search, User } from "lucide-react";
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

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

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
            title: "Paramètres",
            href: "/admin/settings",
            icon: Settings,
        },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex h-16 items-center px-6 border-b">
                <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl">
                    <div className="p-1.5 rounded-md bg-primary/10">
                        <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <span>HBC Admin</span>
                </Link>
            </div>
            <div className="flex-1 py-6 px-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-primary/5 hover:text-primary",
                            pathname === item.href
                                ? "bg-primary/10 text-primary shadow-sm"
                                : "text-muted-foreground"
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                ))}
            </div>
            <div className="p-4 border-t space-y-4">
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-medium text-muted-foreground">Thème</span>
                    <ThemeToggle />
                </div>
                <Separator />
                <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-muted/10">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background/95 backdrop-blur md:flex fixed inset-y-0 z-50">
                <SidebarContent />
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-6 shadow-sm">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] p-0">
                            <SheetTitle className="sr-only">Menu Admin</SheetTitle>
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>

                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <form className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Rechercher..."
                                className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
                            />
                        </form>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src="/avatars/01.png" alt="Admin" />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                </Button>
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
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Paramètres</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Déconnexion</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
