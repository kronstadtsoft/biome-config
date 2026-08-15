type Record = { id: string }

function toRecord(id: string): Record {
  return { id }
}

export const record = toRecord('1')
