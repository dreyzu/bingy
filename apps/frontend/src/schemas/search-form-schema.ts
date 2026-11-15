import { z } from "zod";
import { m } from "@/paraglide/messages";

export const searchFormSchema = z.object({
	newQuery: z
		.string()
		.min(1, { message: m.agile_gray_wombat() })
		.max(300, { message: m.dreamy_green_mesa() }),
});
