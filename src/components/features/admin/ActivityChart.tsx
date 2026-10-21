"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Activity,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Calendar as CalendarIcon,
    History,
} from "lucide-react";
import {
    format,
    subDays,
    addDays,
    eachDayOfInterval,
    isSameDay,
    startOfMonth,
    endOfMonth,
    isAfter,
} from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "@/components/ui/motion";
import { Quote } from "@/lib/quote-storage";

interface ActivityChartProps {
    quotes: Quote[];
}

type TimeRange = "7d" | "14d" | "30d" | "month";

interface DayData {
    date: Date;
    dateLabel: string;
    dayNumber: string;
    total: number;
    validated: number;
    pending: number;
    rejected: number;
}

export function ActivityChart({ quotes }: ActivityChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>("30d");
    // Date de fin de la fenêtre d'observation (par défaut aujourd'hui)
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Extraction dynamique de tous les mois uniques présents dans la base
    const availableMonths = useMemo(() => {
        const monthMap = new Map<string, { label: string; date: Date }>();

        quotes.forEach((q) => {
            const d = new Date(q.date);
            if (!isNaN(d.getTime())) {
                const key = format(d, "yyyy-MM");
                if (!monthMap.has(key)) {
                    monthMap.set(key, {
                        label: format(d, "MMMM yyyy", { locale: fr }),
                        date: d,
                    });
                }
            }
        });

        // Toujours inclure le mois courant
        const currentKey = format(new Date(), "yyyy-MM");
        if (!monthMap.has(currentKey)) {
            monthMap.set(currentKey, {
                label: format(new Date(), "MMMM yyyy", { locale: fr }),
                date: new Date(),
            });
        }

        // Toujours inclure le mois de la fenêtre active pour synchroniser le select
        const activeKey = format(endDate, "yyyy-MM");
        if (!monthMap.has(activeKey)) {
            monthMap.set(activeKey, {
                label: format(endDate, "MMMM yyyy", { locale: fr }),
                date: endDate,
            });
        }

        return Array.from(monthMap.values()).sort(
            (a, b) => b.date.getTime() - a.date.getTime()
        );
    }, [quotes, endDate]);

    // Calcul de la fenêtre temporelle
    const { startDate, daysCount } = useMemo(() => {
        if (timeRange === "month") {
            const start = startOfMonth(endDate);
            const end = endOfMonth(endDate);
            const now = new Date();
            // Ne pas dépasser aujourd'hui si on est dans le mois courant
            const actualEnd = isAfter(end, now) ? now : end;
            return {
                startDate: start,
                daysCount: Math.max(
                    1,
                    Math.round(
                        (actualEnd.getTime() - start.getTime()) /
                            (1000 * 60 * 60 * 24)
                    ) + 1
                ),
            };
        }

        const count = timeRange === "7d" ? 7 : timeRange === "14d" ? 14 : 30;
        return {
            startDate: subDays(endDate, count - 1),
            daysCount: count,
        };
    }, [endDate, timeRange]);

    // Calcul de la série temporelle réelle
    const { chartData, maxCount, totalPeriod, averageDaily, peakDay } =
        useMemo(() => {
            const intervalDays = eachDayOfInterval({
                start: startDate,
                end: endDate,
            });

            // Normaliser les dates des devis
            const parsedQuotes = quotes.map((q) => ({
                ...q,
                parsedDate: new Date(q.date),
            }));

            const days: DayData[] = intervalDays.map((dayDate) => {
                const dayQuotes = parsedQuotes.filter((q) =>
                    isSameDay(q.parsedDate, dayDate)
                );

                const total = dayQuotes.length;
                const validated = dayQuotes.filter(
                    (q) =>
                        q.status === "Validé" ||
                        String(q.status).toUpperCase() === "VALIDATED"
                ).length;
                const pending = dayQuotes.filter(
                    (q) =>
                        q.status === "En attente" ||
                        String(q.status).toUpperCase() === "PENDING"
                ).length;
                const rejected = dayQuotes.filter(
                    (q) =>
                        q.status === "Refusé" ||
                        String(q.status).toUpperCase() === "REJECTED"
                ).length;

                return {
                    date: dayDate,
                    dateLabel: format(dayDate, "EEEE d MMMM yyyy", {
                        locale: fr,
                    }),
                    dayNumber: format(dayDate, "dd MMM", { locale: fr }),
                    total,
                    validated,
                    pending,
                    rejected,
                };
            });

            const currentTotal = days.reduce((sum, d) => sum + d.total, 0);
            const currentMax = days.reduce(
                (max, d) => Math.max(max, d.total),
                0
            );
            const peak = days.reduce<DayData | null>((best, cur) => {
                if (!best || cur.total > best.total) return cur;
                return best;
            }, null);

            // Échelle Y : garantit au minimum 4 graduations
            const calculatedMax = Math.max(currentMax, 4);
            const avg =
                days.length > 0
                    ? (currentTotal / days.length).toFixed(1)
                    : "0.0";

            return {
                chartData: days,
                maxCount: calculatedMax,
                totalPeriod: currentTotal,
                averageDaily: avg,
                peakDay: peak && peak.total > 0 ? peak : null,
            };
        }, [quotes, startDate, endDate]);

    // Navigation temporelle
    const isAtCurrentDate =
        isSameDay(endDate, new Date()) || isAfter(endDate, new Date());

    const handlePreviousPeriod = () => {
        if (timeRange === "month") {
            setEndDate(subDays(startOfMonth(endDate), 1));
        } else {
            setEndDate(subDays(endDate, daysCount));
        }
    };

    const handleNextPeriod = () => {
        if (isAtCurrentDate) return;
        const target =
            timeRange === "month"
                ? endOfMonth(addDays(endOfMonth(endDate), 1))
                : addDays(endDate, daysCount);

        const now = new Date();
        setEndDate(isAfter(target, now) ? now : target);
    };

    const handleResetToToday = () => {
        setEndDate(new Date());
    };

    const handleSelectMonth = (date: Date) => {
        setTimeRange("month");
        const now = new Date();
        const monthEnd = endOfMonth(date);
        setEndDate(isAfter(monthEnd, now) ? now : monthEnd);
    };

    // Dimensions graphiques du SVG
    const svgWidth = 800;
    const svgHeight = 240;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 35;

    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    // Nombre d'étapes de graduation Y (ex: 4 étapes régulières)
    const yTicks = [
        0,
        Math.round(maxCount * 0.25),
        Math.round(maxCount * 0.5),
        Math.round(maxCount * 0.75),
        maxCount,
    ];

    // Espacement dynamique des étiquettes d'abscisse X
    const xLabelStep =
        chartData.length <= 8 ? 1 : chartData.length <= 16 ? 2 : 4;

    // Positionnement dynamique de l'infobulle (évite de recouvrir la barre active)
    const isRightHalf =
        hoveredIndex !== null && hoveredIndex >= chartData.length / 2;

    return (
        <Card className="border-border/60 bg-card overflow-hidden">
            <CardHeader className="space-y-3 pb-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* Colonne Gauche : Titre & Période Active */}
                    <div>
                        <div className="flex items-center gap-2">
                            <Activity className="text-primary h-5 w-5" />
                            <CardTitle className="text-lg font-bold">
                                Activité & Volume des Demandes
                            </CardTitle>
                        </div>
                        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-foreground flex items-center gap-1 font-medium">
                                <CalendarIcon className="text-primary h-3.5 w-3.5" />
                                {timeRange === "month"
                                    ? format(startDate, "MMMM yyyy", {
                                          locale: fr,
                                      })
                                    : `Du ${format(startDate, "d MMM", { locale: fr })} au ${format(endDate, "d MMM yyyy", { locale: fr })}`}
                            </span>
                            {!isAtCurrentDate ? (
                                <Badge
                                    variant="secondary"
                                    className="gap-1 bg-amber-500/15 px-2 py-0 text-[10px] font-semibold text-amber-700 dark:text-amber-300"
                                >
                                    <History className="h-3 w-3" />
                                    Période passée
                                </Badge>
                            ) : (
                                <span className="text-muted-foreground text-[11px]">
                                    • Données récentes
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Colonne Droite : Barre de Contrôles Temporels Unifiée */}
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        {/* 1. Sélecteur de Granularité 7j / 14j / 30j / Mois */}
                        <div className="bg-muted inline-flex items-center rounded-lg p-0.5 text-xs">
                            <button
                                type="button"
                                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                    timeRange === "7d"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() => setTimeRange("7d")}
                            >
                                7j
                            </button>
                            <button
                                type="button"
                                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                    timeRange === "14d"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() => setTimeRange("14d")}
                            >
                                14j
                            </button>
                            <button
                                type="button"
                                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                    timeRange === "30d"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() => setTimeRange("30d")}
                            >
                                30j
                            </button>
                            <button
                                type="button"
                                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                    timeRange === "month"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                                onClick={() => setTimeRange("month")}
                            >
                                Mois
                            </button>
                        </div>

                        {/* 2. Stepper Temporel & Sélecteur de Mois */}
                        <div className="bg-background/50 inline-flex items-center gap-1 rounded-lg border p-0.5 shadow-xs">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground h-7 w-7"
                                title="Période précédente"
                                onClick={handlePreviousPeriod}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {/* Dropdown de mois rapide OU bouton Aujourd'hui */}
                            {timeRange === "month" ? (
                                <select
                                    className="text-foreground h-7 cursor-pointer rounded bg-transparent px-1.5 text-xs font-medium capitalize focus:outline-none"
                                    value={format(endDate, "yyyy-MM")}
                                    onChange={(e) => {
                                        const match = availableMonths.find(
                                            (m) =>
                                                format(m.date, "yyyy-MM") ===
                                                e.target.value
                                        );
                                        if (match)
                                            handleSelectMonth(match.date);
                                    }}
                                >
                                    {availableMonths.map((m) => (
                                        <option
                                            key={format(m.date, "yyyy-MM")}
                                            value={format(m.date, "yyyy-MM")}
                                            className="bg-popover text-popover-foreground"
                                        >
                                            {m.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                !isAtCurrentDate && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 gap-1 px-2 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
                                        onClick={handleResetToToday}
                                        title="Revenir à la période récente"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        Aujourd&apos;hui
                                    </Button>
                                )
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground h-7 w-7"
                                title="Période suivante"
                                disabled={isAtCurrentDate}
                                onClick={handleNextPeriod}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Métriques récapitulatives en en-tête de graphique */}
                <div className="grid grid-cols-2 gap-3 border-y py-3 sm:grid-cols-4">
                    <div>
                        <span className="text-muted-foreground text-xs font-medium">
                            Total période
                        </span>
                        <div className="font-mono text-xl font-bold">
                            {totalPeriod}{" "}
                            <span className="text-muted-foreground text-xs font-normal">
                                demande{totalPeriod > 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>

                    <div>
                        <span className="text-muted-foreground text-xs font-medium">
                            Moyenne journalière
                        </span>
                        <div className="font-mono text-xl font-bold">
                            {averageDaily}{" "}
                            <span className="text-muted-foreground text-xs font-normal">
                                / jour
                            </span>
                        </div>
                    </div>

                    <div>
                        <span className="text-muted-foreground text-xs font-medium">
                            Pic d&apos;activité
                        </span>
                        <div className="text-primary font-mono text-xl font-bold">
                            {peakDay ? peakDay.total : 0}{" "}
                            <span className="text-muted-foreground text-xs font-normal">
                                {peakDay ? `(${peakDay.dayNumber})` : "N/A"}
                            </span>
                        </div>
                    </div>

                    <div>
                        <span className="text-muted-foreground text-xs font-medium">
                            Taux de validation
                        </span>
                        <div className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {totalPeriod > 0
                                ? Math.round(
                                      (chartData.reduce(
                                          (acc, d) => acc + d.validated,
                                          0
                                      ) /
                                          totalPeriod) *
                                          100
                                  )
                                : 0}
                            %
                        </div>
                    </div>
                </div>

                {/* Zone de tracé SVG interactif */}
                <div className="relative w-full overflow-hidden select-none">
                    {totalPeriod === 0 ? (
                        <div className="flex h-56 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                            <CalendarIcon className="text-muted-foreground/40 mb-2 h-8 w-8" />
                            <p className="text-foreground text-sm font-medium">
                                Aucune demande sur cette période
                            </p>
                            <p className="text-muted-foreground mt-0.5 max-w-sm text-xs">
                                Aucun devis n&apos;a été enregistré entre le{" "}
                                {format(startDate, "d MMMM", { locale: fr })} et
                                le{" "}
                                {format(endDate, "d MMMM yyyy", { locale: fr })}
                                .
                            </p>
                            {!isAtCurrentDate && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 gap-1.5 text-xs"
                                    onClick={handleResetToToday}
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Revenir à la période récente
                                </Button>
                            )}
                        </div>
                    ) : (
                        <svg
                            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                            className="h-auto w-full overflow-visible"
                        >
                            <defs>
                                <linearGradient
                                    id="activeBarGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="var(--primary, #3b82f6)"
                                        stopOpacity="0.9"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="var(--primary, #3b82f6)"
                                        stopOpacity="0.3"
                                    />
                                </linearGradient>

                                <linearGradient
                                    id="hoverBarGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="var(--primary, #3b82f6)"
                                        stopOpacity="1"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="var(--primary, #3b82f6)"
                                        stopOpacity="0.6"
                                    />
                                </linearGradient>
                            </defs>

                            {/* Lignes de grille horizontales et repères d'échelle Y */}
                            {yTicks.map((val) => {
                                const y =
                                    paddingTop +
                                    plotHeight -
                                    (val / maxCount) * plotHeight;
                                return (
                                    <g key={val}>
                                        <line
                                            x1={paddingLeft}
                                            y1={y}
                                            x2={svgWidth - paddingRight}
                                            y2={y}
                                            stroke="currentColor"
                                            strokeOpacity="0.1"
                                            strokeDasharray={
                                                val === 0 ? "none" : "3 3"
                                            }
                                        />
                                        <text
                                            x={paddingLeft - 8}
                                            y={y + 4}
                                            textAnchor="end"
                                            className="fill-muted-foreground font-mono text-[10px]"
                                        >
                                            {val}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Barres d'activité avec animation Framer Motion */}
                            {chartData.map((item, index) => {
                                const colWidth = plotWidth / chartData.length;
                                const barWidth = Math.max(colWidth * 0.65, 4);
                                const x =
                                    paddingLeft +
                                    index * colWidth +
                                    (colWidth - barWidth) / 2;

                                const barHeight =
                                    maxCount > 0
                                        ? (item.total / maxCount) * plotHeight
                                        : 0;
                                const y = paddingTop + plotHeight - barHeight;

                                const isHovered =
                                    hoveredDay?.dateLabel === item.dateLabel;
                                const isPeak =
                                    peakDay &&
                                    item.total > 0 &&
                                    item.total === peakDay.total;

                                return (
                                    <g
                                        key={item.dateLabel}
                                        className="cursor-pointer transition-opacity"
                                        onMouseEnter={() => {
                                            setHoveredDay(item);
                                            setHoveredIndex(index);
                                        }}
                                        onMouseLeave={() => {
                                            setHoveredDay(null);
                                            setHoveredIndex(null);
                                        }}
                                    >
                                        {/* Zone transparente élargie pour faciliter le survol mobile et souris */}
                                        <rect
                                            x={paddingLeft + index * colWidth}
                                            y={paddingTop}
                                            width={colWidth}
                                            height={plotHeight}
                                            fill="transparent"
                                        />

                                        {/* Barre de données */}
                                        {item.total > 0 ? (
                                            <motion.rect
                                                x={x}
                                                y={y}
                                                width={barWidth}
                                                height={barHeight}
                                                rx={3}
                                                fill={
                                                    isHovered
                                                        ? "url(#hoverBarGradient)"
                                                        : "url(#activeBarGradient)"
                                                }
                                                initial={{
                                                    height: 0,
                                                    y: paddingTop + plotHeight,
                                                }}
                                                animate={{
                                                    height: barHeight,
                                                    y,
                                                }}
                                                transition={{
                                                    delay: index * 0.015,
                                                    duration: 0.45,
                                                    ease: "easeOut",
                                                }}
                                            />
                                        ) : (
                                            // Repère discret pour les jours à 0 demande
                                            <rect
                                                x={x}
                                                y={paddingTop + plotHeight - 2}
                                                width={barWidth}
                                                height={2}
                                                rx={1}
                                                className="fill-muted/50"
                                            />
                                        )}

                                        {/* Couronne distinctive ancrée sur le pic d'activité */}
                                        {isPeak && (
                                            <rect
                                                x={x}
                                                y={Math.max(y - 2, paddingTop)}
                                                width={barWidth}
                                                height={3}
                                                rx={1.5}
                                                className="fill-amber-400"
                                            />
                                        )}

                                        {/* Étiquette d'abscisse X */}
                                        {index % xLabelStep === 0 && (
                                            <text
                                                x={
                                                    paddingLeft +
                                                    index * colWidth +
                                                    colWidth / 2
                                                }
                                                y={svgHeight - 10}
                                                textAnchor="middle"
                                                className="fill-muted-foreground font-mono text-[10px]"
                                            >
                                                {item.dayNumber}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                    )}

                    {/* Infobulle (Tooltip) Flottante Haute Fidélité et Auto-Positionnée */}
                    <AnimatePresence>
                        {hoveredDay && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96, y: 4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96, y: 4 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className={`bg-popover/95 text-popover-foreground border-border/80 pointer-events-none absolute top-3 z-30 w-72 rounded-xl border p-3.5 shadow-xl backdrop-blur-md transition-all duration-200 ${
                                    isRightHalf ? "left-12" : "right-4"
                                }`}
                            >
                                {/* En-tête : Date & Badge Total avec espacement aéré */}
                                <div className="border-border/60 mb-2.5 flex items-start justify-between gap-3 border-b pb-2">
                                    <div>
                                        <div className="text-foreground text-xs leading-snug font-semibold capitalize">
                                            {hoveredDay.dateLabel}
                                        </div>
                                        <div className="text-muted-foreground mt-0.5 text-[11px]">
                                            Activité journalière enregistrée
                                        </div>
                                    </div>
                                    <Badge
                                        variant={
                                            hoveredDay.total > 0
                                                ? "default"
                                                : "secondary"
                                        }
                                        className="shrink-0 px-2 py-0.5 font-mono text-xs font-bold"
                                    >
                                        {hoveredDay.total} demande
                                        {hoveredDay.total > 1 ? "s" : ""}
                                    </Badge>
                                </div>

                                {/* Lignes de statuts avec espacement équilibré et pills discrets */}
                                <div className="space-y-1.5 font-mono text-xs">
                                    <div className="flex items-center justify-between rounded-md bg-emerald-500/10 px-2.5 py-1.5 text-emerald-600 dark:text-emerald-400">
                                        <span className="flex items-center gap-2 font-sans text-xs font-medium">
                                            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                                            Validés
                                        </span>
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <span>{hoveredDay.validated}</span>
                                            {hoveredDay.total > 0 && (
                                                <span className="text-muted-foreground text-[10px] font-normal">
                                                    (
                                                    {Math.round(
                                                        (hoveredDay.validated /
                                                            hoveredDay.total) *
                                                            100
                                                    )}
                                                    %)
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between rounded-md bg-amber-500/10 px-2.5 py-1.5 text-amber-600 dark:text-amber-400">
                                        <span className="flex items-center gap-2 font-sans text-xs font-medium">
                                            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                                            En attente
                                        </span>
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <span>{hoveredDay.pending}</span>
                                            {hoveredDay.total > 0 && (
                                                <span className="text-muted-foreground text-[10px] font-normal">
                                                    (
                                                    {Math.round(
                                                        (hoveredDay.pending /
                                                            hoveredDay.total) *
                                                            100
                                                    )}
                                                    %)
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between rounded-md bg-rose-500/10 px-2.5 py-1.5 text-rose-600 dark:text-rose-400">
                                        <span className="flex items-center gap-2 font-sans text-xs font-medium">
                                            <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                                            Refusés
                                        </span>
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <span>{hoveredDay.rejected}</span>
                                            {hoveredDay.total > 0 && (
                                                <span className="text-muted-foreground text-[10px] font-normal">
                                                    (
                                                    {Math.round(
                                                        (hoveredDay.rejected /
                                                            hoveredDay.total) *
                                                            100
                                                    )}
                                                    %)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}
