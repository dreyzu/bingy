import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

export default function Devtools() {
	return (
		<TanStackDevtools
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
	);
}
