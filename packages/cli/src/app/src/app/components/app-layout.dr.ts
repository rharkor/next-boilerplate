import { NavSettingsDr } from "@/components/nav-settings.dr"
import { dictionaryRequirements } from "@/lib/utils/dictionary"

import { ProjectInitDr } from "./project-init.dr"
import { SidenavDr } from "./sidenav.dr"

export const AppLayoutDr = dictionaryRequirements({}, ProjectInitDr, SidenavDr, NavSettingsDr)
