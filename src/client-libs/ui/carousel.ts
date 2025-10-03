import type { LocalImage } from "../images";

export interface CarouselItem {
    title: string;
    description: string;
	localImage: LocalImage;
}

export interface SimpleCarouselItem {
	localImage: LocalImage;
}

export function handleStart(event: TouchEvent | MouseEvent): number {
	return 'touches' in event
		? event.touches[0].clientX
		: event.clientX;
}

export function handleEnd(
	event: TouchEvent | MouseEvent,
	touchStartX: number,
	selectedIndex: number,
	itemsLength: number
): number {
	const touchEndX = 'changedTouches' in event
		? event.changedTouches[0].clientX
		: event.clientX;

	const deltaX = touchEndX - touchStartX;
	let nextIndex = selectedIndex;
	if (deltaX > 50) {
		nextIndex = (selectedIndex - 1 + itemsLength) % itemsLength;
	} else if (deltaX < -50) {
		nextIndex = (selectedIndex + 1) % itemsLength;
	}

	return nextIndex;
}
