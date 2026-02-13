# Contributing

Contributions are welcome! Here's how to get started.

## Setup

```bash
git clone https://github.com/ofershap/{{PACKAGE_NAME}}.git
cd {{PACKAGE_NAME}}
npm install
```

## Development

```bash
npm run build        # Build with tsup
npm run typecheck    # Type-check with tsc
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint + format check
npm run format       # Auto-format with Prettier
```

## Pull Requests

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Add or update tests as needed
4. Ensure `npm run lint`, `npm run typecheck`, and `npm test` all pass
5. Open a pull request

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/) and [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning. Please format your commit messages accordingly:

- `feat: add new feature` (triggers minor release)
- `fix: resolve bug` (triggers patch release)
- `feat!: breaking change` (triggers major release)
