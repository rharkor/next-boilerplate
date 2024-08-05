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

export const configSchema = z.object({
  name: z.string(),
  plugins: z.array(
    z.string().or(
      z.object({
        name: z.string(),
        path: z.string().refine(
          (value) => {
            if (!isPathInCurrentScope(value)) {
              return false
            }
            return true
          },
          { message: "The path should be relative and in the current directory" }
        ),
      })
    )
  ),
})
export type TConfig = z.infer<typeof configSchema>

export const pluginConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
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

export type TpluginConfig = z.infer<typeof pluginConfigSchema>
