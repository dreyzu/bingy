import z from "zod";
import { m } from "@/paraglide/messages";

export const deleteAccountSchema = (hasPassword: boolean) =>
	z.object({
		password: hasPassword
			? z
					.string({
						error: (iss) =>
							iss.input === undefined
								? m.chilly_white_bamboo()
								: m.humble_saffron_maple(),
					})
					.min(8, { message: m.plucky_lime_iguana() })
					.max(256, { message: m.velvet_crimson_salmon() })
			: z.string().optional().or(z.literal("")),
	});
