const payload: unknown = JSON.parse('{"id":"1"}')

/**
 * biome-ignore lint: a blanket suppression on a block comment line.
 */
export const record = payload as Record<string, string>
