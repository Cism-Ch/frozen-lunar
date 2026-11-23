"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    CI_ROAD_SAFETY_CHARTER_ARTICLES,
    CI_ROAD_SAFETY_CHARTER_INTRO,
    CI_ROAD_SAFETY_CHARTER_TITLE,
} from "@/lib/ci-road-charter";

export default function CiRoadSafetyCharterPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <SectionContainer className="from-muted/50 to-background bg-gradient-to-b pt-20 pb-12 md:pt-28 md:pb-16">
                    <div className="mx-auto max-w-3xl space-y-5 text-center">
                        <Badge variant="outline" className="gap-1.5">
                            <ShieldCheck className="text-primary h-3.5 w-3.5" />
                            Réglementation Routière • Côte d&apos;Ivoire
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            {CI_ROAD_SAFETY_CHARTER_TITLE}
                        </h1>
                        <p className="text-muted-foreground text-base leading-relaxed md:text-lg">
                            {CI_ROAD_SAFETY_CHARTER_INTRO}
                        </p>
                        <div className="pt-2">
                            <Button asChild variant="outline" className="gap-2">
                                <Link href="/partenaires">
                                    <ArrowLeft className="h-4 w-4" />
                                    Retour au formulaire partenaire
                                </Link>
                            </Button>
                        </div>
                    </div>
                </SectionContainer>

                <SectionContainer className="bg-background pt-0 md:pt-4">
                    <div className="mx-auto max-w-4xl space-y-6">
                        {CI_ROAD_SAFETY_CHARTER_ARTICLES.map((article) => (
                            <Card key={article.number} className="border-2">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">
                                            {article.number}
                                        </Badge>
                                        <CardTitle className="text-lg">
                                            {article.title}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {article.summary}
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        {article.obligations.map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-start gap-2.5"
                                            >
                                                <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </SectionContainer>
            </main>
            <Footer />
        </div>
    );
}
