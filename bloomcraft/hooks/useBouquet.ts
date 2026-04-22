// useBouquet — convenience hook that combines bouquetStore + derived values
// Returns: placed flowers, total stem count, total price, colour palette
// TODO: implement derived selectors
import { useBouquetStore } from "@/store/bouquetStore";

export function useBouquet() {
  const store = useBouquetStore();
  return {
    ...store,
    stemCount: store.placedFlowers.length,
    // totalPrice: derived from placedFlowers + flower catalogue
    // colours: derived unique colour set
  };
}

