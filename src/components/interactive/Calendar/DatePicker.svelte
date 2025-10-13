<script lang="ts">
	import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";
	import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
	import * as Popover from "$lib/components/ui/popover";
	import * as Calendar from "$lib/components/ui/calendar";
	import { cn } from "$lib/utils";
	import { buttonVariants } from "$lib/components/ui/button/button.svelte";

	let {
		value = $bindable<CalendarDate | undefined>(undefined)
	}: {
		value?: CalendarDate | undefined;
	} = $props();

	let contentRef: HTMLElement | null = $state(null);
	const df = new DateFormatter("en-US", {
		dateStyle: "long"
	});
</script>

<!-- <div class="flex w-full max-w-[232px] flex-col gap-3">
	<span class="block select-none text-sm font-medium">Select Date 📅</span>
	<Popover.Root>
		<Popover.Trigger
			class={cn(
				buttonVariants({
					variant: "outline"
				}),
				"w-full max-w-[232px] justify-start text-left font-normal",
				!value && "text-muted-foreground"
			)}
		>
			<CalendarBlank class="size-4 mr-2" />
			{value ? df.format(value.toDate(getLocalTimeZone())) : "Pick a date"}
		</Popover.Trigger>
		<Popover.Content bind:ref={contentRef} class="w-auto p-0">
			<Calendar.Calendar type="single" bind:value weekdayFormat="short" fixedWeeks={true} />
		</Popover.Content>
	</Popover.Root>
</div> -->
