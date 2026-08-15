const payload: unknown = JSON.parse('{"id":"1"}')

export const record = payload as Record<string, string>
