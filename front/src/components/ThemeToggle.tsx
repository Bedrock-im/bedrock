"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ThemeMode, useThemeStore } from "@/stores/theme";

const themes: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
	{ value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
	const { mode, setMode } = useThemeStore();

	return (
		<div className="space-y-3">
			<Label className="text-base font-medium">Appearance</Label>
			<RadioGroup
				value={mode}
				onValueChange={(value) => setMode(value as ThemeMode)}
				className="grid grid-cols-3 gap-4"
			>
				{themes.map((theme) => {
					const Icon = theme.icon;
					const isSelected = mode === theme.value;
					return (
						<Label
							key={theme.value}
							htmlFor={theme.value}
							className={`
								flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
								${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent"}
							`}
						>
							<RadioGroupItem value={theme.value} id={theme.value} className="sr-only" />
							<Icon className={`size-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
							<span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
								{theme.label}
							</span>
						</Label>
					);
				})}
			</RadioGroup>
		</div>
	);
}
