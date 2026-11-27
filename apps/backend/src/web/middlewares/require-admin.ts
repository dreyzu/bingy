import type { Context, Next } from "hono";
import { StatusCodes } from "http-status-codes";
import type { auth } from "../../lib/auth";
import { serveUnauthorized } from "../../lib/responses/error";

type SessionUser = typeof auth.$Infer.Session.user;

/** Lets the request through only for a signed-in admin. Runs after `sessionMiddleware`. */
export const requireAdmin = async (c: Context, next: Next) => {
	const user = c.get("user") as SessionUser | null;
	if (!user) return serveUnauthorized(c);
	if (user.role !== "admin") {
		return c.json({ error: "FORBIDDEN" }, StatusCodes.FORBIDDEN);
	}
	return next();
};
