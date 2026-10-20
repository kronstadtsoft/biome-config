const payload: unknown = JSON.parse('{"id":"1"}')

/* biome-ignore lint/plugin/no-cast: named. */ /* biome-ignore lint: blanket. */
export const record = payload as Record<string, string>
