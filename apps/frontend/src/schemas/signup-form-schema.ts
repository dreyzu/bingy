import z from "zod";
import { m } from "@/paraglide/messages";

export const signUpFormSchema = z.object({
	name: z
		.string({
			error: (iss) =>
				iss.input === undefined
					? m.mighty_topaz_falcon()
					: m.primal_crimson_crystal(),
		})
		.trim()
		.min(2, { message: m.eager_cerise_dune() })
		.max(30, { message: m.chilly_onyx_aspen() })
		.regex(/^[a-zA-Z0-9._]+$/, {
			message: m.rustic_mint_coral(),
		})
		.regex(/^[a-zA-Z0-9].*[a-zA-Z0-9]$/, {
			message: m.jaunty_sienna_panda(),
		})
		.refine((val) => !val.includes(".."), {
			message: m.dusky_aqua_crystal(),
		}),
	email: z
		.email({
			error: (iss) =>
				iss.input === undefined
					? m.lush_amber_squirrel()
					: m.upbeat_topaz_jaguar(),
		})
		.min(3, { message: m.witty_plum_dolphin() })
		.max(256, { message: m.vivid_purple_crystal() }),
	password: z
		.string({
			error: (iss) =>
				iss.input === undefined
					? m.chilly_white_bamboo()
					: m.humble_saffron_maple(),
		})
		.min(8, { message: m.plucky_lime_iguana() })
		.max(256, { message: m.velvet_crimson_salmon() }),
});
