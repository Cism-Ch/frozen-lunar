"use client";

import { Tutorial } from "@/lib/support-agent/tutorials";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { BookOpen, Clock, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
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
                "w-full max-w-[90%] bg-gradient-to-br from-primary/5 to-secondary/5",
                "rounded-xl border border-primary/20 overflow-hidden",
                className
            )}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between p-3 bg-primary/10 cursor-pointer hover:bg-primary/15 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{tutorial.title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {tutorial.estimatedTime}
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </div>

            {/* Steps */}
            {isExpanded && (
                <div className="p-3 space-y-3">
                    {/* Step Navigation */}
                    <div className="flex gap-1">
                        {tutorial.steps.map((step, index) => (
                            <button
                                key={step.order}
                                onClick={() => setCurrentStep(index)}
                                className={cn(
                                    "flex-1 h-1.5 rounded-full transition-colors",
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
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                {currentStep + 1}
                            </span>
                            <h4 className="font-medium text-sm">
                                {tutorial.steps[currentStep].title}
                            </h4>
                        </div>

                        <p className="text-sm text-muted-foreground pl-8">
                            {tutorial.steps[currentStep].content}
                        </p>

                        {tutorial.steps[currentStep].tip && (
                            <div className="flex items-start gap-2 pl-8 mt-2">
                                <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground italic">
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
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            disabled={currentStep === 0}
                            className="text-xs"
                        >
                            ← Précédent
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentStep(Math.min(tutorial.steps.length - 1, currentStep + 1))}
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
