<script lang="ts">
	import { setMap } from "./Map";
	import "leaflet/dist/leaflet.css";

	let {
		location,
		zoom = 19,
		markerMarkup = "",
		onMarkerPlace,
		ignoreMarkerClick = false
	}: {
		location: { latitude: number; longitude: number };
		zoom: number;
		markerMarkup: string;
		onMarkerPlace?: (lat: number, lng: number) => void;
		ignoreMarkerClick: boolean;
	} = $props();

	const { latitude, longitude } = location;

	function handleMarkerPlace(lat: number, lng: number) {
		if (onMarkerPlace) {
			onMarkerPlace(lat, lng);
		}
	}
 </script>

<figure class="map-container" use:setMap={{ latitude, longitude, zoom, markerMarkup, onMarkerPlace: handleMarkerPlace, ignoreMarkerClick }} ></figure>

<style>
	.map-container {
		width: 100%;
		height: 100%;
	}
</style>
