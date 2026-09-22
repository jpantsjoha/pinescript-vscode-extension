# Contributing

Thanks for your interest! Please:

- Keep PRs focused and small.
- Write clear commit messages and PR descriptions.
- Add/adjust tests when changing behaviour — both directions for a false-positive
  fix (see `CLAUDE.md`'s "one rule that matters").
- Match the existing TypeScript style and keep code readable.
- Be respectful in discussions.

## Dev quick start

```bash
npm install
npm run build
# Launch Extension Development Host from VS Code (F5)
```

## Testing

```bash
npm test          # full suite — see docs/guides/TESTING-GUIDE.md
npm run audit      # harness, packaging, version and diagnostic-coverage checks
```

## Releasing

- Semantic versioning.
- Update `CHANGELOG.md`.
- Package with `vsce` and publish — see `docs/guides/RELEASE-RUNBOOK.md`.

## License

By contributing, you agree your contributions are licensed under the MIT License.
