import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "@/components/toast/toast";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";
import { authClient } from "@/lib/auth-client";
import { config } from "@/lib/env";
import { refreshSession } from "@/lib/queries/session";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_auth/verify-email")({
	component: VerifyEmailPage,
	beforeLoad: async ({ context }) => {
		// The email may have been verified from another tab or device.
		const freshSession = await refreshSession(context.queryClient);

		// Redirect verified users to welcome page
		if (freshSession?.user.emailVerified) {
			throw redirect({ to: "/welcome" });
		}
	},
});

function VerifyEmailPage() {
	const session = useSession();
	const [isResending, setIsResending] = useState(false);

	const handleResendEmail = async () => {
		if (!session?.user?.email) return;

		setIsResending(true);
		try {
			await authClient.sendVerificationEmail({
				email: session.user.email,
				callbackURL: `${config.appUrl}/welcome`,
			});
			toast.success({
				title: m.agile_umber_barn(),
				description: m.quiet_khaki_flute(),
			});
		} catch {
			toast.error({
				title: m.daring_lemon_fern(),
			});
		} finally {
			setIsResending(false);
		}
	};

	if (!session) {
		return null;
	}

	return (
		<div className="flex flex-col justify-center items-center gap-4">
			<Card className="min-w-full">
				<CardHeader>
					<CardTitle>{m.shiny_topaz_iguana()}</CardTitle>
					<CardDescription>{m.noble_yellow_prairie()}</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleResendEmail}
						disabled={isResending}
					>
						{isResending
							? m.noble_coral_planet()
							: m.zippy_green_tulip({ email: session.user.email })}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
