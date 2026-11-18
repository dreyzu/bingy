import type { Schemas } from "shared";
import {
	AlternativeTitles,
	CountryBadges,
	FactBadges,
	FlagValue,
	type MediaFact,
	prepareAlternativeTitles,
} from "@/components/medias/media-facts";
import { m } from "@/paraglide/messages";
import { formatSpokenLanguages, getLanguageName } from "@/utils/display-names";
import { formatDate } from "@/utils/format-date";

/** TMDB show types. */
const SHOW_TYPE_LABELS: Record<string, () => string> = {
	Scripted: m.breezy_wine_mirror,
	Miniseries: m.daring_periwinkle_fox,
	Documentary: m.winsome_orange_hippo,
	Reality: m.candid_purple_beacon,
	"Talk Show": m.jaunty_coral_cactus,
	News: m.kind_green_fox,
	Video: m.zesty_onyx_moose,
};

const FALLBACK_RATING_REGION = "US";

/**
 * Age rating for the user's region, or else for the show's country, or else
 * the US one.
 */
function getAgeRating(tv: Schemas.TvDetails, region: string) {
	const ratings = (tv.content_ratings?.results ?? []).filter(
		(rating) => rating.rating,
	);
	const regions = [region, ...tv.origin_country, FALLBACK_RATING_REGION];

	for (const candidate of regions) {
		const rating = ratings.find((r) => r.iso_3166_1 === candidate);
		if (rating) return rating;
	}
	return undefined;
}

/** Rows of the TV show "Details" tab. Rows without data are left out. */
export function getTvFacts(
	tv: Schemas.TvDetails,
	{ locale, region }: { locale: string; region: string },
): MediaFact[] {
	const facts: MediaFact[] = [];

	if (tv.networks.length > 0) {
		facts.push({
			id: "networks",
			label: m.tender_umber_forest(),
			value: (
				<FactBadges
					items={tv.networks.map((network) => ({
						key: network.id,
						label: network.name,
					}))}
				/>
			),
		});
	}

	if (tv.production_companies.length > 0) {
		facts.push({
			id: "studios",
			label: m.icy_magenta_lagoon(),
			value: (
				<FactBadges
					items={tv.production_companies.map((company) => ({
						key: company.id,
						label: company.name,
					}))}
				/>
			),
		});
	}

	if (tv.origin_country.length > 0) {
		facts.push({
			id: "origin-country",
			label: m.bubbly_wine_otter(),
			value: (
				<CountryBadges
					countries={tv.origin_country.map((code) => ({ iso_3166_1: code }))}
					locale={locale}
				/>
			),
		});
	}

	if (tv.production_countries.length > 0) {
		facts.push({
			id: "production-countries",
			label: m.shiny_peach_ember(),
			value: (
				<CountryBadges countries={tv.production_countries} locale={locale} />
			),
		});
	}

	const primaryLanguage = getLanguageName(tv.original_language, locale);
	if (primaryLanguage) {
		facts.push({
			id: "primary-language",
			label: m.sturdy_beige_bagel(),
			value: primaryLanguage,
		});
	}

	const spokenLanguages = formatSpokenLanguages(tv.spoken_languages, locale);
	if (spokenLanguages) {
		facts.push({
			id: "spoken-languages",
			label: m.bright_coral_falcon(),
			value: spokenLanguages,
		});
	}

	const showType = Object.hasOwn(SHOW_TYPE_LABELS, tv.type)
		? SHOW_TYPE_LABELS[tv.type]
		: undefined;
	if (showType) {
		facts.push({
			id: "show-type",
			label: m.fluffy_azure_wombat(),
			value: showType(),
		});
	}

	if (tv.last_air_date) {
		facts.push({
			id: "last-aired",
			label: m.plucky_sage_cedar(),
			value: formatDate(tv.last_air_date, locale, {
				day: "numeric",
				month: "short",
				year: "numeric",
			}),
		});
	}

	const ageRating = getAgeRating(tv, region);
	if (ageRating) {
		facts.push({
			id: "age-rating",
			label: m.bright_green_canyon(),
			value: (
				<FlagValue code={ageRating.iso_3166_1}>{ageRating.rating}</FlagValue>
			),
		});
	}

	const alternativeTitles = prepareAlternativeTitles(
		tv.alternative_titles?.results ?? [],
		{ exclude: [tv.name, tv.original_name], region },
	);
	if (alternativeTitles.length > 0) {
		facts.push({
			id: "alternative-titles",
			label: m.noble_cobalt_saddle(),
			value: <AlternativeTitles titles={alternativeTitles} />,
		});
	}

	return facts;
}
