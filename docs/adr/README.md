# Architecture decision records

Decisions that shaped this repository, with the reasoning as it stood at the time.

ADRs are required, not a convention. They are the design-output record under ISO 9001 clause 8.3.5.
They are the source of prior design information under clause 8.3.3. They turn one person's
knowledge into organizational knowledge under clause 7.1.6. The rule lives in the internal quality
system. This file is the local copy of what it means here.

## Write one when

- You choose between architectures, frameworks, platforms, or providers.
- The decision has a legal, regulatory, or accessibility consequence.
- A later reversal would be expensive.
- The decision supersedes an earlier ADR.

Do not write one for an implementation choice inside an already-decided architecture. An ADR for
each pull request is noise, and noise stops the set being read.

## Rules

- Name the file `NNN-kebab-title.md`. Number the files in sequence. Never renumber, never delete.
- Copy [000-template.md](000-template.md).
- Give **Status** a date. Use one of `Proposed`, `Accepted`, `Superseded by ADR-NNN`, `Deprecated`.
- **Supersede, do not edit.** An accepted ADR is a record. Record a changed decision in a new ADR,
  and mark the old one.
- Review and approve through the pull request, like every other document.

## Index

| # | Decision | Status |
|---|---|---|
| [001](001-publish-the-shared-config-to-npm.md) | Publish the shared Biome configuration to npm | Accepted, 15 Aug 2026 |
