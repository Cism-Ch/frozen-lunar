"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();

    const handleLogin = () => {
        // Pour la démo, on redirige directement
        router.push("/admin/dashboard");
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container py-12 md:py-24 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-3 rounded-full bg-primary/10">
                                <Lock className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-center">Administration</CardTitle>
                        <CardDescription className="text-center">
                            Connectez-vous pour accéder au tableau de bord
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="admin@hbc-logistique.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input id="password" type="password" />
                        </div>
                        <Button className="w-full" onClick={handleLogin}>
                            Se connecter
                        </Button>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
