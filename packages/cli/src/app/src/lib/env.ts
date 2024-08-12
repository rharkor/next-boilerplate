/* eslint-disable no-process-env */

import { z } from "zod"

const schema = z.object({
  ROOT_PATH: z.string(),
})

export const env = schema.parse(process.env)
