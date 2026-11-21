import { type CronWithAutocomplete, RedisClient } from "bun";
import env from "./env";
import { logger } from "./logger";

export type ScheduledJob = {
	/** Shown in the logs, and identifies the job's lock. */
	name: string;
	/** Cron expression or nickname, in UTC (e.g. "@hourly", "0 3 * * *"). */
	schedule: CronWithAutocomplete;
	run: () => Promise<void> | void;
};

/**
 * How long a run's lock is kept. It only has to outlast the clock difference
 * between backend instances: each scheduled time has its own lock.
 */
const LOCK_TTL_MS = 10 * 60 * 1000;

const redis = new RedisClient(env.REDIS_URL);

/**
 * Claims this scheduled run of the job. Every backend instance fires the job
 * at the same minute; only the first to claim it runs it. The lock is not
 * released after the run, so an instance whose clock is a bit late can't run
 * it a second time.
 */
async function claimRun(job: ScheduledJob) {
	const minute = Math.floor(Date.now() / 60_000) * 60_000;
	const key = `scheduler:${job.name}:${new Date(minute).toISOString()}`;
	const result = await redis.send("SET", [
		key,
		"1",
		"NX",
		"PX",
		String(LOCK_TTL_MS),
	]);
	return result === "OK";
}

/** Runs one scheduled occurrence of the job, unless another instance has. */
export async function runScheduledJob(job: ScheduledJob) {
	try {
		if (!(await claimRun(job))) {
			logger.debug({ job: job.name }, "Scheduled job already claimed");
			return;
		}
	} catch (error) {
		// Without the lock the job could run on every instance: skip it.
		logger.error({ err: error, job: job.name }, "Scheduled job not claimed");
		return;
	}

	const startedAt = performance.now();
	try {
		await job.run();
		logger.debug(
			{ job: job.name, ms: Math.round(performance.now() - startedAt) },
			"Scheduled job finished",
		);
	} catch (error) {
		logger.error({ err: error, job: job.name }, "Scheduled job failed");
	}
}

/**
 * Runs each job on its schedule. Each scheduled run happens once across all
 * backend instances, never overlaps the previous run of this instance, and
 * a failure is logged without stopping the job. Under `bun --hot`, jobs are
 * stopped and registered again on reload.
 */
export function startScheduler(jobs: ScheduledJob[]) {
	for (const job of jobs) {
		Bun.cron(job.schedule, () => runScheduledJob(job));
	}

	logger.info(`Scheduled jobs: ${jobs.map((job) => job.name).join(", ")}`);
}
