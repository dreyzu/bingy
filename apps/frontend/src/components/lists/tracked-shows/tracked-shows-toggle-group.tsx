import {
	IconCircleCheck,
	IconCircleX,
	IconEye,
	IconLayoutGrid,
	IconPlayerPause,
} from "@tabler/icons-react";
import type { TrackedShowFilter } from "@/api/tracked-shows";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMediaQuery } from "@/integrations/media-query";
import { m } from "@/paraglide/messages";

type TrackedShowsToggleGroupProps = {
	value: TrackedShowFilter;
	onValueChange: (value: TrackedShowFilter) => void;
};

const isTrackedShowFilter = (value: string): value is TrackedShowFilter =>
	value === "all" ||
	value === "watching" ||
	value === "on_hold" ||
	value === "dropped" ||
	value === "completed";

export function TrackedShowsToggleGroup({
	value,
	onValueChange,
}: TrackedShowsToggleGroupProps) {
	const isMobile = useMediaQuery("(pointer: coarse)");

	const options: {
		value: TrackedShowFilter;
		label: string;
		ariaLabel: string;
		icon: typeof IconLayoutGrid;
	}[] = [
		{
			value: "all",
			label: m.brisk_copper_daisy(),
			ariaLabel: m.epic_cream_daisy(),
			icon: IconLayoutGrid,
		},
		{
			value: "watching",
			label: m.sturdy_rust_blossom(),
			ariaLabel: m.calm_khaki_eagle(),
			icon: IconEye,
		},
		{
			value: "on_hold",
			label: m.tidy_emerald_dolphin(),
			ariaLabel: m.eager_saffron_pelican(),
			icon: IconPlayerPause,
		},
		{
			value: "dropped",
			label: m.noble_lime_barn(),
			ariaLabel: m.silent_saffron_planet(),
			icon: IconCircleX,
		},
		{
			value: "completed",
			label: m.zippy_navy_clover(),
			ariaLabel: m.elegant_olive_meadow(),
			icon: IconCircleCheck,
		},
	];

	if (isMobile) {
		const selected = options.find((option) => option.value === value);
		const SelectedIcon = selected?.icon;

		return (
			<Select
				value={value}
				onValueChange={(next) => {
					if (next && isTrackedShowFilter(next)) onValueChange(next);
				}}
			>
				<SelectTrigger className="w-full">
					<SelectValue>
						<span className="flex items-center gap-2">
							{SelectedIcon ? <SelectedIcon className="h-4 w-4" /> : null}
							{selected?.label}
						</span>
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							<span className="flex items-center gap-2">
								<option.icon className="h-4 w-4" />
								{option.label}
							</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	}

	const handleChange = (values: string[]) => {
		const newValue = values[0];
		if (newValue && isTrackedShowFilter(newValue)) {
			onValueChange(newValue);
		}
	};

	return (
		<ToggleGroup
			value={[value]}
			onValueChange={handleChange}
			className="justify-start"
			spacing={2}
		>
			{options.map((option) => (
				<ToggleGroupItem
					key={option.value}
					value={option.value}
					aria-label={option.ariaLabel}
				>
					<option.icon className="h-4 w-4" />
					{option.label}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
