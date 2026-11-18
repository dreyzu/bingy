import type { Schemas } from "shared";

/**
 * Words that name a video as a trailer in the languages Bingy supports.
 * TMDB's `type` field is often wrong (featurettes and social media cuts are
 * tagged as trailers, trailers as clips), so the video name is the more
 * reliable signal.
 */
const TRAILER_NAME =
	/trailer|bande[\s-]annonce|tr[áa]iler|\bavance\b|予告|예고|预告|預告/iu;

/** Words that name a video as a teaser, a shorter cut before the trailer. */
const TEASER_NAME = /teaser|特報|ティー?ザー|티저|先导|先導/iu;

/** Words that name a video as the main trailer, used in Asian markets. */
const MAIN_TRAILER_NAME = /main trailer|메인 예고편|本予告|正式预告|正式預告/iu;

/**
 * Videos that are not the trailer of the title even when TMDB tags them as
 * trailers or their name mentions one: fan edits, featurettes, clips,
 * reviews, TV spots, livestreams, music videos, etc.
 */
const NOT_A_TRAILER =
	/fan[\s-]?(edit|made|cut)|featurette|behind[\s-]the[\s-]scenes|making[\s-]of|\bclip\b|\bextrait|interview|entrevista|intervista|reaction|réaction|\breview|critique|recap|récap|explained|breakdown|commentary|commentaire|코멘터리|recreation|honest trailer|\btv[\s-]spot|\bspot\b|sneak peek|live[\s-]?stream|lyric|music video|soundtrack|\bost\b|parody|parodie|hinter den kulissen|dietro le quinte|detr[áa]s de (c[áa]maras|escena)|bastidores|coulisses|幕后|幕後|메이킹|メイキング|特別映像/iu;

/**
 * Trailers that are worse as the default: original or subtitled versions (the
 * user likely prefers the dub in their own language) and special or
 * re-release editions.
 */
const VARIANT =
	/\bv\.?o\.?s\.?[te]\b|\bv\.?o\.?s\.?t\.?fr?\b|\bvo\b|\bv\.o\.|sous[\s-]titr|subtitulad|legendad|sottotitolat|\bsub[\s-]?ita\b|\bomu\b|\bov\b|字幕|자막|imax|1\.43|70\s?mm|dolby|4dx|screenx|red[\s-]band|sdcc|comic[\s-]?con|countdown|\bj\s?-\s?\d+\b|카운트다운|re-?release|remaster|\b4k\b|anniversary|anniversaire|aniversario|anniversario|jubiläum/iu;

export type TrailerKind = "main" | "trailer" | "teaser" | "unnamed";

export interface TrailerClassification {
	/** What the video name says it is. */
	kind: TrailerKind;
	/** Whether TMDB types the video as a trailer or a teaser. */
	typed: boolean;
	/** Whether the video is a subtitled, original, or special version. */
	variant: boolean;
}

/**
 * Whether a video can be the trailer of the title: a YouTube video that TMDB
 * types as a trailer or teaser, or whose name says it is one, and that is not
 * a featurette, clip, fan edit, etc.
 */
export function isTrailerCandidate(video: Schemas.Video) {
	if (video.site !== "YouTube" || NOT_A_TRAILER.test(video.name)) {
		return false;
	}
	return (
		isTrailerType(video) ||
		TRAILER_NAME.test(video.name) ||
		TEASER_NAME.test(video.name)
	);
}

/** Describes a trailer candidate from its name and TMDB type. */
export function classifyTrailer(video: Schemas.Video): TrailerClassification {
	return {
		kind: trailerKind(video.name),
		typed: isTrailerType(video),
		variant: VARIANT.test(video.name),
	};
}

/**
 * Ranks a trailer candidate for the user. Lower ranks are better and are
 * compared criterion by criterion:
 *
 * 1. Trust: videos TMDB types as trailers first. Then unofficial ones whose
 *    name says neither trailer nor teaser (usually social media cuts), even
 *    in the user's language. Then videos of another TMDB type whose name says
 *    trailer, as a last resort.
 * 2. Language: the user's language, then English, then any other language.
 * 3. Kind: videos named as the main trailer, then trailers, then teasers,
 *    then videos whose name says neither.
 * 4. Region: the user's region first (e.g. a pt-BR dub over a pt-PT one).
 * 5. Variant: dubbed or plain versions before original, subtitled, IMAX,
 *    countdown, or re-release ones.
 * 6. Official videos first.
 */
export function rankTrailer(
	video: Schemas.Video,
	{ language, region }: { language: string; region: string },
) {
	const { kind, typed, variant } = classifyTrailer(video);

	const trustRank = () => {
		if (!typed) return 2;
		return kind === "unnamed" && !video.official ? 1 : 0;
	};

	const languageRank = () => {
		if (video.iso_639_1 === language) return 0;
		if (video.iso_639_1 === "en") return 1;
		return 2;
	};

	const kindRank = () => {
		if (kind === "main") return 0;
		if (kind === "trailer") return 1;
		if (kind === "teaser") return 2;
		return video.type === "Trailer" ? 3 : 4;
	};

	return [
		trustRank(),
		languageRank(),
		kindRank(),
		video.iso_3166_1?.toUpperCase() === region.toUpperCase() ? 0 : 1,
		variant ? 1 : 0,
		video.official ? 0 : 1,
	];
}

/**
 * Picks the YouTube trailer to show for a movie or TV show: the best ranked
 * candidate (see `rankTrailer`), and the earliest one among equals. Later
 * trailers are mostly marketing cuts (final, countdown, international, fan
 * edit, re-release), while the first one is the main trailer.
 *
 * @param languageTag The user's BCP 47 tag, for example `fr-FR` or `pt-BR`.
 */
export function pickTrailer(
	videos: readonly Schemas.Video[],
	languageTag: string,
): Schemas.Video | undefined {
	const { language, region = "" } = new Intl.Locale(languageTag);

	return videos
		.filter(isTrailerCandidate)
		.map((video) => ({ video, rank: rankTrailer(video, { language, region }) }))
		.sort(
			(a, b) =>
				compareRanks(a.rank, b.rank) ||
				a.video.published_at.localeCompare(b.video.published_at),
		)[0]?.video;
}

function isTrailerType(video: Schemas.Video) {
	return video.type === "Trailer" || video.type === "Teaser";
}

function trailerKind(name: string): TrailerKind {
	if (TEASER_NAME.test(name)) return "teaser";
	if (MAIN_TRAILER_NAME.test(name)) return "main";
	if (TRAILER_NAME.test(name)) return "trailer";
	return "unnamed";
}

function compareRanks(a: number[], b: number[]) {
	for (let i = 0; i < a.length; i++) {
		const difference = (a[i] ?? 0) - (b[i] ?? 0);
		if (difference !== 0) return difference;
	}
	return 0;
}
