import { cn } from "cn";
import { useId } from "react";
import {
	FieldDescription,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { m } from "@/paraglide/messages";
import type { Theme } from "./types";
import { useTheme } from "./use-theme";

const THEMES: { value: Theme; label: () => string }[] = [
	{ value: "light", label: m.daring_ivory_tiger },
	{ value: "dark", label: m.nifty_emerald_iguana },
	{ value: "system", label: m.wild_teal_pelican },
];

const isTheme = (value: unknown): value is Theme =>
	THEMES.some((theme) => theme.value === value);

/**
 * A miniature page drawn with fixed colors, so each card shows its theme
 * whatever theme is active.
 */
function ThemeSketch({
	variant,
	className,
}: {
	variant: "light" | "dark";
	className?: string;
}) {
	const dark = variant === "dark";
	const bar = dark ? "bg-zinc-700" : "bg-zinc-300";
	const tile = dark ? "bg-zinc-800" : "bg-zinc-200";

	return (
		<div
			className={cn(
				"absolute inset-0 flex flex-col gap-1.5 p-2",
				dark ? "bg-zinc-950" : "bg-white",
				className,
			)}
		>
			<div className={cn("h-1.5 w-1/2 rounded-full", bar)} />
			<div className="flex flex-1 gap-1">
				<div className={cn("flex-1 rounded-sm", tile)} />
				<div className={cn("flex-1 rounded-sm", tile)} />
				<div className={cn("flex-1 rounded-sm", tile)} />
			</div>
			<div className={cn("h-1.5 w-3/4 rounded-full", bar)} />
		</div>
	);
}

function ThemePreview({ theme }: { theme: Theme }) {
	return (
		<div
			aria-hidden
			className="relative aspect-4/3 w-full overflow-hidden rounded-md ring-1 ring-foreground/10"
		>
			{theme === "dark" ? (
				<ThemeSketch variant="dark" />
			) : (
				<ThemeSketch variant="light" />
			)}
			{theme === "system" ? (
				<ThemeSketch variant="dark" className="[clip-path:inset(0_0_0_50%)]" />
			) : null}
		</div>
	);
}

export function ThemePicker() {
	const { theme, setTheme } = useTheme();
	const id = useId();

	const handleThemeChange = (value: unknown) => {
		if (!isTheme(value) || value === theme) return;

		if (!document.startViewTransition) {
			setTheme(value);
			return;
		}

		document.startViewTransition(() => {
			setTheme(value);
		});
	};

	return (
		<FieldSet className="py-2">
			<FieldLegend variant="label">{m.fluffy_periwinkle_dolphin()}</FieldLegend>
			<FieldDescription>{m.quiet_jade_dolphin()}</FieldDescription>
			<RadioGroup
				value={theme}
				onValueChange={handleThemeChange}
				className="grid-cols-3 sm:max-w-md"
			>
				{THEMES.map(({ value, label }) => (
					<FieldLabel
						key={value}
						htmlFor={`${id}-${value}`}
						className="w-full flex-col gap-2 rounded-lg border p-2 hover:cursor-pointer has-data-checked:border-primary dark:has-data-checked:border-primary"
					>
						<ThemePreview theme={value} />
						<span className="flex items-center gap-2">
							<RadioGroupItem id={`${id}-${value}`} value={value} />
							<span className="truncate">{label()}</span>
						</span>
					</FieldLabel>
				))}
			</RadioGroup>
		</FieldSet>
	);
}
