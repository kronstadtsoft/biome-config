// biome-ignore-all format: a file-wide format suppression, banned by the gate.
const payload: unknown = JSON.parse('{"id":"1"}')

export const record = payload as Record<string, string>
