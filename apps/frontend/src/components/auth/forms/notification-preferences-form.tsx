import { useId } from "react";
import type { NotificationType } from "@/api/notifications";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import {
	useNotificationPreferences,
	useUpdateNotificationPreferences,
} from "@/hooks/useNotifications";
import { m } from "@/paraglide/messages";

const preferences: {
	type: NotificationType;
	label: () => string;
	description: () => string;
}[] = [
	{
		type: "new_follower",
		label: m.lively_plum_rabbit,
		description: m.tidy_azure_crystal,
	},
	{
		type: "follow_request",
		label: m.dusky_coral_glacier,
		description: m.breezy_fuchsia_garden,
	},
	{
		type: "follow_request_accepted",
		label: m.jolly_khaki_bamboo,
		description: m.bright_navy_otter,
	},
];

interface PreferenceFieldProps {
	label: string;
	description: string;
	checked: boolean;
	disabled: boolean;
	onCheckedChange: (checked: boolean) => void;
}

function PreferenceField({
	label,
	description,
	checked,
	disabled,
	onCheckedChange,
}: PreferenceFieldProps) {
	const id = useId();

	return (
		<Field orientation="horizontal" className="py-2">
			<Checkbox
				id={id}
				checked={checked}
				disabled={disabled}
				onCheckedChange={(value) => onCheckedChange(value === true)}
			/>
			<FieldContent>
				<FieldLabel htmlFor={id}>{label}</FieldLabel>
				<FieldDescription>{description}</FieldDescription>
			</FieldContent>
		</Field>
	);
}

export function NotificationPreferencesForm() {
	const { data } = useNotificationPreferences();
	const update = useUpdateNotificationPreferences();

	return (
		<div className="flex flex-col">
			{preferences.map(({ type, label, description }) => (
				<PreferenceField
					key={type}
					label={label()}
					description={description()}
					checked={data?.[type] ?? true}
					disabled={!data}
					onCheckedChange={(checked) => update.mutate({ [type]: checked })}
				/>
			))}
		</div>
	);
}
