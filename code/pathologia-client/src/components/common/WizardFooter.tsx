import React from 'react';
import { Button } from '../ui/Button';

interface WizardFooterProps {
  onBack?: () => void;
  backLabel?: string;
  onPrimary: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  primaryIcon?: React.ReactNode;
  showBack?: boolean;
}

export const WizardFooter: React.FC<WizardFooterProps> = ({
  onBack,
  backLabel = 'Back',
  onPrimary,
  primaryLabel,
  primaryDisabled = false,
  primaryLoading = false,
  primaryIcon,
  showBack = true,
}) => {
  return (
    <div className="sticky bottom-0 -mx-5 mt-4 px-5 py-4 bg-surface/95 backdrop-blur-sm border-t border-border flex justify-between gap-3 sm:static sm:mx-0 sm:px-0 sm:py-0 sm:border-0 sm:bg-transparent sm:backdrop-blur-none">
      {showBack && onBack ? (
        <Button type="button" variant="secondary" size="md" onClick={onBack}>
          {backLabel}
        </Button>
      ) : (
        <span />
      )}
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={onPrimary}
        disabled={primaryDisabled}
        isLoading={primaryLoading}
      >
        {primaryIcon}
        {primaryLabel}
      </Button>
    </div>
  );
};
