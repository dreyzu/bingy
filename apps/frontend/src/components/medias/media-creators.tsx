import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import {
	type CreditsMedia,
	MediaCreditsLink,
} from "@/components/medias/media-credits-link";
import { m } from "@/paraglide/messages";

const MAX_CREATORS = 3;
// Private-use character, so it never collides with translated text.
const NAMES_PLACEHOLDER = String.fromCodePoint(0xe000);
export const CREATOR_LINK_CLASSES =
	"font-semibold text-foreground hover:underline";

interface CreatorPerson {
	id: number;
	name: string;
}

interface MediaCreatorsProps {
	creators: CreatorPerson[];
	/** Credit message with a `{names}` parameter, e.g. "Directed by {names}". */
	formatCredit: (params: { names: string }) => string;
	/** The media whose crew is linked when some creators are hidden. */
	media: CreditsMedia;
}

export function MediaCreators({
	creators,
	formatCredit,
	media,
}: MediaCreatorsProps) {
	if (creators.length === 0) return null;

	// The names are links, so the message is rendered around them instead of
	// receiving them as plain text. This keeps the translated word order.
	const [before, after = ""] = formatCredit({
		names: NAMES_PLACEHOLDER,
	}).split(NAMES_PLACEHOLDER);
	const separator = m.lush_hazel_valley();

	return (
		<p className="text-sm lg:text-base text-muted-foreground">
			{before}
			{creators.slice(0, MAX_CREATORS).map((person, index) => (
				<Fragment key={person.id}>
					{index > 0 ? separator : null}
					<Link
						to="/person/$personId"
						params={{ personId: person.id.toString() }}
						className={CREATOR_LINK_CLASSES}
					>
						{person.name}
					</Link>
				</Fragment>
			))}
			{creators.length > MAX_CREATORS ? (
				<MoreCreatorsLink media={media} />
			) : null}
			{after}
		</p>
	);
}

function MoreCreatorsLink({ media }: Pick<MediaCreatorsProps, "media">) {
	const label = m.bubbly_sage_badger();
	// Some locales put a space before the ellipsis. It stays outside the link
	// so it is not underlined on hover.
	const [, leadingSpace, ellipsis] =
		m.bubbly_maroon_meerkat().match(/^(\s*)(.*)$/s) ?? [];

	return (
		<>
			{leadingSpace}
			<MediaCreditsLink
				media={media}
				section="crew"
				className={CREATOR_LINK_CLASSES}
				aria-label={label}
				title={label}
			>
				{ellipsis}
			</MediaCreditsLink>
		</>
	);
}
