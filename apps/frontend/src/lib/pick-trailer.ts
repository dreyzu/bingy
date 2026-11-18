import type { Schemas } from "shared";

/**
 * Words that name a video as a trailer in the languages Bingy supports.
 * TMDB's `type` field is often wrong (featurettes and social media cuts are
 * tagged as trailers), so the video name is the more reliable signal.
 */
const TRAILER_NAME =
	/trailer|bande[\s-]annonce|tr[áa]iler|\bavance\b|予告|예고|预告|預告/iu;

/** Words that name a video as a teaser, a shorter cut before the trailer. */
const TEASER_NAME = /teaser|特報|ティー?ザー|티저|先导|先導/iu;

/** Words that name a video as the main trailer, used in Asian markets. */
const MAIN_TRAILER_NAME = /main trailer|메인 예고편|本予告|正式预告|正式預告/iu;

/**
 * Videos that TMDB tags as trailers but are not the trailer of the title:
 * fan edits, featurettes, clips, reviews, TV spots, music videos, etc.
 */
const NOT_A_TRAILER =
	/fan[\s-]?(edit|made|cut)|featurette|behind[\s-]the[\s-]scenes|making[\s-]of|\bclip\b|\bextrait|interview|entrevista|intervista|reaction|réaction|\breview|critique|recap|récap|explained|breakdown|honest trailer|\btv[\s-]spot|\bspot\b|sneak peek|lyric|music video|soundtrack|\bost\b|parody|parodie|hinter den kulissen|dietro le quinte|detr[áa]s de (c[áa]maras|escena)|bastidores|coulisses|幕后|幕後|메이킹|メイキング|特別映像/iu;

/**
 * Trailers that are worse as the default: subtitled versions (the user likely
 * prefers the dub in their own language) and special or re-release editions.
 */
const VARIANT =
	/\bv\.?o\.?s\.?[te]\b|\bv\.?o\.?s\.?t\.?fr?\b|\bvo\b|\bv\.o\.|sous[\s-]titr|subtitulad|legendad|sottotitolat|\bsub[\s-]?ita\b|\bomu\b|\bov\b|字幕|자막|imax|1\.43|70\s?mm|dolby|4dx|screenx|red[\s-]band|sdcc|comic[\s-]?con|countdown|\bj\s?-\s?\d+\b|카운트다운|re-?release|remaster|\b4k\b|anniversary|anniversaire|aniversario|anniversario|jubiläum/iu;

/**
 * Picks the YouTube trailer to show for a movie or TV show.
 *
 * Videos that are not trailers are dropped, whatever their TMDB type. The rest
 * are ranked by, in order:
 *
 * 1. Trust: unofficial videos whose name says neither trailer nor teaser
 *    (usually social media cuts) last, even in the user's language.
 * 2. Language: the user's language, then English, then any other language.
 * 3. Kind: videos named as the main trailer, then trailers, then teasers,
 *    then videos whose name says neither.
 * 4. Region: the user's region first (e.g. a pt-BR dub over a pt-PT one).
 * 5. Variant: plain versions before subtitled, IMAX, countdown, or
 *    re-release ones.
 * 6. Official videos first.
 * 7. Earliest first. Later trailers are mostly marketing cuts (final,
 *    countdown, international, fan edit, re-release), while the first one is
 *    the main trailer.
 *
 * @param languageTag The user's BCP 47 tag, for example `fr-FR` or `pt-BR`.
 */
export function pickTrailer(
	videos: readonly Schemas.Video[],
	languageTag: string,
): Schemas.Video | undefined {
	const [language = "", region = ""] = languageTag.split("-");

	const languageRank = (video: Schemas.Video) => {
		if (video.iso_639_1 === language) return 0;
		if (video.iso_639_1 === "en") return 1;
		return 2;
	};

	const kindRank = (video: Schemas.Video) => {
		if (TEASER_NAME.test(video.name)) return 2;
		if (MAIN_TRAILER_NAME.test(video.name)) return 0;
		if (TRAILER_NAME.test(video.name)) return 1;
		return video.type === "Trailer" ? 3 : 4;
	};

	const rank = (video: Schemas.Video) => [
		kindRank(video) >= 3 && !video.official ? 1 : 0,
		languageRank(video),
		kindRank(video),
		video.iso_3166_1?.toUpperCase() === region.toUpperCase() ? 0 : 1,
		VARIANT.test(video.name) ? 1 : 0,
		video.official ? 0 : 1,
	];

	return videos
		.filter(
			(video) =>
				video.site === "YouTube" &&
				(video.type === "Trailer" || video.type === "Teaser") &&
				!NOT_A_TRAILER.test(video.name),
		)
		.map((video) => ({ video, rank: rank(video) }))
		.sort(
			(a, b) =>
				compareRanks(a.rank, b.rank) ||
				a.video.published_at.localeCompare(b.video.published_at),
		)[0]?.video;
}

function compareRanks(a: number[], b: number[]) {
	for (let i = 0; i < a.length; i++) {
		const difference = (a[i] ?? 0) - (b[i] ?? 0);
		if (difference !== 0) return difference;
	}
	return 0;
}
