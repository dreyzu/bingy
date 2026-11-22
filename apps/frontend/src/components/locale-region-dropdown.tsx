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
import { regionAtom, SUPPORTED_REGIONS } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";
import { locales } from "@/paraglide/runtime";
import { getRegionName, LOCALE_LABELS } from "@/utils/locale-labels";

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
