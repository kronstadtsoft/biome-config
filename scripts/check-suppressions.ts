import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import process from 'node:process'

const excluded = process.argv.slice(2)
const SOURCE = /\.(?:[cm]?[jt]sx?|css|jsonc?|grit|html|vue|svelte|astro|graphql|gql)$/
const SUPPRESSION = /(?:\/\/|\/\*|<!--)\**\s*biome-ignore(-all|-start|-end)?\s*([^\s:]*)/
const RULE = /^(?:lint|assist)\/[\w-]+\/[\w-]+(?:\([^\s)]*\))?$/

function violation(line: string): string | undefined {
  const match = SUPPRESSION.exec(line)
  if (match === null) {
    return undefined
  }
  if (match[1] === '-all') {
    return 'file-wide suppression'
  }
  return RULE.test(match[2] ?? '') ? undefined : 'names no lint/<group>/<rule>'
}

const files = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(
    (file) =>
      SOURCE.test(file) &&
      !excluded.some((path) => file.startsWith(path)) &&
      statSync(file, { throwIfNoEntry: false })?.isFile() === true,
  )

const findings: string[] = []
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n')
  for (const [index, line] of lines.entries()) {
    const reason = violation(line)
    if (reason !== undefined) {
      findings.push(`${file}:${index + 1}: ${reason}: ${line.trim()}`)
    }
  }
}

if (findings.length > 0) {
  console.error(['A suppression must be bounded and name one rule:', ...findings].join('\n'))
  process.exitCode = 1
}
