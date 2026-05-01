import { cn } from "@/lib/utils";

type StepIndicatorProps = {
    currentStep: number;
    totalSteps: number;
};

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
        <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "h-1.5 rounded-full flex-1 transition-all",
                        i < currentStep && "bg-primary",
                        i === currentStep && "bg-primary",
                        i > currentStep && "bg-muted",
                    )}
                />
            ))}
        </div>
    );
}