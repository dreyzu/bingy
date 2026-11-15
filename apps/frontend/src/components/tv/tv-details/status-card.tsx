import {
	IconCalendarWeek,
	IconCircleCheck,
	IconCircleX,
	IconClipboard,
	IconProgress,
	IconSparkles,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { m } from "@/paraglide/messages";

const STATUS_CONFIG = {
	"In Production": {
		icon: IconClipboard,
		key: "daring_plum_octopus",
	},
	"Returning Series": {
		icon: IconProgress,
		key: "bold_beige_otter",
	},
	Canceled: {
		icon: IconCircleX,
		key: "dapper_khaki_gecko",
	},
	Ended: {
		icon: IconCircleCheck,
		key: "warm_ruby_falcon",
	},
	Pilot: {
		icon: IconSparkles,
		key: "snappy_gray_boulder",
	},
	Planned: {
		icon: IconCalendarWeek,
		key: "grand_ivory_lynx",
	},
} as const;

type TVStatus = keyof typeof STATUS_CONFIG;

interface TVStatusCardProps {
	status: string;
}

export function TVStatusCard({ status }: TVStatusCardProps) {
	const config = STATUS_CONFIG[status as TVStatus];

	if (!config) return null;

	const Icon = config.icon;
	const statusMessage = m[config.key as keyof typeof m] as () => string;

	return (
		<Card className="border ring-0">
			<CardContent className="flex items-center gap-4">
				<Icon />
				<div>
					<p className="text-lg font-bold">{statusMessage()}</p>
					<p className="text-sm text-muted-foreground">
						{m.polite_yellow_daisy()}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
