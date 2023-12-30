import { create } from "zustand";

interface State {
  cards: Card[];
}

interface Card {
  position: { x: number; y: number };
}

interface Actions {
  addCard: (card: Card) => void;
}

export const useWhiteboardCards = create<State & Actions>((set) => ({
  cards: [],
  addCard: (card: Card) => set((state) => ({ cards: [...state.cards, card] })),
}));
