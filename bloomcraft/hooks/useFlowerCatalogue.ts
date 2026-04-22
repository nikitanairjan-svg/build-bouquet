// useFlowerCatalogue — returns filtered flower list based on active UI filter
// TODO: import catalogue data from lib/flowers.ts and apply filter
// import { useUIStore } from "@/store/uiStore";

import { useUIStore } from "@/store/uiStore";

export function useFlowerCatalogue() {
  const { activeFilter } = useUIStore();
  return {
    flowers: [],   // TODO: filter lib/flowers.ts by activeFilter
    activeFilter,
  };
}
