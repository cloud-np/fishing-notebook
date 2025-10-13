<script lang="ts">
	import { setMap } from "./Map";
	import "leaflet/dist/leaflet.css";

	let {
		location,
		zoom = 19,
		markerMarkup = "",
		onMarkerPlace,
	}: {
		location: { latitude: number; longitude: number };
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

<figure class="map-container" use:setMap={{ latitude, longitude, zoom, markerMarkup, onMarkerPlace: handleMarkerPlace }} ></figure>

<style>
	.map-container {
		width: 100%;
		height: 100%;
		min-height: 400px;
	}
</style>
