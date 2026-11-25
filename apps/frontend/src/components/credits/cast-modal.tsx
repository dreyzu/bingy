import { m } from "@/paraglide/messages";
import { CreditModal } from "./credit-modal";
import type { CastCreditPerson } from "./credit-people";

interface CastModalProps {
	person: CastCreditPerson | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/** Details of a cast member: their characters, with episode counts on TV. */
export function CastModal({ person, open, onOpenChange }: CastModalProps) {
	return (
		<CreditModal
			person={person}
			episodeCountText={(count) => m.hardy_periwinkle_lantern({ count })}
			open={open}
			onOpenChange={onOpenChange}
		/>
	);
}
