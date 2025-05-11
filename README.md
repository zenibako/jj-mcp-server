# jj-mcp-server

`jj-mcp-server` is a Model Context Protocol (MCP) server that exposes Jujutsu (`jj`) version-control operations as programmable tools. You can integrate it into IDEs, editors, or other clients that support MCP to script and automate your Jujutsu workflows.

## Features

- Expose core `jj` commands (status, log, diff, rebase, commit, etc.) via MCP tools.
- Manage bookmarks, operations, and revisions programmatically.
- Integrate with any editor or language that supports MCP.

## Prerequisites

- Node.js v14+ or later
- Jujutsu (`jj`) installed and in your `PATH`

## Usage

Start the MCP server:

```bash
npx -y jj-mcp-server
```

## Available Tools

See the source in `src/index.ts` for the full list. Highlights include:

- `status`, `log`, `show`, `diff`, `interdiff`
- `rebase`, `commit`, `new`, `abandon`, `revert`, `restore`, `edit`
- Bookmark management: `bookmark-create`, `bookmark-list`, `bookmark-move`, etc.
- Git integration: `git-clone`, `git-push`, `git-fetch`, `git-export`, etc.
- File operations: `file-annotate`, `file-list`, `file-show`, `file-track`, `file-untrack`, `file-chmod`

## Contributing

Contributions are welcome! Please open issues or pull requests against this repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
