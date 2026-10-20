import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'
import process from 'node:process'

const EXCLUDED = ['scripts/check-suppressions.ts', 'test/fixtures/', 'test/cases.ts']
const SOURCE = /\.(?:[cm]?[jt]sx?|css|jsonc?|grit|html|vue|svelte|astro|graphql|gql)$/
const FILE_WIDE = /biome-ignore-all\b/
const SUPPRESSION = /biome-ignore(?:-start|-end)?\s+([^\s:]+)\s*:/
const RULE = /^(?:lint|assist)\/[\w-]+\/[\w-]+(?:\([^\s)]*\))?$/

function violation(line: string): string | undefined {
  if (!line.includes('biome-ignore')) {
    return undefined
  }
  if (FILE_WIDE.test(line)) {
    return 'file-wide suppression'
  }
  const target = SUPPRESSION.exec(line)?.[1] ?? ''
  return RULE.test(target) ? undefined : 'suppression must name lint/<group>/<rule>'
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
      !EXCLUDED.some((excluded) => file.startsWith(excluded)) &&
      statSync(file, { throwIfNoEntry: false })?.isFile() === true,
  )

const findings = files.flatMap((file) =>
  readFileSync(file, 'utf8')
    .split('\n')
    .flatMap((line, index) => {
      const reason = violation(line)
      return reason === undefined ? [] : [`${file}:${index + 1}: ${reason}: ${line.trim()}`]
    }),
)

if (findings.length > 0) {
  console.error('A suppression must be bounded and name lint/<group>/<rule>:')
  for (const finding of findings) {
    console.error(finding)
  }
  process.exit(1)
}
