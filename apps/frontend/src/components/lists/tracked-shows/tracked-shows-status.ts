import { m } from "@/paraglide/messages";

export const getStatusLabel = (status: string) => {
	switch (status) {
		case "watching":
			return m.smart_wine_falcon();
		case "on_hold":
			return m.polite_silver_biscuit();
		case "dropped":
			return m.alert_rust_walrus();
		case "completed":
			return m.candid_mauve_wolf();
		default:
			return null;
	}
};
