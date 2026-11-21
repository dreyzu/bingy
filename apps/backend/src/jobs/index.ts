import type { ScheduledJob } from "../lib/scheduler";
import { deleteExpiredNotificationsJob } from "./delete-expired-notifications";
import { deleteUnverifiedAccountsJob } from "./delete-unverified-accounts";

/** Every job run by the scheduler. Add new jobs here. */
export const jobs: ScheduledJob[] = [
	deleteExpiredNotificationsJob,
	deleteUnverifiedAccountsJob,
];
