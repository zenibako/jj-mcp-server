import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const JJ_COMMAND = "jj";

const server = new McpServer({
  name: "jj-mcp-server",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

// Helper to run jj commands and return stdout or error text
async function runJJCommand(args: string[], cwd?: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync(JJ_COMMAND, args, { cwd });
    return stdout.trim();
  } catch (error: any) {
    if (error.stderr) {
      return `Error: ${error.stderr.trim()}`;
    }
    return `Error: ${error.message}`;
  }
}

// Tool: status
server.tool(
  "status",
  "Show the high-level status of the Jujutsu (jj) repository, including the working copy commit, parent commits, and a summary of changes. Useful for getting an overview of the current state of your repository. Parameters: repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ repoPath, cwd }) => {
    const args = ["status"];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: rebase
server.tool(
  "rebase",
  "Rebase one or more revisions onto a different parent revision in a Jujutsu (jj) repository. Commonly used to move changes to a new base or to clean up commit history. Parameters: source (Revisions to rebase, e.g., '@-'), destination (Destination revision, e.g., 'main'), repoPath (Optional repo path), cwd (Optional working directory to run the command in).",
  {
    // Revisions to rebase, e.g. "@-"
    source: z.string(),
    // Destination revision, e.g. "main"
    destination: z.string(),
    // Optional repo path
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ source, destination, repoPath, cwd }) => {
    const args = ["rebase", "--source", source, "--destination", destination];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: commit
server.tool(
  "commit",
  "Update the current change with the specified message in a Jujutsu (jj) repository and then create and move to a new, empty change. This set of actions is jj's closest analog to committing in a Git repository. Parameters: message (Commit message), repoPath (Optional repo path), cwd (Optional working directory to run the command in).",
  {
    // Commit message
    message: z.string(),
    // Optional repo path
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ message, repoPath, cwd }) => {
    const args = ["commit", "-m", message];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: new
server.tool(
  "new",
  "Create a new, empty change with optional parent revisions in a Jujutsu (jj) repository. Useful for starting a new line of development or feature branch. Parameters: parents (Optional parent revisions, comma separated), repoPath (Optional repo path), cwd (Optional working directory to run the command in).",
  {
    // Optional parent revisions, comma separated
    parents: z.string().optional(),
    // Optional repo path
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ parents, repoPath, cwd }) => {
    const args = ["new"];
    if (parents) {
      args.push("--parents", parents);
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: abandon
server.tool(
  "abandon",
  "Abandon one or more revisions, rebasing descendants onto their parents in a Jujutsu (jj) repository. Useful for discarding changes or cleaning up history. Parameters: revisions (Revisions to abandon, e.g., '@'), repoPath (Optional repo path), cwd (Optional working directory to run the command in).",
  {
    // Revisions to abandon, e.g. "@"
    revisions: z.string(),
    // Optional repo path
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ revisions, repoPath, cwd }) => {
    const args = ["abandon", revisions];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

/* Tool: log */
server.tool(
  "log",
  "Show the commit history of a Jujutsu (jj) repository. Useful for reviewing past changes and understanding project evolution. Parameters: repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in), limit (Optional number of commits to show).",
  {
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
    // Optional number of commits to show
    limit: z.number().int().positive().optional(),
  },
  async ({ repoPath, cwd, limit }) => {
    const args = ["log"];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    if (limit !== undefined) {
      args.push("-n", limit.toString());
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Bookmark: create
server.tool(
  "bookmark-create",
  "Create a new bookmark in a Jujutsu (jj) repository. Useful for marking important points in history or creating named branches. Parameters: name (Name of the bookmark to create), revision (Optional revision to point the bookmark at), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Name of the bookmark to create
    name: z.string(),
    // Optional revision to point the bookmark at
    revision: z.string().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ name, revision, repoPath, cwd }) => {
    const args = ["bookmark", "create", name];
    if (revision) {
      args.push("-r", revision);
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Bookmark: delete
server.tool(
  "bookmark-delete",
  "Delete an existing bookmark in a Jujutsu (jj) repository and propagate the deletion to remotes on the next push. Parameters: names (Names of bookmarks to delete), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Names of bookmarks to delete
    names: z.array(z.string()),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ names, repoPath, cwd }) => {
    const args = ["bookmark", "delete", ...names];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Bookmark: forget
server.tool(
  "bookmark-forget",
  "Forget a bookmark in a Jujutsu (jj) repository without marking it as a deletion to be pushed. Parameters: names (Names of bookmarks to forget), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Names of bookmarks to forget
    names: z.array(z.string()),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ names, repoPath, cwd }) => {
    const args = ["bookmark", "forget", ...names];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Bookmark: list
server.tool(
  "bookmark-list",
  "List bookmarks and their targets in a Jujutsu (jj) repository. Useful for reviewing all named points in history. Parameters: repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in), template (Optional template for output formatting).",
  {
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
    // Optional template for output formatting
    template: z.string().optional(),
  },
  async ({ repoPath, cwd, template }) => {
    const args = ["bookmark", "list"];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    if (template) {
      args.push("-T", template);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Bookmark: move
server.tool(
  "bookmark-move",
  "Move existing bookmarks to target revision in a Jujutsu (jj) repository. Useful for updating bookmark positions. Parameters: names (Names of bookmarks to move), revision (Target revision to move bookmarks to), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Names of bookmarks to move
    names: z.array(z.string()),
    // Target revision to move bookmarks to
    revision: z.string(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ names, revision, repoPath, cwd }) => {
    const args = ["bookmark", "move", ...names, "-t", revision];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Bookmark: rename
server.tool(
  "bookmark-rename",
  "Rename a bookmark in a Jujutsu (jj) repository. Useful for updating bookmark names. Parameters: oldName (Current name of the bookmark), newName (New name for the bookmark), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Current name of the bookmark
    oldName: z.string(),
    // New name for the bookmark
    newName: z.string(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ oldName, newName, repoPath, cwd }) => {
    const args = ["bookmark", "rename", oldName, newName];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Bookmark: set
server.tool(
  "bookmark-set",
  "Create or update a bookmark to point to a certain commit in a Jujutsu (jj) repository. Parameters: name (Name of the bookmark to set), revision (Revision to point the bookmark at), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Name of the bookmark to set
    name: z.string(),
    // Revision to point the bookmark at
    revision: z.string(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ name, revision, repoPath, cwd }) => {
    const args = ["bookmark", "set", name, "-r", revision];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Bookmark: track
server.tool(
  "bookmark-track",
  "Start tracking a remote bookmark in a Jujutsu (jj) repository. Parameters: remoteBookmark (Remote bookmark to track, format: bookmark@remote), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Remote bookmark to track (format: bookmark@remote)
    remoteBookmark: z.string(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ remoteBookmark, repoPath, cwd }) => {
    const args = ["bookmark", "track", remoteBookmark];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Bookmark: untrack
server.tool(
  "bookmark-untrack",
  "Stop tracking a remote bookmark in a Jujutsu (jj) repository. Parameters: remoteBookmark (Remote bookmark to untrack, format: bookmark@remote), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Remote bookmark to untrack (format: bookmark@remote)
    remoteBookmark: z.string(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ remoteBookmark, repoPath, cwd }) => {
    const args = ["bookmark", "untrack", remoteBookmark];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: diff
server.tool(
  "diff",
  "Compare file contents between two revisions in a Jujutsu (jj) repository. With the `--from` and/or `--to` options, shows the difference from/to the given revisions. If either is left out, it defaults to the working-copy commit. Parameters: from (Show changes from this revision), to (Show changes to this revision), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in), context (Optional number of lines of context to show), stat (Optional flag to show a histogram of changes).",
  {
    // Show changes from this revision
    from: z.string().optional(),
    // Show changes to this revision
    to: z.string().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
    // Optional number of lines of context to show
    context: z.number().int().nonnegative().optional(),
    // Optional flag to show a histogram of changes
    stat: z.boolean().optional(),
  },
  async ({ from, to, repoPath, cwd, context, stat }) => {
    const args = ["diff"];
    if (from) {
      args.push("-f", from);
    }
    if (to) {
      args.push("-t", to);
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    if (context !== undefined) {
      args.push("--context", context.toString());
    }
    if (stat) {
      args.push("--stat");
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: git-clone
server.tool(
  "git-clone",
  "Create a new Jujutsu (jj) repository backed by a clone of a Git repo. The Git repo will be a bare git repo stored inside the .jj/ directory. Parameters: source (URL or path of the Git repo to clone), destination (Optional destination directory for the clone), remoteName (Optional name for the newly created remote, default: origin), colocate (Optional flag to colocate the jj repo with the git repo), depth (Optional depth for shallow clone).",
  {
    // URL or path of the Git repo to clone
    source: z.string(),
    // Optional destination directory for the clone
    destination: z.string().optional(),
    // Optional name for the newly created remote (default: origin)
    remoteName: z.string().optional(),
    // Optional flag to colocate the jj repo with the git repo
    colocate: z.boolean().optional(),
    // Optional depth for shallow clone
    depth: z.number().int().positive().optional(),
  },
  async ({ source, destination, remoteName, colocate, depth }) => {
    const args = ["git", "clone", source];
    if (destination) {
      args.push(destination);
    }
    if (remoteName) {
      args.push("--remote", remoteName);
    }
    if (colocate) {
      args.push("--colocate");
    }
    if (depth) {
      args.push("--depth", depth.toString());
    }
    const output = await runJJCommand(args);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: git-export
server.tool(
  "git-export",
  "Update the underlying Git repo with changes made in the Jujutsu (jj) repository. Useful for syncing jj changes back to Git. Parameters: repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ repoPath, cwd }) => {
    const args = ["git", "export"];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: git-fetch
server.tool(
  "git-fetch",
  "Fetch branches and bookmarks from a Git remote into a Jujutsu (jj) repository. Similar to git fetch but preserves the jj-specific state. Parameters: remote (Remote to fetch from, default: origin), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in), branches (Optional branch/patterns to fetch, can specify multiple).",
  {
    // Remote to fetch from (default: origin)
    remote: z.string().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
    // Optional branch/patterns to fetch (can specify multiple)
    branches: z.array(z.string()).optional(),
  },
  async ({ remote, repoPath, cwd, branches }) => {
    const args = ["git", "fetch"];
    if (remote) {
      args.push("--remote", remote);
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    if (branches) {
      args.push("--branch", ...branches);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: git-import
server.tool(
  "git-import",
  "Update the Jujutsu (jj) repository with changes made in the underlying Git repo. Useful for syncing Git changes into jj. Parameters: repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ repoPath, cwd }) => {
    const args = ["git", "import"];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: init
server.tool(
  "init",
  "Create a new Jujutsu (jj) repository backed by a Git repo. Can create a new Git repo or import an existing one. Parameters: destination (Optional destination directory), colocate (Optional flag to colocate the jj repo with the git repo), gitRepo (Optional path to existing git repo to use).",
  {
    // Optional destination directory
    destination: z.string().optional(),
    // Optional flag to colocate the jj repo with the git repo
    colocate: z.boolean().optional(),
    // Optional path to existing git repo to use
    gitRepo: z.string().optional(),
  },
  async ({ destination, colocate, gitRepo }) => {
    const args = ["git", "init"];
    if (destination) {
      args.push(destination);
    }
    if (colocate) {
      args.push("--colocate");
    }
    if (gitRepo) {
      args.push("--git-repo", gitRepo);
    }
    const output = await runJJCommand(args);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: git-push
server.tool(
  "git-push",
  "Push branches and bookmarks to a Git remote from a Jujutsu (jj) repository. Similar to git push but preserves the jj-specific state. Parameters: remote (Remote to push to, default: origin), bookmarks (Optional bookmarks to push, can specify multiple), all (Optional flag to push all bookmarks), tracked (Optional flag to push tracked bookmarks), deleted (Optional flag to push deleted bookmarks), allowNew (Optional flag to allow pushing new bookmarks), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Remote to push to (default: origin)
    remote: z.string().optional(),
    // Optional bookmarks to push (can specify multiple)
    bookmarks: z.array(z.string()).optional(),
    // Optional flag to push all bookmarks
    all: z.boolean().optional(),
    // Optional flag to push tracked bookmarks
    tracked: z.boolean().optional(),
    // Optional flag to push deleted bookmarks
    deleted: z.boolean().optional(),
    // Optional flag to allow pushing new bookmarks
    allowNew: z.boolean().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({
    remote,
    bookmarks,
    all,
    tracked,
    deleted,
    allowNew,
    repoPath,
    cwd,
  }) => {
    const args = ["git", "push"];
    if (remote) {
      args.push("--remote", remote);
    }
    if (bookmarks) {
      args.push("--bookmark", ...bookmarks);
    }
    if (all) {
      args.push("--all");
    }
    if (tracked) {
      args.push("--tracked");
    }
    if (deleted) {
      args.push("--deleted");
    }
    if (allowNew) {
      args.push("--allow-new");
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: git-remote-add
server.tool(
  "git-remote-add",
  "Add a Git remote to a Jujutsu (jj) repository. Parameters: name (Name of the remote to add), url (URL of the remote), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Name of the remote to add
    name: z.string(),
    // URL of the remote
    url: z.string(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ name, url, repoPath, cwd }) => {
    const args = ["git", "remote", "add", name, url];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: git-remote-list
server.tool(
  "git-remote-list",
  "List Git remotes in a Jujutsu (jj) repository. Parameters: repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ repoPath, cwd }) => {
    const args = ["git", "remote", "list"];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: git-remote-remove
server.tool(
  "git-remote-remove",
  "Remove a Git remote from a Jujutsu (jj) repository. Parameters: name (Name of the remote to remove), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Name of the remote to remove
    name: z.string(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ name, repoPath, cwd }) => {
    const args = ["git", "remote", "remove", name];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: git-remote-rename
server.tool(
  "git-remote-rename",
  "Rename a Git remote in a Jujutsu (jj) repository. Parameters: oldName (Current name of the remote), newName (New name for the remote), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Current name of the remote
    oldName: z.string(),
    // New name for the remote
    newName: z.string(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ oldName, newName, repoPath, cwd }) => {
    const args = ["git", "remote", "rename", oldName, newName];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: git-remote-set-url
server.tool(
  "git-remote-set-url",
  "Set the URL of a Git remote in a Jujutsu (jj) repository. Parameters: name (Name of the remote), url (New URL for the remote), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Name of the remote
    name: z.string(),
    // New URL for the remote
    url: z.string(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ name, url, repoPath, cwd }) => {
    const args = ["git", "remote", "set-url", name, url];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: git-root
server.tool(
  "git-root",
  "Show the underlying Git directory of a repository using the Git backend in Jujutsu (jj). Useful for finding the .git directory location. Parameters: repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ repoPath, cwd }) => {
    const args = ["git", "root"];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: show
server.tool(
  "show",
  "Show description and changes in a revision of a Jujutsu (jj) repository compared to its parent(s). Useful for reviewing the exact changes made in a specific commit. Parameters: revision (The revision to show, defaults to working copy), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in), context (Optional number of lines of context to show).",
  {
    // The revision to show (defaults to working copy)
    revision: z.string().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
    // Optional number of lines of context to show
    context: z.number().int().nonnegative().optional(),
  },
  async ({ revision, repoPath, cwd, context }) => {
    const args = ["show"];
    if (revision) {
      args.push("-r", revision);
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    if (context !== undefined) {
      args.push("--context", context.toString());
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: revert
server.tool(
  "revert",
  "Apply the reverse of one or more revisions in a Jujutsu (jj) repository. Creates new changes that undo the specified commits. Useful for safely undoing changes. Parameters: revisions (Revisions to revert), destination (Optional destination revision, where to apply the revert), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Revisions to revert
    revisions: z.array(z.string()),
    // Optional destination revision (where to apply the revert)
    destination: z.string().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ revisions, destination, repoPath, cwd }) => {
    const args = ["revert"];
    if (destination) {
      args.push("-d", destination);
    }
    args.push(...revisions);
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: restore
server.tool(
  "restore",
  "Restore paths from another revision in a Jujutsu (jj) repository. Can undo changes to specific files by restoring them to their previous state. Parameters: source (Optional source revision to restore from, defaults to parent), destination (Optional destination revision to restore into, defaults to working copy), paths (Paths to restore), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Optional source revision to restore from (defaults to parent)
    source: z.string().optional(),
    // Optional destination revision to restore into (defaults to working copy)
    destination: z.string().optional(),
    // Paths to restore
    paths: z.array(z.string()),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ source, destination, paths, repoPath, cwd }) => {
    const args = ["restore"];
    if (source) {
      args.push("-f", source);
    }
    if (destination) {
      args.push("-t", destination);
    }
    args.push(...paths);
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: interdiff
server.tool(
  "interdiff",
  "Compare the changes between two commits in a Jujutsu (jj) repository. Shows only the difference between the two diffs, excluding changes from other commits. Parameters: from (First commit to compare), to (Second commit to compare), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in), context (Optional number of lines of context to show).",
  {
    // First commit to compare
    from: z.string(),
    // Second commit to compare
    to: z.string(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
    // Optional number of lines of context to show
    context: z.number().int().nonnegative().optional(),
  },
  async ({ from, to, repoPath, cwd, context }) => {
    const args = ["interdiff", "-f", from, "-t", to];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    if (context !== undefined) {
      args.push("--context", context.toString());
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: evolog
server.tool(
  "evolog",
  "Show how a change has evolved over time in a Jujutsu (jj) repository. Lists previous commits which a change has pointed to as it was updated, rebased, etc. Parameters: revision (Revision to show evolution for), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in), limit (Optional limit on number of revisions to show), patch (Optional flag to show patch compared to previous version).",
  {
    // Revision to show evolution for
    revision: z.string().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
    // Optional limit on number of revisions to show
    limit: z.number().int().positive().optional(),
    // Optional flag to show patch compared to previous version
    patch: z.boolean().optional(),
  },
  async ({ revision, repoPath, cwd, limit, patch }) => {
    const args = ["evolog"];
    if (revision) {
      args.push("-r", revision);
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    if (limit) {
      args.push("-n", limit.toString());
    }
    if (patch) {
      args.push("-p");
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: edit
server.tool(
  "edit",
  "Sets the specified revision as the working-copy revision in a Jujutsu (jj) repository. Note: it is generally recommended to instead use `jj new` and `jj squash`. Parameters: revision (The commit to edit, e.g., 'my-branch' or a commit ID), repoPath (Optional path to the repository root or a working directory within the repository), cwd (Optional working directory to run the command in).",
  {
    revision: z
      .string()
      .describe("The commit to edit, e.g., 'my-branch' or a commit ID."),
    repoPath: z
      .string()
      .optional()
      .describe(
        "Optional path to the repository root or a working directory within the repository."
      ),
    cwd: z
      .string()
      .optional()
      .describe("Optional working directory to run the command in."),
  },
  async ({ revision, repoPath, cwd }) => {
    const args = ["edit", revision];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: file-annotate
server.tool(
  "file-annotate",
  "Show the source change for each line of a file in a Jujutsu (jj) repository. Useful for understanding how each line of a file has evolved. Parameters: path (Path to the file to annotate), revision (Optional revision to annotate from, defaults to working copy), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Path to the file to annotate
    path: z.string(),
    // Optional revision to annotate from (defaults to working copy)
    revision: z.string().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ path, revision, repoPath, cwd }) => {
    const args = ["file", "annotate"];
    if (revision) {
      args.push("-r", revision);
    }
    args.push(path);
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: file-chmod
server.tool(
  "file-chmod",
  "Sets or removes the executable bit for files in a Jujutsu (jj) repository. Unlike POSIX chmod, this works on Windows and on arbitrary revisions. Parameters: mode (Mode to set, 'x' for executable, 'n' for non-executable), paths (Paths to modify), revision (Optional revision to modify, defaults to working copy), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Mode to set ('x' for executable, 'n' for non-executable)
    mode: z.enum(["x", "n"]),
    // Paths to modify
    paths: z.array(z.string()),
    // Optional revision to modify (defaults to working copy)
    revision: z.string().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ mode, paths, revision, repoPath, cwd }) => {
    const args = ["file", "chmod"];
    if (revision) {
      args.push("-r", revision);
    }
    args.push(mode);
    args.push(...paths);
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: file-list
server.tool(
  "file-list",
  "List files in a revision of a Jujutsu (jj) repository. Useful for exploring the repository contents at a specific point in history. Parameters: revision (Optional revision to list, defaults to working copy), paths (Optional paths to filter by), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Optional revision to list (defaults to working copy)
    revision: z.string().optional(),
    // Optional paths to filter by
    paths: z.array(z.string()).optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ revision, paths, repoPath, cwd }) => {
    const args = ["file", "list"];
    if (revision) {
      args.push("-r", revision);
    }
    if (paths) {
      args.push(...paths);
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: file-show
server.tool(
  "file-show",
  "Print contents of files in a revision of a Jujutsu (jj) repository. Similar to Unix cat but works on repository files at any revision. Parameters: paths (Paths of files to show), revision (Optional revision to show from, defaults to working copy), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Paths of files to show
    paths: z.array(z.string()),
    // Optional revision to show from (defaults to working copy)
    revision: z.string().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ paths, revision, repoPath, cwd }) => {
    const args = ["file", "show"];
    if (revision) {
      args.push("-r", revision);
    }
    args.push(...paths);
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: file-track
server.tool(
  "file-track",
  "Start tracking specified paths in the working copy of a Jujutsu (jj) repository. By default new files are automatically tracked; this is primarily useful when auto-tracking is disabled. Parameters: paths (Paths to track), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Paths to track
    paths: z.array(z.string()),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ paths, repoPath, cwd }) => {
    const args = ["file", "track", ...paths];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: file-untrack
server.tool(
  "file-untrack",
  "Stop tracking specified paths in the working copy of a Jujutsu (jj) repository. The paths must already be ignored via .gitignore or other ignore rules. Parameters: paths (Paths to untrack), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Paths to untrack
    paths: z.array(z.string()),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ paths, repoPath, cwd }) => {
    const args = ["file", "untrack", ...paths];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: squash
server.tool(
  "squash",
  "Move changes from one revision into another revision in a Jujutsu (jj) repository. Only supports whole-file changes (no --interactive flag support). Parameters: source (Source revision to squash from, defaults to working copy), destination (Destination revision to squash into), paths (Optional path patterns to squash, whole paths only, no partial file changes), keepEmptied (Optional flag to keep emptied source revision), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Source revision to squash from (defaults to working copy)
    source: z.string().optional(),
    // Destination revision to squash into
    destination: z.string().optional(),
    // Optional path patterns to squash (whole paths only, no partial file changes)
    paths: z.array(z.string()).optional(),
    // Optional flag to keep emptied source revision
    keepEmptied: z.boolean().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ source, destination, paths, keepEmptied, repoPath, cwd }) => {
    const args = ["squash"];
    if (source) {
      args.push("-f", source);
    }
    if (destination) {
      args.push("-t", destination);
    }
    if (paths) {
      args.push(...paths);
    }
    if (keepEmptied) {
      args.push("-k");
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: workspace-root
server.tool(
  "workspace-root",
  "Show the current workspace root directory in a Jujutsu (jj) repository. Useful for determining the base directory of the current workspace. Parameters: repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ repoPath, cwd }) => {
    const args = ["workspace", "root"];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: operation-abandon
server.tool(
  "operation-abandon",
  "Abandon operation history in a Jujutsu (jj) repository. Discards old operations and reparents descendants onto the root operation. Parameters: operation (Operation or range to abandon), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Operation or range to abandon
    operation: z.string(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ operation, repoPath, cwd }) => {
    const args = ["operation", "abandon", operation];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: operation-diff
server.tool(
  "operation-diff",
  "Compare changes to the repository between two operations in a Jujutsu (jj) repository. Shows what changed between operation states. Parameters: from (Operation to show changes from), to (Operation to show changes to), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in), context (Optional number of lines of context to show).",
  {
    // Operation to show changes from
    from: z.string().optional(),
    // Operation to show changes to
    to: z.string().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
    // Optional number of lines of context to show
    context: z.number().int().nonnegative().optional(),
  },
  async ({ from, to, repoPath, cwd, context }) => {
    const args = ["operation", "diff"];
    if (from) {
      args.push("-f", from);
    }
    if (to) {
      args.push("-t", to);
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    if (context !== undefined) {
      args.push("--context", context.toString());
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: operation-log
server.tool(
  "operation-log",
  "Show the operation log of a Jujutsu (jj) repository. Lists all operations performed on the repository in chronological order. Parameters: limit (Optional limit on number of operations to show), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Optional limit on number of operations to show
    limit: z.number().int().positive().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ limit, repoPath, cwd }) => {
    const args = ["operation", "log"];
    if (limit) {
      args.push("-n", limit.toString());
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: operation-restore
server.tool(
  "operation-restore",
  "Create a new operation that restores the repo to an earlier state in a Jujutsu (jj) repository. Effectively undoes all operations after the specified one. Parameters: operation (Operation to restore to), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Operation to restore to
    operation: z.string(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ operation, repoPath, cwd }) => {
    const args = ["operation", "restore", operation];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: operation-show
server.tool(
  "operation-show",
  "Show changes to the repository in an operation of a Jujutsu (jj) repository. Displays what changed in the specified operation. Parameters: operation (Operation to show, defaults to latest), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Operation to show (defaults to latest)
    operation: z.string().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ operation, repoPath, cwd }) => {
    const args = ["operation", "show"];
    if (operation) {
      args.push(operation);
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: operation-undo
server.tool(
  "operation-undo",
  "Create a new operation that undoes an earlier operation in a Jujutsu (jj) repository. Applies the inverse of the specified operation. Parameters: operation (Operation to undo, defaults to latest), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Operation to undo (defaults to latest)
    operation: z.string().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ operation, repoPath, cwd }) => {
    const args = ["operation", "undo"];
    if (operation) {
      args.push(operation);
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: config-get
server.tool(
  "config-get",
  "Get the value of a config option in a Jujutsu (jj) repository. Unlike `jj config list`, the output is unformatted for scripting use. Parameters: name (Name of config option to get), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Name of config option to get
    name: z.string(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ name, repoPath, cwd }) => {
    const args = ["config", "get", name];
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: config-list
server.tool(
  "config-list",
  "List config variables and their values in a Jujutsu (jj) repository. Shows both user and repo-level configs by default. Parameters: name (Optional name of specific config option to list), includeDefaults (Optional flag to include default values), includeOverridden (Optional flag to include overridden values), user (Optional flag to only show user-level config), repo (Optional flag to only show repo-level config), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Optional name of specific config option to list
    name: z.string().optional(),
    // Optional flag to include default values
    includeDefaults: z.boolean().optional(),
    // Optional flag to include overridden values
    includeOverridden: z.boolean().optional(),
    // Optional flag to only show user-level config
    user: z.boolean().optional(),
    // Optional flag to only show repo-level config
    repo: z.boolean().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({
    name,
    includeDefaults,
    includeOverridden,
    user,
    repo,
    repoPath,
    cwd,
  }) => {
    const args = ["config", "list"];
    if (name) {
      args.push(name);
    }
    if (includeDefaults) {
      args.push("--include-defaults");
    }
    if (includeOverridden) {
      args.push("--include-overridden");
    }
    if (user) {
      args.push("--user");
    }
    if (repo) {
      args.push("--repo");
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: config-set
server.tool(
  "config-set",
  "Set a config option in a Jujutsu (jj) repository. Updates either user or repo config file. Parameters: name (Name of config option to set), value (Value to set), user (Optional flag to set user-level config), repo (Optional flag to set repo-level config), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Name of config option to set
    name: z.string(),
    // Value to set
    value: z.string(),
    // Optional flag to set user-level config
    user: z.boolean().optional(),
    // Optional flag to set repo-level config
    repo: z.boolean().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ name, value, user, repo, repoPath, cwd }) => {
    const args = ["config", "set"];
    if (user) {
      args.push("--user");
    }
    if (repo) {
      args.push("--repo");
    }
    args.push(name, value);
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: config-unset
server.tool(
  "config-unset",
  "Unset a config option in a Jujutsu (jj) repository. Removes from either user or repo config file. Parameters: name (Name of config option to unset), user (Optional flag to unset user-level config), repo (Optional flag to unset repo-level config), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Name of config option to unset
    name: z.string(),
    // Optional flag to unset user-level config
    user: z.boolean().optional(),
    // Optional flag to unset repo-level config
    repo: z.boolean().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ name, user, repo, repoPath, cwd }) => {
    const args = ["config", "unset"];
    if (user) {
      args.push("--user");
    }
    if (repo) {
      args.push("--repo");
    }
    args.push(name);
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: config-path
server.tool(
  "config-path",
  "Show the path to config files in a Jujutsu (jj) repository. Useful for directly editing config files. Parameters: user (Optional flag to show user config path), repo (Optional flag to show repo config path), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in).",
  {
    // Optional flag to show user config path
    user: z.boolean().optional(),
    // Optional flag to show repo config path
    repo: z.boolean().optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
  },
  async ({ user, repo, repoPath, cwd }) => {
    const args = ["config", "path"];
    if (user) {
      args.push("--user");
    }
    if (repo) {
      args.push("--repo");
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: tag-list
server.tool(
  "tag-list",
  "List tags and their targets in a Jujutsu (jj) repository. Useful for reviewing all tagged points in history. Parameters: names (Optional names of tags to list), repoPath (Optional path to repo root or working directory), cwd (Optional working directory to run the command in), template (Optional template for output formatting).",
  {
    // Optional names of tags to list
    names: z.array(z.string()).optional(),
    // Optional path to repo root or working directory
    repoPath: z.string().optional(),
    // Optional working directory to run the command in
    cwd: z.string().optional(),
    // Optional template for output formatting
    template: z.string().optional(),
  },
  async ({ names, repoPath, cwd, template }) => {
    const args = ["tag", "list"];
    if (names) {
      args.push(...names);
    }
    if (repoPath) {
      args.push("--repository", repoPath);
    }
    if (template) {
      args.push("-T", template);
    }
    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

// Tool: describe
server.tool(
  "describe",
  "Update the change description or other metadata for a revision in a Jujutsu (jj) repository. By default, targets the working-copy revision (`@`). Parameters: message (The new change description to use), revisions (The revision(s) whose description to edit, e.g., 'my-branch', '@-', or a commit ID. Defaults to the working-copy revision if not specified), resetAuthor (If true, reset the author to the configured user), author (Set a custom author string, e.g., 'User <email@example.com>'. This changes author name and email while retaining author timestamp for non-discardable commits), repoPath (Optional path to the repository root or a working directory within the repository), cwd (Optional working directory to run the command in).",
  {
    message: z.string().describe("The new change description to use."),
    revisions: z
      .string()
      .optional()
      .describe(
        "The revision(s) whose description to edit (e.g., 'my-branch', '@-', or a commit ID). Defaults to the working-copy revision if not specified."
      ),
    resetAuthor: z
      .boolean()
      .optional()
      .describe("If true, reset the author to the configured user."),
    author: z
      .string()
      .optional()
      .describe(
        "Set a custom author string (e.g., 'User <email@example.com>'). This changes author name and email while retaining author timestamp for non-discardable commits."
      ),
    repoPath: z
      .string()
      .optional()
      .describe(
        "Optional path to the repository root or a working directory within the repository."
      ),
    cwd: z
      .string()
      .optional()
      .describe("Optional working directory to run the command in."),
  },
  async ({ message, revisions, resetAuthor, author, repoPath, cwd }) => {
    const args = ["describe"];

    if (repoPath) {
      args.push("--repository", repoPath);
    }

    args.push("-m", message);

    if (resetAuthor) {
      args.push("--reset-author");
    }

    if (author) {
      args.push("--author", author);
    }

    // The [REVSETS] argument for jj describe comes after options.
    if (revisions) {
      args.push(revisions);
    }

    const output = await runJJCommand(args, cwd);
    return {
      content: [{ type: "text", text: output }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("jj MCP Server running on stdio");
}

main().catch((e) => {
  console.error("Fatal error in jj MCP Server:", e);
  process.exit(1);
});
