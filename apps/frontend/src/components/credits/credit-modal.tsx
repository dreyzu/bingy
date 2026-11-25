import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import fallbackPoster from "@/assets/user-placeholder.jpg";
import { buttonVariants } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/integrations/media-query";
import { m } from "@/paraglide/messages";
import { getTmdbImageUrl } from "@/utils/utils";
import type { CastCreditPerson, CreditRole } from "./credit-people";

interface CreditModalProps {
	/** Kept after closing so the content stays during the close animation. */
	person: CastCreditPerson | null;
	description?: string;
	/** Text for the number of episodes a role is in, on TV credits. */
	episodeCountText: (count: number) => string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Details of a person from a credits page, with a link to their profile. A
 * dialog on desktop and a drawer on mobile.
 */
export function CreditModal({
	person,
	description,
	episodeCountText,
	open,
	onOpenChange,
}: CreditModalProps) {
	const isMobile = useIsMobile();

	if (!person) return null;

	const profileLink = (
		<Link
			to="/person/$personId"
			params={{ personId: person.id.toString() }}
			className={buttonVariants({ className: "w-full sm:w-auto" })}
		>
			{m.clever_bronze_sunflower()}
			<IconArrowRight data-icon="inline-end" />
		</Link>
	);

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={onOpenChange} swipeDirection="down">
				<DrawerContent>
					<DrawerBody className="px-4 pt-4">
						<CreditDetails
							person={person}
							episodeCountText={episodeCountText}
							title={
								<DrawerTitle className={TITLE_CLASSES}>
									{person.name}
								</DrawerTitle>
							}
							description={
								description ? (
									<DrawerDescription>{description}</DrawerDescription>
								) : null
							}
						/>
					</DrawerBody>
					<DrawerFooter className="pb-[calc(1rem+env(safe-area-inset-bottom))]">
						{profileLink}
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md max-h-[85vh] grid-rows-[minmax(0,1fr)_auto]">
				<div className="min-h-0 overflow-y-auto">
					<CreditDetails
						person={person}
						episodeCountText={episodeCountText}
						title={
							<DialogTitle className={TITLE_CLASSES}>{person.name}</DialogTitle>
						}
						description={
							description ? (
								<DialogDescription>{description}</DialogDescription>
							) : null
						}
					/>
				</div>
				<DialogFooter>{profileLink}</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

const TITLE_CLASSES = "text-lg leading-snug font-semibold wrap-break-word";

function CreditDetails({
	person,
	episodeCountText,
	title,
	description,
}: {
	person: CastCreditPerson;
	episodeCountText: (count: number) => string;
	title: ReactNode;
	description: ReactNode;
}) {
	const imageUrl = getTmdbImageUrl(person.profilePath, "w200");

	return (
		<div className="flex gap-4 text-left">
			<img
				src={imageUrl ?? fallbackPoster}
				alt=""
				className="aspect-2/3 w-24 shrink-0 self-start rounded-lg object-cover object-top ring-1 ring-foreground/10 sm:w-28"
				onError={(e) => {
					if (e.currentTarget.src !== fallbackPoster)
						e.currentTarget.src = fallbackPoster;
				}}
			/>
			<div className="flex min-w-0 flex-1 flex-col gap-3 pr-6">
				<div className="flex flex-col gap-1">
					{title}
					{description}
				</div>
				<CreditRoleList
					roles={person.roles}
					episodeCountText={episodeCountText}
				/>
			</div>
		</div>
	);
}

function CreditRoleList({
	roles,
	episodeCountText,
}: {
	roles: CreditRole[];
	episodeCountText: (count: number) => string;
}) {
	if (!roles.length) return null;

	return (
		<ul className="flex flex-col gap-2 text-sm">
			{roles.map((role) => (
				<li key={role.name} className="flex flex-col">
					<span className="font-medium wrap-break-word">{role.name}</span>
					{role.episodeCount ? (
						<span className="text-xs text-muted-foreground">
							{episodeCountText(role.episodeCount)}
						</span>
					) : null}
				</li>
			))}
		</ul>
	);
}
