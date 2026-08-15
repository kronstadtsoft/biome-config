// biome-ignore-start lint/plugin/no-cast: a named range is inside policy.
const payload: unknown = JSON.parse('{"id":"1"}')

export const record = payload as Record<string, string>
// biome-ignore-end lint/plugin/no-cast: the range ends here.
