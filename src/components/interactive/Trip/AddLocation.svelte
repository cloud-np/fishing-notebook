<script lang="ts">
	import Map from "@components/interactive/Map/Map.svelte";
	import { actions } from "astro:actions";
	import * as Popover from "$lib/components/ui/popover";
	import { userValueToPosition } from "@utils/helpers";
	import Rating from "@components/interactive/Rating/Rating.svelte";
	import { locationState } from "@components/interactive/Trip/location.shared.svelte";
	import MapPin from "phosphor-svelte/lib/MapPin";
	import { cn } from "$lib/utils";
	import { buttonVariants } from "$lib/components/ui/button/button.svelte";
	import Input from "$lib/components/ui/input/input.svelte";

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
</script>

<!-- Location Selection -->
<section class="flex flex-col gap-4">
	<div class="flex items-center gap-2 mb-6">
		<Input
			id="location-name"
			type="text"
			bind:value={locationState.location.name}
			placeholder="Location Name"
			class="h-12"
		/>
	</div>

	<div class="mb-8 border p-4 border-border-input rounded-md">
		<!-- Google Maps URL Input -->
		<div class="maps-url-section">
			<label for="maps-url">Google Maps Share Link</label>
			<div class="maps-url-input-wrapper">
				<Input
					id="maps-url"
					type="text"
					bind:value={mapsUrl}
					placeholder="Paste Google Maps share link (e.g., https://maps.app.goo.gl/...)"
					class="h-12"
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
						<label for="latitude">Latitude*</label>
						<Input
							id="latitude"
							type="number"
							step="any"
							bind:value={locationState.location.latitude}
							onpaste={handlePaste}
							placeholder="e.g., 37.977217"
							class="h-12"
						/>
					</div>

					<div class="flex flex-col gap-2">
						<label for="longitude">Longitude*</label>
						<Input
							id="longitude"
							type="number"
							step="any"
							bind:value={locationState.location.longitude}
							placeholder="e.g., 23.730278"
							class="h-12"
						/>
					</div>
				</div>
				<div class="flex flex-col gap-2">
					<p class="help-text">Or open the map</p>
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: "default" }),
							"cursor-pointer gap-2"
						)}
					>
						<MapPin class="size-5" />
						Open Map
					</Popover.Trigger>
				</div>
			</div>
			<Popover.Content
				class="z-50 bg-[#242424] rounded-xl shadow-lg p-4 max-w-[90vw] w-[600px] min-h-[400px]"
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
		<div class="flex gap-4">
			<div class="flex flex-col justify-center items-center">
				<h3>Car Difficulty</h3>
				<Rating bind:value={locationState.location.carDifficulty} />
			</div>
			<div class="flex flex-col justify-center items-center">
				<h3>Walk Difficulty</h3>
				<Rating bind:value={locationState.location.walkDifficulty} />
			</div>
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
</style>
