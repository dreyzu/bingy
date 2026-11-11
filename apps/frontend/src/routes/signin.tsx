import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { SignInForm } from "@/components/auth/forms/signin-form";
import { CenteredLayout } from "@/components/layout/centered-layout";
import { toast } from "@/components/toast/toast";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/signin")({
	validateSearch: z.object({
		redirect: z.string().optional().catch(""),
		error: z.string().optional(),
	}),
	beforeLoad: async ({ context }) => {
		if (context.authData?.user) {
			throw redirect({ to: "/home" });
		}
	},
	component: SigninPage,
});

function SigninPage() {
	const search = Route.useSearch();

	// these errors happens after being redirected from backend
	// eg: oauth sign-in/sign-up with an invalid/not verified email by google
	//     token to verify email/reset password expired or not present/invalid
	const defaultMessage = m.snappy_tan_arrow();
	const errorMessages: Record<string, string> = {
		auth_failed: m.quick_rose_compass(),
		email_required: m.proud_jade_galaxy({ provider: "Google" }),
		token_expired_or_invalid: m.brisk_white_wombat(),
		no_token: m.golden_yellow_sunflower(),
		default: defaultMessage,
	};

	const message = errorMessages[search.error ?? "default"] ?? defaultMessage;

	if (search.error) {
		toast.error({ title: message });
	}

	return (
		<CenteredLayout>
			<SignInForm />
		</CenteredLayout>
	);
}
