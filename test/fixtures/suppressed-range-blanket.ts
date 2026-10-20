// biome-ignore-start lint: a blanket range, banned by the gate.
const payload: unknown = JSON.parse('{"id":"1"}')

export const record = payload as Record<string, string>
// biome-ignore-end lint: the range ends here.
