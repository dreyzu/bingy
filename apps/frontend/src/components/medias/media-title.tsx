import { normalizeTitle } from "@/utils/utils";

type MediaTitleProps = {
	title: string;
	originalTitle: string;
};

export function MediaTitle({ title, originalTitle }: MediaTitleProps) {
	const hasDifferentTitleInVO =
		normalizeTitle(originalTitle) !== normalizeTitle(title);

	return (
		<h1 className="w-full text-2xl lg:text-4xl font-bold leading-none">
			{title}
			<OriginalTitle title={originalTitle} visible={hasDifferentTitleInVO} />
		</h1>
	);
}

function OriginalTitle({
	title,
	visible,
}: {
	title?: string;
	visible: boolean;
}) {
	return visible ? (
		<span className="text-foreground text-base lg:text-xl font-normal italic">
			{" "}
			— {title}
		</span>
	) : null;
}
