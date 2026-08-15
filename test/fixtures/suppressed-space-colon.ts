const payload: unknown = JSON.parse('{"id":"1"}')

// biome-ignore lint : a space before the colon.
export const record = payload as Record<string, string>
