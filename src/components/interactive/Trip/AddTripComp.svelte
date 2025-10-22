<script lang="ts">
	import { CalendarDate } from "@internationalized/date";
	import DatePicker from "@components/interactive/Calendar/DatePicker.svelte";
	import AddLocation from "@components/interactive/Trip/AddLocation.svelte";
	import { actions } from "astro:actions";
	import { locationState } from "@components/interactive/Trip/trip.shared.svelte";
	import Rating from "../Rating/Rating.svelte";
	import Plus from "phosphor-svelte/lib/Plus";
	import ArrowLeft from "phosphor-svelte/lib/ArrowLeft";
	import SelectFromLocations from "./SelectFromLocations.svelte";
	import { AlertDialog } from "bits-ui";
	import Trash from "phosphor-svelte/lib/Trash";

	let isAddLocationOpen = $state(false);
	let selectedDate = $state<CalendarDate | undefined>(undefined);
	let tripNotes = $state("");
	let rating = $state(0);
	let isSubmitting = $state(false);
	let submitError = $state("");
	let submitSuccess = $state(false);
	let selectedLocation = $derived(locationState.location ?? { latitude: 20, longitude: 20 });

	// Handle saving location when user clicks Continue in dialog
	async function handleSaveLocation() {
		// Validate location data
		if (!selectedLocation.latitude || !selectedLocation.longitude) {
			submitError = "Please enter valid location coordinates";
			return;
		}
		isAddLocationOpen = false;
	}

	// Handle form submission
	async function handleSubmit(event: Event) {
		event.preventDefault();

		// Reset states
		submitError = "";
		submitSuccess = false;

		// Validate required fields
		if (!selectedLocation.latitude || !selectedLocation.longitude) {
			submitError = "Please select a location for your trip";
			return;
		}

		if (!selectedDate) {
			submitError = "Please select a date for your trip";
			return;
		}

		isSubmitting = true;

		try {
			const { data, error } = await actions.trip.createTrip({
				location: {
					name: selectedLocation.name,
					latitude: selectedLocation.latitude,
					longitude: selectedLocation.longitude,
					carDifficulty: selectedLocation.carDifficulty === 0 ? undefined : selectedLocation.carDifficulty,
					walkDifficulty: selectedLocation.walkDifficulty === 0 ? undefined : selectedLocation.walkDifficulty,
					rating: selectedLocation.rating === 0 ? undefined : selectedLocation.rating,
				},
				tripDate: selectedDate.toString(),
				rating: rating === 0 ? undefined : rating,
				notes: tripNotes || undefined,
			});

			if (error) {
				submitError = error.message || "Failed to create trip";
				return;
			}

			if (data?.success) {
				submitSuccess = true;

				// Reset form after successful submission
				setTimeout(() => {
					locationState.reset();
					selectedDate = undefined;
					tripNotes = "";
					rating = 0;
					submitSuccess = false;
				}, 2000);
			}
		} catch (error) {
			submitError = (error as Error).message || "An unexpected error occurred";
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="trip-form-container">
	<div class="mb-4">
		<button
			onclick={() => window.history.back()}
			class="inline-flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
			aria-label="Go back"
		>
			<ArrowLeft class="size-5" weight="bold" />
			<span>Back</span>
		</button>
	</div>

	<h2>Create Fishing Trip</h2>

	<div class="trip-form">
		<!-- Date Selection -->
		<section class="flex flex-col gap-4">
			<DatePicker bind:value={selectedDate} />
		</section>

		{#if !locationState.isSet() || isAddLocationOpen}
			<section class="flex flex-col gap-8 sm:flex-row">
				<div class="flex flex-col gap-2">
					<h1>Select Previous Location</h1>
					<SelectFromLocations />
				</div>

				<div class="mt-6 mx-auto">
					<span>OR</span>
				</div>

				<AlertDialog.Root bind:open={isAddLocationOpen}>
					<div class="flex justify-center items-center flex-col gap-2">
						<AlertDialog.Trigger onclick={() => isAddLocationOpen = true}
							class="cursor-pointer rounded-card border-border-input text-muted-foreground flex h-16 w-16 select-none items-center justify-center border-2 border-dashed bg-transparent font-semibold"
						>
							<Plus />
						</AlertDialog.Trigger>
					</div>
					<AlertDialog.Portal>
						<AlertDialog.Overlay
							class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
						/>
						<AlertDialog.Content
							class="rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 flex flex-col w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border sm:max-w-lg md:w-full max-h-[calc(100dvh-2rem)]"
						>
							<div class="flex flex-col gap-4 px-7 pt-7 pb-4">
								<AlertDialog.Title class="text-lg font-semibold tracking-tight">
									Add new location 📍
								</AlertDialog.Title>
							</div>
							<div class="flex-1 overflow-y-auto overflow-x-hidden px-7 pb-4">
								<AddLocation />
							</div>
							<div class="flex w-full items-center justify-center gap-2 px-7 pb-7 pt-4 border-t">
								<AlertDialog.Cancel
									class="h-input rounded-input bg-muted shadow-mini hover:bg-dark-10 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex w-full items-center justify-center text-[15px] font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
								>
									Cancel
								</AlertDialog.Cancel>
								<AlertDialog.Action
									onclick={handleSaveLocation}
									class="h-input rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex w-full items-center justify-center text-[15px] font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Save
								</AlertDialog.Action>
							</div>
						</AlertDialog.Content>
					</AlertDialog.Portal>
				</AlertDialog.Root>
			</section>
		{:else}
			<section class="flex flex-col gap-8 sm:flex-row ">
				<div class="flex flex-col gap-2 border border-border-input rounded-card-sm p-4 pr-8 relative">
					{selectedLocation.name || `Location at ${selectedLocation.latitude!.toFixed(4)}, ${selectedLocation.longitude!.toFixed(4)}`}
					<button class="text-lg absolute right-0 top-0 cursor-pointer p-2" onclick={() => locationState.reset()}>
						<Trash />
					</button>
				</div>
			</section>
		{/if}

		<div class="flex flex-col">
			<h3>Select trip Rating</h3>
			<Rating bind:value={rating} />
		</div>
		<!-- Notes -->
		<section class="flex flex-col gap-4">
			<h3>Trip Notes</h3>
			<textarea
				bind:value={tripNotes}
				placeholder="Add notes about your fishing trip..."
				rows="4"
				class="rounded-card-sm p-4 border-border-input bg-background placeholder:text-foreground-alt/50 hover:border-dark-40 focus:ring-foreground focus:ring-offset-background focus:outline-hidden inline-flex w-full items-center border px-4 text-base focus:ring-2 focus:ring-offset-2 sm:text-sm" name="name"
			></textarea>
		</section>

		<!-- Error Message -->
		{#if submitError}
			<div class="message error-message">
				{submitError}
			</div>
		{/if}

		<!-- Success Message -->
		{#if submitSuccess}
			<div class="message success-message">
				Fishing trip created successfully!
			</div>
		{/if}

		<!-- Submit Button -->
		<button onclick={handleSubmit} class="submit-button" disabled={isSubmitting}>
			Save
		</button>
	</div>
</div>

<style>
	.trip-form-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	h2 {
		font-size: 2rem;
		margin-bottom: 2rem;
		font-weight: 600;
	}

	h3 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
		font-weight: 500;
	}

	.trip-form {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.message {
		padding: 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.error-message {
		background-color: #fee;
		color: #c00;
		border: 1px solid #fcc;
	}

	.success-message {
		background-color: #efe;
		color: #060;
		border: 1px solid #cfc;
	}

	.submit-button {
		padding: 1rem 2rem;
		background-color: #4a90e2;
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.submit-button:hover:not(:disabled) {
		background-color: #357abd;
	}

	.submit-button:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}

	.submit-button:active:not(:disabled) {
		transform: scale(0.98);
	}
</style>
