<script lang="ts">
	import "leaflet/dist/leaflet.css";
	import type { Map as LeafletMap, Marker } from "leaflet";
	import { initializeMap, updateMapLocation } from "./Map";

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
		ignoreMarkerClick?: boolean;
	} = $props();

	let mapElement: HTMLElement;
	let map: LeafletMap | null = null;
	let currentMarker: Marker | null = null;
	let markerIcon: any = null;
	let leafletMarker: any = null;

	$effect(() => {
		if (!mapElement) return;

		(async () => {
			const { latitude, longitude } = location;

			if (!map) {
				// Initialize map only once
				const result = await initializeMap(mapElement, {
					latitude,
					longitude,
					zoom,
					markerMarkup,
					onMarkerPlace,
					ignoreMarkerClick,
				});

				map = result.map;
				markerIcon = result.markerIcon;
				leafletMarker = result.marker;
			} else if (latitude && longitude && leafletMarker) {
				// Update map view and marker when location changes
				currentMarker = updateMapLocation(
					map,
					markerIcon,
					leafletMarker,
					currentMarker,
					{
						latitude,
						longitude,
						zoom,
						markerMarkup,
					}
				);
			}
		})();
	});
 </script>

<figure class="map-container" bind:this={mapElement}></figure>

<style>
	.map-container {
		width: 100%;
		height: 100%;
		z-index: 1;
	}
</style>
