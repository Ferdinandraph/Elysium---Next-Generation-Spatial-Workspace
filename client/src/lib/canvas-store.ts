import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

export type CardColor = "violet" | "cyan" | "rose" | "amber" | "emerald" | "neutral";

export interface CanvasCard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content: string;
  color: CardColor;
  z: number;
  createdAt: number;
}

interface Viewport {
  x: number;
  y: number;
  scale: number;
}

interface CanvasState {
  cards: Record<string, CanvasCard>;
  selectedIds: string[];
  viewport: Viewport;
  focusMode: boolean;
  topZ: number;

  addCard: (partial?: Partial<CanvasCard>) => string;
  updateCard: (id: string, patch: Partial<CanvasCard>) => void;
  deleteCard: (id: string) => void;
  bringToFront: (id: string) => void;
  selectCard: (id: string | null, additive?: boolean) => void;
  clearSelection: () => void;
  setViewport: (v: Partial<Viewport>) => void;
  toggleFocusMode: () => void;
  exportJSON: () => string;
  reset: () => void;
}

const seed = (): Record<string, CanvasCard> => {
  const make = (
    x: number,
    y: number,
    title: string,
    content: string,
    color: CardColor,
    w = 280,
    h = 180,
  ): CanvasCard => ({
    id: nanoid(8),
    x,
    y,
    width: w,
    height: h,
    title,
    content,
    color,
    z: 1,
    createdAt: Date.now(),
  });
  const list = [
    make(
      -420,
      -180,
      "Welcome to Elysium",
      "An **infinite spatial canvas** for your thoughts.\n\nDrag cards around. Scroll to zoom. Double-click empty space to create.",
      "violet",
      320,
      200,
    ),
    make(
      -40,
      -220,
      "AI Commands",
      "Select a card and use the toolbar to:\n- ✨ Enhance\n- 📝 Summarize\n- 🔗 Connect\n- 🌱 Expand",
      "cyan",
    ),
    make(320, -160, "Try /ai", "Type `/ai <prompt>` inside any card to invoke intelligence.", "rose"),
    make(-300, 80, "Focus Mode", "Press **F** to enter focus mode and dim the canvas around your selection.", "amber"),
    make(80, 100, "Shortcuts", "- **N** new card\n- **F** focus\n- **E** export\n- **Del** remove", "emerald"),
  ];
  const out: Record<string, CanvasCard> = {};
  list.forEach((c, i) => {
    c.z = i + 1;
    out[c.id] = c;
  });
  return out;
};

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      cards: seed(),
      selectedIds: [],
      viewport: { x: 0, y: 0, scale: 1 },
      focusMode: false,
      topZ: 10,

      addCard: (partial) => {
        const id = nanoid(8);
        const vp = get().viewport;
        const cx = (window.innerWidth / 2 - vp.x) / vp.scale - 140;
        const cy = (window.innerHeight / 2 - vp.y) / vp.scale - 90;
        const topZ = get().topZ + 1;
        const card: CanvasCard = {
          id,
          x: partial?.x ?? cx + (Math.random() * 60 - 30),
          y: partial?.y ?? cy + (Math.random() * 60 - 30),
          width: partial?.width ?? 280,
          height: partial?.height ?? 180,
          title: partial?.title ?? "Untitled",
          content: partial?.content ?? "",
          color: partial?.color ?? "violet",
          z: topZ,
          createdAt: Date.now(),
        };
        set((s) => ({ cards: { ...s.cards, [id]: card }, topZ, selectedIds: [id] }));
        return id;
      },

      updateCard: (id, patch) =>
        set((s) => {
          const existing = s.cards[id];
          if (!existing) return s;
          return { cards: { ...s.cards, [id]: { ...existing, ...patch } } };
        }),

      deleteCard: (id) =>
        set((s) => {
          const next = { ...s.cards };
          delete next[id];
          return { cards: next, selectedIds: s.selectedIds.filter((x) => x !== id) };
        }),

      bringToFront: (id) =>
        set((s) => {
          const topZ = s.topZ + 1;
          const card = s.cards[id];
          if (!card) return s;
          return { topZ, cards: { ...s.cards, [id]: { ...card, z: topZ } } };
        }),

      selectCard: (id, additive) =>
        set((s) => {
          if (id === null) return { selectedIds: [] };
          if (additive) {
            return s.selectedIds.includes(id)
              ? { selectedIds: s.selectedIds.filter((x) => x !== id) }
              : { selectedIds: [...s.selectedIds, id] };
          }
          return { selectedIds: [id] };
        }),

      clearSelection: () => set({ selectedIds: [] }),

      setViewport: (v) => set((s) => ({ viewport: { ...s.viewport, ...v } })),

      toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),

      exportJSON: () => {
        const { cards, viewport } = get();
        return JSON.stringify({ cards, viewport, exportedAt: Date.now() }, null, 2);
      },

      reset: () => set({ cards: seed(), selectedIds: [], viewport: { x: 0, y: 0, scale: 1 } }),
    }),
    {
      name: "elysium-canvas",
      partialize: (s) => ({ cards: s.cards, viewport: s.viewport, topZ: s.topZ }),
    },
  ),
);

export const colorStyles: Record<CardColor, { accent: string; tag: string }> = {
  violet: { accent: "oklch(0.78 0.17 295)", tag: "Violet" },
  cyan: { accent: "oklch(0.78 0.15 210)", tag: "Cyan" },
  rose: { accent: "oklch(0.75 0.18 10)", tag: "Rose" },
  amber: { accent: "oklch(0.82 0.15 75)", tag: "Amber" },
  emerald: { accent: "oklch(0.75 0.15 160)", tag: "Emerald" },
  neutral: { accent: "oklch(0.7 0.02 260)", tag: "Neutral" },
};
