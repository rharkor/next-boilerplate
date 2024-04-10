import { SelectSubset, UnionToIntersection } from "@/types"

import { TBaseDict } from "../langs"

import { merge } from "."

/**
 * Used to define the dictionary requirements of a component
 */
export const dictionaryRequirements = <
  P1 extends SelectSubset<TBaseDict>,
  P2 extends SelectSubset<TBaseDict>[],
  P extends P2 extends [] ? P1 : P1 & UnionToIntersection<P2[number]>,
>(
  subset: P1,
  ...subsets: [...P2]
): P => {
  const requirements = subsets.length > 0 ? merge(subset, ...subsets) : (subset as unknown as P)
  return requirements as P
}
