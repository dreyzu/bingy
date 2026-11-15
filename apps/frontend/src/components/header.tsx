import {
	IconDeviceTv,
	IconMovie,
	IconSearch,
	IconSmartHome,
} from "@tabler/icons-react";
import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { LocaleRegionDropdown } from "@/components/locale-region-dropdown";
import { ProfileDropdown } from "@/components/profile/profile-dropdown";
import { ProfileDrawer } from "@/components/profile-drawer";
import { SearchCommand } from "@/components/search/search-command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileBottomNav, MobileTopBar } from "@/components/ui/mobile-navbar";
import {
	MobileNavbarLogo,
	NavBody,
	Navbar,
	NavbarButton,
	NavbarLogo,
	NavItems,
} from "@/components/ui/resizable-navbar";
import { useShowTopMobileNavbar } from "@/hooks/useShowTopMobileNavbar";
import { m } from "@/paraglide/messages";

export default function Header() {
	const { authData } = useRouteContext({ from: "__root__" });
	const [searchOpen, setSearchOpen] = useState(false);
	const showTopMobileNavbar = useShowTopMobileNavbar();

	const allNavItems = [
		{
			name: m.kind_saffron_penguin(),
			link: authData ? "/home" : "/",
			requiresAuth: false,
			hideWhenAuth: false,
		},
		{
			name: m.proud_green_beaver(),
			link: "/movies" as const,
			requiresAuth: false,
			hideWhenAuth: false,
		},
		{
			name: m.fair_lemon_fox(),
			link: "/tv" as const,
			requiresAuth: false,
			hideWhenAuth: false,
		},
		{
			name: m.lively_crimson_daisy(),
			icon: <IconSearch className="h-4 w-4" />,
			onClick: () => setSearchOpen(true),
		},
	] as const;

	const desktopNavItems = allNavItems.filter((item) => {
		if ("requiresAuth" in item && item.requiresAuth && !authData) return false;
		if ("hideWhenAuth" in item && item.hideWhenAuth && authData) return false;
		return true;
	});

	const allMobileBottomItems = [
		{
			name: m.kind_saffron_penguin(),
			link: authData ? "/home" : "/",
			icon: <IconSmartHome className="h-6 w-6" />,
			requiresAuth: false,
		},
		{
			name: m.proud_green_beaver(),
			link: "/movies",
			icon: <IconMovie className="h-6 w-6" />,
			requiresAuth: false,
		},
		{
			name: m.fair_lemon_fox(),
			link: "/tv",
			icon: <IconDeviceTv className="h-6 w-6" />,
			requiresAuth: false,
		},
		{
			name: m.lively_crimson_daisy(),
			icon: <IconSearch className="h-6 w-6" />,
			onClick: () => setSearchOpen(true),
			requiresAuth: false,
		},
		{
			name: authData?.user.displayName ?? "",
			link: `/@${authData?.user.name}`,
			icon: (
				<Avatar className="h-6 w-6">
					<AvatarImage src={authData?.user.image ?? ""} />
					<AvatarFallback>{authData?.user.name ?? "U"}</AvatarFallback>
				</Avatar>
			),
			requiresAuth: true,
		},
	] as const;

	const mobileBottomItems = allMobileBottomItems.filter((item) => {
		if ("requiresAuth" in item && item.requiresAuth && !authData) return false;
		return true;
	});

	return (
		<>
			{/* Desktop Navigation */}
			<Navbar>
				<NavBody>
					<NavbarLogo />
					<NavItems items={desktopNavItems} />
					<div className="flex items-center gap-1">
						<LocaleRegionDropdown />

						{authData ? (
							<ProfileDropdown />
						) : (
							<NavbarButton to="/signin">{m.vivid_coral_cedar()}</NavbarButton>
						)}
					</div>
				</NavBody>
			</Navbar>

			{/* Mobile Top Bar */}
			{showTopMobileNavbar ? (
				<MobileTopBar
					left={
						authData ? (
							<ProfileDrawer />
						) : (
							<NavbarButton to="/signin" size="sm">
								{m.vivid_coral_cedar()}
							</NavbarButton>
						)
					}
					center={<MobileNavbarLogo />}
					right={<LocaleRegionDropdown />}
				/>
			) : null}

			{/* Mobile Bottom Navigation */}
			<MobileBottomNav items={mobileBottomItems} />
			<SearchCommand
				open={searchOpen}
				setOpen={setSearchOpen}
				showButton={false}
			/>
		</>
	);
}
