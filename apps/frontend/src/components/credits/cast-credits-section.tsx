import { useCallback, useMemo, useState } from "react";
import { m } from "@/paraglide/messages";
import { CastModal } from "./cast-modal";
import { CreditCard, CreditCardGrid } from "./credit-card";
import {
	type CastCreditPerson,
	type CreditRole,
	mergeCreditPeople,
} from "./credit-people";

interface CastCreditsSectionProps {
	people: CastCreditPerson[];
	title?: string;
	/**
	 * Whether clicking a card opens the person's details. Turn it off when the
	 * card already shows everything, so it links straight to the profile.
	 */
	showDetails?: boolean;
}

function castRoleText(roles: CreditRole[]) {
	const [primaryRole] = roles;
	if (!primaryRole) return "";
	return roles.length > 1
		? m.alert_sepia_cactus({
				primaryRole: primaryRole.name,
				numberOfOtherRoles: roles.length - 1,
			})
		: primaryRole.name;
}

export function CastCreditsSection({
	people,
	title = m.fancy_bronze_panda(),
	showDetails = true,
}: CastCreditsSectionProps) {
	const uniquePeople = useMemo(() => mergeCreditPeople(people), [people]);
	const [selected, setSelected] = useState<CastCreditPerson | null>(null);
	const [open, setOpen] = useState(false);

	const handleSelect = useCallback((person: CastCreditPerson) => {
		setSelected(person);
		setOpen(true);
	}, []);

	if (!uniquePeople.length) return null;

	return (
		<section className="flex flex-col gap-4">
			<h2 className="text-2xl font-bold">
				{title} ({uniquePeople.length})
			</h2>
			<CreditCardGrid>
				{uniquePeople.map((person) => (
					<CreditCard
						key={person.id}
						person={person}
						role={castRoleText(person.roles)}
						onSelect={showDetails ? handleSelect : undefined}
					/>
				))}
			</CreditCardGrid>
			{showDetails ? (
				<CastModal person={selected} open={open} onOpenChange={setOpen} />
			) : null}
		</section>
	);
}
