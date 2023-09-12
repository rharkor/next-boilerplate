import { z } from "zod"

export type apiInputFromSchema<T extends () => z.Schema> = { input: z.infer<ReturnType<T>> }
