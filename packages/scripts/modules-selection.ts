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
  "apps/app/src/app/[lang]/providers.dr.ts",
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
        "aW1wb3J0IHsgdHlwZSBDbGFzc1ZhbHVlLCBjbHN4IH0gZnJvbSAiY2xzeCIKaW1wb3J0IHsgdHdNZXJnZSB9IGZyb20gInRhaWx3aW5kLW1lcmdlIgoKaW1wb3J0IHsgUGlja0Zyb21TdWJzZXQsIFNlbGVjdFN1YnNldCB9IGZyb20gIkAvdHlwZXMiCgpleHBvcnQgZnVuY3Rpb24gY24oLi4uaW5wdXRzOiBDbGFzc1ZhbHVlW10pIHsKICByZXR1cm4gdHdNZXJnZShjbHN4KGlucHV0cykpCn0KCmV4cG9ydCBmdW5jdGlvbiBieXRlc1RvTWVnYWJ5dGVzKGJ5dGVzOiBudW1iZXIsIHJvdW5kPzogYm9vbGVhbik6IG51bWJlciB7CiAgY29uc3QgbWVnYWJ5dGVzID0gYnl0ZXMgLyAoMTAyNCAqIDEwMjQpCiAgaWYgKHJvdW5kKSByZXR1cm4gTWF0aC5yb3VuZChtZWdhYnl0ZXMgKiAxMDApIC8gMTAwCiAgcmV0dXJuIG1lZ2FieXRlcwp9CgpleHBvcnQgZnVuY3Rpb24gY2h1bms8VD4oYXJyYXk6IFRbXSwgc2l6ZTogbnVtYmVyKTogVFtdW10gewogIGNvbnN0IHJlc3VsdDogVFtdW10gPSBbXQoKICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSArPSBzaXplKSB7CiAgICByZXN1bHQucHVzaChhcnJheS5zbGljZShpLCBpICsgc2l6ZSkpCiAgfQoKICByZXR1cm4gcmVzdWx0Cn0KCmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdUb1NsdWcoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcgewogIHJldHVybiBzdHJpbmcKICAgIC50b0xvd2VyQ2FzZSgpCiAgICAucmVwbGFjZSgvW15cdyAtXSsvZywgIiIpCiAgICAucmVwbGFjZSgvICsvZywgIi0iKQp9CgpleHBvcnQgZnVuY3Rpb24gc2xlZXAobXM6IG51bWJlcikgewogIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpCn0KCmV4cG9ydCBmdW5jdGlvbiBwaWNrRnJvbVN1YnNldDxUIGV4dGVuZHMgb2JqZWN0LCBLIGV4dGVuZHMgU2VsZWN0U3Vic2V0PFQ+PigKICBvYmo6IFQsCiAgc3Vic2V0OiBLLAogIGtleVN1bT86IHN0cmluZwopOiBQaWNrRnJvbVN1YnNldDxULCBLPiB7CiAgY29uc3QgcmVzdWx0ID0ge30gYXMgUGlja0Zyb21TdWJzZXQ8VCwgSz4KICBpZiAoIXN1YnNldCkgewogICAgLy8gdGhyb3cgbmV3IEVycm9yKCJUaGUgc3Vic2V0IGlzIHVuZGVmaW5lZC4gUGxlYXNlIHByb3ZpZGUgYSBzdWJzZXQgdG8gcGljayBmcm9tIHRoZSBkaWN0aW9uYXJ5LiIpCiAgICByZXR1cm4gb2JqIGFzIFBpY2tGcm9tU3Vic2V0PFQsIEs+CiAgfQogIE9iamVjdC5rZXlzKHN1YnNldCkuZm9yRWFjaCgoX2tleSkgPT4gewogICAgY29uc3Qga2V5ID0gX2tleSBhcyBrZXlvZiB0eXBlb2Ygc3Vic2V0CiAgICBpZiAoIW9ialtrZXkgYXMga2V5b2YgVF0pIHsKICAgICAgdGhyb3cgbmV3IEVycm9yKAogICAgICAgIGBUaGUga2V5ICIkeyhrZXlTdW0gPyBrZXlTdW0gKyAiLiIgOiAiIikgKyBrZXkudG9TdHJpbmcoKX0iIG5vdCBmb3VuZCBpbiBkaWN0aW9uYXJ5LiBNYXliZSB5b3UgZm9yZ290IHRvIGltcG9ydCBpdCBmcm9tIHRoZSBzZXJ2ZXIgY29tcG9uZW50LiBzZWUgdGhlIGRvY3MgZm9yIG1vcmUgaW5mb3JtYXRpb24uYAogICAgICApCiAgICB9CiAgICBpZiAoc3Vic2V0W2tleV0gPT09IHRydWUpIHsKICAgICAgcmVzdWx0W2tleV0gPSBvYmpba2V5IGFzIGtleW9mIFRdIGFzIFBpY2tGcm9tU3Vic2V0PFQsIEs+W2tleW9mIEtdCiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdWJzZXRba2V5XSA9PT0gIm9iamVjdCIpIHsKICAgICAgcmVzdWx0W2tleV0gPSBwaWNrRnJvbVN1YnNldCgKICAgICAgICBvYmpba2V5IGFzIGtleW9mIFRdIGFzIG9iamVjdCwKICAgICAgICBzdWJzZXRba2V5XSBhcyBTZWxlY3RTdWJzZXQ8VFtrZXlvZiBUXT4sCiAgICAgICAga2V5U3VtID8ga2V5U3VtICsgIi4iICsga2V5LnRvU3RyaW5nKCkgOiBrZXkudG9TdHJpbmcoKQogICAgICApIGFzIFBpY2tGcm9tU3Vic2V0PFQsIEs+W2tleW9mIEtdCiAgICB9CiAgfSkKICByZXR1cm4gcmVzdWx0Cn0KCmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdChpdGVtOiB1bmtub3duKSB7CiAgcmV0dXJuIGl0ZW0gJiYgdHlwZW9mIGl0ZW0gPT09ICJvYmplY3QiICYmICFBcnJheS5pc0FycmF5KGl0ZW0pCn0KCmV4cG9ydCBmdW5jdGlvbiBtZXJnZTxUIGV4dGVuZHMgb2JqZWN0LCBSIGV4dGVuZHMgb2JqZWN0W10+KHRhcmdldDogVCwgLi4uc291cmNlczogUik6IFQgJiBSW251bWJlcl0gewogIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55CiAgY29uc3QgaXNPYmplY3QgPSAob2JqOiBhbnkpOiBvYmogaXMgb2JqZWN0ID0+ICEhb2JqICYmIHR5cGVvZiBvYmogPT09ICJvYmplY3QiICYmICFBcnJheS5pc0FycmF5KG9iaikKCiAgY29uc3QgbWVyZ2VUd28gPSA8VCBleHRlbmRzIG9iamVjdCwgSyBleHRlbmRzIG9iamVjdD4odGFyZ2V0OiBULCBzb3VyY2U6IEspOiBUICYgSyA9PiB7CiAgICBpZiAoKHRhcmdldCBhcyBUIHwgYm9vbGVhbikgPT09IHRydWUpIHJldHVybiB0cnVlIGFzIHVua25vd24gYXMgVCAmIEsKICAgIGNvbnN0IG91dHB1dCA9IHsgLi4udGFyZ2V0IH0KICAgIGlmIChpc09iamVjdCh0YXJnZXQpICYmIGlzT2JqZWN0KHNvdXJjZSkpIHsKICAgICAgT2JqZWN0LmtleXMoc291cmNlKS5mb3JFYWNoKChfa2V5KSA9PiB7CiAgICAgICAgY29uc3Qga2V5ID0gX2tleSBhcyBrZXlvZiB0eXBlb2Ygc291cmNlCiAgICAgICAgaWYgKGlzT2JqZWN0KHNvdXJjZVtrZXldKSkgewogICAgICAgICAgaWYgKCEoa2V5IGluIHRhcmdldCkpIE9iamVjdC5hc3NpZ24ob3V0cHV0LCB7IFtrZXldOiBzb3VyY2Vba2V5XSB9KQogICAgICAgICAgZWxzZQogICAgICAgICAgICBvdXRwdXRba2V5IGFzIHVua25vd24gYXMga2V5b2YgVF0gPSBtZXJnZVR3bygKICAgICAgICAgICAgICB0YXJnZXRba2V5IGFzIHVua25vd24gYXMga2V5b2YgVF0gYXMgb2JqZWN0LAogICAgICAgICAgICAgIHNvdXJjZVtrZXldIGFzIG9iamVjdAogICAgICAgICAgICApIGFzIFRba2V5b2YgVF0KICAgICAgICB9IGVsc2UgewogICAgICAgICAgT2JqZWN0LmFzc2lnbihvdXRwdXQsIHsgW2tleV06IHNvdXJjZVtrZXldIH0pCiAgICAgICAgfQogICAgICB9KQogICAgfQogICAgcmV0dXJuIG91dHB1dCBhcyBUICYgSwogIH0KCiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnkKICByZXR1cm4gc291cmNlcy5yZWR1Y2UoKGFjYywgY3VycikgPT4gbWVyZ2VUd28oYWNjLCBjdXJyIGFzIGFueSksIHRhcmdldCkgYXMgVAp9Cg==",
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
      removals: [
        "COPY apps/app/prisma/schema.prisma apps/app/prisma/schema.prisma",
        "RUN npm run deploy-db:prod -w apps/app",
      ],
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
          /\,\n.*"prisma"\: \{\n.*"schema"\: "prisma\/schema\.prisma"\,\n.*"seed"\: "npx -y tsx prisma\/seed\.ts"\n\s*\}/,
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
        '"dev": "npm run is-initialized && prisma migrate dev && cross-env FORCE_COLOR=1 next dev --turbo",':
          '"dev": "npm run is-initialized && cross-env FORCE_COLOR=1 next dev --turbo",',
      },
    },
  },
  {
    path: "apps/app/src/app/[lang]/(not-protected)/page.tsx",
    fileEdits: {
      newContent:
        "aW1wb3J0IE5hdlNldHRpbmdzIGZyb20gIkAvY29tcG9uZW50cy9uYXYtc2V0dGluZ3MiCmltcG9ydCB7IExvY2FsZSB9IGZyb20gIkAvbGliL2kxOG4tY29uZmlnIgppbXBvcnQgeyBnZXREaWN0aW9uYXJ5IH0gZnJvbSAiQC9saWIvbGFuZ3MiCgpleHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBIb21lKHsKICBwYXJhbXM6IHsgbGFuZyB9LAp9OiB7CiAgcGFyYW1zOiB7CiAgICBsYW5nOiBMb2NhbGUKICB9Cn0pIHsKICBjb25zdCBkaWN0aW9uYXJ5ID0gYXdhaXQgZ2V0RGljdGlvbmFyeShsYW5nLCB7CiAgICBob21lUGFnZTogewogICAgICB0aXRsZTogdHJ1ZSwKICAgIH0sCiAgfSkKCiAgcmV0dXJuICgKICAgIDxtYWluIGNsYXNzTmFtZT0iY29udGFpbmVyIG0tYXV0byBmbGV4IG1pbi1oLXNjcmVlbiBmbGV4LTEgZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0zIj4KICAgICAgPE5hdlNldHRpbmdzIGxhbmc9e2xhbmd9IC8+CiAgICAgIDxoMSBjbGFzc05hbWU9InRleHQtNHhsIGZvbnQtYm9sZCI+e2RpY3Rpb25hcnkuaG9tZVBhZ2UudGl0bGV9PC9oMT4KICAgIDwvbWFpbj4KICApCn0K",
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
        "aW1wb3J0IHsgTG9jYWxlIH0gZnJvbSAiQC9saWIvaTE4bi1jb25maWciCmltcG9ydCB7IGdldERpY3Rpb25hcnkgfSBmcm9tICJAL2xpYi9sYW5ncyIKCmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIEhvbWUoewogIHBhcmFtczogeyBsYW5nIH0sCn06IHsKICBwYXJhbXM6IHsKICAgIGxhbmc6IExvY2FsZQogIH0KfSkgewogIGNvbnN0IGRpY3Rpb25hcnkgPSBhd2FpdCBnZXREaWN0aW9uYXJ5KGxhbmcsIHsKICAgIGhvbWVQYWdlOiB7CiAgICAgIHRpdGxlOiB0cnVlLAogICAgfQogIH0pCgogIHJldHVybiAoCiAgICA8bWFpbiBjbGFzc05hbWU9ImNvbnRhaW5lciBtLWF1dG8gZmxleCBtaW4taC1zY3JlZW4gZmxleC0xIGZsZXgtY29sIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMyI+CiAgICAgIDxoMSBjbGFzc05hbWU9InRleHQtNHhsIGZvbnQtYm9sZCI+e2RpY3Rpb25hcnkuaG9tZVBhZ2UudGl0bGV9PC9oMT4KICAgIDwvbWFpbj4KICApCn0=",
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
  {
    path: "apps/app/src/app/[lang]/not-found.tsx",
    fileEdits: {
      newContent:
        "aW1wb3J0IFJlYWN0IGZyb20gInJlYWN0IgppbXBvcnQgeyBjb29raWVzIH0gZnJvbSAibmV4dC9oZWFkZXJzIgoKaW1wb3J0IHsgTG9jYWxlIH0gZnJvbSAiQC9saWIvaTE4bi1jb25maWciCmltcG9ydCB7IGdldERpY3Rpb25hcnkgfSBmcm9tICJAL2xpYi9sYW5ncyIKaW1wb3J0IExpbmsgZnJvbSAibmV4dC9saW5rIgoKZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gUGFnZTQwNE1hdGNoQWxsKCkgewogIGNvbnN0IGNvb2tpZXNTdG9yZSA9IGNvb2tpZXMoKQogIGNvbnN0IHNhdmVkTG9jYWxlID0gY29va2llc1N0b3JlLmdldCgic2F2ZWQtbG9jYWxlIikKICBjb25zdCBwYXJhbXMgPSBzYXZlZExvY2FsZT8udmFsdWUgPyB7IGxhbmc6IHNhdmVkTG9jYWxlLnZhbHVlIH0gOiB1bmRlZmluZWQKICBjb25zdCBkaWN0aW9uYXJ5ID0gYXdhaXQgZ2V0RGljdGlvbmFyeShwYXJhbXMgPyAocGFyYW1zLmxhbmcgYXMgTG9jYWxlKSA6ICJlbiIsIHsKICAgIG5vdEZvdW5kOiB0cnVlLAogICAgZ29Ib21lOiB0cnVlLAogIH0pCiAgcmV0dXJuICgKICAgIDxtYWluIGNsYXNzTmFtZT0iY29udGFpbmVyIG0tYXV0byBmbGV4IG1pbi1oLXNjcmVlbiBmbGV4LTEgZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0zIj4KICAgICAgPGgxIGNsYXNzTmFtZT0idGV4dC00eGwgZm9udC1ib2xkIj57ZGljdGlvbmFyeS5ub3RGb3VuZH08L2gxPgogICAgICA8TGluayBocmVmPSIvIj4KICAgICAgICB7ZGljdGlvbmFyeS5nb0hvbWV9CiAgICAgIDwvTGluaz4KICAgIDwvbWFpbj4KICApCn0K",
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
