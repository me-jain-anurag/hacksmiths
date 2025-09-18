## Contribution Guidelines

### Workflow
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/<short-name>`
3. Commit with conventional commits: `feat: add icd translation fallback`
4. Open a PR with a clear description and testing notes

### Code Style
- TypeScript-first in main backend; JS in EMR backend
- Use ESLint and Prettier (respect existing config)
- Follow naming and clarity practices (no 1–2 char vars)

### Testing
- Provide example curl or Postman snippets
- Include edge cases: missing token, missing query, HAPI unavailable
- Run `node test-complete-integration.js` before PR


