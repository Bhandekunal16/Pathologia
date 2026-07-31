import React, { forwardRef } from 'react';
import { Calendar } from 'lucide-react';
import { Input, InputProps } from './Input';

export const DatePicker = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <Input
      ref={ref}
      type="date"
      leftIcon={<Calendar className="w-4 h-4 text-foreground-subtle" />}
      {...props}
    />
  );
});

DatePicker.displayName = 'DatePicker';
