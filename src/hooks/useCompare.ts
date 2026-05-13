import { useState, useEffect, useCallback } from "react";

export interface CompareItem {
  id: string;
  type: "sale" | "rental";
}

const KEY = "carflex_compare_v1";
const MAX = 3;

const read = (): CompareItem[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const write = (items: CompareItem[]) => {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("carflex-compare-change"));
};

export const useCompare = () => {
  const [items, setItems] = useState<CompareItem[]>(read);

  useEffect(() => {
    const handler = () => setItems(read());
    window.addEventListener("carflex-compare-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("carflex-compare-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const isSelected = useCallback(
    (id: string, type: "sale" | "rental") =>
      items.some((i) => i.id === id && i.type === type),
    [items]
  );

  const toggle = useCallback(
    (id: string, type: "sale" | "rental") => {
      const current = read();
      const exists = current.some((i) => i.id === id && i.type === type);
      let next: CompareItem[];
      if (exists) {
        next = current.filter((i) => !(i.id === id && i.type === type));
      } else {
        if (current.length >= MAX) return false;
        // Force same type for coherent comparison
        if (current.length > 0 && current[0].type !== type) {
          next = [{ id, type }];
        } else {
          next = [...current, { id, type }];
        }
      }
      write(next);
      return true;
    },
    []
  );

  const clear = useCallback(() => write([]), []);
  const remove = useCallback((id: string, type: "sale" | "rental") => {
    write(read().filter((i) => !(i.id === id && i.type === type)));
  }, []);

  return { items, isSelected, toggle, clear, remove, max: MAX };
};
