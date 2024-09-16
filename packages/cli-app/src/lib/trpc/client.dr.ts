import { dictionaryRequirements } from "../utils/dictionary"

import { makeQueryClientDr } from "./query-client"

export const TRPCProviderDr = dictionaryRequirements(makeQueryClientDr)
