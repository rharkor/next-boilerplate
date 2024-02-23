import { appRouter } from "../../api/_app"
import { createCallerFactory } from "../server/trpc"

import { createContext } from "./context"

/**
 * This client invokes procedures directly on the server without fetching over HTTP.
 */
export const serverTrpc = createCallerFactory(appRouter)(createContext())
