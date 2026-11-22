import {
	IconBell,
	IconBrush,
	IconLock,
	IconUserCog,
} from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import type { Account } from "better-auth";
import { BlockedAccountsForm } from "@/components/auth/forms/blocked-accounts-form";
import { DeleteAccountForm } from "@/components/auth/forms/delete-account-form";
import { DisableTwoFactorForm } from "@/components/auth/forms/disable-two-factor-form";
import { EnableTwoFactorForm } from "@/components/auth/forms/enable-two-factor-form";
import { LocaleRegionForm } from "@/components/auth/forms/locale-region-form";
import { NotificationPreferencesForm } from "@/components/auth/forms/notification-preferences-form";
import { PrivateAccountForm } from "@/components/auth/forms/private-account-form";
import { UpdateEmailForm } from "@/components/auth/forms/update-email-form";
import { UpdatePasswordForm } from "@/components/auth/forms/update-password-form";
import { LinkAccountComponent } from "@/components/auth/link-account";
import { ThemePicker } from "@/components/theme/theme-picker";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/hooks/useSession";
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
	const session = useSession();
	const navigate = useNavigate();

	if (!session) return null;

	const hasPassword = accounts.some((c) => c.providerId === "credential");
	const twoFactorEnabled = session.user.twoFactorEnabled;

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
			<TabsList className="w-full sm:w-fit sm:self-center">
				<TabsTrigger value="account" className="group/tab">
					<IconUserCog />
					<span className="max-sm:group-not-data-active/tab:sr-only">
						{m.proud_emerald_dolphin()}
					</span>
				</TabsTrigger>
				<TabsTrigger value="privacy" className="group/tab">
					<IconLock />
					<span className="max-sm:group-not-data-active/tab:sr-only">
						{m.wild_periwinkle_mesa()}
					</span>
				</TabsTrigger>
				<TabsTrigger value="notifications" className="group/tab">
					<IconBell />
					<span className="max-sm:group-not-data-active/tab:sr-only">
						{m.swift_cerise_octopus()}
					</span>
				</TabsTrigger>
				<TabsTrigger value="display" className="group/tab">
					<IconBrush />
					<span className="max-sm:group-not-data-active/tab:sr-only">
						{m.fierce_sage_galaxy()}
					</span>
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
			<TabsContent value="privacy">
				<Card className="p-4">
					<CardTitle>{m.zippy_hazel_orchid()}</CardTitle>
					<CardDescription>{m.humble_yellow_quail()}</CardDescription>
					<Separator />
					<PrivateAccountForm />
					<Separator />
					<BlockedAccountsForm />
				</Card>
			</TabsContent>
			<TabsContent value="notifications">
				<Card className="p-4">
					<CardTitle>{m.dapper_topaz_canyon()}</CardTitle>
					<CardDescription>{m.kind_mauve_meerkat()}</CardDescription>
					<Separator />
					<NotificationPreferencesForm />
				</Card>
			</TabsContent>
			<TabsContent value="display">
				<Card className="p-4">
					<CardTitle>{m.hazy_azure_island()}</CardTitle>
					<CardDescription>{m.kind_white_jasmine()}</CardDescription>
					<Separator />
					<ThemePicker />
					<Separator />
					<LocaleRegionForm />
				</Card>
			</TabsContent>
		</Tabs>
	);
}
