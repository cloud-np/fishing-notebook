<script lang="ts">
	import Calendar from "@components/interactive/Calendar/Calendar.svelte";
	import { tripService } from "@client-libs/store/store.svelte";
	import Plus from "phosphor-svelte/lib/Plus";
	import PencilSimple from "phosphor-svelte/lib/PencilSimple";

	let selectedTrip = $derived(tripService.trip);
</script>

<div class="mb-6 flex justify-end flex-col px-6">
	<div class="flex gap-2 justify-end">
		{#if selectedTrip}
			<a
				href={`/edit-trip/${selectedTrip.tripDate}`}
				class="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
			>
				<PencilSimple class="size-5" weight="bold" />
				<span>Edit Trip</span>
			</a>
		{/if}
		<a
			href="/add-trip"
			class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
		>
			<Plus class="size-5" weight="bold" />
			<span>Add Trip</span>
		</a>
	</div>
	<div class="flex flex-col sm:flex-row gap-4">
		<Calendar />

		<!-- TODO: When we open TripDetails then try to fetch weather data -->
		{#if selectedTrip}
			{#await import("@components/interactive/Trip/TripDetails.svelte") then TripDetails}
				<TripDetails.default trip={selectedTrip} />
			{/await}
		{/if}
	</div>
</div>
