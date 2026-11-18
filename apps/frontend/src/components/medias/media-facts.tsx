import { type ReactNode, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";
import { getRegionName } from "@/utils/display-names";
import { shortenCountryName } from "@/utils/shorten-country-name";

export interface MediaFact {
	id: string;
	label: string;
	value: ReactNode;
}

interface MediaFactListProps {
	facts: MediaFact[];
}

/** Label/value rows: stacked on mobile, two columns from `sm` up. */
export function MediaFactList({ facts }: MediaFactListProps) {
	return (
		<dl className="grid gap-x-6 gap-y-4 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-y-3">
			{facts.map((fact) => (
				<div key={fact.id} className="flex flex-col gap-1 sm:contents">
					<dt className="text-sm text-muted-foreground">{fact.label}</dt>
					<dd className="text-sm">{fact.value}</dd>
				</div>
			))}
		</dl>
	);
}

function CountryFlag({ code }: { code: string }) {
	return (
		<span
			aria-hidden
			className={`fi fi-${code.toLowerCase()} shrink-0`}
			style={{ width: 18, height: 14 }}
		/>
	);
}

interface FactBadgesProps {
	items: Array<{ key: string | number; label: string; flag?: string }>;
}

export function FactBadges({ items }: FactBadgesProps) {
	return (
		<div className="flex flex-wrap gap-2">
			{items.map((item) => (
				<Badge
					key={item.key}
					variant="secondary"
					className="flex items-center gap-2"
				>
					{item.flag ? <CountryFlag code={item.flag} /> : null}
					{item.label}
				</Badge>
			))}
		</div>
	);
}

interface CountryBadgesProps {
	countries: Array<{ iso_3166_1: string; name?: string }>;
	locale: string;
}

/** Country badges with flags, named in the user's language. */
export function CountryBadges({ countries, locale }: CountryBadgesProps) {
	return (
		<FactBadges
			items={countries.map((country) => ({
				key: country.iso_3166_1,
				flag: country.iso_3166_1,
				label:
					getRegionName(country.iso_3166_1, locale) ??
					shortenCountryName(country.name ?? country.iso_3166_1),
			}))}
		/>
	);
}

export function FlagValue({
	code,
	children,
}: {
	code: string;
	children: ReactNode;
}) {
	return (
		<span className="flex items-center gap-2">
			<CountryFlag code={code} />
			{children}
		</span>
	);
}

const COLLAPSED_TITLE_COUNT = 5;

interface AlternativeTitlesProps {
	titles: Array<{ iso_3166_1: string; title: string }>;
}

export function AlternativeTitles({ titles }: AlternativeTitlesProps) {
	const [expanded, setExpanded] = useState(false);
	const visibleTitles = expanded
		? titles
		: titles.slice(0, COLLAPSED_TITLE_COUNT);

	return (
		<div className="flex flex-col items-start gap-1.5">
			<ul className="flex flex-col gap-1.5">
				{visibleTitles.map((title) => (
					<li key={`${title.iso_3166_1}-${title.title}`}>
						<FlagValue code={title.iso_3166_1}>{title.title}</FlagValue>
					</li>
				))}
			</ul>
			{titles.length > COLLAPSED_TITLE_COUNT ? (
				<Button
					variant="link"
					size="sm"
					className="h-auto px-0"
					onClick={() => setExpanded((value) => !value)}
				>
					{expanded
						? m.noble_indigo_canyon()
						: m.witty_lavender_otter({ count: titles.length })}
				</Button>
			) : null}
		</div>
	);
}

/**
 * Removes duplicate titles and the ones matching the main titles, and puts the
 * titles from the user's region first.
 */
export function prepareAlternativeTitles(
	titles: Array<{ iso_3166_1: string; title: string }>,
	{ exclude, region }: { exclude: string[]; region: string },
) {
	const seen = new Set(exclude.map((title) => title.toLocaleLowerCase()));
	const unique = titles.filter((title) => {
		const key = title.title.toLocaleLowerCase();
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});

	return [
		...unique.filter((title) => title.iso_3166_1 === region),
		...unique.filter((title) => title.iso_3166_1 !== region),
	];
}
