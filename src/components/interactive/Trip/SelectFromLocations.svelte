<script lang="ts">
	import { Select } from "bits-ui";
	import Check from "phosphor-svelte/lib/Check";
	import Gps from "phosphor-svelte/lib/Gps";
	import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
	import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
	import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";
	import { locationState } from "@components/interactive/Trip/location.shared.svelte";
	import { onMount } from "svelte";
	import { actions } from "astro:actions";
	import type { Location } from "@types";

	let locations = $state<Location[]>([]);

	onMount(async () => {
		const { data, error } = await actions.location.getLocations();
		if (data && data.success) {
			locations = data.locations;
		} else if (error) {
			console.error("Failed to load locations:", error);
		}
	});

	// Create items array for Select component
	const selectItems = $derived(
		locations.map((loc) => ({
			value: loc.name || `${loc.latitude},${loc.longitude}`,
			label: loc.name || `Location at ${loc.latitude}, ${loc.longitude}`,
		}))
	);

	let value = $state<string>("");
	const selectedLabel = $derived(
		value
			? selectItems.find((item) => item.value === value)?.label
			: "Select a Location"
	);

	// Update the bindable location when value changes
	$effect(() => {
		if (value) {
			const selectedLocation = locations.find(
				(loc) => (loc.name || `${loc.latitude},${loc.longitude}`) === value
			);
			if (selectedLocation) {
				locationState.set({ ...selectedLocation });
			}
		}
	});
</script>

<Select.Root
	type="single"
	onValueChange={(v) => (value = v || "")}
	items={selectItems}
	allowDeselect={true}
>
	<Select.Trigger
		type="button"
		class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-[296px] touch-none select-none items-center border px-[11px] text-sm transition-colors"
		aria-label="Select a location"
	>
		<Gps class="text-muted-foreground mr-[9px] size-6" />
		{selectedLabel}
		<CaretUpDown class="text-muted-foreground ml-auto size-6" />
	</Select.Trigger>
	<Select.Portal>
		<Select.Content
			class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
			sideOffset={10}
		>
			<Select.ScrollUpButton class="flex w-full items-center justify-center">
				<CaretDoubleUp class="size-3" />
			</Select.ScrollUpButton>
			<Select.Viewport class="p-1">
				{#each selectItems as item}
					<Select.Item
						class="rounded-button data-highlighted:bg-muted outline-hidden data-disabled:opacity-50 flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize"
						value={item.value}
						label={item.label}
					>
						{#snippet children({ selected })}
							{item.label}
							{#if selected}
								<div class="ml-auto">
									<Check aria-label="check" />
								</div>
							{/if}
						{/snippet}
					</Select.Item>
				{/each}
			</Select.Viewport>
			<Select.ScrollDownButton class="flex w-full items-center justify-center">
				<CaretDoubleDown class="size-3" />
			</Select.ScrollDownButton>
		</Select.Content>
	</Select.Portal>
</Select.Root>
