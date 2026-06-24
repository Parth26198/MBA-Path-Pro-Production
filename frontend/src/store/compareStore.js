import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX = 3;

function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((u) => u && u.id != null && u.name);
}

export const useCompareStore = create(
  persist(
    (set, get) => ({
      items: [],
      add: (university) => {
        const items = sanitizeItems(get().items);
        if (items.some((u) => u.id === university.id)) return items;
        if (items.length >= MAX) return items;
        const next = [...items, { id: university.id, name: university.name, slug: university.slug }];
        set({ items: next });
        return next;
      },
      remove: (id) => set({ items: sanitizeItems(get().items).filter((u) => u.id !== id) }),
      clear: () => set({ items: [] }),
      toggle: (university) => {
        const items = sanitizeItems(get().items);
        if (items.some((u) => u.id === university.id)) {
          set({ items: items.filter((u) => u.id !== university.id) });
        } else {
          get().add(university);
        }
      },
      isComparing: (id) => sanitizeItems(get().items).some((u) => u.id === id),
    }),
    {
      name: 'mba-compare',
      merge: (persisted, current) => ({
        ...current,
        ...persisted,
        items: sanitizeItems(persisted?.items),
      }),
    }
  )
);
