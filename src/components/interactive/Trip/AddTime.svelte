<script lang="ts">
	import { TimeRangeField } from "bits-ui";
	import { Time } from "@internationalized/date";

	let {
		startTime = $bindable<string | undefined>(undefined),
		endTime = $bindable<string | undefined>(undefined)
	}: {
		startTime?: string | undefined;
		endTime?: string | undefined;
	} = $props();

	// Create Time objects from string values if they exist
	let timeRangeValue = $state<{ start: Time | undefined; end: Time | undefined }>({
		start: startTime ? parseTimeString(startTime) : undefined,
		end: endTime ? parseTimeString(endTime) : undefined
	});

	// Helper function to parse HH:MM:SS time string to Time object
	function parseTimeString(timeStr: string): Time | undefined {
		if (!timeStr) return undefined;
		const parts = timeStr.split(':');
		if (parts.length >= 2) {
			const hour = parseInt(parts[0], 10);
			const minute = parseInt(parts[1], 10);
			const second = parts.length >= 3 ? parseInt(parts[2], 10) : 0;
			return new Time(hour, minute, second);
		}
		return undefined;
	}

	// Helper function to format Time object to HH:MM:SS string
	function formatTimeToString(time: Time | undefined): string | undefined {
		if (!time) return undefined;
		const hour = time.hour.toString().padStart(2, '0');
		const minute = time.minute.toString().padStart(2, '0');
		const second = time.second.toString().padStart(2, '0');
		return `${hour}:${minute}:${second}`;
	}

	// Update parent bindings when timeRangeValue changes
	$effect(() => {
		startTime = formatTimeToString(timeRangeValue.start);
		endTime = formatTimeToString(timeRangeValue.end);
	});
</script>

<TimeRangeField.Root
	bind:value={timeRangeValue}
	granularity="minute"
	hourCycle={24}
>
	<div class="flex w-full max-w-full flex-col gap-3">
		<TimeRangeField.Label class="block select-none text-sm font-medium">
			Select Time Range ⏱️
		</TimeRangeField.Label>

		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
			<!-- Start Time Input -->
			<div class="flex flex-col gap-1.5">
				<span class="text-xs text-muted-foreground">Start Time</span>
				<TimeRangeField.Input
					type="start"
					class="h-input rounded-input border-border-input bg-background text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover flex w-full max-w-[200px] select-none items-center border px-3 py-3 text-sm tracking-[0.01em]"
				>
					{#snippet children({ segments })}
						{#each segments as { part, value }, i (part + i)}
							<div class="inline-block select-none">
								{#if part === "literal"}
									<TimeRangeField.Segment {part} class="text-muted-foreground p-1">
										{value}
									</TimeRangeField.Segment>
								{:else}
									<TimeRangeField.Segment
										{part}
										class="rounded-5px hover:bg-muted focus:bg-muted focus:text-foreground aria-[valuetext=Empty]:text-muted-foreground focus-visible:ring-0! focus-visible:ring-offset-0! px-1.5 py-1"
									>
										{value}
									</TimeRangeField.Segment>
								{/if}
							</div>
						{/each}
					{/snippet}
				</TimeRangeField.Input>
			</div>

			<span class="text-muted-foreground hidden sm:block">to</span>

			<!-- End Time Input -->
			<div class="flex flex-col gap-1.5">
				<span class="text-xs text-muted-foreground">End Time</span>
				<TimeRangeField.Input
					type="end"
					class="h-input rounded-input border-border-input bg-background text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover flex w-full max-w-[200px] select-none items-center border px-3 py-3 text-sm tracking-[0.01em]"
				>
					{#snippet children({ segments })}
						{#each segments as { part, value }, i (part + i)}
							<div class="inline-block select-none">
								{#if part === "literal"}
									<TimeRangeField.Segment {part} class="text-muted-foreground p-1">
										{value}
									</TimeRangeField.Segment>
								{:else}
									<TimeRangeField.Segment
										{part}
										class="rounded-5px hover:bg-muted focus:bg-muted focus:text-foreground aria-[valuetext=Empty]:text-muted-foreground focus-visible:ring-0! focus-visible:ring-offset-0! px-1.5 py-1"
									>
										{value}
									</TimeRangeField.Segment>
								{/if}
							</div>
						{/each}
					{/snippet}
				</TimeRangeField.Input>
			</div>
		</div>
	</div>
</TimeRangeField.Root>
