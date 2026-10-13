export interface SocialLink {
	friendlyName: string;
	link: string;
}

/** Shown on the home page's "Let's connect" line, in this order. */
export const socialLinks: SocialLink[] = [
	{ friendlyName: "pandurang.plw@gmail.com", link: "mailto:pandurang.plw@gmail.com" },
	{ friendlyName: "GitHub", link: "https://github.com/pandurang90" },
	{ friendlyName: "LinkedIn", link: "https://www.linkedin.com/in/pandurangwaghulde" },
	{
		friendlyName: "Stack Overflow",
		link: "https://stackoverflow.com/users/1699730/pandurang-waghulde",
	},
	{ friendlyName: "X", link: "https://x.com/pandurang_w" },
	{ friendlyName: "RSS", link: "/feed.xml" },
];
