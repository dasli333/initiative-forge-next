import { Check } from "lucide-react";
import type { ProgressIndicatorProps } from "./types";

const STEP_LABELS = ["Combat Name", "Select PCs", "Add Monsters", "Add NPCs", "Summary"] as const;

export function ProgressIndicator({ currentStep, completedSteps }: ProgressIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-start justify-between">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = (index + 1) as 1 | 2 | 3 | 4 | 5;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = currentStep === stepNumber;
          const isFirstOrLast = index === 0 || index === STEP_LABELS.length - 1;

          return (
            <li
              key={stepNumber}
              className="flex flex-col items-center gap-2"
              style={{ flex: isFirstOrLast ? "0 0 auto" : "1 1 0%" }}
            >
              <div className="flex items-center" style={{ width: isFirstOrLast ? "auto" : "100%" }}>
                {/* Line before (except first step) */}
                {index > 0 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      isCompleted || isCurrent ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                )}

                {/* Step indicator */}
                <div
                  className={`
                    flex items-center justify-center flex-shrink-0
                    w-10 h-10 rounded-full font-medium text-sm
                    transition-colors duration-200
                    ${
                      isCurrent
                        ? "bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-900"
                        : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                    }
                  `}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <span>{stepNumber}</span>}
                </div>

                {/* Line after (except last step) */}
                {index < STEP_LABELS.length - 1 && (
                  <div className={`h-0.5 flex-1 ${isCompleted ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`} />
                )}
              </div>

              {/* Step label */}
              <span
                className={`
                  text-xs font-medium text-center whitespace-nowrap
                  ${
                    isCurrent
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isCompleted
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-500 dark:text-gray-400"
                  }
                `}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
