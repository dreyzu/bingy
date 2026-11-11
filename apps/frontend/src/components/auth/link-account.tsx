import { IconBrandGoogle } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import type { Account } from "better-auth";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { config } from "@/lib/env";
import { m } from "@/paraglide/messages";
import { toast } from "../toast/toast";
import { OAuthButton } from "../ui/oauth-button";

type LinkAccountComponentProps = {
	accounts: Account[];
};

export function LinkAccountComponent({ accounts }: LinkAccountComponentProps) {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);

	const googleConnected = accounts.some((c) => c.providerId === "google");

	const getButtonText = () => {
		if (isLoading) {
			return googleConnected
				? m.crisp_onyx_ember()
				: m.elegant_navy_salmon();
		}

		return googleConnected
			? m.humble_rust_tulip({ provider: "Google" })
			: m.candid_indigo_boulder({ provider: "Google" });
	};

	const handleLinkAccount = async (provider: "google") => {
		try {
			setIsLoading(true);

			if (googleConnected) {
				if (accounts.length <= 1) {
					toast.error({
						title: m.noble_lime_jasmine({ provider: "Google" }),
					});
					return;
				}

				const account = accounts?.find(
					(account) => account.providerId === "google",
				);

				if (account) {
					await authClient.unlinkAccount({ accountId: account.id });
				}

				toast.success({
					title: m.zippy_beige_bagel({ provider: "Google" }),
				});
				navigate({ to: "/settings" });
			} else {
				await authClient.linkSocial({
					provider,
					callbackURL: `${config.appUrl}/settings`,
					errorCallbackURL: `${config.appUrl}/settings`,
				});
			}
		} catch (err) {
			toast.error({ title: m.candid_beige_yak() });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="grid gap-2">
			<div>
				{googleConnected ? (
					<>
						<p className="text-md font-semibold leading-none tracking-tight">
							{m.quick_mauve_boulder()}
						</p>
						<p className="text-sm text-muted-foreground mt-1.5">
							{m.polite_coral_mirror()}
						</p>
					</>
				) : (
					<>
						<p className="text-md font-semibold leading-none tracking-tight">
							{m.calm_sage_mesa()}
						</p>
						<p className="text-sm text-muted-foreground mt-1.5">
							{m.mighty_green_yak()}
						</p>
					</>
				)}
			</div>

			<OAuthButton
				icon={IconBrandGoogle}
				label="Google"
				text={getButtonText()}
				onClick={() => handleLinkAccount("google")}
				disabled={isLoading}
			/>
		</div>
	);
}
