export interface Project {
	description: string;
	href: string;
	name: string;
	/** Shown as a small label after the name, e.g. the domain. */
	label?: string;
}

export const projects: Project[] = [
	{
		description:
			"Interactive system-design diagrams you can step through one interaction at a time, rather than pointing at a static picture. Build by drag-and-drop or from plain text, share as a read-only link, and embed anywhere.",
		href: "https://flostep.dev",
		label: "flostep.dev",
		name: "Flostep",
	},
	{
		description:
			"An open-source background coding agent that runs on your own machine. Label a GitHub issue, and it works on it with Claude Code in an isolated git worktree, reruns your own checks, and opens a PR. Label the PR after review, and it addresses your comments.",
		href: "https://github.com/pandurang90/agent-loop",
		label: "github.com/pandurang90/agent-loop",
		name: "agent-loop",
	},
];
