import { zodResolver } from "@hookform/resolvers/zod";
import { IconBrandGoogleFilled, IconLoader } from "@tabler/icons-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import type { z } from "zod";
import { TwoFactorDialog } from "@/components/auth/two-factor-dialog";
import { toast } from "@/components/toast/toast";
import { Badge } from "@/components/ui/badge";
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
import { queryClient } from "@/integrations/tanstack-query/root-provider";
import { authClient } from "@/lib/auth-client";
import { config } from "@/lib/env";
import { sessionQueryOptions } from "@/lib/queries/session";
import { m } from "@/paraglide/messages";
import { signinFormSchema } from "@/schemas/signin-form-schema";

export function SignInForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showDialog, setShowDialog] = useState(false);
	const id = useId();
	const router = useRouter();
	const lastMethod = authClient.getLastUsedLoginMethod();

	const form = useForm<z.infer<typeof signinFormSchema>>({
		resolver: zodResolver(signinFormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const watchedEmail = form.watch("email");

	const onFormSubmit: SubmitHandler<z.infer<typeof signinFormSchema>> = async (
		formData,
	) => {
		setIsSubmitting(true);
		try {
			const { data, error } = await authClient.signIn.email({
				email: formData.email,
				password: formData.password,
			});

			// check for 2FA redirect (better-auth returns this instead of session data)
			if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
				setShowDialog(true);
				setIsSubmitting(false);
				return;
			}

			if (data && !("twoFactorRedirect" in data)) {
				// normal sign-in flow (no 2FA)
				await queryClient.invalidateQueries({
					queryKey: sessionQueryOptions.queryKey,
				});
				await queryClient.refetchQueries({
					queryKey: sessionQueryOptions.queryKey,
				});

				if (!data.user.emailVerified) {
					await router.navigate({ to: "/verify-email" });
					return;
				}

				await router.navigate({ to: "/home" });
			}

			if (error) {
				if (
					error.code === "INVALID_EMAIL_OR_PASSWORD" ||
					error.code === "INVALID_PASSWORD"
				) {
					toast.error({ title: m.icy_white_barn() });
				} else {
					toast.error({ title: m.candid_beige_yak() });
				}
			}
		} catch (err) {
			toast.error({ title: m.candid_beige_yak() });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleOAuthSignIn = async (provider: "google") => {
		try {
			await authClient.signIn.social({
				provider,
				callbackURL: `${config.appUrl}/home`,
				errorCallbackURL: `${config.appUrl}/signup`,
				newUserCallbackURL: `${config.appUrl}/welcome`,
			});
		} catch (err) {
			toast.error({ title: m.candid_beige_yak() });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleVerifyTotp = async (code: string) => {
		try {
			const { data, error } = await authClient.twoFactor.verifyTotp({
				code,
				trustDevice: true,
			});

			authClient.$ERROR_CODES;

			if (error?.message === "Invalid two factor cookie") {
				toast.error({ title: m.sweet_silver_dolphin() });
				return;
			} else if (error) {
				toast.error({ title: m.candid_beige_yak() });
				return;
			}

			if (data) {
				await queryClient.invalidateQueries({
					queryKey: sessionQueryOptions.queryKey,
				});
				await queryClient.refetchQueries({
					queryKey: sessionQueryOptions.queryKey,
				});

				toast.success({
					title: m.swift_olive_pine({ username: data.user.name }),
				});
				setShowDialog(false);
				form.reset();
				await router.navigate({ to: "/home" });
			}
		} catch (err) {
			toast.error({ title: m.tidy_beige_bridge() });
		}
	};

	return (
		<>
			<Card className="border-none p-0 w-xs md:w-md lg:w-lg max-w-lg overflow-visible">
				<MagicCard
					gradientColor="var(--shadow-pointer)"
					className="py-4 md:px-2 flex-1"
				>
					<CardHeader>
						<CardTitle className="text-2xl">{m.crisp_topaz_planet()}</CardTitle>
						<CardDescription>
							<div className="flex flex-col gap-1">
								<p>{m.earthy_gray_eagle()}</p>
								<p>{m.velvet_cream_maple()}</p>
							</div>
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 pt-2">
						<form
							onSubmit={form.handleSubmit(onFormSubmit)}
							className="grid gap-4"
						>
							<fieldset disabled={isSubmitting}>
								<div className="grid gap-4">
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
													<Link
														to={"/forgot-password"}
														search={
															watchedEmail ? { email: watchedEmail } : undefined
														}
														className="ml-auto mr-1 inline-block text-xs underline"
													>
														{m.wise_rose_whale()}
													</Link>
												</div>
												<Input
													id={`${id}-password`}
													type="password"
													autoComplete="current-password"
													{...field}
												/>
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
										className="w-full mt-2 font-bold flex justify-center relative disabled:bg-gray-300 disabled:text-gray-500"
									>
										{isSubmitting ? (
											<span className="flex items-center justify-center gap-2">
												<IconLoader className="animate-spin h-4 w-4" />
												{m.golden_fuchsia_iguana()}
											</span>
										) : (
											m.sweet_sage_forest()
										)}
										{lastMethod === "email" ? (
											<Badge
												variant="secondary"
												className="hidden absolute right-2 rounded-md md:block text-xs overflow-hidden"
											>
												{m.warm_purple_rocket()}
											</Badge>
										) : null}
									</Button>
								</div>
							</fieldset>
						</form>

						<SeparatorWithText text={m.tidy_umber_squirrel()} />
						<div className="flex gap-2">
							<OAuthButton
								icon={IconBrandGoogleFilled}
								label={m.chilly_purple_octopus({ provider: "Google" })}
								text="Google"
								lastMethod={lastMethod === "google"}
								onClick={() => handleOAuthSignIn("google")}
							/>
						</div>
						<div className="flex justify-center items-center flex-wrap text-sm gap-1">
							<span>{m.icy_olive_maple()}</span>
							<Link to="/signup" className="underline">
								{m.fair_azure_iguana()}
							</Link>
						</div>
					</CardContent>
				</MagicCard>
			</Card>

			<TwoFactorDialog
				open={showDialog}
				onOpenChange={setShowDialog}
				onVerify={handleVerifyTotp}
			/>
		</>
	);
}
