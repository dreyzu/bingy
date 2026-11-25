import { m } from "@/paraglide/messages";
import { CreditModal } from "./credit-modal";
import type { CrewCreditPerson } from "./credit-people";

interface CrewModalProps {
	person: CrewCreditPerson | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/** Details of a crew member: their department and jobs. */
export function CrewModal({ person, open, onOpenChange }: CrewModalProps) {
	return (
		<CreditModal
			person={person}
			description={person?.department}
			episodeCountText={(count) => m.wise_teal_banjo({ count })}
			open={open}
			onOpenChange={onOpenChange}
		/>
	);
}
