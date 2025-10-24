<script lang="ts">
	import type { HourlyWeather } from "@types";
	import { actions } from "astro:actions";
	import { onMount } from "svelte";
	import { weatherState } from "../Trip/trip.shared.svelte";
	import Thermometer from "phosphor-svelte/lib/Thermometer";
	import Wind from "phosphor-svelte/lib/Wind";
	import CloudRain from "phosphor-svelte/lib/CloudRain";
	import Gauge from "phosphor-svelte/lib/Gauge";

	interface Props {
		latitude: number;
		longitude: number;
		date: string;
	}

	let { latitude, longitude, date }: Props = $props();
	let weatherData = $state<HourlyWeather[]>([]);
	let isLoading = $state(true);
	let selectedHour = $state<HourlyWeather | null>(null);

	const fetchWeather = async (date: string) => {
		const { data, error } = await actions.weather.getByDate({
			longitude,
			latitude,
			date,
		});

		if (data && data.success) {
			return data.data;
		} else if (error) {
			console.error("Failed to load weather:", error);
		}
	};

	const formatTime = (timeString: string) => {
		const date = new Date(timeString);
		return date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	};

	const getWindDirection = (degrees: number | undefined) => {
		if (degrees === undefined) return 'N/A';
		const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
		const index = Math.round(degrees / 45) % 8;
		return directions[index];
	};

	const getAverageForDay = (data: HourlyWeather[]) => {
		if (data.length === 0) return null;

		const sum = data.reduce((acc, hour) => ({
			temperature: acc.temperature + (hour.temperature ?? 0),
			windSpeed: acc.windSpeed + (hour.windSpeed ?? 0),
			cloudCover: acc.cloudCover + (hour.cloudCover ?? 0),
			pressure: acc.pressure + (hour.surfacePressure ?? 0),
		}), { temperature: 0, windSpeed: 0, cloudCover: 0, pressure: 0 });

		const count = data.length;
		return {
			temperature: (sum.temperature / count).toFixed(1),
			windSpeed: (sum.windSpeed / count).toFixed(1),
			cloudCover: (sum.cloudCover / count).toFixed(0),
			pressure: (sum.pressure / count).toFixed(0),
		};
	};

	onMount(async () => {
		// Fetch weather data for the trip
		const data = await fetchWeather(date) as HourlyWeather[];
		weatherData = data;
		// Set the first hour as selected by default
		if (data && data.length > 0) {
			selectedHour = data[0];
		}
		isLoading = false;
		// Update the weather state with the fetched data
		weatherState.setHourlyWeather(data);
	});

	$effect(() => {
		if (weatherData.length > 0 && !selectedHour) {
			selectedHour = weatherData[0];
		}
	});
</script>

<div class="border-t border-dark-10 pt-6 mb-6">
	<h3 class="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
		<CloudRain class="size-5 text-muted-foreground" />
		Weather Conditions
	</h3>

	{#if isLoading}
		<div class="text-muted-foreground text-sm">Loading weather data...</div>
	{:else if weatherData.length === 0}
		<div class="text-muted-foreground text-sm">No weather data available</div>
	{:else}
		<!-- Average Day Summary -->
		{@const averages = getAverageForDay(weatherData)}
		{#if averages}
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<div class="flex items-center gap-3 p-3 bg-background rounded-lg border border-dark-10">
					<Thermometer class="size-6 text-muted-foreground" />
					<div>
						<p class="text-xs text-muted-foreground">Avg Temp</p>
						<p class="text-lg font-semibold text-foreground">{averages.temperature}°C</p>
					</div>
				</div>

				<div class="flex items-center gap-3 p-3 bg-background rounded-lg border border-dark-10">
					<Wind class="size-6 text-muted-foreground" />
					<div>
						<p class="text-xs text-muted-foreground">Avg Wind</p>
						<p class="text-lg font-semibold text-foreground">{averages.windSpeed} km/h</p>
					</div>
				</div>

				<div class="flex items-center gap-3 p-3 bg-background rounded-lg border border-dark-10">
					<CloudRain class="size-6 text-muted-foreground" />
					<div>
						<p class="text-xs text-muted-foreground">Avg Cloud</p>
						<p class="text-lg font-semibold text-foreground">{averages.cloudCover}%</p>
					</div>
				</div>

				<div class="flex items-center gap-3 p-3 bg-background rounded-lg border border-dark-10">
					<Gauge class="size-6 text-muted-foreground" />
					<div>
						<p class="text-xs text-muted-foreground">Avg Pressure</p>
						<p class="text-lg font-semibold text-foreground">{averages.pressure} hPa</p>
					</div>
				</div>
			</div>
		{/if}

		<!-- Hourly Selection -->
		<div class="mb-4">
			<label for="hour-select" class="text-sm text-muted-foreground mb-2 block">Select Hour:</label>
			<select
				id="hour-select"
				bind:value={selectedHour}
				class="w-full lg:w-auto px-4 py-2 bg-background border border-dark-10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
			>
				{#each weatherData as hour}
					<option value={hour}>{formatTime(hour.time)}</option>
				{/each}
			</select>
		</div>

		<!-- Selected Hour Details -->
		{#if selectedHour}
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<!-- Temperature -->
				<div class="p-4 bg-background rounded-lg border border-dark-10">
					<div class="flex items-center gap-2 mb-3">
						<Thermometer class="size-5 text-muted-foreground" />
						<h4 class="font-medium text-foreground">Temperature</h4>
					</div>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Actual:</span>
							<span class="font-medium text-foreground">{selectedHour.temperature?.toFixed(1) ?? 'N/A'}°C</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Feels Like:</span>
							<span class="font-medium text-foreground">{selectedHour.feelsLike?.toFixed(1) ?? 'N/A'}°C</span>
						</div>
					</div>
				</div>

				<!-- Wind -->
				<div class="p-4 bg-background rounded-lg border border-dark-10">
					<div class="flex items-center gap-2 mb-3">
						<Wind class="size-5 text-muted-foreground" />
						<h4 class="font-medium text-foreground">Wind</h4>
					</div>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Speed:</span>
							<span class="font-medium text-foreground">{selectedHour.windSpeed?.toFixed(1) ?? 'N/A'} km/h</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Direction:</span>
							<span class="font-medium text-foreground">{getWindDirection(selectedHour.windDirection ?? undefined)}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Gusts:</span>
							<span class="font-medium text-foreground">{selectedHour.windGusts?.toFixed(1) ?? 'N/A'} km/h</span>
						</div>
					</div>
				</div>

				<!-- Atmospheric -->
				<div class="p-4 bg-background rounded-lg border border-dark-10">
					<div class="flex items-center gap-2 mb-3">
						<Gauge class="size-5 text-muted-foreground" />
						<h4 class="font-medium text-foreground">Atmospheric</h4>
					</div>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Pressure:</span>
							<span class="font-medium text-foreground">{selectedHour.surfacePressure?.toFixed(0) ?? 'N/A'} hPa</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Cloud Cover:</span>
							<span class="font-medium text-foreground">{selectedHour.cloudCover?.toFixed(0) ?? 'N/A'}%</span>
						</div>
					</div>
				</div>

				<!-- Precipitation -->
				<div class="p-4 bg-background rounded-lg border border-dark-10">
					<div class="flex items-center gap-2 mb-3">
						<CloudRain class="size-5 text-muted-foreground" />
						<h4 class="font-medium text-foreground">Precipitation</h4>
					</div>
					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Probability:</span>
							<span class="font-medium text-foreground">{selectedHour.precipitationProbability?.toFixed(0) ?? 'N/A'}%</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Rain:</span>
							<span class="font-medium text-foreground">{selectedHour.rain?.toFixed(1) ?? 'N/A'} mm</span>
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>
