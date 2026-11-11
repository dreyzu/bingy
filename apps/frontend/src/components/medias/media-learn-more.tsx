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
		<Card>
			<CardContent className=" flex items-center gap-4">
				<IconExternalLink />
				<div>
					<p className="text-lg font-bold">
						<a
							href={tmdbUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline"
						>
							{m.plucky_saffron_wolf()}
						</a>
					</p>
					<p className="text-sm text-muted-foreground">
						{m.nifty_azure_hippo()}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
