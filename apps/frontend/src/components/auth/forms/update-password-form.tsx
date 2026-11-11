import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader } from "@tabler/icons-react";
import React, { useId } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import type { z } from "zod";
import { toast } from "@/components/toast/toast";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { m } from "@/paraglide/messages";
import { updatePasswordFormSchema } from "@/schemas/password/update-password";

type UpdatePasswordFormProps = {
	hasPassword: boolean;
};

export function UpdatePasswordForm({ hasPassword }: UpdatePasswordFormProps) {
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [open, setOpen] = React.useState(false);
	const [_, setIsSuccess] = React.useState(false);
	const id = useId();

	const form = useForm<z.infer<typeof updatePasswordFormSchema>>({
		resolver: zodResolver(updatePasswordFormSchema),
		defaultValues: {
			newPassword: "",
			currentPassword: "",
		},
	});

	const onFormSubmit: SubmitHandler<
		z.infer<typeof updatePasswordFormSchema>
	> = async (formData) => {
		setIsSubmitting(true);
		try {
			const { data, error } = await authClient.changePassword({
				newPassword: formData.newPassword,
				currentPassword: formData.currentPassword,
				revokeOtherSessions: true,
			});

			if (error) {
				toast.error({ title: m.swift_ochre_hazel() });
				return;
			}

			if (data) {
				toast.success({ title: m.fierce_turquoise_spruce() });
				setIsSuccess(true);
			}
		} catch (err) {
			toast.error({ title: m.candid_beige_yak() });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="grid gap-2">
			<div>
				<p className="text-md font-semibold leading-none tracking-tight">
					{m.quick_scarlet_eagle()}
				</p>
				<p className="text-sm text-muted-foreground mt-1.5">
					{!hasPassword
						? m.calm_aqua_heron({ providers: "Google" })
						: m.candid_sepia_dolphin()}
				</p>
			</div>
			{hasPassword ? (
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger
						render={<Button>{m.brave_yellow_otter()}</Button>}
						className="w-full"
					></DialogTrigger>
					<DialogContent className="max-w-lg">
						<DialogHeader>
							<DialogTitle>{m.hardy_amber_coral()}</DialogTitle>
							<DialogDescription className="w-6/7">
								{m.spry_beige_otter()}
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={form.handleSubmit(onFormSubmit)}>
							<fieldset disabled={isSubmitting} className="grid gap-2">
								<Controller
									control={form.control}
									name="currentPassword"
									render={({ field, fieldState }) => (
										<Field className="grid gap-2">
											<FieldLabel htmlFor="currentPassword">
												{m.quiet_rose_lynx()}
											</FieldLabel>
											<FieldContent>
												<Input
													id={`${id}-currentPassword`}
													type="password"
													autoComplete="current-password"
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
									name="newPassword"
									render={({ field, fieldState }) => (
										<Field className="grid gap-2">
											<FieldLabel htmlFor="newPassword">
												{m.smart_mauve_fern()}
											</FieldLabel>
											<FieldContent>
												<Input
													id={`${id}-newPassword`}
													type="password"
													autoComplete="new-password"
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
									className="w-full mt-4 disabled:bg-gray-300 disabled:text-gray-500"
								>
									{isSubmitting ? (
										<span className="flex items-center justify-center gap-2">
											<IconLoader className="animate-spin h-4 w-4" />
											{m.cozy_silver_cricket()}
										</span>
									) : (
										m.brave_yellow_otter()
									)}
								</Button>
							</fieldset>
						</form>
					</DialogContent>
				</Dialog>
			) : null}
		</div>
	);
}
