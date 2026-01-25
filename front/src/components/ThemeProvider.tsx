"use client";

import { useEffect } from "react";

import { useThemeStore } from "@/stores/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const { mode } = useThemeStore();

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove("light", "dark");

		if (mode === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
			root.classList.add(systemTheme);
		} else {
			root.classList.add(mode);
		}
	}, [mode]);

	return <>{children}</>;
}
