<script lang="ts">
	import { Calendar } from "bits-ui";
	import { actions } from "astro:actions";
	import cn from "clsx";
	import CaretLeft from "phosphor-svelte/lib/CaretLeft";
	import CaretRight from "phosphor-svelte/lib/CaretRight";
	import { getLocalTimeZone, today } from "@internationalized/date";

	// let currentDate =
	let value = $state(today(getLocalTimeZone()));
	let lastMonthFetched: number | undefined;
	let data: any = $state(undefined);

	$effect(() => {
		$inspect("Calendar value changed: ", value);
		(async () => {
			const ox = await actions.calendar.fetchDay({ date: value.toString(),
				latitude: 37.9838, // Athens, Greece
				longitude: 23.7275
			});
			console.log("edw: ", ox);
			// await actions.calendar.fetchMonth({ date: value.toString() });
		})();
	});

	const buttonClasses = "rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center active:scale-[0.98]";
	const sizing = "size-10 md:size-[6vw] md:text-[2vw]";
	const handleMonthChange = async (isNext: boolean) => {
		// const currentDate = isNext ? value.add({ months: 1 }) : value.subtract({ months: 1 });
		// value = currentDate;
	}
</script>

<button class={buttonClasses} onclick={() =>console.log()}>
	Heelo
</button>
<Calendar.Root
	class="border-dark-10 bg-background-alt shadow-card mt-6 rounded-[15px] border p-[22px]"
	weekdayFormat="short"
	fixedWeeks={true}
	type="single"
	bind:value
>
{#snippet children({ months, weekdays })}
	<Calendar.Header class="flex items-center justify-between md:pb-10">
		<Calendar.PrevButton class={buttonClasses} onclick={() => handleMonthChange(false)}>
			<CaretLeft class="size-6" />
		</Calendar.PrevButton>
		<Calendar.Heading class="text-[2.5vw] font-medium" />
		<Calendar.NextButton class={buttonClasses} onclick={() => handleMonthChange(true)}>
			<CaretRight class="size-6" />
		</Calendar.NextButton>
	</Calendar.Header>
	<div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
		{#each months as month, i (i)}
			<Calendar.Grid class="w-full border-collapse select-none space-y-1">
				<Calendar.GridHead>
					<Calendar.GridRow class="mb-1 flex w-full justify-between">
						{#each weekdays as day, i (i)}
							<Calendar.HeadCell class={cn("text-muted-foreground font-normal! rounded-md", sizing)}>
								<div>{day.slice(0, 2)}</div>
							</Calendar.HeadCell>
						{/each}
					</Calendar.GridRow>
				</Calendar.GridHead>
				<Calendar.GridBody>
					{#each month.weeks as weekDates, i (i)}
						<Calendar.GridRow class="flex w-full">
							{#each weekDates as date, i (i)}
								<Calendar.Cell {date} month={month.value} class={cn("p-0! relative m-0 text-center text-sm focus-within:z-20", sizing)}>
									<Calendar.Day
										class={cn("rounded-9px text-foreground hover:border-foreground data-selected:bg-foreground data-disabled:text-foreground/30 data-selected:text-background ",
										"data-unavailable:text-muted-foreground data-disabled:pointer-events-none data-outside-month:pointer-events-none data-selected:font-medium data-unavailable:line-through",
										"group relative inline-flex size-10 items-center justify-center whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal", sizing
										)}
									>
										<div class="bg-foreground group-data-selected:bg-background group-data-today:block absolute top-[5px] hidden size-[1vw] rounded-full"></div>
										{date.day}
									</Calendar.Day>
								</Calendar.Cell>
							{/each}
						</Calendar.GridRow>
					{/each}
				</Calendar.GridBody>
			</Calendar.Grid>
		{/each}
	</div>
{/snippet}
</Calendar.Root>
