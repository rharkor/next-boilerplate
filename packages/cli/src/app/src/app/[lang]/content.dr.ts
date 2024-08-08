import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { CurrentConfigurationDr } from "./components/current-configuration.dr"
import { ProjectInitDr } from "./components/project-init.dr"
import { SidenavDr } from "./components/sidenav.dr"

export const MainContentDr = dictionaryRequirements({}, ProjectInitDr, SidenavDr, CurrentConfigurationDr)
