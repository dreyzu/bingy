import { useQuery } from "@tanstack/react-query";
import { useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { useUpdatePrivacy } from "@/hooks/useFollows";
import { sessionQueryOptions } from "@/lib/queries/session";
import { m } from "@/paraglide/messages";

export function PrivateAccountForm() {
	const { data: session } = useQuery(sessionQueryOptions);
	const updatePrivacy = useUpdatePrivacy();
	const id = useId();

	const isPrivate = updatePrivacy.isPending
		? updatePrivacy.variables
		: (session?.user.isPrivate ?? false);

	return (
		<Field orientation="horizontal" className="py-2">
			<Checkbox
				id={id}
				checked={isPrivate}
				disabled={updatePrivacy.isPending}
				onCheckedChange={(checked) => updatePrivacy.mutate(checked === true)}
			/>
			<FieldContent>
				<FieldLabel htmlFor={id}>{m.chilly_olive_fern()}</FieldLabel>
				<FieldDescription>{m.bold_navy_oasis()}</FieldDescription>
			</FieldContent>
		</Field>
	);
}
