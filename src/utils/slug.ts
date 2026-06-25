/**
 * Generate a URL-safe slug from a string.
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes non-alphanumeric characters (except hyphens)
 * - Collapses multiple hyphens into one
 * - Trims leading/trailing hyphens
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Collapse multiple hyphens
    .replace(/^-|-$/g, '');        // Trim leading/trailing hyphens
}
