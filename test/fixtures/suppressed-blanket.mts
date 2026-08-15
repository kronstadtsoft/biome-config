const payload: unknown = JSON.parse('{"id":"1"}')

// biome-ignore lint: a blanket form in a non-.ts extension.
export const record = payload as Record<string, string>
