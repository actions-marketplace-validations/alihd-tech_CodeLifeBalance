# Code Life Balance CLI

Run Code Life Balance locally without sending your GitHub credential or generated report to Code Life Balance infrastructure.

## Run without installing

```bash
npx code-life-balance --username octocat
```

Or install globally:

```bash
npm install --global code-life-balance
code-life-balance --username octocat
```

## Authentication

The CLI resolves credentials in this order:

1. `GITHUB_TOKEN`, when present.
2. Your existing `gh auth token` session.
3. No token for public-only username analysis.

For private owned-repository analysis:

```bash
gh auth login
code-life-balance --include-private
```

Private mode verifies that the authenticated token owner matches the username being analyzed.

## Options

```text
--username <login>        GitHub username
--output-dir <path>       Output directory
--theme <dark|light>      SVG theme
--card-style <style>      detailed or compact
--formats <list>          svg,markdown
--include-private         Include authenticated private owned activity
--public-only             Force public-only analysis
--no-gh                   Do not read GitHub CLI authentication
--help                    Show CLI help
```

Generated output can include:

- `code-life.svg`
- `report.md`

## Privacy

The CLI calls the GitHub API directly from your machine. It does not send your GitHub token or generated report to a Code Life Balance service.

Repository: https://github.com/alihd-tech/CodeLifeBalance
