import { useEffect } from "react";
import { z } from "zod";

/** Id of the crew section element on credits pages. */
export const CREW_SECTION_ID = "crew";

/** Search params of the credits pages: `section` picks where to land. */
export const creditsSearchSchema = z.object({
	section: z.enum(["crew"]).optional().catch(undefined),
});

export type CreditsSection = z.infer<typeof creditsSearchSchema>["section"];

/**
 * Scrolls to the crew section once the credits are loaded, when the page was
 * opened with `section=crew`. The section only exists after loading, so this
 * cannot happen on navigation.
 */
export function useScrollToCrewSection(
	section: CreditsSection,
	isLoaded: boolean,
) {
	useEffect(() => {
		if (!isLoaded || section !== "crew") return;
		document
			.getElementById(CREW_SECTION_ID)
			?.scrollIntoView({ block: "start" });
	}, [section, isLoaded]);
}
