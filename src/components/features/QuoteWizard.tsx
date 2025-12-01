"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CalendarIcon, Check, ChevronRight, MapPin, Package, Truck, User, Mail, Phone } from "lucide-react";
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
    transportDate: z.date(),
    fullName: z.string().min(2, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(10, "Le téléphone est requis"),
});

export function QuoteWizard() {
    const [step, setStep] = useState(1);
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

    function onSubmit(values: z.infer<typeof formSchema>) {
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
        toast.success(`Demande #${newQuote.id} envoyée avec succès !`, {
            description: "Nous vous contacterons dans les plus brefs délais."
        });
        form.reset();
        setStep(1);
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
        <Card className="w-full max-w-lg mx-auto shadow-xl border-t-4 border-t-primary">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Devis Immédiat</CardTitle>
                <CardDescription className="text-center">
                    Obtenez une estimation pour votre transport en quelques clics.
                </CardDescription>
                <div className="flex justify-center gap-2 mt-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-2 w-12 rounded-full transition-colors",
                                step >= i ? "bg-primary" : "bg-muted"
                            )}
                        />
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="itemType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold flex items-center gap-2">
                                                <Package className="h-5 w-5 text-primary" />
                                                Ce que vous voulez transporter
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-12 text-lg">
                                                        <SelectValue placeholder="Sélectionnez un type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="materiaux">Matériaux de construction</SelectItem>
                                                    <SelectItem value="containers">Containers</SelectItem>
                                                    <SelectItem value="charpentes">Charpentes</SelectItem>
                                                    <SelectItem value="machines">Machines industrielles</SelectItem>
                                                    <SelectItem value="modules">Modules préfabriqués</SelectItem>
                                                    <SelectItem value="autre">Autre</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="pickupLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-primary" />
                                                Depuis où ?
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Adresse de départ..." className="h-12 text-lg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="dropoffLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold flex items-center gap-2">
                                                <Truck className="h-5 w-5 text-primary" />
                                                Vers où ?
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Adresse d'arrivée..." className="h-12 text-lg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="transportDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-lg font-semibold flex items-center gap-2">
                                                <CalendarIcon className="h-5 w-5 text-primary" />
                                                La date
                                            </FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "h-12 w-full pl-3 text-left font-normal text-lg",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP", { locale: fr })
                                                            ) : (
                                                                <span>Choisir une date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-lg font-semibold flex items-center gap-2">
                                                <User className="h-5 w-5 text-primary" />
                                                Votre nom complet
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="Jean Dupont" className="h-12 text-lg" {...field} />
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
                                            <FormLabel className="text-lg font-semibold flex items-center gap-2">
                                                <Mail className="h-5 w-5 text-primary" />
                                                Votre adresse email
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="jean.dupont@example.com" className="h-12 text-lg" {...field} />
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
                                            <FormLabel className="text-lg font-semibold flex items-center gap-2">
                                                <Phone className="h-5 w-5 text-primary" />
                                                Votre numéro de téléphone
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="06 12 34 56 78" className="h-12 text-lg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
                {step > 1 ? (
                    <Button variant="outline" onClick={prevStep}>
                        ← Retour
                    </Button>
                ) : (
                    <div />
                )}

                {step < 5 ? (
                    <Button onClick={nextStep} className="gap-2">
                        Continuer <ChevronRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={form.handleSubmit(onSubmit)} className="gap-2">
                        Envoyer ma demande <Check className="h-4 w-4" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
