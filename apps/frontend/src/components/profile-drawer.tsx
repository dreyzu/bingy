import {
	IconAdjustmentsHorizontal,
	IconBrandGithub,
	IconClockBolt,
	IconExternalLink,
	IconHeart,
	IconHistory,
	IconLifebuoy,
	IconList,
	IconLogout,
	IconUser,
} from "@tabler/icons-react";
import {
	useNavigate,
	useRouteContext,
	useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { MobileProfileTriggerButton } from "@/components/mobile-profile-trigger";
import { toast } from "@/components/toast/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { queryClient } from "@/integrations/tanstack-query/root-provider";
import { authClient } from "@/lib/auth-client";
import { sessionQueryOptions } from "@/lib/queries/session";
import { m } from "@/paraglide/messages";

export function ProfileDrawer() {
	const { authData } = useRouteContext({ from: "__root__" });
	const navigate = useNavigate();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);

	if (!authData) return null;
	const username = authData.user.name;
	const displayName = authData.user.displayName;
	const image = authData.user.image;

	const logout = async () => {
		await authClient.signOut();

		queryClient.setQueryData(sessionQueryOptions.queryKey, null);
		queryClient.removeQueries({ queryKey: ["accounts"] });

		toast.success({ title: m.epic_azure_mesa() });

		await router.navigate({ to: "/" });
	};

	return (
		<Drawer swipeDirection="left" open={isOpen} onOpenChange={setIsOpen}>
			<DrawerTrigger
				render={(props) => <MobileProfileTriggerButton {...props} />}
			/>
			<DrawerContent className="focus:outline-none focus-visible:outline-none *:focus:outline-none">
				<DrawerHeader className="px-6">
					<Avatar
						className="w-16 h-16 object-cover rounded-full"
						onClick={() => {
							setIsOpen(false);
							navigate({
								to: "/@{$username}",
								params: { username },
							});
						}}
					>
						<AvatarImage src={image || ""} alt={displayName ?? username} />
						<AvatarFallback className="rounded-full">
							{username ? username.charAt(0) : "U"}
						</AvatarFallback>
					</Avatar>
					<DrawerTitle className="line-clamp-1 leading-relaxed">
						{displayName}
					</DrawerTitle>
					<DrawerDescription className="line-clamp-1 leading-relaxed">
						{authData.user.email}
					</DrawerDescription>
				</DrawerHeader>
				<DrawerBody>
					<Separator />
					<div className="flex flex-col items-center my-4 gap-4 px-3">
						<Button
							className="w-full justify-start"
							variant="ghost"
							onClick={() => {
								setIsOpen(false);
								navigate({
									to: "/@{$username}",
									params: { username },
								});
							}}
						>
							<IconUser />
							{m.candid_azure_pine()}
						</Button>
						<Button
							className="w-full justify-start"
							variant="ghost"
							onClick={() => {
								setIsOpen(false);
								navigate({
									to: "/@{$username}/watchlist",
									params: { username },
								});
							}}
						>
							<IconClockBolt />
							{m.lush_tan_pelican()}
						</Button>
						<Button
							className="w-full justify-start"
							variant="ghost"
							onClick={() => {
								setIsOpen(false);
								navigate({
									to: "/@{$username}/lists",
									params: { username },
								});
							}}
						>
							<IconList />
							{m.peppy_pink_falcon()}
						</Button>
						<Button
							className="w-full justify-start"
							variant="ghost"
							onClick={() => {
								setIsOpen(false);
								navigate({
									to: "/@{$username}/favorites",
									params: { username },
								});
							}}
						>
							<IconHeart />
							{m.gentle_saffron_yak()}
						</Button>
						<Button
							className="w-full justify-start"
							variant="ghost"
							onClick={() => {
								setIsOpen(false);
								navigate({
									to: "/@{$username}/history",
									params: { username },
								});
							}}
						>
							<IconHistory />
							{m.plucky_lime_island()}
						</Button>
						<Button
							className="w-full justify-start"
							variant="ghost"
							onClick={() => {
								setIsOpen(false);
								navigate({
									to: "/settings",
								});
							}}
						>
							<IconAdjustmentsHorizontal />
							{m.daring_lime_meerkat()}
						</Button>
						<Button className="w-full" variant="ghost">
							<a
								href="https://github.com/dreyzu/bingy"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-between w-full"
							>
								<div className="flex items-center gap-2">
									<IconBrandGithub className="w-4 h-4" />
									<span>GitHub</span>
								</div>
								<IconExternalLink className="w-4 h-4 text-muted-foreground" />
							</a>
						</Button>
						<Button disabled className="w-full justify-start" variant="ghost">
							<IconLifebuoy className="w-4 h-4" />
							<span>{m.primal_slate_barn()}</span>
						</Button>
					</div>
					<Separator />
				</DrawerBody>
				<DrawerFooter>
					<Button onClick={logout} variant="destructive" className="w-full">
						<IconLogout className="w-4 h-4" />
						<span>{m.chilly_plum_jaguar()}</span>
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
