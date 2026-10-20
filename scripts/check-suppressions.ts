import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import process from 'node:process'

const excluded = process.argv.slice(2)
const SOURCE = /\.(?:[cm]?[jt]sx?|css|jsonc?|grit|html|vue|svelte|astro|graphql|gql)$/
// Biome reads a suppression on any line of a block comment, with or without a leading `*`.
// The group around the token keeps this line from matching itself.
const SUPPRESSION = /(?:^|\/\/|\*|<!--|#)\s*(?:biome-ignore)(-all|-start|-end)?\s*([^\s:]*)/g
const RULE = /^(?:lint|assist)\/[\w-]+\/[\w-]+(?:\([^\s)]*\))?$/

function violations(line: string): string[] {
  const reasons: string[] = []
  for (const [, kind, target] of line.matchAll(SUPPRESSION)) {
    if (kind === '-all') {
      reasons.push('file-wide suppression')
    } else if (!RULE.test(target ?? '')) {
      reasons.push('names no lint/<group>/<rule>')
    }
  }
  return reasons
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
    for (const reason of violations(line)) {
      findings.push(`${file}:${index + 1}: ${reason}: ${line.trim()}`)
    }
  }
}

if (findings.length > 0) {
  console.error(['A suppression must be bounded and name one rule:', ...findings].join('\n'))
  process.exitCode = 1
}
