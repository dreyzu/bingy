import { IconDeviceTv, IconLayoutGrid, IconMovie } from "@tabler/icons-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { m } from "@/paraglide/messages";

export type MediaFilter = "all" | "movie" | "tv";

type MediaToggleGroupProps = {
	value: MediaFilter;
	onValueChange: (value: MediaFilter) => void;
};

export function MediaToggleGroup({
	value,
	onValueChange,
}: MediaToggleGroupProps) {
	const handleChange = (values: string[]) => {
		const newValue = values[0];
		if (newValue === "all" || newValue === "movie" || newValue === "tv") {
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
			<ToggleGroupItem value="all" aria-label={m.wise_orange_cedar()}>
				<IconLayoutGrid className="h-4 w-4" />
				{m.gallant_green_rocket()}
			</ToggleGroupItem>
			<ToggleGroupItem value="movie" aria-label={m.ample_sepia_tulip()}>
				<IconMovie className="h-4 w-4" />
				{m.candid_lavender_harbor()}
			</ToggleGroupItem>
			<ToggleGroupItem value="tv" aria-label={m.fair_saffron_glacier()}>
				<IconDeviceTv className="h-4 w-4" />
				{m.airy_yellow_rocket()}
			</ToggleGroupItem>
		</ToggleGroup>
	);
}
