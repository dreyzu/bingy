import { RedisClient } from "bun";
import env from "./env";
import { logger } from "./logger";

/**
 * Real-time notification events, sent to every open stream of a user.
 * Events go through Redis pub/sub so a change made by one backend instance
 * reaches streams held by any other instance.
 */

/** Why the unread count was sent. */
export type NotificationEventReason =
	| "init"
	| "created"
	| "removed"
	| "read"
	| "updated";

export type NotificationEvent = {
	reason: NotificationEventReason;
	unreadCount: number;
};

type Listener = (event: NotificationEvent) => void;

const CHANNEL = "notifications";

// A subscribed Redis connection can't run other commands, so publishing
// needs its own connection.
const publisher = new RedisClient(env.REDIS_URL);
const subscriber = new RedisClient(env.REDIS_URL);

const listeners = new Map<string, Set<Listener>>();
let subscription: Promise<unknown> | null = null;

function dispatch(message: string) {
	let payload: { userId: string; event: NotificationEvent };
	try {
		payload = JSON.parse(message);
	} catch {
		return;
	}

	for (const listener of listeners.get(payload.userId) ?? []) {
		listener(payload.event);
	}
}

function ensureSubscribed() {
	subscription ??= subscriber.subscribe(CHANNEL, dispatch).catch((error) => {
		subscription = null;
		throw error;
	});
	return subscription;
}

/** Listens to a user's events. Returns the function that stops listening. */
export async function listenToUser(userId: string, listener: Listener) {
	await ensureSubscribed();

	let userListeners = listeners.get(userId);
	if (!userListeners) {
		userListeners = new Set();
		listeners.set(userId, userListeners);
	}
	userListeners.add(listener);

	return () => {
		userListeners.delete(listener);
		if (userListeners.size === 0) listeners.delete(userId);
	};
}

export async function publishToUser(userId: string, event: NotificationEvent) {
	try {
		await publisher.publish(CHANNEL, JSON.stringify({ userId, event }));
	} catch (error) {
		logger.error(error, "Failed to publish notification event");
	}
}
