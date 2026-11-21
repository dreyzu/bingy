import { createFileRoute } from "@tanstack/react-router";
import { NotificationList } from "@/components/notifications/notification-list";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_auth/notifications")({
	head: () => ({
		meta: [{ title: "Bingy - Notifications" }],
	}),
	component: NotificationsPage,
});

function NotificationsPage() {
	return (
		<div className="flex w-full flex-col gap-8">
			<NotificationList
				title={<h1 className="text-2xl font-bold">{m.lush_gold_quail()}</h1>}
			/>
		</div>
	);
}
