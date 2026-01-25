import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
	mode: ThemeMode;
	setMode: (mode: ThemeMode) => void;
}

const applyTheme = (mode: ThemeMode) => {
	const root = window.document.documentElement;
	root.classList.remove("light", "dark");

	if (mode === "system") {
		const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		root.classList.add(systemTheme);
	} else {
		root.classList.add(mode);
	}
};

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			mode: "system",
			setMode: (mode: ThemeMode) => {
				applyTheme(mode);
				set({ mode });
			},
		}),
		{
			name: "bedrock-theme",
			onRehydrateStorage: () => (state) => {
				if (state) {
					applyTheme(state.mode);
				}
			},
		},
	),
);

if (typeof window !== "undefined") {
	window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
		const { mode } = useThemeStore.getState();
		if (mode === "system") {
			applyTheme("system");
		}
	});
}
