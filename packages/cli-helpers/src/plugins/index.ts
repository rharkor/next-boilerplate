import { z } from "zod"

import { isPathInCurrentScope } from "../utils"

// Name of the plugins folder
export const pluginsFolder = "plugins"

// Name of the config file for a plugin
export const pluginConfigFileName = "config.json"
/**
 * Schema for validating plugin used in configuration file.
 */
export const pluginSchema = z.object({
  // The name of the plugin the a config file correspond to its relative path from the store (not it's real name)
  name: z.string().max(100),
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

/**
 * Schema for validating the configuration of a plugin.
 */
export const pluginConfigSchema = z.object({
  name: z.string().max(100),
  description: z.string().max(300),
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
  scripts: z
    .object({
      replaceByProjectName: z
        .object({
          search: z.string(),
          root: z.string().refine(
            (value) => {
              if (!isPathInCurrentScope(value)) {
                return false
              }
              return true
            },
            { message: "The path should be relative and in the current directory" }
          ),
        })
        .or(
          z.object({
            search: z.string(),
            paths: z.array(
              z.string().refine((value) => {
                if (!isPathInCurrentScope(value)) {
                  return false
                }
                return true
              })
            ),
          })
        )
        .optional(),
    })
    .optional(),
})

export type TPluginConfig = z.infer<typeof pluginConfigSchema>
