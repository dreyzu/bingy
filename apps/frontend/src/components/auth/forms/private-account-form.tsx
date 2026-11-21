import { useId } from "react";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useUpdatePrivacy } from "@/hooks/useFollows";
import { useSession } from "@/hooks/useSession";
import { m } from "@/paraglide/messages";

export function PrivateAccountForm() {
	const session = useSession();
	const updatePrivacy = useUpdatePrivacy();
	const id = useId();

	const isPrivate = updatePrivacy.isPending
		? updatePrivacy.variables
		: (session?.user.isPrivate ?? false);

	return (
		<Field orientation="horizontal" className="gap-6 py-2">
			<FieldContent>
				<FieldLabel htmlFor={id}>{m.chilly_olive_fern()}</FieldLabel>
				<FieldDescription>{m.bold_navy_oasis()}</FieldDescription>
			</FieldContent>
			<Switch
				id={id}
				checked={isPrivate}
				disabled={updatePrivacy.isPending}
				onCheckedChange={(checked) => updatePrivacy.mutate(checked)}
			/>
		</Field>
	);
}
