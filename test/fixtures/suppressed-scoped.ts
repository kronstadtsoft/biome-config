const payload: unknown = JSON.parse('{"id":"1"}')

// biome-ignore lint/complexity/useLiteralKeys: a rule-scoped suppression cannot name a plugin.
export const record = payload as Record<string, string>
