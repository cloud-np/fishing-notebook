<script lang="ts">
	import Map from "@components/interactive/Map/Map.svelte";
	import { actions } from "astro:actions";
	import { Popover } from "bits-ui";
	import { userValueToPosition } from "@utils/helpers";
	import Rating from "@components/interactive/Rating/Rating.svelte";
	import { locationState } from "@components/interactive/Trip/trip.shared.svelte";
	import MapPin from "phosphor-svelte/lib/MapPin";

	// Local state
	let mapsUrl = $state("");
	let isLoadingCoordinates = $state(false);
	let urlError = $state("");
	let isMapOpen = $state(false);
	const DEFAULT_LOCATION = {
		latitude: 37.971498,
		longitude: 23.726647
	}

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
				locationState.location.latitude = data.coordinates.latitude;
				locationState.location.longitude = data.coordinates.longitude;
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
		locationState.location.latitude = lat;
		locationState.location.longitude = lng;
	}

	function handlePaste(event: ClipboardEvent) {
		let parsedValue = userValueToPosition(event?.clipboardData?.getData('text/plain'));
		if (!parsedValue) return;

		// Kinda hacky, we wait for the input from the user to be processed
		// then we set the values in an async manner.
		setTimeout(() => {
			locationState.location.latitude = parsedValue[0];
			locationState.location.longitude = parsedValue[1];
		}, 0);
	}

	const inputClasses = "rounded-card-sm p-4 border-border-input bg-background placeholder:text-foreground-alt/50 hover:border-dark-40 focus:ring-foreground focus:ring-offset-background focus:outline-hidden inline-flex items-center border px-4 text-base focus:ring-2 focus:ring-offset-2 sm:text-sm";
</script>

<!-- Location Selection -->
<section class="flex flex-col gap-4">
	<div class="flex items-center gap-2 mb-6">
		<input
			id="maps-url"
			type="text"
			bind:value={locationState.location.name}
			placeholder="Location Name"
			class={inputClasses}
		/>
	</div>

	<div class="border p-4 border-border-input rounded-md">
		<!-- Google Maps URL Input -->
		<div class="maps-url-section">
			<label for="maps-url">Google Maps Share Link</label>
			<div class="maps-url-input-wrapper flex flex-col">
				<input
					id="maps-url"
					type="text"
					bind:value={mapsUrl}
					placeholder="Paste Google Maps share link (e.g., https://maps.app.goo.gl/...)"
					class={inputClasses}
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
			<div class="flex flex-col gap-4">
				<div class="flex flex-col sm:flex-row gap-4 flex-1">
					<div class="flex flex-col gap-2 flex-1">
						<label for="latitude">Latitude*</label>
						<input
							type="number"
							step="any"
							bind:value={locationState.location.latitude}
							onpaste={handlePaste}
							class={inputClasses}
							placeholder="e.g., 37.977217"
						/>
					</div>

					<div class="flex flex-col gap-2 flex-1">
						<label for="longitude">Longitude*</label>
						<input
							type="number"
							step="any"
							bind:value={locationState.location.longitude}
							class={inputClasses}
							placeholder="e.g., 23.730278"
						/>
					</div>
				</div>
				<div class="flex flex-col gap-2">
					<p class="text-center italic text-gray-500">Or open the map</p>
					<Popover.Trigger type="button" class="cursor-pointer rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex h-12 items-center justify-center px-[21px] text-[15px] font-semibold active:scale-[0.98] active:transition-all gap-2 whitespace-nowrap">
						<MapPin class="size-5" />
						<span>Open Map</span>
					</Popover.Trigger>
				</div>
			</div>
			<Popover.Content
				class="popover-map-content"
				sideOffset={8}
			>
				<div class="w-full h-full">
					<Map
						location={{ latitude: locationState.location.latitude || DEFAULT_LOCATION.latitude, longitude: locationState.location.longitude || DEFAULT_LOCATION.longitude }}
						zoom={9}
						markerMarkup={`
							<div class="marker">
								<p><strong>Fishing Spot</strong></p>
								<p>Lat: ${(locationState.location.latitude || DEFAULT_LOCATION.latitude).toFixed(6)}</p>
								<p>Lng: ${(locationState.location.longitude || DEFAULT_LOCATION.longitude).toFixed(6)}</p>
							</div>
						`}
						onMarkerPlace={handleMapClick}
					/>
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>

	<div class="flex flex-col gap-4 justify-center items-center">
		<div class="flex flex-col justify-center items-center">
			<h3>Car Difficulty</h3>
			<Rating bind:value={locationState.location.carDifficulty} />
		</div>
		<div class="flex flex-col justify-center items-center">
			<h3>Walk Difficulty</h3>
			<Rating bind:value={locationState.location.walkDifficulty} />
		</div>
		<div class="flex flex-col justify-center items-center">
			<h3>Location Overall Rating</h3>
			<Rating bind:value={locationState.location.rating} />
		</div>
	</div>
</section>

<style>
	h3 {
		font-size: 1.25rem;
		font-weight: 500;
	}

	label {
		font-weight: 500;
		font-size: 0.875rem;
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
		background: #242424;
		border-radius: 0.75rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		padding: 1rem;
		max-width: 90vw;
		width: 600px;
		min-height: 400px;
		height: min(400px, 10dvh);
	}
</style>
