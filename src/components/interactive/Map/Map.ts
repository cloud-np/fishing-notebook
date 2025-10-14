import type { Marker, TileLayerOptions } from "leaflet";

export function setMap(
	mapElement: HTMLElement,
	{
		latitude,
		longitude,
		zoom,
		markerMarkup = "",
		onMarkerPlace,
		ignoreMarkerClick = false,
	}: {
		latitude: number;
		longitude: number;
		zoom: number;
		markerMarkup?: string;
		onMarkerPlace?: (lat: number, lng: number) => void;
		ignoreMarkerClick?: boolean;
	}
) {
	let currentMarker: Marker | null = null;

	(async () => {
		const { icon: leafletIcon, map: leafletMap, marker: leafletMarker, tileLayer } = await import("leaflet");

		const markerIcon = leafletIcon({
			iconUrl: "/map-marker.svg",
			iconSize: [25, 41],
			iconAnchor: [10, 41],
			popupAnchor: [2, -40],
		});

		const tileLayerOptions: TileLayerOptions = {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			maxZoom: 19,
		};
		const map = leafletMap(mapElement).setView([latitude, longitude], zoom);
		tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", tileLayerOptions).addTo(map);

		// Add initial marker if coordinates are provided
		if (latitude && longitude) {
			currentMarker = leafletMarker([latitude, longitude], { icon: markerIcon });
			if (markerMarkup !== "") {
				currentMarker.bindPopup(markerMarkup);
			}
			currentMarker.addTo(map);
		}

		// Add click event listener to place marker on map click
		if (!ignoreMarkerClick && onMarkerPlace) {
			map.on("click", e => {
				const { lat, lng } = e.latlng;

				// Remove existing marker if present
				if (currentMarker) {
					map.removeLayer(currentMarker);
				}

				// Add new marker at clicked location
				currentMarker = leafletMarker([lat, lng], { icon: markerIcon });
				if (markerMarkup !== "") {
					currentMarker.bindPopup(markerMarkup);
				}
				currentMarker.addTo(map);

				// Call the callback with the new coordinates
				onMarkerPlace(lat, lng);
			});
		}
	})();
}
