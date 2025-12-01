import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Paramètres</h3>
                <p className="text-sm text-muted-foreground">
                    Gérez les paramètres de votre compte et de l'application.
                </p>
            </div>
            <Separator />

            <div className="space-y-8">
                <div className="grid gap-4">
                    <h4 className="text-sm font-medium">Profil</h4>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom d'affichage</Label>
                        <Input id="name" defaultValue="Admin" className="max-w-[400px]" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" defaultValue="admin@example.com" className="max-w-[400px]" />
                    </div>
                    <Button className="w-fit">Sauvegarder les modifications</Button>
                </div>

                <Separator />

                <div className="grid gap-4">
                    <h4 className="text-sm font-medium">Notifications</h4>
                    <div className="flex items-center justify-between rounded-lg border p-4 max-w-[600px]">
                        <div className="space-y-0.5">
                            <Label className="text-base">Emails de devis</Label>
                            <p className="text-sm text-muted-foreground">
                                Recevoir un email à chaque nouvelle demande de devis.
                            </p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4 max-w-[600px]">
                        <div className="space-y-0.5">
                            <Label className="text-base">Rapport hebdomadaire</Label>
                            <p className="text-sm text-muted-foreground">
                                Recevoir un résumé de l'activité chaque lundi.
                            </p>
                        </div>
                        <Switch />
                    </div>
                </div>
            </div>
        </div>
    );
}
