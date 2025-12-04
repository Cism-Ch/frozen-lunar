"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, Check, ChevronRight, MapPin, Package, Truck, User, Mail, Phone, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { quoteStorage } from "@/lib/quote-storage";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocationPicker } from "./LocationPicker";

const formSchema = z.object({
    itemType: z.string().min(2, {
        message: "Veuillez sélectionner un type de transport.",
    }),
    pickupLocation: z.string().min(5, {
        message: "L'adresse de départ doit contenir au moins 5 caractères.",
    }),
    dropoffLocation: z.string().min(5, {
        message: "L'adresse d'arrivée doit contenir au moins 5 caractères.",
    }),
    transportDate: z.date({
        message: "Une date de transport est requise.",
    }),
    fullName: z.string().min(2, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(10, "Le téléphone est requis"),
});

export function QuoteWizard() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            itemType: "",
            pickupLocation: "",
            dropoffLocation: "",
            fullName: "",
            email: "",
            phone: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newQuote = quoteStorage.add({
            client: values.fullName,
            email: values.email,
            phone: values.phone,
            type: values.itemType,
            pickup: values.pickupLocation,
            dropoff: values.dropoffLocation,
            transportDate: values.transportDate.toISOString(),
        });

        console.log({ ...values, refNumber: newQuote.id });
        toast.success(`Demande #${newQuote.id} envoyée !`, {
            description: "Un expert vous contactera sous 2h avec votre devis."
        });

        form.reset();
        setStep(1);
        setIsSubmitting(false);
    }

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) fieldsToValidate = ["itemType"];
        if (step === 2) fieldsToValidate = ["pickupLocation"];
        if (step === 3) fieldsToValidate = ["dropoffLocation"];
        if (step === 4) fieldsToValidate = ["transportDate"];
        if (step === 5) fieldsToValidate = ["fullName", "email", "phone"];

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);



    return (
        <Card className="w-full max-w-2xl mx-auto shadow-2xl border-muted/40 overflow-hidden">
            {/* Header with Progress */}
            <div className="bg-muted/30 p-6 border-b">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Badge variant="outline" className="mb-2 bg-background">Étape {step} sur 5</Badge>
                        <CardTitle className="text-2xl font-bold">
                            {step === 1 && "Que transportez-vous ?"}
                            {step === 2 && "Lieu de départ"}
                            {step === 3 && "Lieu d'arrivée"}
                            {step === 4 && "Date du transport"}
                            {step === 5 && "Vos coordonnées"}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {step === 1 && "Sélectionnez le type de marchandise"}
                            {step === 2 && "Où devons-nous récupérer la marchandise ?"}
                            {step === 3 && "Où devons-nous livrer la marchandise ?"}
                            {step === 4 && "Quand souhaitez-vous être livré ?"}
                            {step === 5 && "Pour vous envoyer votre devis personnalisé"}
                        </CardDescription>
                    </div>
                    <div className="hidden md:block">
                        <div className="p-3 bg-primary/10 rounded-full">
                            {step === 1 && <Package className="h-8 w-8 text-primary" />}
                            {step === 2 && <MapPin className="h-8 w-8 text-primary" />}
                            {step === 3 && <Truck className="h-8 w-8 text-primary" />}
                            {step === 4 && <CalendarIcon className="h-8 w-8 text-primary" />}
                            {step === 5 && <User className="h-8 w-8 text-primary" />}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${(step / 5) * 100}%` }}
                    />
                </div>
            </div>

            <CardContent className="p-6 md:p-8 min-h-[300px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                                <FormField
                                    control={form.control}
                                    name="itemType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-medium">Type de marchandise</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-14 text-lg bg-muted/20 border-muted-foreground/20 focus:ring-primary/20">
                                                        <SelectValue placeholder="Sélectionnez un type..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="materiaux">Matériaux de construction</SelectItem>
                                                    <SelectItem value="containers">Containers</SelectItem>
                                                    <SelectItem value="charpentes">Charpentes</SelectItem>
                                                    <SelectItem value="machines">Machines industrielles</SelectItem>
                                                    <SelectItem value="modules">Modules préfabriqués</SelectItem>
                                                    <SelectItem value="autre">Autre demande spécifique</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    {["Matériaux", "Containers", "Machines", "Autre"].map((item) => (
                                        <div key={item} className="p-4 border rounded-lg bg-muted/10 text-center text-sm text-muted-foreground">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                                <FormField
                                    control={form.control}
                                    name="pickupLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-medium">Adresse complète de départ</FormLabel>
                                            <FormControl>
                                                <LocationPicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Ex: 12 Rue de l'Industrie, 75000 Paris"
                                                    icon={<MapPin className="h-6 w-6 text-muted-foreground" />}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                                <FormField
                                    control={form.control}
                                    name="dropoffLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-medium">Adresse complète d'arrivée</FormLabel>
                                            <FormControl>
                                                <LocationPicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Ex: Zone Industrielle Nord, 69000 Lyon"
                                                    icon={<Truck className="h-6 w-6 text-muted-foreground" />}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                                <FormField
                                    control={form.control}
                                    name="transportDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-lg font-medium">Date souhaitée</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "h-14 w-full pl-4 text-left font-normal text-lg bg-muted/20 border-muted-foreground/20 hover:bg-muted/30",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP", { locale: fr })
                                                            ) : (
                                                                <span>Sélectionnez une date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date < new Date() || date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                        className="p-3 pointer-events-auto"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="grid gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">Nom complet</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Votre nom" className="h-12 bg-muted/20" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="votre@email.com" className="h-12 bg-muted/20" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-medium">Téléphone</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="06 12 34 56 78" className="h-12 bg-muted/20" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>

            <CardFooter className="flex justify-between p-6 bg-muted/10 border-t">
                {step > 1 ? (
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                    </Button>
                ) : (
                    <div />
                )}

                {step < 5 ? (
                    <Button onClick={nextStep} size="lg" className="px-8 font-semibold shadow-lg hover:shadow-primary/25 transition-all">
                        Continuer <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                ) : (
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        size="lg"
                        className="px-8 font-semibold shadow-lg hover:shadow-primary/25 transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Envoi...
                            </>
                        ) : (
                            <>
                                Demander mon devis <Check className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
