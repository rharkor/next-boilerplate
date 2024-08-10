import path from "path"
import { z } from "zod"

/**
 * Checks if the provided file path is within the current directory scope.
 * @param filePath The file path to check.
 * @returns true if the path is within the current directory, false otherwise.
 */
export function isPathInCurrentScope(filePath: string): boolean {
  const basePath = process.cwd() // Get the current working directory
  const resolvedPath = path.resolve(basePath, filePath) // Resolve the full path

  // Check if the resolved path starts with the base path and is not just the root
  return resolvedPath.startsWith(basePath) && path.relative(basePath, resolvedPath) !== ".."
}

export const fullPluginSchema = z.object({
  name: z.string(),
  path: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (value === undefined) {
          return true
        }
        if (!isPathInCurrentScope(value)) {
          return false
        }
        return true
      },
      { message: "The path should be relative and in the current directory" }
    ),
})

export const configSchema = z.object({
  name: z.string(),
  description: z.string().max(300),
  plugins: z.array(z.string().or(fullPluginSchema)),
})
export type TConfig = z.infer<typeof configSchema>

export const pluginConfigSchema = z.object({
  name: z.string(),
  description: z.string().max(300),
  suggestedPath: z.string().refine(
    (value) => {
      if (!isPathInCurrentScope(value)) {
        return false
      }
      return true
    },
    { message: "The path should be relative and in the current directory" }
  ),
})

export type TPluginConfig = z.infer<typeof pluginConfigSchema>
