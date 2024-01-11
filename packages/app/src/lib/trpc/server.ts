import { appRouter } from "../../api/_app"

import { createContext } from "./context"

/**
 * This client invokes procedures directly on the server without fetching over HTTP.
 */
export const serverTrpc = appRouter.createCaller(createContext())
