"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Truck, Menu, Phone } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Truck className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight text-foreground">
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
                "text-sm lg:text-base font-medium transition-all hover:text-primary relative group",
                pathname === item.href
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
              {/* Underline effect */}
              <span className={cn(
                "absolute -bottom-1 left-0 h-0.5 bg-primary transition-all",
                pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </Link>
          ))}

          <div className="h-6 w-px bg-border" />
          <ThemeToggle />

          <Button asChild size="default" className="font-semibold group">
            <Link href="/devis">
              <Phone className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
              Demander un devis
            </Link>
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

          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-6 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-lg font-medium hover:text-primary transition-colors",
                    pathname === item.href ? "text-primary font-semibold" : ""
                  )}
                >
                  {item.name}
                </Link>
              ))}

              <div className="flex items-center justify-between w-full pt-4 border-t">
                <span className="text-sm text-muted-foreground">Thème:</span>
                <ThemeToggle />
              </div>

              <Button className="w-full font-semibold group" asChild>
                <Link href="/devis">
                  <Phone className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Demander un devis
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
