import React from 'react';
import { Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SearchInput } from './SearchInput';

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'standalone' | 'embedded';
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
  className,
  variant = 'standalone',
}) => {
  return (
    <div
      className={cn(
        'filter-bar',
        variant === 'embedded' && 'data-panel-filters',
        className,
      )}
    >
      <SearchInput value={searchValue} onChange={onSearchChange} placeholder={searchPlaceholder} />

      {children && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="filter-bar-label">
            <Filter className="w-3.5 h-3.5" aria-hidden />
            <span>Filters</span>
          </div>
          {children}
        </div>
      )}
    </div>
  );
};
