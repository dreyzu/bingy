import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { m } from "@/paraglide/messages";

interface ProfileNavProps {
	username: string;
}

export function ProfileNav({ username }: ProfileNavProps) {
	const navRef = useRef<HTMLElement>(null);

	const handleMouseDown = (e: React.MouseEvent) => {
		const nav = navRef.current;
		if (!nav) return;

		const startX = e.pageX - nav.offsetLeft;
		const scrollLeft = nav.scrollLeft;

		const handleMouseMove = (e: MouseEvent) => {
			const x = e.pageX - nav.offsetLeft;
			const walk = (x - startX) * 2;
			nav.scrollLeft = scrollLeft - walk;
		};

		const handleMouseUp = () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	return (
		<nav
			ref={navRef}
			onMouseDown={handleMouseDown}
			className="flex gap-6 border-b overflow-x-auto scrollbar-hide select-none"
		>
			<Link
				to="/@{$username}"
				params={{ username }}
				className="pb-3 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
				activeProps={{
					className: "pb-3 text-foreground border-b-2 border-brand",
				}}
				activeOptions={{ exact: true }}
			>
				{m.modest_plum_walrus()}
			</Link>
			<Link
				to="/@{$username}/watchlist"
				params={{ username }}
				className="pb-3 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
				activeProps={{
					className: "pb-3 text-foreground border-b-2 border-brand",
				}}
			>
				{m.elegant_jade_dolphin()}
			</Link>
			<Link
				to="/@{$username}/history"
				params={{ username }}
				className="pb-3 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
				activeProps={{
					className: "pb-3 text-foreground border-b-2 border-brand",
				}}
			>
				{m.grand_khaki_lynx()}
			</Link>
			<Link
				to="/@{$username}/favorites"
				params={{ username }}
				className="pb-3 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
				activeProps={{
					className: "pb-3 text-foreground border-b-2 border-brand",
				}}
			>
				{m.lucky_ruby_prairie()}
			</Link>
			<Link
				to="/@{$username}/in-progress"
				params={{ username }}
				className="pb-3 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
				activeProps={{
					className: "pb-3 text-foreground border-b-2 border-brand",
				}}
			>
				{m.wise_lilac_rocket()}
			</Link>
			<Link
				to="/@{$username}/lists"
				params={{ username }}
				className="pb-3 text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
				activeProps={{
					className: "pb-3 text-foreground border-b-2 border-brand",
				}}
			>
				{m.fluffy_cerise_cactus()}
			</Link>
		</nav>
	);
}
