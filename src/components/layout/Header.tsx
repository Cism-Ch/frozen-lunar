"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Truck, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
    const pathname = usePathname();
    const navItems = [
        { name: "Services", href: "/services" },
        { name: "Pourquoi nous", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-20 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2">
                    <Truck className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold tracking-tight text-foreground">
                        HBC LOGISTIQUE
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                                pathname === item.href ? "text-primary font-bold" : "text-foreground-muted"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="h-6 w-px bg-border mx-2"></div>
                    <ThemeToggle />
                    <Button asChild size="default" className="ml-2">
                        <Link href="/devis">Demander un devis</Link>
                    </Button>
                </nav>

                {/* Mobile Nav */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <div className="flex flex-col gap-4 mt-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "text-lg font-medium hover:text-primary",
                                        pathname === item.href ? "text-primary font-bold" : ""
                                    )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="flex items-center gap-2 pt-4 border-t">
                                <span className="text-sm text-muted-foreground">Thème:</span>
                                <ThemeToggle />
                            </div>
                            <Button className="w-full" asChild>
                                <Link href="/devis">Demander un devis</Link>
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
