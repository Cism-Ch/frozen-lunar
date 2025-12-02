"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Truck, Menu, Phone, Home, Info, Mail, Package } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";

export function Header() {
  const pathname = usePathname();
  const navItems = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: Package },
    { name: "Pourquoi nous", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
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
          {navItems.filter(item => item.href !== "/").map((item) => (
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

          <Button asChild size="default" className="font-semibold group shadow-lg hover:shadow-primary/25 transition-all">
            <Link href="/devis">
              <Phone className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
              Demander un devis
            </Link>
          </Button>
        </nav>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col p-0">
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>

            {/* Mobile Header */}
            <div className="p-6 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <span className="text-lg font-bold tracking-tight">
                  HBC LOGISTIQUE
                </span>
              </div>
            </div>

            {/* Mobile Links */}
            <div className="flex-1 overflow-y-auto py-6 px-6">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-muted group",
                      pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-md transition-colors",
                      pathname === item.href ? "bg-primary/20" : "bg-muted group-hover:bg-background"
                    )}>
                      <item.icon className={cn(
                        "h-5 w-5",
                        pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      )} />
                    </div>
                    <span className={cn(
                      "text-base font-medium",
                      pathname === item.href ? "font-semibold" : ""
                    )}>
                      {item.name}
                    </span>
                    {pathname === item.href && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center justify-between px-3">
                  <span className="text-sm font-medium text-muted-foreground">Apparence</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="p-6 border-t bg-muted/30 mt-auto">
              <Button className="w-full h-12 text-lg font-semibold shadow-lg group" asChild>
                <Link href="/devis">
                  <Phone className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Demander un devis
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                © {new Date().getFullYear()} HBC Logistique
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
