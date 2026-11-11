import { LoaderTwo } from "@/components/ui/loader";

type LoadingSectionProps = {
	title: string;
};

export function LoadingSection({ title }: LoadingSectionProps) {
	return (
		<section className="flex flex-col gap-4 min-h-124 pb-4">
			<h2 className="text-xl font-semibold">{title}</h2>
			<div className="flex items-center justify-center py-12 min-h-101">
				<LoaderTwo />
			</div>
		</section>
	);
}
