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
  paths: z.array(
    z.object({
      from: z.string().refine(
        (value) => {
          if (!isPathInCurrentScope(value)) {
            return false
          }
          return true
        },
        { message: "The path should be relative and in the current directory" }
      ),
      to: z.string().refine(
        (value) => {
          if (!isPathInCurrentScope(value)) {
            return false
          }
          return true
        },
        { message: "The path should be relative and in the current directory" }
      ),
    })
  ),
})

export const storeNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
// Regex that do not allow any kind of special characters
export const storeVersionRegex = /^[~^]?[\da-z.-]+$/

export const configSchema = z.object({
  name: z.string(),
  plugins: z.array(fullPluginSchema),
  stores: z.array(
    z.object({
      name: z.string().regex(storeNameRegex),
      version: z.string().regex(storeVersionRegex),
    })
  ),
})
export type TConfig = z.infer<typeof configSchema>

export const templateSchema = z.object({
  name: z.string(),
  description: z.string().max(300),
  plugins: z.array(
    fullPluginSchema.extend({
      store: z.object({
        name: z.string().regex(storeNameRegex),
        version: z.string().regex(storeVersionRegex),
      }),
    })
  ),
})

export const pluginConfigSchema = z.object({
  name: z.string(),
  store: z.string(), // Store name
  description: z.string().max(300),
  paths: z
    .array(
      z.object({
        from: z.string().refine(
          (value) => {
            if (!isPathInCurrentScope(value)) {
              return false
            }
            return true
          },
          { message: "The path should be relative and in the current directory" }
        ),
        to: z.string().refine(
          (value) => {
            if (!isPathInCurrentScope(value)) {
              return false
            }
            return true
          },
          { message: "The path should be relative and in the current directory" }
        ),
        overridedTo: z
          .string()
          .optional()
          .refine(
            (value) => {
              if (value === undefined) return true
              if (!isPathInCurrentScope(value)) {
                return false
              }
              return true
            },
            { message: "The path should be relative and in the current directory" }
          ),
      })
    )
    .refine(
      (value) => {
        const paths = value.map((path) => path.to)
        return new Set(paths).size === paths.length
      },
      {
        message: "The 'to' paths should be unique",
      }
    ),
})

export type TPluginConfig = z.infer<typeof pluginConfigSchema>

export const storeConfigSchema = z.object({
  name: z.string().regex(storeNameRegex),
  version: z.string().regex(storeVersionRegex),
})
