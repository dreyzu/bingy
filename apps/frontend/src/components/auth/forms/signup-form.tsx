import { zodResolver } from "@hookform/resolvers/zod";
import {
	IconBrandGoogleFilled,
	IconInfoCircle,
	IconLoader,
} from "@tabler/icons-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import type { z } from "zod";
import { toast } from "@/components/toast/toast";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MagicCard } from "@/components/ui/magic-card";
import { OAuthButton } from "@/components/ui/oauth-button";
import { SeparatorWithText } from "@/components/ui/separator-text";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { queryClient } from "@/integrations/tanstack-query/root-provider";
import { authClient } from "@/lib/auth-client";
import { config } from "@/lib/env";
import { sessionQueryOptions } from "@/lib/queries/session";
import { m } from "@/paraglide/messages";
import { signUpFormSchema } from "@/schemas/signup-form-schema";
import { getRandomAvatarUrl } from "@/utils/image";
import { capitalize } from "@/utils/utils";

export function SignUpForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const id = useId();

	const form = useForm<z.infer<typeof signUpFormSchema>>({
		resolver: zodResolver(signUpFormSchema),
		mode: "onTouched",
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
	});

	const onFormSubmit: SubmitHandler<z.infer<typeof signUpFormSchema>> = async (
		formData,
	) => {
		try {
			setIsSubmitting(true);

			const { data, error } = await authClient.signUp.email({
				email: formData.email,
				password: formData.password,
				name: formData.name,
				image: getRandomAvatarUrl(formData.name),
				callbackURL: `${config.appUrl}/verify-email`,
			});

			if (error) {
				switch (error.code) {
					case "USER_ALREADY_EXISTS":
					case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
						toast.error({ title: m.lean_periwinkle_crystal() });
						break;
					case "USERNAME_ALREADY_EXISTS":
						toast.error({ title: m.modest_magenta_lemur() });
						break;
					default:
						toast.error({ title: m.candid_beige_yak() });
				}
				return;
			}

			if (!data) return;

			if (data.user) {
				await queryClient.invalidateQueries({
					queryKey: sessionQueryOptions.queryKey,
				});
				await queryClient.refetchQueries({
					queryKey: sessionQueryOptions.queryKey,
				});

				toast.success({
					title: m.icy_aqua_turtle({
						email: data.user.email,
					}),
				});
				await router.navigate({ to: "/verify-email" });
			}
		} catch (err) {
			toast.error({ title: m.candid_beige_yak() });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleOAuthRegister = async (provider: "google") => {
		const providerCapitalized = capitalize(provider);
		try {
			toast.loading({
				title: m.noble_gray_dune({
					provider: providerCapitalized,
				}),
			});

			await authClient.signIn.social({
				provider,
				callbackURL: `${config.appUrl}/home`,
				errorCallbackURL: `${config.appUrl}/signup`,
				newUserCallbackURL: `${config.appUrl}/welcome`,
			});
		} catch (err: unknown) {
			toast.error({
				title: m.steady_ochre_salmon({
					provider: providerCapitalized,
				}),
			});
		}
	};

	const isRegistering = isSubmitting;

	return (
		<Card className="border-none p-0 w-xs md:w-md lg:w-lg max-w-lg overflow-visible">
			<MagicCard
				gradientColor="var(--shadow-pointer)"
				className="py-4 md:px-2 flex-1"
			>
				<CardHeader>
					<CardTitle className="text-2xl">{m.tender_onyx_squirrel()}</CardTitle>
					<CardDescription>
						<p>{m.fluffy_hazel_boulder()}</p>
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 pt-2">
					<form
						onSubmit={form.handleSubmit(onFormSubmit)}
						className="grid gap-4"
					>
						<fieldset disabled={isRegistering}>
							<div className="grid gap-4">
								<Controller
									control={form.control}
									name="name"
									render={({ field, fieldState }) => (
										<Field className="grid gap-2">
											<div className="flex items-center">
												<FieldLabel htmlFor={`${id}-username`}>
													{m.lush_umber_pelican()}
												</FieldLabel>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger className="ml-2">
															<IconInfoCircle className="h-4 w-4" />
														</TooltipTrigger>
														<TooltipContent>
															<p>{m.vibrant_plum_fern()}</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</div>
											<FieldContent>
												<Input
													id={`${id}-username`}
													type="text"
													autoComplete="username"
													placeholder="Teemo"
													required
													{...field}
												/>
											</FieldContent>
											<FieldError
												errors={
													fieldState.error ? [fieldState.error] : undefined
												}
											/>
										</Field>
									)}
								/>
								<Controller
									control={form.control}
									name="email"
									render={({ field, fieldState }) => (
										<Field className="grid gap-2">
											<FieldLabel htmlFor={`${id}-email`}>
												{m.witty_maroon_pelican()}
											</FieldLabel>
											<FieldContent>
												<Input
													id={`${id}-email`}
													type="email"
													autoComplete="email"
													placeholder="m@example.com"
													required
													{...field}
												/>
											</FieldContent>
											<FieldError
												errors={
													fieldState.error ? [fieldState.error] : undefined
												}
											/>
										</Field>
									)}
								/>
								<Controller
									control={form.control}
									name="password"
									render={({ field, fieldState }) => (
										<Field className="grid gap-2">
											<div className="flex items-center">
												<FieldLabel htmlFor={`${id}-password`}>
													{m.airy_umber_rabbit()}
												</FieldLabel>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger className="ml-2">
															<IconInfoCircle className="h-4 w-4" />
														</TooltipTrigger>
														<TooltipContent>
															{m.alert_silver_yarn()}
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											</div>
											<FieldContent>
												<Input
													id={`${id}-password`}
													type="password"
													autoComplete="new-password"
													minLength={8}
													required
													{...field}
												/>
											</FieldContent>
											<FieldError
												errors={
													fieldState.error ? [fieldState.error] : undefined
												}
											/>
										</Field>
									)}
								/>

								<Button
									type="submit"
									className="w-full mt-2 disabled:bg-gray-300 disabled:text-gray-500"
								>
									{isRegistering ? (
										<span className="flex items-center justify-center gap-2">
											<IconLoader className="animate-spin h-4 w-4" />
											{m.gleeful_tan_fox()}
										</span>
									) : (
										m.gallant_cobalt_aspen()
									)}
								</Button>
							</div>
						</fieldset>
					</form>
					<div className="grid gap-4">
						<SeparatorWithText text={m.proud_magenta_bridge()} />
						<div className="flex gap-2">
							<OAuthButton
								icon={IconBrandGoogleFilled}
								label={m.hasty_fuchsia_fern({ provider: "Google" })}
								text="Google"
								onClick={() => handleOAuthRegister("google")}
							/>
						</div>
					</div>
					<div className="flex gap-1 justify-center text-sm">
						<span>{m.earthy_green_lynx()}</span>
						<Link to="/signin" className="underline">
							{m.cozy_indigo_gecko()}
						</Link>
					</div>
				</CardContent>
			</MagicCard>
		</Card>
	);
}
