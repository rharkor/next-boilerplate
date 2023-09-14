import { createContext } from "./context"
import { appRouter } from "../server/routers/_app"

/**
 * This client invokes procedures directly on the server without fetching over HTTP.
 */
export const serverTrpc = appRouter.createCaller(await createContext())
