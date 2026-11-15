import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/goodbye")({
	component: GoodByePage,
});

function GoodByePage() {
	const navigate = useNavigate();
	return (
		<div>
			<div className="grid gap-4 text-center">
				<p>{m.vibrant_lime_cricket()}</p>
				<Button onClick={() => navigate({ to: "/" })}>
					{m.quick_jade_pelican()}
				</Button>
			</div>
		</div>
	);
}
