import { SelectSubset, UnionToIntersection } from "@/types"

import { TBaseDict, TPossibleNamespaces } from "../langs"

import { merge } from "."

/**
 * Used to define the dictionary requirements of a component
 */
export const dictionaryRequirements = <
  NS extends TPossibleNamespaces,
  P1 extends SelectSubset<TBaseDict<NS>>,
  P2 extends SelectSubset<TBaseDict<NS>>[],
  P extends P2 extends [] ? P1 : P1 & UnionToIntersection<P2[number]>,
>(
  subset: P1,
  ...subsets: [...P2]
): P => {
  const requirements = subsets.length > 0 ? merge(subset, ...subsets) : (subset as unknown as P)
  return requirements as P
}
