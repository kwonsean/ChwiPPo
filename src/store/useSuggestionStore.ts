import { create } from 'zustand';

interface SuggestionStore {
  positions: string[];
  topics: string[];
  keywords: string[];
  materials: string[];
  setSuggestions: (data: { positions: string[], topics: string[], keywords: string[], materials: string[] }) => void;
}

export const useSuggestionStore = create<SuggestionStore>((set) => ({
  positions: [],
  topics: [],
  keywords: [],
  materials: [],
  setSuggestions: (data) => set(data),
}));
