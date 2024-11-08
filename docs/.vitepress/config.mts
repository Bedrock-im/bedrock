import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Bedrock.im",
	description: "Bedrock.im official documentation",

	lastUpdated: true,

	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Changelog", link: "/CHANGELOG" },
		],

		sidebar: [
			{
				text: "Introduction",
				link: "/introduction",
			},
			{
				text: "Changelog",
				link: "/CHANGELOG",
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
