import React from 'react';
import { cn } from '../../lib/utils';

export interface BookingStep {
  id: string;
  label: string;
}

interface BookingStepperProps {
  steps: BookingStep[];
  currentStepId: string;
  currentStepIndex: number;
}

export const BookingStepper: React.FC<BookingStepperProps> = ({
  steps,
  currentStepId,
  currentStepIndex,
}) => {
  return (
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
      {steps.map((step, index) => {
        const isActive = step.id === currentStepId;
        const isComplete = index < currentStepIndex;

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shrink-0',
                isActive
                  ? 'accent-glass'
                  : isComplete
                    ? 'bg-accent-subtle text-accent'
                    : 'bg-surface-sunken text-foreground-muted',
              )}
            >
              <span
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                  isActive ? 'bg-surface/20' : isComplete ? 'accent-glass rounded-full' : 'bg-border text-foreground-muted',
                )}
              >
                {isComplete && !isActive ? '✓' : index + 1}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-4 sm:w-8 h-0.5 shrink-0 rounded-full',
                  index < currentStepIndex ? 'bg-accent' : 'bg-border',
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
