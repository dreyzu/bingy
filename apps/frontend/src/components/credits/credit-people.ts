import type { Pretty, Schemas } from "shared";

/** A character or a job, with its episode count on aggregated TV credits. */
export interface CreditRole {
	name: string;
	episodeCount?: number;
}

/** A cast member as shown on credits pages, whatever the credits source. */
export interface CastCreditPerson {
	id: number;
	name: string;
	profilePath: string | null;
	roles: CreditRole[];
}

/** A crew member as shown on credits pages, whatever the credits source. */
export interface CrewCreditPerson extends CastCreditPerson {
	department: string;
}

type CastCredit = Pretty<Omit<Schemas.CastMember, "cast_id">>;

const byEpisodeCountDesc = (a: CreditRole, b: CreditRole) =>
	(b.episodeCount ?? 0) - (a.episodeCount ?? 0);

export function castFromCredits(people: CastCredit[]): CastCreditPerson[] {
	return people.map((person) => ({
		id: person.id,
		name: person.name,
		profilePath: person.profile_path,
		roles: person.character ? [{ name: person.character }] : [],
	}));
}

export function castFromAggregatedCredits(
	people: Schemas.CastPersonInAggregatedTvCredits[],
): CastCreditPerson[] {
	return people.map((person) => ({
		id: person.id,
		name: person.name,
		profilePath: person.profile_path,
		roles: person.roles
			.filter((role) => role.character)
			.map((role) => ({
				name: role.character,
				episodeCount: role.episode_count,
			}))
			.sort(byEpisodeCountDesc),
	}));
}

export function crewFromCredits(
	people: Schemas.CrewMember[],
): CrewCreditPerson[] {
	return people.map((person) => ({
		id: person.id,
		name: person.name,
		profilePath: person.profile_path,
		department: person.department,
		roles: person.job ? [{ name: person.job }] : [],
	}));
}

export function crewFromAggregatedCredits(
	people: Schemas.CrewPersonInAggregatedTvCredits[],
): CrewCreditPerson[] {
	return people.map((person) => ({
		id: person.id,
		name: person.name,
		profilePath: person.profile_path,
		department: person.department,
		roles: person.jobs
			.filter((job) => job.job)
			.map((job) => ({ name: job.job, episodeCount: job.episode_count }))
			.sort(byEpisodeCountDesc),
	}));
}

/**
 * Merges the entries of the same person into one, keeping the first
 * occurrence's position and adding the roles it does not have yet.
 */
export function mergeCreditPeople<T extends CastCreditPerson>(
	people: T[],
): T[] {
	const byId = new Map<number, T>();
	for (const person of people) {
		const existing = byId.get(person.id);
		if (!existing) {
			byId.set(person.id, person);
			continue;
		}
		const names = new Set(existing.roles.map((role) => role.name));
		byId.set(person.id, {
			...existing,
			roles: [
				...existing.roles,
				...person.roles.filter((role) => !names.has(role.name)),
			],
		});
	}
	return Array.from(byId.values());
}
