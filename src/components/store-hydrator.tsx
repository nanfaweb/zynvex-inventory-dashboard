"use client";

import { useEffect } from "react";
import { useCatalogStore } from "@/store/catalog-store";

/** Loads persisted products from localStorage once the app has mounted. */
export function StoreHydrator() {
  useEffect(() => {
    void useCatalogStore.persist.rehydrate();
  }, []);
  return null;
}
