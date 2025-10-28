<script lang="ts">
	import type { HourlyWeather } from "@types";
	import { weatherService } from "@client-libs/store/store.svelte";
	import Thermometer from "phosphor-svelte/lib/Thermometer";
	import Wind from "phosphor-svelte/lib/Wind";
	import CloudRain from "phosphor-svelte/lib/CloudRain";
	import Gauge from "phosphor-svelte/lib/Gauge";
	import Skeleton from "@components/common/Skeleton.svelte";
	import NoData from "@components/common/NoData.svelte";

	interface Props {
		latitude: number;
		longitude: number;
		date: string;
	}

	let { latitude, longitude, date }: Props = $props();
	let initialized = $state(false);
	let weatherData = $state<HourlyWeather[]>([]);
	let isLoading = $state(true);
	let selectedHour = $derived(weatherData[0]);

	let averages = $derived.by(() => {
		if (weatherData.length === 0) return undefined;

		const sum = weatherData.reduce((acc, hour) => ({
			temperature: acc.temperature + (hour.temperature ?? 0),
			windSpeed: acc.windSpeed + (hour.windSpeed ?? 0),
			cloudCover: acc.cloudCover + (hour.cloudCover ?? 0),
			pressure: acc.pressure + (hour.surfacePressure ?? 0),
		}), { temperature: 0, windSpeed: 0, cloudCover: 0, pressure: 0 });

		const count = weatherData.length;
		return {
			temperature: (sum.temperature / count).toFixed(1),
			windSpeed: (sum.windSpeed / count).toFixed(1),
			cloudCover: (sum.cloudCover / count).toFixed(0),
			pressure: (sum.pressure / count).toFixed(0),
		};
	});

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

	$effect(() => {
	    // Track these values
	    const deps = { latitude, longitude, date };

	    const fetchWeather = async () => {
	        isLoading = true;
	        weatherData = await weatherService.getWeatherByDate(deps.longitude, deps.latitude, deps.date);
	        isLoading = false;
	    };

	    if (!initialized) {
	        initialized = true;
	    }

	    fetchWeather();
	});

	const statClasses = "w-35 h-30 flex items-center gap-3 p-3 bg-background rounded-lg border border-dark-10";
	const detailedStaClasses = "grow-0 min-w-0 w-40 p-4 bg-background rounded-lg border border-dark-10";
</script>

<div class="border-t border-dark-10 pt-6 mb-6">
	<h3 class="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
		<CloudRain class="size-5 text-muted-foreground" />
		Weather Conditions
	</h3>

	<!-- Average Day Summary -->
	<div class="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
		<div class={statClasses}>
			<Skeleton {isLoading}>
				<div>
					<Thermometer class="size-6 text-muted-foreground" />
					<div>
						<p class="text-xs text-muted-foreground">Avg Temp</p>
						<NoData data={averages?.temperature} class="text-lg font-semibold text-foreground">
							°C
						</NoData>
					</div>
				</div>
			</Skeleton>
		</div>

		<div class={statClasses}>
			<Skeleton {isLoading}>
				<Wind class="size-6 text-muted-foreground" />
				<div>
					<p class="text-xs text-muted-foreground">Avg Wind</p>
					<NoData data={averages?.windSpeed} class="text-lg font-semibold text-foreground">
						 km/h
					</NoData>
				</div>
			</Skeleton>
		</div>

		<div class={statClasses}>
			<Skeleton {isLoading}>
				<CloudRain class="size-6 text-muted-foreground" />
				<div>
					<p class="text-xs text-muted-foreground">Avg Cloud</p>
					<NoData data={averages?.cloudCover} class="text-lg font-semibold text-foreground">
						%
					</NoData>
				</div>
			</Skeleton>
		</div>

		<div class={statClasses}>
			<Skeleton {isLoading}>
				<Gauge class="size-6 text-muted-foreground" />
				<div>
					<p class="text-xs text-muted-foreground">Avg Pressure</p>
					<NoData data={averages?.pressure} class="text-lg font-semibold text-foreground">
						hPa
					</NoData>
				</div>
			</Skeleton>
		</div>
	</div>

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
		<div class="flex flex-col sm:flex-row flex-wrap gap-4">
			<!-- Temperature -->
			<div class={detailedStaClasses}>
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
			<div class={detailedStaClasses}>
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
			<div class={detailedStaClasses}>
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
			<div class={detailedStaClasses}>
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
</div>
