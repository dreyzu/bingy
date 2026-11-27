import { RedisClient } from "bun";
import env from "./env";
import { logger } from "./logger";

const CACHE_DB = 1;

const cacheUrl = new URL(env.REDIS_URL);
cacheUrl.pathname = `/${CACHE_DB}`;

const cacheRedis = new RedisClient(cacheUrl.toString());

export const cacheClient = {
	get: async (key: string): Promise<string | null> => {
		try {
			const value = await cacheRedis.get(key);
			return value as string | null;
		} catch (error) {
			logger.error(error, `Cache get error for key ${key}`);
			return null;
		}
	},
	set: async (key: string, value: string, ttl?: number): Promise<void> => {
		try {
			await cacheRedis.set(key, value);
			if (ttl) {
				await cacheRedis.expire(key, ttl);
			}
		} catch (error) {
			logger.error(error, `Cache set error for key ${key}`);
		}
	},
	/** Values of `fields` in the hash at `key`, or null if Redis fails. */
	hmget: async (
		key: string,
		fields: string[],
	): Promise<Array<string | null> | null> => {
		try {
			return await cacheRedis.hmget(key, fields);
		} catch (error) {
			logger.error(error, `Cache hmget error for key ${key}`);
			return null;
		}
	},
	hset: async (
		key: string,
		values: Record<string, string>,
		ttl?: number,
	): Promise<void> => {
		try {
			await cacheRedis.hset(key, values);
			if (ttl) {
				await cacheRedis.expire(key, ttl);
			}
		} catch (error) {
			logger.error(error, `Cache hset error for key ${key}`);
		}
	},
	delete: async (key: string): Promise<void> => {
		try {
			await cacheRedis.del(key);
		} catch (error) {
			logger.error(error, `Cache delete error for key ${key}`);
		}
	},
	flush: async (): Promise<void> => {
		try {
			await cacheRedis.send("FLUSHDB", []);
		} catch (error) {
			logger.error(error, "Cache flush error");
		}
	},
};
