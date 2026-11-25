import { IconExternalLink } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { m } from "@/paraglide/messages";

interface MediaLearnMoreProps {
	id: number;
	mediaType: "movie" | "tv";
}

export function MediaLearnMoreCard({ id, mediaType }: MediaLearnMoreProps) {
	const tmdbUrl = `https://www.themoviedb.org/${mediaType}/${id}`;

	return (
		<a href={tmdbUrl} target="_blank" rel="noopener noreferrer">
			<Card className="h-full transition-colors hover:bg-accent">
				<CardContent className="flex items-center gap-4">
					<IconExternalLink />
					<div>
						<p className="text-lg font-bold">{m.plucky_saffron_wolf()}</p>
						<p className="text-sm text-muted-foreground">
							{m.nifty_azure_hippo()}
						</p>
					</div>
				</CardContent>
			</Card>
		</a>
	);
}
