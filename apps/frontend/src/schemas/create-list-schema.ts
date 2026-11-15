import z from "zod";
import { m } from "@/paraglide/messages";

export const createListSchema = z.object({
	name: z
		.string()
		.min(1, m.earthy_plum_barn())
		.max(200, m.hardy_olive_mirror({ maxCharsNumber: 200 })),
	description: z
		.string()
		.max(2000, m.gallant_olive_wombat({ maxCharsNumber: 2000 }))
		.optional(),
	type: z.enum(["unranked", "ranked"]),
	visibility: z.enum(["public", "limited", "private"]),
});
