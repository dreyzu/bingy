import { useRouter } from "@tanstack/react-router";
import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "./button";

interface BackButtonProps {
	children: ReactNode;
	className?: string;
	variant?: ComponentProps<typeof Button>["variant"];
}

export const BackButton = ({
	children,
	className,
	variant = "ghost",
}: BackButtonProps) => {
	const router = useRouter();

	if (!router.history.canGoBack()) return null;

	return (
		<Button
			onClick={() => router.history.back()}
			variant={variant}
			className={cn("rounded-xl", className)}
		>
			{children}
		</Button>
	);
};
