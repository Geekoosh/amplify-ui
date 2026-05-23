# Contributing Guidelines

Thank you for your interest in contributing to our project! 💛

Please read through these guidelines carefully before submitting a PR and let us know if it's not up to date (or even better, submit a PR with your corrections 😉).

## Table of Contents

- [Bug Reports](#bug-reports)
- [Pull Requests](#pull-requests)
- [Project Structure](#project-structure)
- [Local Development Guides](#local-development-guides)
- [SaaSOn Fork Maintenance](#saason-fork-maintenance)
- [Publishing](#publishing)

## Bug Reports

Bug reports and feature requests are always welcome. Good bug reports are extremely helpful, so thanks in advance!

When filing a bug, please try to be as detailed as possible. In addition to the bug report form information, details like these are incredibly useful:

- A reproducible test case or series of steps
- The date/commit/version(s) of the code you're running
- Any modifications you've made relevant to the bug
- Anything unusual about your environment or deployment

Guidelines for bug reports:

- Check to see if a [duplicate or closed issue](https://github.com/aws-amplify/amplify-ui/issues?q=is%3Aissue+) already exists!
- Provide a short and descriptive issue title
- Remove any sensitive data from your examples or snippets
- Format any code snippets using [Markdown](https://docs.github.com/en/github/writing-on-github/creating-and-highlighting-code-blocks) syntax

Finally, thank you for taking the time to read this, and taking the time to write a good bug report.

## Pull Requests

We welcome pull requests!

You should open an issue to discuss your pull request, unless it's a trivial change. It's best to ensure that your proposed change would be accepted so that you don't waste your own time. If you would like to implement support for a significant feature that is not yet available, please talk to us beforehand to avoid any duplication of effort.

### Contribution Process

1. Fork & Clone this repo (Make sure to disable associated GitHub Actions. In fork go to Settings > Actions > General > Disable actions > save)
1. [`nvm install`](https://github.com/nvm-sh/nvm)
1. [`nvm use`](https://github.com/nvm-sh/nvm)
1. `yarn setup`
1. Within your fork, create a new branch based on the issue you're addressing, e.g. `git checkout -b angular/remove-browser-module`
1. Commit your code using [conventional commit messages](https://www.conventionalcommits.org/en/v1.0.0/#summary), e.g. `git commit -m "chore: remove browser module"`.
1. Once your work is committed, validate your changes according to [local development guides](#local-development-guides).
1. If this is a change to any customer-facing aspect of a component, for example a new prop, feature, or a breaking change, update or add relevant documentation. If this is a large change, documentation updates can be made in a separate PR, but should be noted as a followup in the PR description. See the specific contributing guide for documentation [here](docs/README.md#contributing)
1. Push your branch with `git push origin -u`
1. Open a PR against this repo from your newly published branch.
1. Add a [changeset](https://github.com/changesets/changesets) that describes your changes. More info [here](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md). Please make sure that your changeset only bumps `@aws-amplify/*` packages and does not bump any of private packages like `docs`, `e2e`, `examples`, etc. If you only updated a private package like `docs`, `e2e`, or `examples`, skip this step.
1. Finally, Amplify UI team will review your PR. Add reviewers based on the core member who is tracking the issue with you or code owners. In the meantime, address any automated check that fail (such as linting, unit tests, etc. in CI)

### Troubleshooting

**Apple Silicon:**
If using an M1 (or more recent) Macbook and you get the following error message regarding installation of `canvas`:

```bash
error /Users/USERNAME/amplify-ui/node_modules/canvas: Command failed.
Exit code: 1
...
/bin/sh: pkg-config: command not found
gyp: Call to 'pkg-config pixman-1 --libs' returned exit status 127 while in binding.gyp. while trying to load binding.gyp`
```

See the [canvas docs](https://github.com/Automattic/node-canvas#compiling) to install required dependencies for local docs development.

**Python >= 3.12:**
If you are using Python 3.12 or greater and you get the following error message regarding installation of `canvas`:

```bash
error /Users/USERNAME/amplify-ui/node_modules/canvas: Command failed.
Exit code: 1
...
ModuleNotFoundError: No module named 'distutils'
```

See the [setuptools](https://pypi.org/project/setuptools/) installation website. Setuptools serves as a [recommended](https://docs.python.org/3.10/library/distutils.html) alternative to distutils.

## Project Structure

`amplify-ui` is a monorepo that contains the following workspaces:

```bash
amplify-ui
├── canary # contains examples we use to test build systems
├── docs # ui.docs.amplify.aws documentation code
├── environments # Amplify backend environments we use for e2e testing
├── examples # Example apps we use for e2e testing
│   └── angular
│   └── next
│   └── vue
├── packages # Amplify UI components implementations
│   └── angular
│   └── react
│   └── vue
```

## Local Development Guides

Please refer to the following contributing guides:

- [`docs`](docs/README.md#contributing)
- [`@aws-amplify/ui`](packages/ui/CONTRIBUTING.md)
- [`@aws-amplify/ui-angular`](packages/angular/CONTRIBUTING.md)
- [`@aws-amplify/ui-react`](packages/react/CONTRIBUTING.md)
- [`@aws-amplify/ui-vue`](packages/vue/CONTRIBUTING.md)
- [`examples`](examples/README.md#examples-development)
- [`e2e`](packages/e2e/README.md#contributing)
- [`environments`](environments/README.md#external-contributors)

## SaaSOn Fork Maintenance

This fork keeps the Authenticator and account-component auth seam isolated from
upstream Amplify runtime imports. Runtime imports from `aws-amplify/auth` and
`aws-amplify/utils` in the guarded Authenticator/account surfaces must stay in
`packages/ui/src/machines/authenticator/amplifyAuthAdapter.ts`; use
`AuthServices`, `defaultServices`, or `import type` elsewhere.

### Upstream Sync

1. Add the upstream remote once:

   ```bash
   git remote add upstream https://github.com/aws-amplify/amplify-ui.git
   ```

1. Keep `vendor/upstream` as a mirror of the upstream commit being evaluated.
   This branch is vendor-only; update it with fetch plus `reset --hard` only:

   ```bash
   git fetch upstream main
   git switch vendor/upstream
   git reset --hard upstream/main
   ```

1. Return to the fork branch and merge the pinned vendor branch deliberately:

   ```bash
   git switch main
   git merge --no-ff vendor/upstream
   ```

1. Pin the upstream version or commit in the PR description or release notes.
   Every bump must run the auth seam guard and focused type checks before the
   merge is accepted:

   ```bash
   yarn auth:import-guard
   yarn auth:import-guard:self-test
   yarn ui typecheck
   yarn ui test --runTestsByPath src/machines/authenticator/__tests__/authServices.conformance.test.ts src/machines/authenticator/__tests__/fakeServices.test.ts
   ```

The `authServices.conformance.test.ts` suite is a compile-time guard for the
SaaSOn auth seam. It pins the Amplify `nextStep` fields that authenticator
actions consume through `AuthServices`, such as TOTP setup details, MFA options,
code delivery details, and sign-in/sign-up step names. If an upstream Amplify
type change removes or renames one of those fields, `yarn ui typecheck` or the
focused Jest run should fail in that test before the fork ships a mismatched
service contract.

When that guard fails, do not loosen the test just to restore green CI. Compare
the new upstream Amplify output type with `AuthServices` and the consuming
authenticator action. If the existing SaaSOn-facing service shape is still the
right contract, normalize the new upstream shape inside the adapter. If the
runtime behavior genuinely changed, update the action, `AuthServices`, the
conformance test, and release notes together so downstream maintainers can see
the contract change.

### SaaSOn Publish

The fork uses changesets and publishes the SaaSOn-consumed packages as public
scoped npm packages. For each release:

1. Add or update a changeset for `@aws-amplify/ui` and
   `@aws-amplify/ui-react`.
1. Build the publish targets with `yarn ui build` and `yarn react build`.
1. Publish the public scoped packages with changesets. For first-time scoped
   npm publishes, pass `--access public` in the release command or workflow.
1. Smoke install in SaaSOn and verify imports from the public fork packages
   before promoting the version.

## Publishing

Amplify UI publishes to NPM on every Tuesday. We use [`changesets`](https://github.com/changesets/changesets) to drive our deployment procedure:

1. Each contributor adds a changeset in their PR
1. Changesets get accumulated into [Version Packages PR](https://github.com/aws-amplify/amplify-ui/pulls/app%2Fgithub-actions).
1. Maintainer will run tests, approve, and merge the PR.
1. Previous step will trigger [`publish-latest`](./.github/workflows/publish-next.yml) action that will build and publish packages to NPM.

### Docs Publishing

Amplify UI publishes updates to the UI docs site each Tuesday as a part of the primary publish process. For Pull Requests that require publishing outside of the standard publish process, a **one week** lead time is required with the exception of high severity issues.
