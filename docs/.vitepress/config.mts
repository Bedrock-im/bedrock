import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Bedrock.im",
	description: "Bedrock.im official documentation",

	lastUpdated: true,
	base: "/bedrock/",

	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Changelog", link: "/CHANGELOG" },
		],

		sidebar: [
			{
				text: "Changelog",
				link: "/CHANGELOG",
			},
			{
				text: "Examples",
				items: [
					{ text: "Markdown Examples", link: "/markdown-examples" },
					{ text: "Runtime API Examples", link: "/api-examples" },
				],
			},
		],

		editLink: {
			pattern: "https://github.com/Bedrock-im/bedrock/edit/main/docs/:path",
			text: "Edit this page on GitHub",
		},

		search: {
			provider: "local",
		},

		socialLinks: [{ icon: "github", link: "https://github.com/Bedrock-im/bedrock" }],
	},
});
