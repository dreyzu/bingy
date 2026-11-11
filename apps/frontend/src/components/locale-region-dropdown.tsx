import { IconCheck, IconLanguage } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/integrations/media-query";
import { localeAtom, setLocaleAtom } from "@/lib/atoms/locale";
import { type Region, regionAtom, SUPPORTED_REGIONS } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";
import { type Locale, locales } from "@/paraglide/runtime";

const LOCALE_LABELS: Record<Locale, string> = {
	en: "English",
	fr: "Français",
	ko: "한국어",
	"zh-CN": "简体中文",
	"zh-TW": "繁體中文",
	"es-419": "Español (Latinoamérica)",
	"es-ES": "Español (España)",
	it: "Italiano",
	"pt-BR": "Português (Brasil)",
	"pt-PT": "Português (Portugal)",
};

const getRegionName = (region: Region): string => {
	switch (region) {
		case "FR":
			return m.vibrant_onyx_dolphin();
		case "CA":
			return m.sunny_mauve_basil();
		case "US":
			return m.bright_gray_cricket();
		case "GB":
			return m.tidy_copper_rabbit();
		case "AU":
			return m.jaunty_wine_eagle();
		case "KR":
			return m.witty_periwinkle_canyon();
		case "IT":
			return m.zippy_sage_nectar();
		case "MX":
			return m.swift_slate_mesa();
		case "ES":
			return m.vibrant_teal_planet();
		case "BR":
			return m.dusky_lemon_beaver();
		case "PT":
			return m.daring_bronze_blossom();
		case "TW":
			return m.modest_onyx_yak();
		default:
			return region;
	}
};

const LocaleRegionContent = () => {
	const locale = useAtomValue(localeAtom);
	const region = useAtomValue(regionAtom);
	const changeLocale = useSetAtom(setLocaleAtom);
	const changeRegion = useSetAtom(regionAtom);

	return (
		<div className="space-y-4">
			<div>
				<h3 className="mb-2 font-medium">{m.plucky_peach_acorn()}</h3>
				<div className="space-y-1">
					{locales.map((tag) => (
						<Button
							key={tag}
							variant={locale === tag ? "secondary" : "ghost"}
							className="w-full justify-start"
							onClick={() => changeLocale(tag)}
						>
							<span className="flex-1 whitespace-nowrap text-left">
								{LOCALE_LABELS[tag]}
							</span>
							{locale === tag ? <IconCheck className="h-4 w-4" /> : null}
						</Button>
					))}
				</div>
			</div>
			<div className="h-px bg-border" />
			<div>
				<h3 className="mb-2 font-medium">{m.noble_coral_rabbit()}</h3>
				<div className="space-y-1">
					{SUPPORTED_REGIONS.map((reg) => (
						<Button
							key={reg}
							variant={region === reg ? "secondary" : "ghost"}
							className="w-full justify-start"
							onClick={() => changeRegion(reg)}
						>
							<span className="flex-1 whitespace-nowrap text-left">
								{getRegionName(reg)}
							</span>
							{region === reg ? <IconCheck className="h-4 w-4" /> : null}
						</Button>
					))}
				</div>
			</div>
		</div>
	);
};

export const LocaleRegionDropdown = () => {
	const locale = useAtomValue(localeAtom);
	const region = useAtomValue(regionAtom);
	const changeLocale = useSetAtom(setLocaleAtom);
	const changeRegion = useSetAtom(regionAtom);
	const [open, setOpen] = useState(false);
	const isMobile = useMediaQuery("(pointer: coarse)");

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={setOpen} swipeDirection="up">
				<DrawerTrigger
					render={(props) => (
						<Button
							{...props}
							variant="ghost"
							size="icon"
							aria-label={m.crisp_onyx_barn()}
						>
							<IconLanguage />
						</Button>
					)}
				/>
				<DrawerContent>
					<DrawerBody>
						<div className="p-4">
							<LocaleRegionContent />
						</div>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" size="icon" aria-label={m.crisp_onyx_barn()}>
						<IconLanguage />
					</Button>
				}
			/>
			<DropdownMenuContent align="end" className="w-64">
				<DropdownMenuGroup>
					<DropdownMenuLabel>{m.plucky_peach_acorn()}</DropdownMenuLabel>
					<DropdownMenuRadioGroup value={locale} onValueChange={changeLocale}>
						{locales.map((tag) => (
							<DropdownMenuRadioItem
								key={tag}
								value={tag}
								className="whitespace-nowrap"
							>
								{LOCALE_LABELS[tag]}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuLabel>{m.noble_coral_rabbit()}</DropdownMenuLabel>
					<DropdownMenuRadioGroup value={region} onValueChange={changeRegion}>
						{SUPPORTED_REGIONS.map((reg) => (
							<DropdownMenuRadioItem key={reg} value={reg}>
								{getRegionName(reg)}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
