# Releasing

Every release after the first: `bin/release` on a clean `main` runs
[`release.yml`](../../.github/workflows/release.yml), which builds, publishes with npm's trusted
publishing (no token in the repository) and tags `v<version>`. `bin/release --local` publishes from
the owner's machine with the npm token from the keyring instead.

## The first publish — the owner's steps

Trusted publishing is set on a package that already exists, so the first version goes out by hand.

1. On `main`, date the top section of [`CHANGELOG.md`](../../CHANGELOG.md):
   `## Unreleased` becomes `## 0.1.0 — DD.MM.YYYY`. Commit and push.
2. Make sure the npm account can publish under the `@wirecat` scope (the organisation exists and the
   account is a member with publish rights).
3. Publish from a terminal: `bin/release --local`. It runs the checks, publishes with the token from
   the keyring (`service npm account leemour`) and tags `v0.1.0`.
4. On npmjs.com, open `@wirecat/cli-meetings` → Settings → Trusted publisher → GitHub Actions:
   organisation `WireCatLabs`, repository `cli-meetings`, workflow `release.yml`, environment `npm`.
5. In the GitHub repository settings, create the environment `npm` — `release.yml`'s publish job
   names it, and npm checks it.
6. Check the path once with `gh workflow run release.yml --ref main -f dry_run=true`.

From then on, `bin/release` with no flag.

## What to know

- `package.json`'s `repository.url` is `https://github.com/WireCatLabs/cli-meetings`, matched exactly and
  case-sensitively by npm's provenance check. Renaming the repository or its owner means changing it.
- `release.yml` is trusted by its file name; renaming it breaks publishing until npm is told.
- CI calls the reusable workflow in `leemour/cli-core`. When cli-core moves to `WireCatLabs`, the `uses:`
  line in [`ci.yml`](../../.github/workflows/ci.yml) changes with it.
