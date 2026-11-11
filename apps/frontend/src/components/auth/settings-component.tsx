import { IconBrush, IconUserCog } from "@tabler/icons-react";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import type { Account } from "better-auth";
import { DeleteAccountForm } from "@/components/auth/forms/delete-account-form";
import { DisableTwoFactorForm } from "@/components/auth/forms/disable-two-factor-form";
import { EnableTwoFactorForm } from "@/components/auth/forms/enable-two-factor-form";
import { UpdateEmailForm } from "@/components/auth/forms/update-email-form";
import { UpdatePasswordForm } from "@/components/auth/forms/update-password-form";
import { LinkAccountComponent } from "@/components/auth/link-account";
import { ModeToggle } from "@/components/theme/theme-toggle";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { m } from "@/paraglide/messages";
import type { SettingsTab } from "@/routes/_auth/settings";

interface SettingsComponentProps {
	accounts: Account[];
	currentTab: SettingsTab;
}

export function SettingsComponent({
	accounts,
	currentTab,
}: SettingsComponentProps) {
	const { authData } = useRouteContext({ from: "__root__" });
	const navigate = useNavigate();

	if (!authData) return null;

	const hasPassword = accounts.some((c) => c.providerId === "credential");
	const twoFactorEnabled = authData.user.twoFactorEnabled;

	return (
		<Tabs
			value={currentTab}
			onValueChange={(value) => {
				navigate({
					to: "/settings",
					search: { tab: value as SettingsTab },
				});
			}}
		>
			<TabsList className="self-center">
				<TabsTrigger value="account">
					<IconUserCog />
					{m.proud_emerald_dolphin()}
				</TabsTrigger>
				<TabsTrigger value="display">
					<IconBrush />
					{m.fierce_sage_galaxy()}
				</TabsTrigger>
			</TabsList>
			<TabsContent value="account">
				<Card className="p-4">
					<CardTitle>{m.bubbly_aqua_puma()}</CardTitle>
					<CardDescription>{m.happy_khaki_iguana()}</CardDescription>
					<Separator />
					<LinkAccountComponent accounts={accounts} />
					<Separator />
					{hasPassword && !twoFactorEnabled ? (
						<>
							<EnableTwoFactorForm />
							<Separator />
						</>
					) : null}
					{twoFactorEnabled ? (
						<>
							<DisableTwoFactorForm />
							<Separator />
						</>
					) : null}
					<UpdateEmailForm />
					<Separator />
					<UpdatePasswordForm hasPassword={hasPassword} />
					<Separator />
					<DeleteAccountForm hasPassword={hasPassword} />
				</Card>
			</TabsContent>
			<TabsContent value="display">
				<Card className="p-4">
					<CardTitle>{m.hazy_azure_island()}</CardTitle>
					<CardDescription>{m.kind_white_jasmine()}</CardDescription>
					<div className="flex flex-col py-2">
						<ModeToggle />
					</div>
				</Card>
			</TabsContent>
		</Tabs>
	);
}
