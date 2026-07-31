import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface BookingCartSummaryProps {
  itemCount: number;
  totalAmount: number;
}

export const BookingCartSummary: React.FC<BookingCartSummaryProps> = ({
  itemCount,
  totalAmount,
}) => {
  return (
    <div className="sidebar-chip">
      <ShoppingCart className="w-4 h-4" />
      <span>{itemCount} in cart</span>
      <span className="text-sidebar-text-muted">·</span>
      <span>{formatCurrency(totalAmount)}</span>
    </div>
  );
};
