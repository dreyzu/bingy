import { useCallback, useMemo, useState } from "react";
import { m } from "@/paraglide/messages";
import { CreditCard, CreditCardGrid } from "./credit-card";
import {
	type CreditRole,
	type CrewCreditPerson,
	mergeCreditPeople,
} from "./credit-people";
import { CrewModal } from "./crew-modal";

interface CrewCreditsSectionProps {
	people: CrewCreditPerson[];
	title?: string;
	/**
	 * Whether clicking a card opens the person's details. Turn it off when the
	 * card already shows everything, so it links straight to the profile.
	 */
	showDetails?: boolean;
}

function crewRoleText(jobs: CreditRole[]) {
	const [primaryJob] = jobs;
	if (!primaryJob) return "";
	return jobs.length > 1
		? m.nifty_hazel_maple({
				primaryJob: primaryJob.name,
				numberOfOtherJobs: jobs.length - 1,
			})
		: primaryJob.name;
}

/** Groups people by department, merging each person's jobs within one. */
function groupByDepartment(people: CrewCreditPerson[]) {
	const byDepartment = new Map<string, CrewCreditPerson[]>();
	for (const person of people) {
		const department = person.department || "Other";
		const departmentPeople = byDepartment.get(department) ?? [];
		departmentPeople.push(person);
		byDepartment.set(department, departmentPeople);
	}
	return Array.from(byDepartment, ([department, departmentPeople]) => ({
		department,
		people: mergeCreditPeople(departmentPeople),
	}));
}

export function CrewCreditsSection({
	people,
	title = m.quiet_orange_anchor(),
	showDetails = true,
}: CrewCreditsSectionProps) {
	const departments = useMemo(() => groupByDepartment(people), [people]);
	const totalCount = useMemo(
		() => new Set(people.map((person) => person.id)).size,
		[people],
	);
	const [selected, setSelected] = useState<CrewCreditPerson | null>(null);
	const [open, setOpen] = useState(false);

	const handleSelect = useCallback((person: CrewCreditPerson) => {
		setSelected(person);
		setOpen(true);
	}, []);

	if (!totalCount) return null;

	return (
		<section className="flex flex-col gap-8">
			<h2 className="text-2xl font-bold">
				{title} ({totalCount})
			</h2>
			{departments.map(({ department, people: departmentPeople }) => (
				<div key={department} className="flex flex-col gap-4">
					<h3 className="text-xl font-semibold">{department}</h3>
					<CreditCardGrid>
						{departmentPeople.map((person) => (
							<CreditCard
								key={person.id}
								person={person}
								role={crewRoleText(person.roles)}
								onSelect={showDetails ? handleSelect : undefined}
							/>
						))}
					</CreditCardGrid>
				</div>
			))}
			{showDetails ? (
				<CrewModal person={selected} open={open} onOpenChange={setOpen} />
			) : null}
		</section>
	);
}
