import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { memo, type ReactNode } from "react";
import fallbackPoster from "@/assets/user-placeholder.jpg";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getTmdbImageUrl } from "@/utils/utils";
import type { CastCreditPerson } from "./credit-people";

interface CreditCardProps<T extends CastCreditPerson> {
	person: T;
	role: string;
	/** Opens the person's details. Without it, the card links to their profile. */
	onSelect?: (person: T) => void;
}

const CARD_TRIGGER_CLASSES =
	"group/credit rounded-xl text-left outline-none cursor-pointer focus-visible:ring-3 focus-visible:ring-ring/50";

function CreditCardInner<T extends CastCreditPerson>({
	person,
	role,
	onSelect,
}: CreditCardProps<T>) {
	const imageUrl = getTmdbImageUrl(person.profilePath, "w200");

	const card = (
		<Card
			size="sm"
			className="h-full gap-2 pt-0 pb-2 transition-colors group-hover/credit:bg-accent"
		>
			<img
				src={imageUrl ?? fallbackPoster}
				alt=""
				loading="lazy"
				className="aspect-2/3 w-full object-cover object-top"
				onError={(e) => {
					if (e.currentTarget.src !== fallbackPoster)
						e.currentTarget.src = fallbackPoster;
				}}
			/>
			<CardHeader className="gap-0.5 px-2 group-data-[size=sm]/card:px-2">
				<CardTitle className="line-clamp-1" title={person.name}>
					{person.name}
				</CardTitle>
				<CardDescription
					className="line-clamp-1 min-h-4 text-xs"
					title={role || undefined}
				>
					{role}
				</CardDescription>
			</CardHeader>
		</Card>
	);

	if (!onSelect) {
		return (
			<Link
				to="/person/$personId"
				params={{ personId: person.id.toString() }}
				className={CARD_TRIGGER_CLASSES}
			>
				{card}
			</Link>
		);
	}

	return (
		<button
			type="button"
			onClick={() => onSelect(person)}
			className={CARD_TRIGGER_CLASSES}
		>
			{card}
		</button>
	);
}

export const CreditCard = memo(CreditCardInner) as typeof CreditCardInner;

export function CreditCardGrid({
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={cn(
				"grid w-full grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] sm:gap-4",
				className,
			)}
		>
			{children}
		</div>
	);
}
