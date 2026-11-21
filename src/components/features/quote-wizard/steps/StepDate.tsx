"use client";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

export function StepDate() {
    const { control } = useFormContext();

    return (
        <div className="animate-in fade-in slide-in-from-right-8 space-y-4 duration-500">
            <FormField
                control={control}
                name="transportDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel className="text-lg font-medium">
                            Date souhaitée
                        </FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "bg-muted/20 border-muted-foreground/20 hover:bg-muted/30 h-12 w-full pl-4 text-left text-sm font-normal sm:h-14 sm:text-base",
                                            !field.value &&
                                                "text-muted-foreground"
                                        )}
                                    >
                                        {field.value ? (
                                            format(field.value, "PPP", {
                                                locale: fr,
                                            })
                                        ) : (
                                            <span>Sélectionnez une date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-5 w-5 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                                className="border-border/60 w-auto max-w-[calc(100vw-2rem)] rounded-xl p-0 shadow-xl"
                                align="center"
                                sideOffset={8}
                            >
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                        date < startOfDay(new Date()) ||
                                        date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                    className="pointer-events-auto p-3"
                                />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
