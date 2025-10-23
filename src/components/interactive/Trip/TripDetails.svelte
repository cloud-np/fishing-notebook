<script lang="ts">
	import type { Trip } from "@types";
	import MapPin from "phosphor-svelte/lib/MapPin";
	import Clock from "phosphor-svelte/lib/Clock";
	import Star from "phosphor-svelte/lib/Star";
	import Calendar from "phosphor-svelte/lib/Calendar";
	import CarSimple from "phosphor-svelte/lib/CarSimple";
	import PersonSimpleWalk from "phosphor-svelte/lib/PersonSimpleWalk";
	import Note from "phosphor-svelte/lib/Note";
	import X from "phosphor-svelte/lib/X";
	import Map from "@components/interactive/Map/Map.svelte";

	interface Props {
		trip: Trip;
	}

	// let selectedWeather = $derived(weatherState.weather);

	let { trip }: Props = $props();
	let isMapOpen = $state(false);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const formatTime = (timeString?: string) => {
		if (!timeString) return null;
		return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	};

	const renderStars = (rating?: number) => {
		if (!rating) return [];
		return Array.from({ length: 5 }, (_, i) => i < rating);
	};

	const getDifficultyLabel = (level?: number) => {
		if (!level) return 'N/A';
		const labels = ['', 'Easy', 'Moderate', 'Hard', 'Very Hard', 'Extreme'];
		return labels[level] || 'N/A';
	};
</script>

<div class="border-dark-10 bg-background-alt shadow-card mt-6 rounded-[15px] border p-6">
	<!-- Header -->
	<div class="mb-6">
		{#if trip.title}
			<h2 class="text-2xl lg:text-3xl font-semibold text-foreground mb-2">{trip.title}</h2>
		{/if}

		<div class="flex items-center gap-2 text-muted-foreground">
			<Calendar class="size-5" />
			<span class="text-base lg:text-lg">{formatDate(trip.tripDate)}</span>
		</div>
	</div>

	<!-- Time Information -->
	{#if trip.startTime || trip.endTime}
		<div class="mb-6 flex items-center gap-4 text-foreground">
			<Clock class="size-5 text-muted-foreground" />
			<div class="flex gap-3">
				{#if trip.startTime}
					<span><span class="text-muted-foreground">Start:</span> {formatTime(trip.startTime)}</span>
				{/if}
				{#if trip.endTime}
					<span><span class="text-muted-foreground">End:</span> {formatTime(trip.endTime)}</span>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Rating -->
	{#if trip.rating}
		<div class="mb-6 flex items-center gap-3">
			<span class="text-muted-foreground">Trip Rating:</span>
			<div class="flex gap-1">
				{#each renderStars(trip.rating) as filled}
					<Star class="size-5 {filled ? 'text-yellow-500' : 'text-muted-foreground'}" weight={filled ? 'fill' : 'regular'} />
				{/each}
			</div>
		</div>
	{/if}

	<!-- Location Details -->
	{#if trip.location}
		<div class="border-t border-dark-10 pt-6 mb-6">
			<div class="flex items-start gap-3 mb-4">
				<MapPin class="size-6 text-muted-foreground mt-1" />
				<div class="flex-1">
					{#if trip.location.name}
						<h3 class="text-lg font-medium text-foreground mb-2">{trip.location.name}</h3>
					{/if}
					<p class="text-sm text-muted-foreground">
						{trip.location.latitude.toFixed(6)}, {trip.location.longitude.toFixed(6)}
					</p>
				</div>
			</div>

			<!-- Location Rating -->
			{#if trip.location.rating}
				<div class="flex items-center gap-3 mb-3">
					<span class="text-sm text-muted-foreground">Location Rating:</span>
					<div class="flex gap-1">
						{#each renderStars(trip.location.rating) as filled}
							<Star class="size-4 {filled ? 'text-yellow-500' : 'text-muted-foreground'}" weight={filled ? 'fill' : 'regular'} />
						{/each}
					</div>
				</div>
			{/if}

			<!-- Difficulty Levels -->
			<div class="grid grid-cols-2 gap-4 mt-4">
				{#if trip.location.carDifficulty}
					<div class="flex items-center gap-2 text-sm flex-wrap">
						<CarSimple class="size-5 text-muted-foreground" />
						<span class="text-muted-foreground">Car Access:</span>
						<span class="font-medium text-foreground">{getDifficultyLabel(trip.location.carDifficulty)}</span>
					</div>
				{/if}

				{#if trip.location.walkDifficulty}
					<div class="flex items-center gap-2 text-sm flex-wrap">
						<PersonSimpleWalk class="size-5 text-muted-foreground" />
						<span class="text-muted-foreground">Walk Access:</span>
						<span class="font-medium text-foreground">{getDifficultyLabel(trip.location.walkDifficulty)}</span>
					</div>
				{/if}
			</div>

			<!-- Map -->
			<div class="mt-6">
				{#if !isMapOpen}
					<button
						onclick={() => isMapOpen = true}
						class="inline-flex items-center gap-2 px-4 py-2.5 bg-dark text-background rounded-lg hover:bg-dark/95 transition-all active:scale-[0.98] font-medium"
					>
						<MapPin class="size-5" />
						<span>Open Map</span>
					</button>
				{:else}
					<div class="relative rounded-lg overflow-hidden border border-dark-10">
						<button
							onclick={() => isMapOpen = false}
							class="absolute z-[2] top-3 right-3 bg-background/90 hover:bg-background text-foreground rounded-lg p-2 shadow-lg transition-all active:scale-[0.95] backdrop-blur-sm"
							aria-label="Close map"
						>
							<X class="size-5" weight="bold" />
						</button>
						<div class="h-[300px] lg:h-[400px]">
							<Map
								location={{ latitude: trip.location.latitude, longitude: trip.location.longitude }}
								zoom={15}
								ignoreMarkerClick={true}
								markerMarkup=""
							/>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Notes -->
	{#if trip.notes}
		<div class="border-t border-dark-10 pt-6">
			<div class="flex items-start gap-3">
				<Note class="size-5 text-muted-foreground mt-1" />
				<div class="flex-1">
					<h3 class="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
					<p class="text-foreground whitespace-pre-wrap">{trip.notes}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Metadata -->
	<div class="border-t border-dark-10 pt-4 mt-6">
		<div class="flex justify-between text-xs text-muted-foreground">
			<span>Created: {new Date(trip.createdAt).toLocaleDateString()}</span>
			<span>Updated: {new Date(trip.updatedAt).toLocaleDateString()}</span>
		</div>
	</div>
</div>
