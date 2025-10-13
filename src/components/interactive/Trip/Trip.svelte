<script lang="ts">
	import { CalendarDate } from "@internationalized/date";
	import DatePicker from "@components/interactive/Calendar/DatePicker.svelte";
	import AddLocation from "@components/interactive/Trip/AddLocation.svelte";
	import { actions } from "astro:actions";
	import { locationState } from "@components/interactive/Trip/location.shared.svelte";
	import Rating from "../Rating/Rating.svelte";
	import Plus from "phosphor-svelte/lib/Plus";
	import SelectFromLocations from "./SelectFromLocations.svelte";
	import * as Dialog from "$lib/components/ui/dialog";
	import Button from "$lib/components/ui/button/button.svelte";
	import Textarea from "$lib/components/ui/textarea/textarea.svelte";

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
		<section class="flex flex-col gap-4">
			<DatePicker bind:value={selectedDate} />
		</section>

		{#if (!locationState.location.latitude || !locationState.location.longitude) || isAddLocationOpen}
			<section class="flex flex-col gap-8 sm:flex-row">
				<div class="flex flex-col gap-2">
					<h1>Select previous location</h1>
					<SelectFromLocations />
				</div>

				<Dialog.Root bind:open={isAddLocationOpen}>
					<div class="flex justify-center items-center flex-col gap-2">
						<h1>Add a new location</h1>
						<Dialog.Trigger
							class="cursor-pointer rounded-card rounded-md border-border-input text-muted-foreground flex h-16 w-16 select-none items-center justify-center border-2 border-dashed bg-transparent font-semibold"
						>
							<Plus />
						</Dialog.Trigger>
					</div>
					<Dialog.Portal>
						<Dialog.Overlay />
						<Dialog.Content class="sm:max-w-lg">
							<Dialog.Header>
								<Dialog.Title>Add new location 📍</Dialog.Title>
							</Dialog.Header>
							<div class="flex flex-col gap-4 py-4">
								<AddLocation />
							</div>
							<Dialog.Footer class="flex flex-col gap-2">
								<Dialog.Close>
									<Button>
										Cancel
									</Button>
								</Dialog.Close>
								<Button
									onclick={handleSaveLocation}
								>
									Save
								</Button>
							</Dialog.Footer>
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>
			</section>
		{:else}
			<section class="flex flex-col gap-8 sm:flex-row">
				<div class="flex flex-col gap-2 border border-border-input rounded-card-sm p-4">
					{locationState.location.name}
				</div>
			</section>
		{/if}

		<div class="flex flex-col">
			<h3>Select trip Rating</h3>
			<Rating bind:value={rating} />
		</div>
		<section class="flex flex-col gap-4">
			<h3>Trip Notes</h3>
			<Textarea
				bind:value={tripNotes}
				placeholder="Add notes about your fishing trip..."
				rows={4}
			/>
		</section>

		{#if submitError}
			<div class="message error-message">
				{submitError}
			</div>
		{/if}

		{#if submitSuccess}
			<div class="message success-message">
				Fishing trip created successfully!
			</div>
		{/if}

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
