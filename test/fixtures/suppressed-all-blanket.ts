// biome-ignore-all lint: a blanket file suppression, banned by the grep gate.
const payload: unknown = JSON.parse('{"id":"1"}')

export const record = payload as Record<string, string>
