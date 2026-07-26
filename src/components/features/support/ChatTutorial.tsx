"use client";

import { Tutorial } from "@/lib/support-agent/tutorials";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    BookOpen,
    Clock,
    ChevronDown,
    ChevronUp,
    Lightbulb,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatTutorialProps {
    tutorial: Tutorial;
    className?: string;
}

export function ChatTutorial({ tutorial, className }: ChatTutorialProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "from-primary/5 to-secondary/5 w-full max-w-[90%] bg-gradient-to-br",
                "border-primary/20 overflow-hidden rounded-xl border",
                className
            )}
        >
            {/* Header */}
            <div
                className="bg-primary/10 hover:bg-primary/15 flex cursor-pointer items-center justify-between p-3 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <BookOpen className="text-primary h-4 w-4" />
                    <span className="text-sm font-semibold">
                        {tutorial.title}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        {tutorial.estimatedTime}
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="text-muted-foreground h-4 w-4" />
                    ) : (
                        <ChevronDown className="text-muted-foreground h-4 w-4" />
                    )}
                </div>
            </div>

            {/* Steps */}
            {isExpanded && (
                <div className="space-y-3 p-3">
                    {/* Step Navigation */}
                    <div className="flex gap-1">
                        {tutorial.steps.map((step, index) => (
                            <button
                                key={step.order}
                                onClick={() => setCurrentStep(index)}
                                className={cn(
                                    "h-1.5 flex-1 rounded-full transition-colors",
                                    index === currentStep
                                        ? "bg-primary"
                                        : index < currentStep
                                          ? "bg-primary/50"
                                          : "bg-muted"
                                )}
                            />
                        ))}
                    </div>

                    {/* Current Step Content */}
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                                {currentStep + 1}
                            </span>
                            <h4 className="text-sm font-medium">
                                {tutorial.steps[currentStep].title}
                            </h4>
                        </div>

                        <p className="text-muted-foreground pl-8 text-sm">
                            {tutorial.steps[currentStep].content}
                        </p>

                        {tutorial.steps[currentStep].tip && (
                            <div className="mt-2 flex items-start gap-2 pl-8">
                                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                                <p className="text-muted-foreground text-xs italic">
                                    {tutorial.steps[currentStep].tip}
                                </p>
                            </div>
                        )}
                    </motion.div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                setCurrentStep(Math.max(0, currentStep - 1))
                            }
                            disabled={currentStep === 0}
                            className="text-xs"
                        >
                            ← Précédent
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                setCurrentStep(
                                    Math.min(
                                        tutorial.steps.length - 1,
                                        currentStep + 1
                                    )
                                )
                            }
                            disabled={currentStep === tutorial.steps.length - 1}
                            className="text-xs"
                        >
                            Suivant →
                        </Button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
