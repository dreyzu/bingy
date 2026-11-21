import { HeadContent, Outlet, useRouteContext } from "@tanstack/react-router";
import { Fragment, lazy, Suspense } from "react";
import Header from "./header";
import { GlobalLoadingIndicator } from "./loading/loading-global";

// Read import.meta.env directly rather than through config: Vite inlines it
// at build time, so production builds drop the devtools chunk entirely.
const Devtools =
	import.meta.env.VITE_APP_ENV !== "production"
		? lazy(() => import("./devtools"))
		: null;

export function RootComponent() {
	// The route context switches account once the route guards have run for
	// the new one. Remounting on that change drops every bit of component state
	// (forms, dialogs) that was built for the previous account.
	const { authData } = useRouteContext({ from: "__root__" });
	const accountKey = authData?.user.id ?? "signed-out";

	return (
		<div>
			<HeadContent />
			<Fragment key={accountKey}>
				<Header />
				<div className="flex flex-col min-h-dvh py-20 lg:py-30 w-full px-4 md:px-6 lg:px-0 lg:max-w-240 xl:max-w-280 3xl:max-w-300 lg:mx-auto">
					<Outlet />
					<GlobalLoadingIndicator />
				</div>
			</Fragment>
			{Devtools ? (
				<Suspense>
					<Devtools />
				</Suspense>
			) : null}
		</div>
	);
}
