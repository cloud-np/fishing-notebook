<script lang="ts">
	import Map from "@components/interactive/Map/Map.svelte";
	import { CalendarDate } from "@internationalized/date";
	import DatePicker from "@components/interactive/Calendar/DatePicker.svelte";
	import { actions } from "astro:actions";
	import { Popover, Button } from "bits-ui";
	import MapPin from "phosphor-svelte/lib/MapPin";

	// Form state
	let latitude = $state(37.977217456248574);
	let longitude = $state(23.730278147550383);
	let selectedDate = $state<CalendarDate | undefined>(undefined);
	let tripNotes = $state("");
	let mapsUrl = $state("");
	let isLoadingCoordinates = $state(false);
	let urlError = $state("");
	let isMapOpen = $state(false);

	// Handle Google Maps URL input
	async function handleMapsUrlSubmit() {
		if (!mapsUrl.trim()) {
			urlError = "Please enter a Google Maps URL";
			return;
		}

		isLoadingCoordinates = true;
		urlError = "";

		try {
			const { data, error } = await actions.maps.extractCoordinates({ url: mapsUrl });

			if (error) {
				urlError = error.message || "Failed to extract coordinates";
				console.error('Error:', error);
				return;
			}

			if (data?.coordinates) {
				latitude = data.coordinates.latitude;
				longitude = data.coordinates.longitude;
				console.log('Coordinates extracted:', data.coordinates);
				urlError = "";
			}
		} catch (error) {
			urlError = (error as Error).message;
			console.error('Error:', error);
		} finally {
			isLoadingCoordinates = false;
		}
	}

	// Handle map click to update coordinates
	function handleMapClick(lat: number, lng: number) {
		latitude = lat;
		longitude = lng;
	}

	// Handle form submission
	function handleSubmit(event: Event) {
		event.preventDefault();
		const tripData = {
			latitude,
			longitude,
			date: selectedDate?.toString() || "No date selected",
			notes: tripNotes,
		};
		console.log("Trip data:", tripData);
		// TODO: Submit to server/action
	}
</script>

<div class="trip-form-container">
	<h2>Create Fishing Trip</h2>

	<form onsubmit={handleSubmit} class="trip-form">
		<!-- Date Selection -->
		<section class="form-section">
			<DatePicker bind:value={selectedDate} />
		</section>

		<!-- Location Selection -->
		<section class="form-section">
			<h3>Select Location 📍</h3>

			<!-- Google Maps URL Input -->
			<div class="maps-url-section">
				<label for="maps-url">Google Maps Share Link</label>
				<div class="maps-url-input-wrapper">
					<input
						id="maps-url"
						type="text"
						bind:value={mapsUrl}
						placeholder="Paste Google Maps share link (e.g., https://maps.app.goo.gl/...)"
						class="maps-url-input"
					/>
					<button
						type="button"
						onclick={handleMapsUrlSubmit}
						disabled={isLoadingCoordinates}
						class="extract-coords-button"
					>
						{isLoadingCoordinates ? 'Loading...' : 'Extract'}
					</button>
				</div>
				{#if urlError}
					<p class="error-text">{urlError}</p>
				{/if}
			</div>

			<div class="divider">
				<span>OR</span>
			</div>

			<!-- Manual Coordinate Inputs -->

			<Popover.Root bind:open={isMapOpen}>
				<div class="flex gap-4">
					<div class="flex gap-4">
						<div class="flex flex-col gap-2">
							<label for="latitude">Latitude</label>
							<input
								id="latitude"
								type="number"
								step="any"
								bind:value={latitude}
								placeholder="e.g., 37.977217"
							/>
						</div>

						<div class="flex flex-col gap-2">
							<label for="longitude">Longitude</label>
							<input
								id="longitude"
								type="number"
								step="any"
								bind:value={longitude}
								placeholder="e.g., 23.730278"
							/>
						</div>
					</div>
					<div class="flex flex-col gap-2">
						<p class="help-text">Or open the map to set location</p>
						<Popover.Trigger class="flex gap-2 items-center">
							<Button.Root class="cursor-pointer rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex h-12 items-center justify-center px-[21px] text-[15px] font-semibold active:scale-[0.98] active:transition-all">
								<MapPin class="size-5" />
								<span>Open Map</span>
							</Button.Root>
						</Popover.Trigger>
					</div>
				</div>
				<Popover.Content
					class="popover-map-content"
					sideOffset={8}
				>
					<div class="map-wrapper">
						<Map
							location={{ latitude, longitude }}
							zoom={9}
							markerMarkup={`
								<div class="marker">
									<p><strong>Fishing Spot</strong></p>
									<p>Lat: ${latitude.toFixed(6)}</p>
									<p>Lng: ${longitude.toFixed(6)}</p>
								</div>
							`}
							onMarkerPlace={handleMapClick}
						/>
					</div>
				</Popover.Content>
			</Popover.Root>
		</section>

		<!-- Notes -->
		<section class="form-section">
			<h3>Trip Notes</h3>
			<textarea
				bind:value={tripNotes}
				placeholder="Add notes about your fishing trip..."
				rows="4"
			></textarea>
		</section>

		<!-- Submit Button -->
		<button type="submit" class="submit-button">
			Save Fishing Trip
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

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	label {
		font-weight: 500;
		font-size: 0.875rem;
	}

	:global(.popover-content) {
		z-index: 50;
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
		margin-top: 0.5rem;
	}

	input[type="number"],
	textarea {
		padding: 0.75rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		font-size: 1rem;
		background: var(--background-alt, #f9f9f9);
	}

	input[type="number"]:focus,
	textarea:focus {
		outline: none;
		border-color: #4a90e2;
		box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
	}

	.help-text {
		font-size: 0.875rem;
		color: #666;
		font-style: italic;
	}

	.error-text {
		font-size: 0.875rem;
		color: #dc2626;
		margin-top: 0.5rem;
	}

	.maps-url-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.maps-url-input-wrapper {
		display: flex;
		gap: 0.5rem;
	}

	.maps-url-input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		font-size: 1rem;
		background: var(--background-alt, #f9f9f9);
		font-family: inherit;
	}

	.maps-url-input:focus {
		outline: none;
		border-color: #4a90e2;
		box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
	}

	.extract-coords-button {
		padding: 0.75rem 1.5rem;
		background-color: #10b981;
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s;
		white-space: nowrap;
	}

	.extract-coords-button:hover:not(:disabled) {
		background-color: #059669;
	}

	.extract-coords-button:disabled {
		background-color: #9ca3af;
		cursor: not-allowed;
	}

	.extract-coords-button:active:not(:disabled) {
		transform: scale(0.98);
	}

	.divider {
		display: flex;
		align-items: center;
		text-align: center;
		margin: 1rem 0;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		border-bottom: 1px solid #ccc;
	}

	.divider span {
		padding: 0 1rem;
		color: #666;
		font-size: 0.875rem;
		font-weight: 500;
	}

	:global(.popover-map-content) {
		z-index: 50;
		background: white;
		border-radius: 0.75rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		border: 1px solid #e5e7eb;
		padding: 1rem;
		max-width: 90vw;
		width: 600px;
	}

	.map-wrapper {
		width: 100%;
		min-height: 400px;
	}

	textarea {
		resize: vertical;
		font-family: inherit;
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

	.submit-button:hover {
		background-color: #357abd;
	}

	.submit-button:active {
		transform: scale(0.98);
	}

	@media (max-width: 768px) {
		.location-inputs {
			grid-template-columns: 1fr;
		}

		.trip-form-container {
			padding: 1rem;
		}
	}
</style>
