const payload: unknown = JSON.parse('{"id":"1"}')

// biome-ignore format: a line-level format suppression names no rule.
export const record = payload as Record<string, string>
