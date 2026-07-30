import { create } from 'zustand';
import { PathologyTest } from '../types/pathology-test.types';

interface CartState {
  items: PathologyTest[];
  addItem: (test: PathologyTest) => void;
  removeItem: (testId: string) => void;
  clearCart: () => void;
  hasItem: (testId: string) => boolean;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (test) => {
    const exists = get().items.some((item) => item.id === test.id);
    if (exists) return;
    set({ items: [...get().items, test] });
  },

  removeItem: (testId) => {
    set({ items: get().items.filter((item) => item.id !== testId) });
  },

  clearCart: () => set({ items: [] }),

  hasItem: (testId) => get().items.some((item) => item.id === testId),

  totalAmount: () => get().items.reduce((sum, item) => sum + (item.rate ?? 0), 0),
}));
