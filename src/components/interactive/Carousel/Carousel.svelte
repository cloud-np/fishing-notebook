<script lang="ts">
	import { fly } from "svelte/transition";
	import { onMount } from "svelte";
	import { CarouselState } from "./carousel-state.svelte";
	import type { CarouselItem } from "@client-libs/ui/carousel";

    let { items, }: { items: CarouselItem[]; } = $props();

	const carouselState = new CarouselState(items);

	onMount(() => {
		carouselState.transition(0);
	});

</script>

<div role="slider" tabindex="0" aria-valuenow={carouselState.previousIndex} aria-valuemax={items.length - 1} aria-valuemin={0} aria-label="carousel"
	class="carousel w-fulloverflow-hidden relative"
	onmousedown={(e) => carouselState.handleStart(e)}
	onmouseup={(e) => carouselState.handleEnd(e)}
	ontouchstart={(e) => carouselState.handleStart(e)}
	ontouchend={(e) => carouselState.handleEnd(e)}
>
	<div role="status" class="flex items-center justify-center w-full h-full animate-pulse absolute inset-0">
		<svg class="w-10 h-10 text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
        </svg>
		<span class="sr-only">Loading...</span>
	</div>
	<div class="absolute inset-0 z-1 md:flex justify-center items-center overflow-hidden">
		<!--
			TODO: Ideally here we use the native <Image/> from Astro.
			But this to be passed as snippet or something to this comp.
		-->
		<img src={carouselState.previousItem.localImage.imageMetadata.src}
			sizes="(max-width: 768px) 480px, 960px"
			alt={carouselState.previousItem.localImage.alt}
			class:non-visible={carouselState.isTransitioning}
			class="img-from w-full h-full object-cover md:w-10/12 md:h-5/6"
		/>
	</div>
	<div class="absolute inset-0 z-0 md:flex justify-center items-center overflow-hidden">
		<img src={carouselState.selectedItem.localImage.imageMetadata.src}
			sizes="(max-width: 768px) 480px, 960px"
			alt={carouselState.selectedItem.localImage.alt}
			class:visible={carouselState.isTransitioning}
			class="img-to w-full h-full object-cover md:w-10/12 md:h-5/6"
		/>
	</div>

	<div class="relative z-1 h-full grid grid-rows-[1fr_auto] text-left mx-4 overflow-hidden">
		<div class="flex items-center sm:-ml-24">
			<div class="max-w-md sm:ml-[25dvw]">
				{#key carouselState.selectedIndex}
					<h1 in:fly={{ delay: 500, x: 100, duration: 1000 }} class="title f-mono font-bold mb-4">{carouselState.selectedItem.title}</h1>
					<p in:fly={{ delay: 700, x: 200, duration: 1000 }} class="description text-sm f-sans overflow-hidden md:text-base">
						{carouselState.selectedItem.description}
					</p>
				{/key}
			</div>
		</div>
		<div class="flex justify-between gap-4 w-full pb-4 sm:px-10">
			<ul class="flex gap-4">
				{#each items as _, index}
					<li class:selected-number={carouselState.selectedIndex === index}>
						<button onclick={() => !carouselState.isTransitioning && carouselState.transition(index)} class="f-mono text-sm style-none p-2">0{index + 1}</button>
					</li>
				{/each}
			</ul>
			<button class="f-mono font-bold text-sm style-none">
				SCROLL DOWN
			</button>
		</div>
	</div>
</div>

<style>
	.carousel {
		height: clamp(300px, calc(20dvh + 35dvw), 100dvh);
	}

	.img-from {
		clip-path: inset(0);
	}

	.img-to {
		clip-path: inset(0 100% 0 0);
	}

	.img-from.non-visible {
		clip-path: inset(0 0 0 100%);
		transition: clip-path .7s ease-out;
	}

	.img-to.visible {
		clip-path: inset(0);
		transition: clip-path .7s var(--ease-out-quad);
	}

	.title, .description {
		transition: opacity .3s ease;
	}

	.title {
		font-size: clamp(2rem, 3dvw, 5rem);
	}

	.selected-number {
		border-bottom: 2px solid #fff;
		border-radius: 2px;
	}
</style>
