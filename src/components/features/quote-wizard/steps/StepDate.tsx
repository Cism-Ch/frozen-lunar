"use client";

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

function getTimeString(date: Date | undefined): string {
    if (!date || Number.isNaN(date.getTime())) return "08:00";
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

function applyTimeToDate(baseDate: Date, timeStr: string): Date {
    const [rawH, rawM] = timeStr.split(":");
    const hours = Math.min(23, Math.max(0, parseInt(rawH || "8", 10) || 0));
    const minutes = Math.min(59, Math.max(0, parseInt(rawM || "0", 10) || 0));
    const next = new Date(baseDate);
    next.setHours(hours, minutes, 0, 0);
    return next;
}

export function StepDate() {
    const { control } = useFormContext();

    return (
        <div className="animate-in fade-in slide-in-from-right-8 space-y-5 duration-500">
            <FormField
                control={control}
                name="transportDate"
                render={({ field }) => {
                    const currentDate = field.value as Date | undefined;
                    const timeValue = getTimeString(currentDate);

                    return (
                        <FormItem className="flex flex-col space-y-4">
                            <div className="space-y-2">
                                <FormLabel className="text-lg font-medium">
                                    Date d&apos;échéance / transport souhaitée
                                </FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "bg-muted/20 border-muted-foreground/20 hover:bg-muted/30 h-12 w-full pl-4 text-left text-sm font-normal sm:h-14 sm:text-base",
                                                    !currentDate &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                {currentDate ? (
                                                    format(
                                                        currentDate,
                                                        "PPP 'à' HH:mm",
                                                        {
                                                            locale: fr,
                                                        }
                                                    )
                                                ) : (
                                                    <span>
                                                        Sélectionnez une date
                                                    </span>
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
                                            selected={currentDate}
                                            onSelect={(picked) => {
                                                if (!picked) {
                                                    field.onChange(undefined);
                                                    return;
                                                }
                                                field.onChange(
                                                    applyTimeToDate(
                                                        picked,
                                                        timeValue
                                                    )
                                                );
                                            }}
                                            disabled={(date) =>
                                                date < startOfDay(new Date()) ||
                                                date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                            className="pointer-events-auto p-3"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <FormLabel
                                    htmlFor="transport-time"
                                    className="flex items-center gap-2 text-sm font-medium"
                                >
                                    <Clock className="text-primary h-4 w-4" />
                                    Heure souhaitée d&apos;enlèvement (suivi
                                    d&apos;échéance)
                                </FormLabel>
                                <Input
                                    id="transport-time"
                                    type="time"
                                    value={timeValue}
                                    onChange={(e) => {
                                        const base = currentDate || new Date();
                                        field.onChange(
                                            applyTimeToDate(
                                                base,
                                                e.target.value || "08:00"
                                            )
                                        );
                                    }}
                                    className="bg-muted/20 border-muted-foreground/20 h-12 font-mono text-base sm:h-14"
                                />
                            </div>

                            <FormMessage />
                        </FormItem>
                    );
                }}
            />
        </div>
    );
}
