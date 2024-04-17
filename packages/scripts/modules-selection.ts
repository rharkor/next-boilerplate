/**
 * This script remove all the packages you don't want from the monorepo
 */

import chalk from "chalk"
import * as fs from "fs"
import inquirer from "inquirer"
import * as path from "path"
import * as url from "url"
import YAML from "yaml"

import { logger } from "@next-boilerplate/lib"

const __dirname = url.fileURLToPath(new URL(".", import.meta.url))
const rootDir = path.join(__dirname, "..", "..")

const dockerComposePaths = [
  path.join(rootDir, "docker", "docker-compose.yml"),
  path.join(rootDir, "docker", "docker-compose.local.yml"),
  path.join(rootDir, ".devcontainer", "docker-compose.yml"),
]

const onlyFrontToRemove = [
  "apps/app/prisma",
  "apps/app/src/api",
  "apps/app/src/app/api/auth",
  "apps/app/src/app/api/trpc",
  "apps/app/src/app/[lang]/(protected)",
  "apps/app/src/app/[lang]/(sys-auth)",
  "apps/app/src/components/auth",
  "apps/app/src/components/profile",
  "apps/app/src/constants/auth.ts",
  "apps/app/src/constants/rate-limit.ts",
  "apps/app/src/contexts/account.tsx",
  "apps/app/src/contexts/active-sessions.tsx",
  "apps/app/src/lib/auth",
  "apps/app/src/lib/server",
  "apps/app/src/lib/templates",
  "apps/app/src/lib/trpc",
  "apps/app/src/lib/utils/client-utils.ts",
  "apps/app/src/lib/utils/server-utils.ts",
  "apps/app/src/lib/bcrypt.ts",
  "apps/app/src/lib/mailer.ts",
  "apps/app/src/lib/prisma.ts",
  "apps/app/src/lib/queries-options.ts",
  "apps/app/src/lib/rate-limit.ts",
  "apps/app/src/lib/redis.ts",
  "apps/app/src/lib/s3.ts",
  "apps/app/src/types/auth.d.ts",
  "apps/app/src/types/api.d.ts",
  "apps/app/types.d.ts",
]

const onlyFrontAppsAdaptaion: {
  path: string
  fileEdits:
    | {
        newContent: string
      }
    | {
        removals?: (string | RegExp)[]
        replacements?: { [key: string]: string }
      }
}[] = [
  {
    path: "apps/app/src/lib/utils/index.ts",
    fileEdits: {
      newContent:
        "aW1wb3J0IHsgdHlwZSBDbGFzc1ZhbHVlLCBjbHN4IH0gZnJvbSAiY2xzeCIKaW1wb3J0IHsgdHdNZXJnZSB9IGZyb20gInRhaWx3aW5kLW1lcmdlIgoKZXhwb3J0IGZ1bmN0aW9uIGNuKC4uLmlucHV0czogQ2xhc3NWYWx1ZVtdKSB7CiAgcmV0dXJuIHR3TWVyZ2UoY2xzeChpbnB1dHMpKQp9CgpleHBvcnQgZnVuY3Rpb24gYnl0ZXNUb01lZ2FieXRlcyhieXRlczogbnVtYmVyLCByb3VuZD86IGJvb2xlYW4pOiBudW1iZXIgewogIGNvbnN0IG1lZ2FieXRlcyA9IGJ5dGVzIC8gKDEwMjQgKiAxMDI0KQogIGlmIChyb3VuZCkgcmV0dXJuIE1hdGgucm91bmQobWVnYWJ5dGVzICogMTAwKSAvIDEwMAogIHJldHVybiBtZWdhYnl0ZXMKfQoKZXhwb3J0IGZ1bmN0aW9uIGNodW5rPFQ+KGFycmF5OiBUW10sIHNpemU6IG51bWJlcik6IFRbXVtdIHsKICBjb25zdCByZXN1bHQ6IFRbXVtdID0gW10KCiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkgKz0gc2l6ZSkgewogICAgcmVzdWx0LnB1c2goYXJyYXkuc2xpY2UoaSwgaSArIHNpemUpKQogIH0KCiAgcmV0dXJuIHJlc3VsdAp9CgpleHBvcnQgZnVuY3Rpb24gc3RyaW5nVG9TbHVnKHN0cmluZzogc3RyaW5nKTogc3RyaW5nIHsKICByZXR1cm4gc3RyaW5nCiAgICAudG9Mb3dlckNhc2UoKQogICAgLnJlcGxhY2UoL1teXHcgLV0rL2csICIiKQogICAgLnJlcGxhY2UoLyArL2csICItIikKfQoKZXhwb3J0IGZ1bmN0aW9uIHNsZWVwKG1zOiBudW1iZXIpIHsKICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKQp9",
    },
  },
  {
    path: "apps/app/src/types/index.d.ts",
    fileEdits: {
      newContent:
        "ZXhwb3J0IHR5cGUgVmFsdWVPZjxUPiA9IFRba2V5b2YgVF0KCmV4cG9ydCB0eXBlIFBhdGg8VCwgUHJlZml4IGV4dGVuZHMgc3RyaW5nID0gIiI+ID0gVCBleHRlbmRzIG9iamVjdAogID8gewogICAgICBbSyBpbiBrZXlvZiBUXS0/OiBLIGV4dGVuZHMgc3RyaW5nCiAgICAgICAgPyBgJHtQcmVmaXh9JHtQcmVmaXggZXh0ZW5kcyAiIiA/ICIiIDogIi4ifSR7S31gIHwgUGF0aDxUW0tdLCBgJHtQcmVmaXh9JHtQcmVmaXggZXh0ZW5kcyAiIiA/ICIiIDogIi4ifSR7S31gPgogICAgICAgIDogbmV2ZXIKICAgIH1ba2V5b2YgVF0KICA6IG5ldmVy",
    },
  },
  {
    path: "apps/app/.env.example",
    fileEdits: {
      newContent: "UkVBQ1RfRURJVE9SPWNvZGUKTkVYVF9URUxFTUVUUllfRElTQUJMRUQ9MQpFTlY9ZGV2ZWxvcG1lbnQ=",
    },
  },
  {
    path: "apps/app/Dockerfile",
    fileEdits: {
      removals: ["COPY packages/app/prisma/schema.prisma ./packages/app/prisma/schema.prisma"],
    },
  },
  {
    path: "apps/app/src/lib/env.ts",
    fileEdits: {
      newContent:
        "LyogZXNsaW50LWRpc2FibGUgbm8tcHJvY2Vzcy1lbnYgKi8KaW1wb3J0IHsgY29uZmlnIH0gZnJvbSAiZG90ZW52IgppbXBvcnQgeyB6IH0gZnJvbSAiem9kIgoKaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAiQG5leHQtYm9pbGVycGxhdGUvbGliIgppbXBvcnQgeyBjcmVhdGVFbnYgfSBmcm9tICJAdDMtb3NzL2Vudi1uZXh0anMiCgppZiAoIXByb2Nlc3MuZW52LkVOVikgewogIGNvbmZpZygpCn0KCmV4cG9ydCBjb25zdCBlbnYgPSBjcmVhdGVFbnYoewogIHNlcnZlcjogewogICAgQU5BTFlaRTogegogICAgICAuZW51bShbInRydWUiLCAiZmFsc2UiXSkKICAgICAgLm9wdGlvbmFsKCkKICAgICAgLnRyYW5zZm9ybSgodmFsdWUpID0+IHZhbHVlID09PSAidHJ1ZSIpLAogICAgRU5WOiB6LmVudW0oWyJkZXZlbG9wbWVudCIsICJzdGFnaW5nIiwgInByZXByb2R1Y3Rpb24iLCAicHJvZHVjdGlvbiJdKSwKICB9LAogIGNsaWVudDogewogIH0sCiAgcnVudGltZUVudjogewogICAgQU5BTFlaRTogcHJvY2Vzcy5lbnYuQU5BTFlaRSwKICAgIEVOVjogcHJvY2Vzcy5lbnYuRU5WLAogIH0sCiAgb25WYWxpZGF0aW9uRXJyb3I6IChlcnJvcikgPT4gewogICAgbG9nZ2VyLmVycm9yKGVycm9yKQogICAgdGhyb3cgIkludmFsaWQgZW52aXJvbm1lbnQgdmFyaWFibGVzIgogIH0sCiAgb25JbnZhbGlkQWNjZXNzKHZhcmlhYmxlKSB7CiAgICBsb2dnZXIuZXJyb3IoYEludmFsaWQgYWNjZXNzIHRvICR7dmFyaWFibGV9YCkKICAgIHRocm93ICJJbnZhbGlkIGVudmlyb25tZW50IHZhcmlhYmxlcyIKICB9LAp9KQ==",
    },
  },
  {
    path: "apps/app/src/app/[lang]/providers.tsx",
    fileEdits: {
      removals: [
        'import { NextAuthProvider } from "@/components/auth/provider"',
        'import TrpcProvider from "@/lib/trpc/provider"',
        "<NextAuthProvider>",
        "<TrpcProvider dictionary={dictionary}>",
        "</TrpcProvider>",
        "</NextAuthProvider>",
        "const dictionary = await getDictionary(lang, RootProvidersDr)",
      ],
      replacements: {
        "export default async function RootProviders({ children, lang }: { children: ReactNode; lang: Locale }) {":
          "export default async function RootProviders({ children }: { children: ReactNode; lang: Locale }) {",
      },
    },
  },
  {
    path: "apps/app/package.json",
    fileEdits: {
      removals: [
        new RegExp(/\,\n.*"deploy-db\:prod"\: "prisma migrate deploy && npm run seed"/, "g"),
        new RegExp(/\,\n.*"seed"\: "cross-env NODE_ENV=development tsx prisma\/seed.ts"/, "g"),
        new RegExp(
          /\,\n.*"prisma"\: \{\n.*"schema"\: "prisma\/schema\.prisma"\,\n.*"seed"\: "tsx prisma\/seed\.ts"\n\s*\}/,
          "g"
        ),
        ...[
          "@aws-sdk/client-s3",
          "@aws-sdk/s3-presigned-post",
          "@hookform/resolvers",
          "@next-auth/prisma-adapter",
          "@prisma/client",
          "@tanstack/react-query",
          "@trpc/client",
          "@trpc/react-query",
          "@trpc/server",
          "@types/bcryptjs",
          "@types/cli-spinner",
          "@types/crypto-js",
          "@types/nodemailer",
          "@types/request-ip",
          "@types/ua-parser-js",
          "base32-encode",
          "bcryptjs",
          "bip39",
          "chalk",
          "cli-spinner",
          "crypto-js",
          "ioredis",
          "next-auth",
          "nodemailer",
          "otpauth",
          "prisma",
          "qrcode.react",
          "request-ip",
          "superjson",
          "tsx",
          "ua-parser-js",
        ].map((s) => new RegExp(`\\n\\s*"${s}"\:.*\,`, "g")),
        new RegExp(`\\n\\s*"postinstall"\:"prisma generate"\,`, "g"),
      ],
      replacements: {
        '"start": "npm run deploy-db:prod && next start --port ${PORT:-3000}",':
          '"start": "next start --port ${PORT:-3000}",',
        '"dev": "npm run is-initialized && prisma migrate dev && cross-env FORCE_COLOR=1 next dev",':
          '"dev": "npm run is-initialized && cross-env FORCE_COLOR=1 next dev",',
      },
    },
  },
  {
    path: "apps/app/src/app/[lang]/(not-protected)/page.tsx",
    fileEdits: {
      newContent:
        "aW1wb3J0IE5hdlNldHRpbmdzIGZyb20gIkAvY29tcG9uZW50cy9uYXYtc2V0dGluZ3MiCmltcG9ydCB7IExvY2FsZSB9IGZyb20gIkAvbGliL2kxOG4tY29uZmlnIgppbXBvcnQgeyBnZXREaWN0aW9uYXJ5IH0gZnJvbSAiQC9saWIvbGFuZ3MiCgpleHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBIb21lKHsKICBwYXJhbXM6IHsgbGFuZyB9LAp9OiB7CiAgcGFyYW1zOiB7CiAgICBsYW5nOiBMb2NhbGUKICB9Cn0pIHsKICBjb25zdCBkaWN0aW9uYXJ5ID0gYXdhaXQgZ2V0RGljdGlvbmFyeShsYW5nKQoKICByZXR1cm4gKAogICAgPG1haW4gY2xhc3NOYW1lPSJjb250YWluZXIgbS1hdXRvIGZsZXggbWluLWgtc2NyZWVuIGZsZXgtMSBmbGV4LWNvbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTMiPgogICAgICA8TmF2U2V0dGluZ3MgbGFuZz17bGFuZ30gLz4KICAgICAgPGgxIGNsYXNzTmFtZT0idGV4dC00eGwgZm9udC1ib2xkIj57ZGljdGlvbmFyeS5ob21lUGFnZS50aXRsZX08L2gxPgogICAgPC9tYWluPgogICkKfQo=",
    },
  },
  {
    path: "apps/app/next.config.mjs",
    fileEdits: {
      removals: [new RegExp(/redirects\(\)\s{(\n|.)*},/, "g")],
    },
  },
  {
    path: ".devcontainer/devcontainer.json",
    fileEdits: {
      removals: [new RegExp(/\,\n\s*"runServices": \["redis"\, "db"\]/, "g")],
    },
  },
]

const noUiToRemove = [
  "apps/app/src/app/[lang]/ui-provider.tsx",
  "apps/app/src/components/ui",
  "apps/app/src/components/auto-refresh.tsx",
  "apps/app/src/components/locale-switcher.tsx",
  "apps/app/src/components/icons.tsx",
  "apps/app/src/components/theme/theme-switch.tsx",
  "apps/app/src/components/nav-settings.tsx",
  "apps/app/src/app/[lang]/not-found.tsx",
  "apps/app/src/app/[lang]/error.tsx",
]

const noUiAppsAdaptaion: {
  path: string
  fileEdits:
    | {
        newContent: string
      }
    | {
        removals?: (string | RegExp)[]
        replacements?: { [key: string]: string }
      }
}[] = [
  {
    path: "apps/app/src/app/[lang]/(not-protected)/page.tsx",
    fileEdits: {
      newContent:
        "aW1wb3J0IHsgTG9jYWxlIH0gZnJvbSAiQC9saWIvaTE4bi1jb25maWciCmltcG9ydCB7IGdldERpY3Rpb25hcnkgfSBmcm9tICJAL2xpYi9sYW5ncyIKCmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIEhvbWUoewogIHBhcmFtczogeyBsYW5nIH0sCn06IHsKICBwYXJhbXM6IHsKICAgIGxhbmc6IExvY2FsZQogIH0KfSkgewogIGNvbnN0IGRpY3Rpb25hcnkgPSBhd2FpdCBnZXREaWN0aW9uYXJ5KGxhbmcpCgogIHJldHVybiAoCiAgICA8bWFpbiBjbGFzc05hbWU9ImNvbnRhaW5lciBtLWF1dG8gZmxleCBtaW4taC1zY3JlZW4gZmxleC0xIGZsZXgtY29sIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMyI+CiAgICAgIDxoMSBjbGFzc05hbWU9InRleHQtNHhsIGZvbnQtYm9sZCI+e2RpY3Rpb25hcnkuaG9tZVBhZ2UudGl0bGV9PC9oMT4KICAgIDwvbWFpbj4KICApCn0=",
    },
  },
  {
    path: "apps/app/tailwind.config.js",
    fileEdits: {
      newContent:
        "aW1wb3J0ICogYXMgcGF0aCBmcm9tICJwYXRoIgoKLyoqIEB0eXBlIHtpbXBvcnQoJ3RhaWx3aW5kY3NzJykuQ29uZmlnfSAqLwptb2R1bGUuZXhwb3J0cyA9IHsKICBjb250ZW50OiBbCiAgICAuLi5bInBhZ2VzLyoqLyoue3RzLHRzeH0iLCAiY29tcG9uZW50cy8qKi8qLnt0cyx0c3h9IiwgImFwcC8qKi8qLnt0cyx0c3h9IiwgInNyYy8qKi8qLnt0cyx0c3h9Il0ubWFwKChwKSA9PgogICAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCBwKQogICAgKSwKICBdLAogIHRoZW1lOiB7CiAgICBleHRlbmQ6IHsKICAgICAgY29sb3JzOiB7CiAgICAgIH0sCiAgICB9LAogIH0sCiAgZGFya01vZGU6ICJjbGFzcyIsCn0K",
    },
  },
  {
    path: "apps/app/src/app/[lang]/providers.tsx",
    fileEdits: {
      removals: ['import UIProvider from "./ui-provider"', "<UIProvider>", "</UIProvider>"],
    },
  },
  {
    path: "apps/app/package.json",
    fileEdits: {
      removals: [
        "@types/react-dom",
        "lucide-react",
        "react-dropzone",
        "react-hook-form",
        "framer-motion",
        "@nextui-org/react",
      ].map((s) => new RegExp(`\\n\\s*"${s}"\:.*\,`, "g")),
    },
  },
]

export const modulesSelection = async () => {
  const { onlyFront } = await inquirer.prompt<{ onlyFront: boolean }>([
    {
      type: "confirm",
      name: "onlyFront",
      message: "Do you want to transform the app into a front-end only app?",
      default: false,
    },
  ])

  if (onlyFront) {
    // Remove the docker-compose services that are not needed anymore
    for (const dockerComposePath of dockerComposePaths) {
      const dockerCompose = fs.readFileSync(dockerComposePath).toString()
      const dockerComposeYaml = YAML.parse(dockerCompose)
      delete dockerComposeYaml.services.db
      delete dockerComposeYaml.services.redis
      delete dockerComposeYaml.volumes
      fs.writeFileSync(dockerComposePath, YAML.stringify(dockerComposeYaml))
    }
    logger.log(chalk.gray("Removed docker-compose services!"))

    // Remove the files that are not needed anymore
    await Promise.all(
      onlyFrontToRemove.map((file) =>
        fs.promises
          .rm(path.join(rootDir, file), {
            recursive: true,
          })
          .catch((e) => {
            if (e.code !== "ENOENT") {
              throw e
            }
          })
      )
    )
    logger.log(chalk.gray("Removed unnecessary files!"))

    // Adapt the files that are not needed anymore
    for (const { path: filePath, fileEdits } of onlyFrontAppsAdaptaion) {
      let file = fs.readFileSync(path.join(rootDir, filePath), "utf-8").toString()
      if ("newContent" in fileEdits) {
        fs.writeFileSync(path.join(rootDir, filePath), Buffer.from(fileEdits.newContent, "base64").toString())
      } else {
        for (const removal of fileEdits.removals ?? []) {
          file = file.replaceAll(removal, "")
        }
        for (const [key, value] of Object.entries(fileEdits.replacements ?? {})) {
          file = file.replaceAll(key, value)
        }
        fs.writeFileSync(path.join(rootDir, filePath), file)
      }
    }
    logger.log(chalk.gray("Adapted some files!"))

    const { noUi } = await inquirer.prompt<{ noUi: boolean }>([
      {
        type: "confirm",
        name: "noUi",
        message: "Do you want to remove the UI from the app?",
        default: false,
      },
    ])

    if (noUi) {
      // Remove the files that are not needed anymore
      await Promise.all(
        noUiToRemove.map((file) =>
          fs.promises.rm(path.join(rootDir, file), {
            recursive: true,
          })
        )
      )
      logger.log(chalk.gray("Removed unnecessary files!"))

      // Adapt the files that are not needed anymore
      for (const { path: filePath, fileEdits } of noUiAppsAdaptaion) {
        let file = fs.readFileSync(path.join(rootDir, filePath), "utf-8").toString()
        if ("newContent" in fileEdits) {
          fs.writeFileSync(path.join(rootDir, filePath), Buffer.from(fileEdits.newContent, "base64").toString())
        } else {
          for (const removal of fileEdits.removals ?? []) {
            file = file.replaceAll(removal, "")
          }
          for (const [key, value] of Object.entries(fileEdits.replacements ?? {})) {
            file = file.replaceAll(key, value)
          }
          fs.writeFileSync(path.join(rootDir, filePath), file)
        }
      }
      logger.log(chalk.gray("Adapted some files!"))
    }
  }
}
