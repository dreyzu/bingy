import { zodResolver } from "@hookform/resolvers/zod";
import {
	createFileRoute,
	useNavigate,
	useRouteContext,
} from "@tanstack/react-router";
import { useAtom } from "jotai";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { ListItemsPreview } from "@/components/lists/custom-lists/list-items-preview";
import { ListSearchAddInput } from "@/components/lists/custom-lists/list-search-add";
import { toast } from "@/components/toast/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateList } from "@/hooks/useLists";
import { createListDraftItemsAtom } from "@/lib/atoms/draft-list";
import { m } from "@/paraglide/messages";
import { createListSchema } from "@/schemas/create-list-schema";

export const Route = createFileRoute("/_auth/lists/create")({
	component: CreateListPage,
});

type CreateListFormValues = z.infer<typeof createListSchema>;

function CreateListPage() {
	const { authData } = useRouteContext({ from: "__root__" });
	const navigate = useNavigate();

	if (!authData) return null;
	const username = authData.user.name;

	const createList = useCreateList(username);
	const [selectedItems, setSelectedItems] = useAtom(createListDraftItemsAtom);

	const form = useForm<CreateListFormValues>({
		resolver: zodResolver(createListSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			description: "",
			visibility: "public",
			type: "unranked",
		},
	});

	const listType = form.watch("type");

	const handleRemoveItem = (tmdbId: number, mediaType: string) => {
		setSelectedItems(
			selectedItems.filter(
				(item) => !(item.tmdbId === tmdbId && item.mediaType === mediaType),
			),
		);
	};

	const handleReorder = (reorderedItems: typeof selectedItems) => {
		setSelectedItems(reorderedItems);
	};

	const handleUpdateNote = (
		tmdbId: number,
		mediaType: string,
		note: string,
	) => {
		setSelectedItems(
			selectedItems.map((item) =>
				item.tmdbId === tmdbId && item.mediaType === mediaType
					? { ...item, note }
					: item,
			),
		);
	};

	const onSubmit = (values: CreateListFormValues) => {
		const payload = {
			...values,
			items:
				selectedItems.length > 0
					? selectedItems.map((item, index) => ({
							tmdbId: item.tmdbId,
							mediaType: item.mediaType,
							note: item.note,
							position: values.type === "ranked" ? index + 1 : undefined,
						}))
					: undefined,
		};

		createList.mutate(payload, {
			onSuccess: (data) => {
				setSelectedItems([]);

				toast.success({
					title: m.lucky_sapphire_tulip({ list_name: values.name }),
				});
				navigate({
					to: "/@{$username}/lists/$slug",
					params: { username, slug: data.slug },
				});
			},
			onError: () => {
				toast.error({
					title: m.rustic_rust_barn({ list_name: values.name }),
				});
			},
		});
	};

	return (
		<div className="flex flex-col gap-6 w-full">
			<Card>
				<CardHeader>
					<CardTitle>{m.stellar_topaz_lynx()}</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-4"
					>
						<div className="flex flex-col lg:flex-row lg:items-start gap-4 w-full">
							<Controller
								control={form.control}
								name="name"
								render={({ field, fieldState }) => (
									<Field className="w-full lg:w-[55%]">
										<FieldLabel>{m.bubbly_magenta_rabbit()}</FieldLabel>
										<FieldContent>
											<Input {...field} autoComplete="off" />
										</FieldContent>
										<FieldError
											errors={fieldState.error ? [fieldState.error] : undefined}
										/>
									</Field>
								)}
							/>

							<Controller
								control={form.control}
								name="visibility"
								render={({ field, fieldState }) => {
									const visibilityLabel = {
										public: m.gentle_sage_barn(),
										limited: m.lean_lime_quail(),
										private: m.humble_lime_beacon(),
									}[field.value as "public" | "limited" | "private"];

									return (
										<Field className="w-full lg:w-[45%]">
											<FieldLabel>
												{m.shiny_hazel_planet()}
											</FieldLabel>
											<FieldContent>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger className="w-full">
														<SelectValue>{visibilityLabel}</SelectValue>
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="public">
															{m.rustic_lavender_turtle()}
														</SelectItem>
														<SelectItem value="limited">
															{m.hazy_khaki_fox()}
														</SelectItem>
														<SelectItem value="private">
															{m.keen_umber_cactus()}
														</SelectItem>
													</SelectContent>
												</Select>
											</FieldContent>
											<FieldError
												errors={
													fieldState.error ? [fieldState.error] : undefined
												}
											/>
										</Field>
									);
								}}
							/>
						</div>

						<Controller
							control={form.control}
							name="type"
							render={({ field }) => (
								<Field>
									<FieldContent className="flex flex-row gap-2 items-center">
										<Checkbox
											checked={field.value === "ranked"}
											onCheckedChange={(checked) =>
												field.onChange(checked ? "ranked" : "unranked")
											}
										/>
										<FieldLabel>{m.ample_gray_beacon()}</FieldLabel>
									</FieldContent>
									<FieldDescription>
										{m.quick_mauve_flute()}
									</FieldDescription>
								</Field>
							)}
						/>

						<Controller
							control={form.control}
							name="description"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel>
										{m.dusky_hazel_yak()}
									</FieldLabel>
									<FieldContent>
										<Textarea
											className="resize-y field-sizing-content"
											rows={4}
											{...field}
										/>
									</FieldContent>
									<FieldError
										errors={fieldState.error ? [fieldState.error] : undefined}
									/>
								</Field>
							)}
						/>

						<div className="flex flex-col gap-2">
							<div className="flex flex-col gap-2">
								<FieldLabel>{m.lush_fuchsia_clover()}</FieldLabel>
								<ListSearchAddInput draftItemsAtom={createListDraftItemsAtom} />
							</div>
						</div>
						<div className="flex w-full gap-2">
							<Button
								type="button"
								disabled={createList.isPending}
								variant="destructive"
								onClick={() =>
									navigate({
										to: "/@{$username}/lists",
										params: { username },
									})
								}
								className="flex-1"
							>
								{m.fluffy_azure_puma()}
							</Button>
							<Button
								type="submit"
								disabled={createList.isPending}
								className="flex-1"
							>
								{createList.isPending
									? m.candid_topaz_quail()
									: m.fancy_scarlet_koala()}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* items (movies/tv shows) added to the list */}
			<ListItemsPreview
				selectedItems={selectedItems}
				listType={listType}
				clearItems={() => setSelectedItems([])}
				handleRemoveItem={handleRemoveItem}
				handleUpdateNote={handleUpdateNote}
				handleReorder={handleReorder}
			/>
		</div>
	);
}
