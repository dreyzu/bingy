import { z } from "zod";
import { m } from "@/paraglide/messages";

export const profileSchema = z.object({
	bio: z.string().max(160, m.clever_ruby_crystal({ maxChars: 160 })),
	location: z.string().max(30, m.daring_sapphire_bridge({ maxChars: 30 })),
});
