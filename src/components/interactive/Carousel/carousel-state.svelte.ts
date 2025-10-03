import * as Carousel from "@client-libs/ui/carousel";
import { getContext, onDestroy, setContext } from "svelte";

export class CarouselState {
	items: Carousel.CarouselItem[] = [];
	selectedIndex = $state.raw(0);
	previousIndex = $state.raw(0);
	selectedItem = $derived(this.items[this.selectedIndex]);
	previousItem = $derived(this.items[this.previousIndex]);
	transitionTimeout?: ReturnType<typeof setTimeout>;
	isTransitioning = $state.raw(false);
	touchStartX = $state.raw(0);

	constructor(items?: Carousel.CarouselItem[]) {
		this.items = items ?? [];
		this.selectedIndex = this.items.length - 1;
		this.previousIndex = this.items.length - 1;
		onDestroy(() => {
			this.transitionTimeout && clearTimeout(this.transitionTimeout);
		});
	}

	handleStart(event: TouchEvent | MouseEvent) {
		if (this.isTransitioning) return;

		this.touchStartX = Carousel.handleStart(event);
		if ("touches" in event) {
			this.touchStartX = event.touches[0].clientX;
		} else {
			this.touchStartX = event.clientX;
		}
	}

	handleEnd(event: TouchEvent | MouseEvent) {
		if (this.isTransitioning) return;

		const newIndex = Carousel.handleEnd(event, this.touchStartX, this.selectedIndex, this.items.length);

		if (this.selectedIndex !== newIndex) {
			this.transition(newIndex);
		}
	}

	transition(transitionNumber: number) {
		this.selectedIndex = transitionNumber;
		this.isTransitioning = true;

		// Clear any existing timeout
		if (this.transitionTimeout) {
			clearTimeout(this.transitionTimeout);
			this.transitionTimeout = undefined;
		}

		// The code here is beyond of atrocious, but it works for now.
		this.transitionTimeout = setTimeout(() => {
			this.previousIndex = transitionNumber;
		}, 690);
		this.transitionTimeout = setTimeout(() => {
			this.isTransitioning = false;
		}, 700);
	}
}

// For Sharing state between Components
const CAROUSEL_KEY = Symbol("carousel");
export function setCarouselState(items: Carousel.CarouselItem[]) {
	return setContext(CAROUSEL_KEY, new CarouselState(items));
}
export function getCarouselState() {
	return getContext<ReturnType<typeof setCarouselState>>(CAROUSEL_KEY);
}
