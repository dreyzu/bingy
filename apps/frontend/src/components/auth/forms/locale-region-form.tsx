import { useAtomValue, useSetAtom } from "jotai";
import { useId } from "react";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	NativeSelect,
	NativeSelectOption,
} from "@/components/ui/native-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useMediaQuery } from "@/integrations/media-query";
import { localeAtom, setLocaleAtom } from "@/lib/atoms/locale";
import { regionAtom, SUPPORTED_REGIONS } from "@/lib/atoms/region";
import { m } from "@/paraglide/messages";
import { locales } from "@/paraglide/runtime";
import { getRegionName, LOCALE_LABELS } from "@/utils/locale-labels";

interface PickerFieldProps<T extends string> {
	label: string;
	description: string;
	value: T;
	options: readonly T[];
	getLabel: (value: T) => string;
	onChange: (value: T) => void;
}

/**
 * On touch devices, a native select opens the system picker, which is easier
 * to scroll and tap than a popup.
 */
function PickerField<T extends string>({
	label,
	description,
	value,
	options,
	getLabel,
	onChange,
}: PickerFieldProps<T>) {
	const id = useId();
	const isTouch = useMediaQuery("(pointer: coarse)");

	const handleChange = (next: unknown) => {
		const option = options.find((o) => o === next);
		if (option) onChange(option);
	};

	return (
		<Field orientation="responsive" className="gap-x-6 py-2">
			<FieldContent>
				<FieldLabel htmlFor={id}>{label}</FieldLabel>
				<FieldDescription>{description}</FieldDescription>
			</FieldContent>
			{isTouch ? (
				<NativeSelect
					id={id}
					value={value}
					onChange={(event) => handleChange(event.target.value)}
					className="@md/field-group:min-w-48"
				>
					{options.map((option) => (
						<NativeSelectOption key={option} value={option}>
							{getLabel(option)}
						</NativeSelectOption>
					))}
				</NativeSelect>
			) : (
				<Select value={value} onValueChange={handleChange}>
					<SelectTrigger id={id} className="@md/field-group:min-w-48">
						<SelectValue>{getLabel(value)}</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{options.map((option) => (
							<SelectItem key={option} value={option}>
								{getLabel(option)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
		</Field>
	);
}

export function LocaleRegionForm() {
	const locale = useAtomValue(localeAtom);
	const region = useAtomValue(regionAtom);
	const changeLocale = useSetAtom(setLocaleAtom);
	const changeRegion = useSetAtom(regionAtom);

	return (
		<FieldGroup className="gap-0">
			<PickerField
				label={m.bright_coral_heron()}
				description={m.jolly_aqua_whale()}
				value={locale}
				options={locales}
				getLabel={(tag) => LOCALE_LABELS[tag]}
				onChange={changeLocale}
			/>
			<Separator />
			<PickerField
				label={m.modest_khaki_fox()}
				description={m.shiny_umber_nectar()}
				value={region}
				options={SUPPORTED_REGIONS}
				getLabel={getRegionName}
				onChange={changeRegion}
			/>
		</FieldGroup>
	);
}
