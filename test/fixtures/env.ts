const raw: unknown = { PORT: '8080' }

export const env = raw as Record<string, string>
