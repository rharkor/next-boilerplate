import { TConfiguration } from "@/api/configuration/schemas"
import { logger } from "@rharkor/logger"

import { env } from "../env"

let configuration: TConfiguration = {}

logger._log("ROOT PATH", env.ROOT_PATH)

export const getConfiguration = () => configuration

export const setConfiguration = (newConfiguration: TConfiguration) => {
  configuration = newConfiguration
}
