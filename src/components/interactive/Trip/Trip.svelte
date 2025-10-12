<script lang="ts">
	import { CalendarDate } from "@internationalized/date";
	import DatePicker from "@components/interactive/Calendar/DatePicker.svelte";
	import AddLocation from "@components/interactive/Trip/AddLocation.svelte";
	import { actions } from "astro:actions";
	import type { Location } from "./Trip.model";
	import Rating from "../Rating/Rating.svelte";

	// Form state
	let location = $state<Location>({
		carDifficulty: 0,
		walkDifficulty: 0,
		rating: 0
	});
	let selectedDate = $state<CalendarDate | undefined>(undefined);
	let tripNotes = $state("");
	let rating = $state(0);
	let isSubmitting = $state(false);
	let submitError = $state("");
	let submitSuccess = $state(false);

	// Handle form submission
	async function handleSubmit(event: Event) {
		event.preventDefault();

		// Reset states
		submitError = "";
		submitSuccess = false;

		// Validate required fields
		if (!location.latitude || !location.longitude) {
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
					...location,
					latitude: location.latitude,
					longitude: location.longitude,
				},
				tripDate: selectedDate.toString(),
				rating,
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
					location = {};
					selectedDate = undefined;
					tripNotes = "";
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

	<form onsubmit={handleSubmit} class="trip-form">
		<!-- Date Selection -->

		<section class="flex flex-col gap-4">
			<DatePicker bind:value={selectedDate} />
		</section>

		<!-- Location Selection -->
		<AddLocation bind:location />

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
		<button type="submit" class="submit-button" disabled={isSubmitting}>
			{isSubmitting ? 'Saving...' : 'Save Fishing Trip'}
		</button>
	</form>
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
