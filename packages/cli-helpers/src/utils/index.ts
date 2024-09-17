import path from "path"

/**
 * Checks if the provided file path is within the current directory scope.
 * @param filePath The file path to check.
 * @returns true if the path is within the current directory, false otherwise.
 * @example
 * isPathInCurrentScope('./myFile.txt') // true if myFile.txt is in the current directory
 * isPathInCurrentScope('../myFile.txt') // false if myFile.txt is outside the current directory
 * isPathInCurrentScope('/myFile.txt') // false if myFile.txt is outside the current directory
 */
export function isPathInCurrentScope(filePath: string): boolean {
  const basePath = process.cwd() // Get the current working directory
  const resolvedPath = path.resolve(basePath, filePath) // Resolve the full path

  // Check if the resolved path starts with the base path and is not just the root
  return resolvedPath.startsWith(basePath) && path.relative(basePath, resolvedPath) !== ".."
}
