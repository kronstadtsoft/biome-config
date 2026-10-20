// biome-ignore-all assist/source/organizeImports: a file-wide assist suppression, banned by the gate.
const payload: unknown = JSON.parse('{"id":"1"}')

export const record = payload as Record<string, string>
