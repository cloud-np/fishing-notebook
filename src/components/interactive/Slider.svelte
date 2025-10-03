<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as Carousel from '@client-libs/ui/carousel';
	import type { LocalImage } from '@client-libs/images';

	interface Props {
		initialXOffset?: number;
		slideTimer?: number;
		images: LocalImage[];
	}

	let {
		initialXOffset = 900,
		slideTimer = 10_000,
		images
	}: Props = $props();

	let sliderWrapper: HTMLDivElement;
	let currentImage = $state(images[0]);
	let xTransition = $state(initialXOffset);
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let touchStartX = $state(0);
	let selectedIndex = $state(0);

	function startAutoSlide() {
		intervalId = setInterval(() => {
			const currentIndex = images.indexOf(currentImage);
			const nextIndex = (currentIndex + 1) % images.length;
			goToImage(images[nextIndex], nextIndex);
		}, slideTimer);
	}

	function stopAutoSlide() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function goToImage(destinationImage: LocalImage, targetIndex: number) {
		const currentIndex = images.indexOf(currentImage);
		if (currentIndex === targetIndex) return;

		if (!sliderWrapper) return;

		const ulEl = sliderWrapper.children[0];
		const lis = Array.from(ulEl.children);
		const screenCenterX = window.innerWidth / 2;
		const rect = lis[targetIndex].getBoundingClientRect();
		const elementCenterX = rect.left + rect.width / 2;
		const dist = elementCenterX - screenCenterX;
		const newX = xTransition + (-1 * dist);

		xTransition = newX;
		currentImage = destinationImage;
		selectedIndex = targetIndex;

		// Restart auto-slide timer
		stopAutoSlide();
		startAutoSlide();
	}

	function handleImageClick(index: number) {
		goToImage(images[index], index);
	}

	function handleTouchStart(event: TouchEvent | MouseEvent) {
		touchStartX = Carousel.handleStart(event);
	}

	function handleTouchEnd(event: TouchEvent | MouseEvent) {
		selectedIndex = Carousel.handleEnd(event, touchStartX, selectedIndex, images.length);
		goToImage(images[selectedIndex], selectedIndex);
	}

	onMount(() => {
		startAutoSlide();
	});

	onDestroy(() => {
		stopAutoSlide();
	});
</script>

<div class="overflow-hidden max-w-full">
	<div
		bind:this={sliderWrapper}
		class="transition-transform duration-300 ease-out flex items-center justify-center my-12 mx-auto"
		style="transform: translate3d({xTransition}px, 0, 0)"
	>
		<ul class="flex gap-2">
			{#each images as image, index}
				<li class="flex flex-col items-center justify-center">
					<img
						src={image.imageMetadata.src}
						alt={image.alt}
						class="cursor-grab active:cursor-grabbing w-88 min-w-88 max-w-full h-auto object-cover transition-opacity duration-200 ease-out hover:opacity-80 select-none"
						draggable="false"
						role="button"
						loading="lazy"
						decoding="async"
						fetchpriority="low"
						onclick={() => handleImageClick(index)}
						onmousedown={handleTouchStart}
						onmouseup={handleTouchEnd}
						ontouchstart={handleTouchStart}
						ontouchend={handleTouchEnd}
						aria-label={image.alt}
					/>
				</li>
			{/each}
		</ul>
	</div>
</div>
