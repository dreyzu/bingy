import { TanstackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Outlet, useRouteContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Fragment } from "react";
import { config } from "@/lib/env";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import Header from "./header";
import { GlobalLoadingIndicator } from "./loading/loading-global";

export function RootComponent() {
	const isProd = config.appEnv === "production";
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
			{!isProd ? (
				<TanstackDevtools
					config={{
						position: "top-left",
						hideUntilHover: true,
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
			) : null}
		</div>
	);
}
