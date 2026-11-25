import { Link } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { Fragment } from "react";
import { CREATOR_LINK_CLASSES } from "@/components/medias/media-creators";
import { localeRegionAtom } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";

// Private-use characters, so they never collide with translated text.
const DIRECTORS_PLACEHOLDER = String.fromCodePoint(0xe000);
const WRITERS_PLACEHOLDER = String.fromCodePoint(0xe001);

interface Person {
	id: number;
	name: string;
}

interface EpisodeCreatorsProps {
	directors: Person[];
	writers: Person[];
}

/** "Directed by … and written by …", with every name linked. */
export function EpisodeCreators({ directors, writers }: EpisodeCreatorsProps) {
	if (directors.length === 0 && writers.length === 0) return null;

	const text =
		directors.length > 0 && writers.length > 0
			? m.grand_amber_mesa({
					directors: DIRECTORS_PLACEHOLDER,
					writers: WRITERS_PLACEHOLDER,
				})
			: directors.length > 0
				? m.lively_coral_bamboo({ names: DIRECTORS_PLACEHOLDER })
				: m.fierce_olive_tiger({ names: WRITERS_PLACEHOLDER });

	// The names are links, so the message is rendered around them instead of
	// receiving them as plain text. This keeps the translated word order.
	const [before, middle = "", after = ""] = text.split(
		new RegExp(`[${DIRECTORS_PLACEHOLDER}${WRITERS_PLACEHOLDER}]`),
	);
	const directorsFirst =
		!text.includes(WRITERS_PLACEHOLDER) ||
		text.indexOf(DIRECTORS_PLACEHOLDER) < text.indexOf(WRITERS_PLACEHOLDER);
	const directorLinks = <PeopleLinks people={directors} />;
	const writerLinks = <PeopleLinks people={writers} />;

	return (
		<p className="text-sm lg:text-base text-muted-foreground">
			{before}
			{directorsFirst ? directorLinks : writerLinks}
			{middle}
			{directors.length > 0 && writers.length > 0
				? directorsFirst
					? writerLinks
					: directorLinks
				: null}
			{after}
		</p>
	);
}

/** Linked names joined the way the locale lists them, e.g. "A, B and C". */
function PeopleLinks({ people }: { people: Person[] }) {
	const localeRegion = useAtomValue(localeRegionAtom);

	if (people.length === 0) return null;

	const parts = new Intl.ListFormat(localeRegion, {
		type: "conjunction",
	}).formatToParts(people.map((person) => person.name));

	// Text between names (", ", " and ") goes before the name that follows it.
	const separators: string[] = people.map(() => "");
	let trailing = "";
	let nameIndex = 0;
	for (const part of parts) {
		if (part.type === "element") {
			nameIndex += 1;
		} else if (nameIndex < people.length) {
			separators[nameIndex] += part.value;
		} else {
			trailing += part.value;
		}
	}

	return (
		<>
			{people.map((person, index) => (
				<Fragment key={person.id}>
					{separators[index]}
					<Link
						to="/person/$personId"
						params={{ personId: person.id.toString() }}
						className={CREATOR_LINK_CLASSES}
					>
						{person.name}
					</Link>
				</Fragment>
			))}
			{trailing}
		</>
	);
}
