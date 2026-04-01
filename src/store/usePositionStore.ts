import { create } from 'zustand';

interface PositionStore {
  positions: string[];
  setPositions: (positions: string[]) => void;
}

export const usePositionStore = create<PositionStore>((set) => ({
  positions: [],
  setPositions: (positions) => set({ positions }),
}));


