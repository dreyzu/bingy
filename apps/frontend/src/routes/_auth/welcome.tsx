import {
	createFileRoute,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_auth/welcome")({
	component: WelcomePage,
	beforeLoad: ({ context }) => {
		// Redirect unverified users to verify-email page
		// Note: verify-email already refetches and updates cache before redirecting here
		if (context.authData?.user && !context.authData.user.emailVerified) {
			throw redirect({ to: "/verify-email" });
		}
	},
});

function WelcomePage() {
	const { authData } = useRouteContext({ from: "__root__" });

	if (!authData) return null;

	if (!authData.user?.emailVerified) return null;

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-3xl font-bold mt-2">
				{m.tender_lime_badger({
					username: authData.user.displayName ?? authData.user.name,
				})}
			</h1>
			<Card>
				<CardHeader>
					<CardTitle>{m.bold_emerald_crystal()}</CardTitle>
				</CardHeader>
			</Card>
		</div>
	);
}
