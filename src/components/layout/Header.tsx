"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Truck, Menu, Phone, Home, Info, Mail, Package } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence, usePrefersReducedMotion } from "@/components/ui/motion";

export function Header() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const navItems = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: Package },
    { name: "Pourquoi nous", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const MotionLink = motion.create(Link);

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm"
      initial={prefersReducedMotion ? {} : { y: -100 }}
      animate={prefersReducedMotion ? {} : { y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <MotionLink
          href="/"
          className="flex items-center gap-2 group"
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <motion.div
            className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
            whileHover={prefersReducedMotion ? {} : { rotate: 10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Truck className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </motion.div>
          <span className="text-lg md:text-xl font-bold tracking-tight text-foreground">
            HBC LOGISTIQUE
          </span>
        </MotionLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.filter(item => item.href !== "/").map((item, index) => (
            <MotionLink
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm lg:text-base font-medium transition-all hover:text-primary relative group",
                pathname === item.href
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
              whileHover={prefersReducedMotion ? {} : { y: -2 }}
            >
              {item.name}
              {/* Underline effect */}
              <motion.span
                className="absolute -bottom-1 left-0 h-0.5 bg-primary"
                initial={{ width: pathname === item.href ? "100%" : "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            </MotionLink>
          ))}

          <div className="h-6 w-px bg-border" />
          <ThemeToggle />

          <motion.div
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Button asChild size="default" className="font-semibold group shadow-lg hover:shadow-primary/25 transition-all">
              <Link href="/devis">
                <motion.span
                  className="mr-2"
                  whileHover={prefersReducedMotion ? {} : { rotate: 12 }}
                  transition={{ type: "spring", stiffness: 400 }}
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
                  <AnimatePresence>
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                      >
                        <Link
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
                            <motion.div
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
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
                    <span className="text-sm font-medium text-muted-foreground">Apparence</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>

              {/* Mobile Footer */}
              <div className="p-6 border-t bg-muted/30 mt-auto">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="w-full h-12 text-lg font-semibold shadow-lg group" asChild>
                    <Link href="/devis">
                      <Phone className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Demander un devis
                    </Link>
                  </Button>
                </motion.div>
                <p className="text-center text-xs text-muted-foreground mt-4">
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
