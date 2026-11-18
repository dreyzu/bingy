/**
 * Builds the TMDB query for a movie or TV details request.
 *
 * When videos are appended, TMDB only returns the ones in `language`. Many
 * titles have no trailer in the user's language, so English videos and videos
 * without a language are requested too.
 */
export function detailsQuery(
	language: string | undefined,
	appendToResponse: string | undefined,
) {
	const appendsVideos = appendToResponse?.split(",").includes("videos");
	if (!appendsVideos) {
		return { language, append_to_response: appendToResponse };
	}

	const videoLanguages = new Set([language?.split("-")[0], "en", "null"]);
	videoLanguages.delete(undefined);

	return {
		language,
		append_to_response: appendToResponse,
		include_video_language: [...videoLanguages].join(","),
	};
}
