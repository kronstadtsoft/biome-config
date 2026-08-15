const payload: unknown = JSON.parse('{"id":"1"}')

export const record = payload as unknown as Record<string, string>
