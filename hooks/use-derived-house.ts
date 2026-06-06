import { useMemo } from "react";

import { BLOCK_TO_HOUSE } from "@/data/championship";

export function useDerivedHouse(block: string) {
  return useMemo(() => (block ? BLOCK_TO_HOUSE[block] : null), [block]);
}
