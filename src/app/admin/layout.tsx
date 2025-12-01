"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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

    return (
        <div className="flex h-screen bg-muted/40">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background md:flex">
                <div className="flex h-14 items-center border-b px-6 font-bold text-lg">
                    Admin Panel
                </div>
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
