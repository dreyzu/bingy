import { cn } from "cn";
import type { Schemas } from "shared";
import { m } from "@/paraglide/messages";
import { getProviderName } from "@/utils/utils";

interface WatchProvidersSectionProps {
	watchProviders: Schemas.WatchProviders | undefined;
	region?: Schemas.WatchProvidersCountry;
	className?: string;
	maxProviders?: number;
	title?: string;
	/** Which side of the provider name the logo sits on. */
	logoPosition?: "start" | "end";
}

export function WatchProvidersSection({
	watchProviders,
	region = "US",
	className,
	maxProviders = 1,
	title,
	logoPosition = "start",
}: WatchProvidersSectionProps) {
	const isLogoAtEnd = logoPosition === "end";

	const providers = watchProviders?.results[region];

	if (!providers?.flatrate?.length) {
		return null;
	}

	const displayedProviders = providers.flatrate.slice(0, maxProviders);

	return (
		<div className={cn("pb-3", className)}>
			{title ? (
				<div>
					<div className="text-lg font-semibold">{title}</div>
				</div>
			) : null}
			<div
				className={cn(
					"flex flex-row",
					isLogoAtEnd ? "justify-end" : "justify-center",
				)}
			>
				{displayedProviders.map((provider) => {
					const providerName = getProviderName(provider.provider_name);

					return (
						<a
							key={provider.provider_id}
							href={providers.link}
							target="_blank"
							rel="noopener noreferrer"
							className={cn(
								"flex items-center gap-2 hover:opacity-80 transition-opacity text-foreground",
								isLogoAtEnd && "flex-row-reverse",
							)}
						>
							{provider.logo_path && (
								<img
									src={
										provider.logo_path
											? `https://image.tmdb.org/t/p/original${provider.logo_path}`
											: undefined
									}
									alt={providerName}
									className="w-10 h-10 rounded"
								/>
							)}
							<div
								className={cn(
									"flex flex-col h-10 justify-center",
									isLogoAtEnd && "items-end",
								)}
							>
								<span className="text-sm leading-relaxed">
									{m.candid_rose_crystal()}
								</span>
								<span className="text-base font-bold leading-relaxed md:hidden">
									{providerName.length > 12
										? `${providerName.slice(0, 12)}...`
										: providerName}
								</span>
								<span className="text-base font-bold leading-relaxed hidden md:inline">
									{providerName}
								</span>
							</div>
						</a>
					);
				})}
			</div>
		</div>
	);
}
