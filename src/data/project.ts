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
];
