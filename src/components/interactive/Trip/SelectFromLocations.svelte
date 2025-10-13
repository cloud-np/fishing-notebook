<script lang="ts">
	import Check from "phosphor-svelte/lib/Check";
	import Gps from "phosphor-svelte/lib/Gps";
	import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
	import { locationState } from "@components/interactive/Trip/location.shared.svelte";
	import { onMount } from "svelte";
	import { actions } from "astro:actions";
	import type { Location } from "@types";
	import * as Popover from "$lib/components/ui/popover";
	import * as Command from "$lib/components/ui/command";
	import { cn } from "$lib/utils";
	import { buttonVariants } from "$lib/components/ui/button/button.svelte";

	let locations = $state<Location[]>([]);
	let open = $state(false);
	let value = $state<string>("");

	onMount(async () => {
		const { data, error } = await actions.location.getLocations();
		if (data && data.success) {
			locations = data.locations;
		} else if (error) {
			console.error("Failed to load locations:", error);
		}
	});

	// Create items array for Combobox
	const comboboxItems = $derived(
		locations.map((loc, index) => ({
			id: `${loc.latitude}-${loc.longitude}-${index}`,
			value: loc.name || `${loc.latitude},${loc.longitude}`,
			label: loc.name || `Location at ${loc.latitude}, ${loc.longitude}`,
			location: loc,
		}))
	);

	const selectedLabel = $derived(
		value
			? comboboxItems.find((item) => item.value === value)?.label
			: "Select a Location"
	);

	// Update the bindable location when value changes
	$effect(() => {
		if (value) {
			const selectedItem = comboboxItems.find((item) => item.value === value);
			if (selectedItem) {
				locationState.set({ ...selectedItem.location });
			}
		}
	});

	function handleSelect(currentValue: string) {
		value = currentValue === value ? "" : currentValue;
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		class={cn(
			buttonVariants({ variant: "outline" }),
			"w-[296px] justify-start text-left font-normal",
			!value && "text-muted-foreground"
		)}
		role="combobox"
		aria-expanded={open}
	>
		<Gps class="mr-2 size-4" />
		<span class="flex-1 truncate">{selectedLabel}</span>
		<CaretUpDown class="ml-2 size-4 shrink-0 opacity-50" />
	</Popover.Trigger>
	<Popover.Content class="w-[296px] p-0">
		<Command.Command>
			<Command.Input placeholder="Search location..." class="h-9" />
			<Command.Empty>No location found.</Command.Empty>
			<Command.List>
				<Command.Group>
					{#each comboboxItems as item (item.id)}
						<Command.Item
							value={item.value}
							onSelect={() => handleSelect(item.value)}
							class="flex items-center gap-2"
						>
							<Check
								class={cn(
									"size-4",
									value === item.value ? "opacity-100" : "opacity-0"
								)}
							/>
							<span class="truncate">{item.label}</span>
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Command.Command>
	</Popover.Content>
</Popover.Root>
