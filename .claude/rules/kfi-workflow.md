<!--
  GENERATED FILE — DO NOT EDIT HERE.
  Source: kronstadtsoft/rules · rules/kfi-workflow.md · rule set v2.2.0
  Change the source there and run: bun run scripts/apply.ts --target <this repo>
  A local edit fails the drift check in CI and is reverted by the next sync.
-->

# How work moves at Kronstadtsoft

**In force from 11 August 2026.** This rule set was written on 10 August 2026 and commences the
next day, so it applies to work planned under it and not to work already started. Branches open
on 10 August keep their names; every branch from 11 August complies.

**Ticket scope narrowed on 27 September 2026.** From that date, a Linear ticket is required only
for client work. The Administrator made this decision. Branches opened before that date keep
their names.

The rules apply to every repository. An exception is a decision; record it.

## Ticket → branch → PR → merge

The pull request is the review record. The merge is the approval. Every change needs both.

**Client work needs a Linear ticket first.** Client work is:

- any change in a repository whose work profile is `customer-engagement` in
  `internal/qms/repos.json` (today: `rezervari`);
- any change made under a customer agreement, in any other repository.

The ticket holds the acceptance criteria and the authoriser.

**Other work needs no ticket.** This is internal operations, owned products, experiments and
services in use. The pull request is the record. Use a ticket when the work spans several pull
requests or needs follow-up.

1. **Client work: create the ticket first.** No ticket, no branch. Fold small work into a ticket
   that exists.
2. **Name the branch.** For client work, start the branch name with the ticket, in Linear's own
   format: `alexandruadam/kfi-42-short-slug`. This name links the PR to the issue and moves the
   issue to `In Review`. Copy the name from the issue; do not type it. For other work, use a
   short descriptive name, for example `alexandruadam/fix-biome-excludes`. If other work has a
   ticket, use the ticket's branch name.
3. **Open a pull request for every change.** Never push to `main`. GitHub refuses a direct push
   through a branch-protection ruleset with no bypass actors, on every repo. The local
   `pre-push` hook refuses it a second earlier. GitHub refuses a force-push to `main` and
   deletion of `main` the same way.
4. **Merge with squash only.** The merge is the approval. Squash is the only method enabled, so
   every commit on `main` carries `(#N)` and maps to exactly one pull request. Write the squash
   subject as the change's real summary. The subject is the permanent record, not the branch's
   commit list. The merge button works only when CI is green and the branch is current with
   `main`.

## Commits

Write commit subjects in the present tense, imperative. Explain why, not what; the diff shows
what. Keep the first line under approximately 70 characters. Then add a blank line and the
reasoning, if the change needs any. Do not put the ticket number in the subject; the branch
carries it.

## Architecture decision records

Write an ADR at `docs/adr/NNN-kebab-title.md` in the repo the decision affects.

Write one when:

- You choose between architectures, frameworks, platforms, or providers.
- The decision has a legal, regulatory, or accessibility consequence.
- A later reversal would be expensive.
- The decision supersedes an earlier ADR.

Do not write one for an implementation choice inside an already-decided architecture.

**Supersede, never edit.** An accepted ADR is a record. Record a changed decision in a new ADR.
Mark the old ADR `Superseded by ADR-NNN`; do not rewrite it.

The format is `docs/adr/000-template.md` in each repo.

## Where things get written down

| It is… | It goes in |
|---|---|
| A decision about the architecture | An ADR in that repo |
| A rule for how we work everywhere | `kronstadtsoft/rules`, then synced — never edited in place downstream |
| Something true only of this codebase | That repo's `CLAUDE.md` |
| A procedure you invoke | A skill in `kronstadtsoft/skills` |
| Evidence that something happened | The controlled source record; monthly snapshots add retention protection |

## Two errors that break the chain

**Do not edit a vendored rules file.** Files under `.claude/rules/` are generated. Change the
source in `kronstadtsoft/rules` and run the sync. The next sync reverts a local edit, and the
drift check fails until then.

**Do not start client work without the ticket open.** The ticket holds the acceptance criteria
and the authoriser. Work ticketed after the fact records the outcome, not the requirement.

## Bypassing the hooks

A `PreToolUse` hook refuses `--no-verify`, `git commit -n`, `core.hooksPath` overrides, and
`HUSKY=0`. The hook binds the agent, not the person. A person at a terminal can still type the
bypass, and must be able to, because emergencies exist.

If a push is rejected, fix the branch name or create the ticket. Never use the flag.
