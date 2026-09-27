<!--
  GENERATED FILE — DO NOT EDIT HERE.
  Source: kronstadtsoft/rules · rules/kfi-repository.md · rule set v2.2.0
  Change the source there and run: bun run scripts/apply.ts --target <this repo>
  A local edit fails the drift check in CI and is reverted by the next sync.
-->

# Repository standard

Choose controls for the repository's purpose and the risk of the change.
The QMS delivery procedure defines work profiles and promotion to customer or operational use.
These engineering defaults are company choices, not an ISO 9001 checklist of mandatory tools.

## Tooling and layout

For JavaScript/TypeScript applications, use pnpm with a pinned package-manager version and committed lockfile.
Use the repository's supported Node version, Biome, Vitest and Playwright where applicable.
Run standalone TypeScript scripts with Bun; Bun's test runner is suitable for these scripts without introducing an application toolchain.
Do not add package.json, a workspace layout or a browser test runner to a prose-only repository merely to match an application template.

Keep repository-specific architecture and operating constraints in CLAUDE.md or linked documentation.
Create apps/packages directories only when the project has those units.
Keep generated shared rules in .claude/rules/; change their source in kronstadtsoft/rules.

## Verification

Select checks that establish confidence in the affected output:

| Repository or change | Applicable checks |
|---|---|
| Documentation | Accuracy, consistency and useful reference checks; exercise affected automation. |
| Application code | Frozen dependency install, static checks, relevant tests and build. |
| Generated committed artefacts | Regenerate and check for drift. No generation step is needed when none exist. |
| Database or service integration | Relevant integration tests, migrations and affected failure/recovery cases. |
| User interface or user workflow | Representative browser/manual checks and relevant accessibility checks. |
| Shared tools/configuration | Parse or focused behaviour tests and the effect on consumers. |

Record the applicable approach in CI and repository instructions. Explain material omissions or changes in the PR.
Existing required checks remain in force until a reviewed change replaces them; do not skip a failing required test and claim success.
When introducing or changing automated checks, verify they exercise the intended behaviour. Avoid tests that merely mirror the implementation.
CI should run on pull requests and main for code it verifies. Cancel superseded PR runs; preserve release evidence for main commits.
Default workflow permissions to contents: read, widening only where the job needs it.

## Delivery and accessibility

Before customer or operational use, verify the intended-use requirements and keep the approving person, version/commit and deployment or handover result.
A prototype iteration does not need a production release tag. An owned product with real users still needs operational controls.
For public interfaces, select accessibility checks for the applicable requirements and changed surface.
Automated scanning alone does not prove full conformance. State the tested scope, standard and tool versions in any conformance report.

## New repositories

Record purpose, owner, work profile and relevant checks before relying on the repository.
Start with the controls the work needs. Review additional delivery, data, support and recovery controls before external or critical operational use.
Do not copy every application gate into a repository that cannot meaningfully run it.
