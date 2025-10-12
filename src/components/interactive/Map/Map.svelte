<script lang="ts">
	import { setMap } from "./Map";
	import "leaflet/dist/leaflet.css";

	let {
		location,
		zoom = 19,
		markerMarkup = "",
		onMarkerPlace,
	}: {
		location: { latitude?: number; longitude?: number };
		zoom: number;
		markerMarkup: string;
		onMarkerPlace?: (lat: number, lng: number) => void;
	} = $props();

	const { latitude, longitude } = location;

	function handleMarkerPlace(lat: number, lng: number) {
		if (onMarkerPlace) {
			onMarkerPlace(lat, lng);
		}
	}
 </script>

{#if latitude && longitude}
	<figure class="map-container" use:setMap={{ latitude, longitude, zoom, markerMarkup, onMarkerPlace: handleMarkerPlace }} ></figure>
{:else}
	<div class="flex items-center justify-center h-full">
		<h1 class="text-2xl">Please add a location..</h1>
	</div>
{/if}

<style>
	.map-container {
		width: 100%;
		height: 100%;
	}
</style>
