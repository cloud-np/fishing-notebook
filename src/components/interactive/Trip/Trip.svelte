<script lang="ts">
	import { CalendarDate } from "@internationalized/date";
	import DatePicker from "@components/interactive/Calendar/DatePicker.svelte";
	import AddLocation from "@components/interactive/Trip/AddLocation.svelte";
	import { actions } from "astro:actions";
	import { locationState } from "@components/interactive/Trip/location.shared.svelte";
	import Rating from "../Rating/Rating.svelte";
	import Plus from "phosphor-svelte/lib/Plus";
	import SelectFromLocations from "./SelectFromLocations.svelte";
	import { AlertDialog } from "bits-ui";

	let isAddLocationOpen = $state(false);
	let selectedDate = $state<CalendarDate | undefined>(undefined);
	let tripNotes = $state("");
	let rating = $state(0);
	let isSubmitting = $state(false);
	let submitError = $state("");
	let submitSuccess = $state(false);
	let isSavingLocation = $state(false);

	// Handle saving location when user clicks Continue in dialog
	async function handleSaveLocation() {
		// Validate location data
		if (!locationState.location.latitude || !locationState.location.longitude) {
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
		if (!locationState.location.latitude || !locationState.location.longitude) {
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
					name: locationState.location.name,
					latitude: locationState.location.latitude,
					longitude: locationState.location.longitude,
					carDifficulty: locationState.location.carDifficulty === 0 ? undefined : locationState.location.carDifficulty,
					walkDifficulty: locationState.location.walkDifficulty === 0 ? undefined : locationState.location.walkDifficulty,
					rating: locationState.location.rating === 0 ? undefined : locationState.location.rating,
				},
				tripDate: selectedDate.toString(),
				rating: rating === 0 ? undefined : rating,
				notes: tripNotes || undefined,
			});

			if (error) {
				submitError = error.message || "Failed to create trip";
				console.error('Error creating trip:', error);
				return;
			}

			if (data?.success) {
				submitSuccess = true;
				console.log('Trip created successfully:', data.trip);

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
			console.error('Error:', error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="trip-form-container">
	<h2>Create Fishing Trip</h2>

	<div class="trip-form">
		<!-- Date Selection -->
		<section class="flex flex-col gap-4">
			<DatePicker bind:value={selectedDate} />
		</section>

		{#if (!locationState.location.latitude || !locationState.location.longitude) || isAddLocationOpen}
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
							class="rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 border p-7 sm:max-w-lg md:w-full"
						>
							<div class="flex flex-col gap-4 pb-6">
								<AlertDialog.Title class="text-lg font-semibold tracking-tight mb-4">
									Add new location 📍
								</AlertDialog.Title>
								<AddLocation />
							</div>
							<div class="flex w-full items-center justify-center gap-2">
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
			<section class="flex flex-col gap-8 sm:flex-row">
				<div class="flex flex-col gap-2 border border-border-input rounded-card-sm p-4">
					{locationState.location.name ?? `Location at ${locationState.location.latitude.toFixed(4)}, ${locationState.location.longitude.toFixed(4)}`}
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
