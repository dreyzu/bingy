import type { Schemas } from "shared";

export type CastWithCharacters = Schemas.CastMember & { characters?: string[] };
export type CrewWithJobs = Schemas.CrewMember & { jobs?: string[] };

/** Aggregate TV cast as cast members, with every character they played. */
export function toCastWithCharacters(
	cast: Schemas.TvAggregatedCredits["cast"],
): CastWithCharacters[] {
	return cast.map((member) => ({
		id: member.id,
		name: member.name,
		adult: member.adult,
		gender: member.gender,
		known_for_department: member.known_for_department,
		original_name: member.original_name,
		popularity: member.popularity,
		profile_path: member.profile_path,
		cast_id: member.id,
		character: member.roles?.[0]?.character || "",
		credit_id: member.roles?.[0]?.credit_id || "",
		order: member.order,
		characters: member.roles?.map((r) => r.character).filter(Boolean) || [],
	}));
}

/** Aggregate TV crew as crew members, with every job they held. */
export function toCrewWithJobs(
	crew: Schemas.TvAggregatedCredits["crew"],
): CrewWithJobs[] {
	return crew.map((member) => ({
		id: member.id,
		name: member.name,
		adult: member.adult,
		gender: member.gender,
		known_for_department: member.known_for_department,
		department: member.department,
		original_name: member.original_name,
		popularity: member.popularity,
		profile_path: member.profile_path,
		credit_id: member.jobs?.[0]?.credit_id || "",
		job: member.jobs?.[0]?.job || "",
		jobs: member.jobs?.map((j) => j.job).filter(Boolean) || [],
	}));
}
