import type { Schemas } from "shared";
import {
	AlternativeTitles,
	CountryBadges,
	FactBadges,
	type MediaFact,
	prepareAlternativeTitles,
} from "@/components/medias/media-facts";
import { m } from "@/paraglide/messages";
import { formatSpokenLanguages, getLanguageName } from "@/utils/display-names";

function formatUsd(amount: number, locale: string) {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "USD",
		notation: "compact",
		maximumFractionDigits: 1,
	}).format(amount);
}

/** Rows of the movie "Details" tab. Rows without data are left out. */
export function getMovieFacts(
	movie: Schemas.MovieDetails,
	{ locale, region }: { locale: string; region: string },
): MediaFact[] {
	const facts: MediaFact[] = [];

	if (movie.production_companies.length > 0) {
		facts.push({
			id: "studios",
			label: m.joyful_pearl_penguin(),
			value: (
				<FactBadges
					items={movie.production_companies.map((company) => ({
						key: company.id,
						label: company.name,
					}))}
				/>
			),
		});
	}

	if (movie.production_countries.length > 0) {
		facts.push({
			id: "countries",
			label: m.lucky_scarlet_cactus(),
			value: (
				<CountryBadges countries={movie.production_countries} locale={locale} />
			),
		});
	}

	const primaryLanguage = getLanguageName(movie.original_language, locale);
	if (primaryLanguage) {
		facts.push({
			id: "primary-language",
			label: m.alert_gray_dune(),
			value: primaryLanguage,
		});
	}

	const spokenLanguages = formatSpokenLanguages(movie.spoken_languages, locale);
	if (spokenLanguages) {
		facts.push({
			id: "spoken-languages",
			label: m.balmy_coral_quail(),
			value: spokenLanguages,
		});
	}

	// TMDB returns 0 when the amount is unknown
	if (movie.budget > 0) {
		facts.push({
			id: "budget",
			label: m.sturdy_lime_anchor(),
			value: formatUsd(movie.budget, locale),
		});
	}

	if (movie.revenue > 0) {
		facts.push({
			id: "revenue",
			label: m.jaunty_teal_fern(),
			value: formatUsd(movie.revenue, locale),
		});
	}

	const alternativeTitles = prepareAlternativeTitles(
		movie.alternative_titles?.titles ?? [],
		{ exclude: [movie.title, movie.original_title], region },
	);
	if (alternativeTitles.length > 0) {
		facts.push({
			id: "alternative-titles",
			label: m.gleeful_fuchsia_heron(),
			value: <AlternativeTitles titles={alternativeTitles} />,
		});
	}

	return facts;
}
