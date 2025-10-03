<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	type CursorType = 'image' | 'video';

	class CursorManager {
		mousePos = [0, 0];
		cursor: HTMLElement;
		slider: HTMLElement | null = null;
		cachedPlayButton: HTMLElement | null = null;
		video: HTMLElement | null = null;
		animationId: number | null = null;
		cachedImageEls: Map<string, HTMLElement> = new Map();
		videoIframe = `
		<div class="video-overlay fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
			<div class="video-container relative">
				<button class="close-button absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition-colors" onclick="this.closest('.video-overlay').remove()">
					✕
				</button>
				<iframe id="video-iframe" width="560" height="315"
					src="https://www.youtube.com/embed/FpL7gM3IDb0?si=eh6Zj_dd4ChMOOI_"
					title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
				</iframe>
			</div>
		</div>
		`;

		constructor() {
			this.cursor = document.getElementById('cursor') as HTMLElement;
			if (!this.cursor) {
				return;
			}
			// Check for touch capability and mouse availability
			const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
			const hasMousePointer = window.matchMedia('(pointer: fine)').matches;
			
			if (isTouchDevice && !hasMousePointer) {
				// Hidden by default for touch-only devices
				return;
			} else {
				this.cursor.classList.remove('hidden');
			}
			// Bind method to preserve 'this' context
			this.updateMousePosition = this.updateMousePosition.bind(this);
			this.animateCursor = this.animateCursor.bind(this);
			document.addEventListener('mousemove', this.updateMousePosition);

			this.slider = document.querySelector('#slider-wrapper') as HTMLElement;
			this.video = document.querySelector('#video-section') as HTMLElement;

			// Cache elements
			this.cachedPlayButton = document.querySelector('#video-play-button')?.cloneNode(true) as HTMLElement;

			// Setup element-specific event listeners
			this.setupElementListeners();

			this.animateCursor();
		}

		animateCursor() {
			this.cursor.style.transform = `translate(${this.mousePos[0]}px, ${this.mousePos[1]}px)`;
			this.animationId = requestAnimationFrame(this.animateCursor);
		}

		setupElementListeners() {
			// Handle regular links
			const links = document.querySelectorAll('a, button, input[type="button"], input[type="submit"]');
			links.forEach((link: HTMLElement) => {
				if (link.dataset.cursorType === 'image') {
					link.addEventListener('mouseenter', () => this.showImageCursor(link));
					link.addEventListener('mouseleave', () => this.hideCursorType('image'));
				} else {
					link.addEventListener('mouseenter', () => this.cursor.classList.add('cursor-over-link'));
					link.addEventListener('mouseleave', () => this.cursor.classList.remove('cursor-over-link'));
				}
			});

			// Handle video with play button display
			if (this.video) {
				this.video.addEventListener('mouseenter', () => this.showPlayButton());
				this.video.addEventListener('mouseleave', () => this.hideCursorType('video'));
				this.video.addEventListener('click', () => this.showVideo());
			}
		}

		showVideo() {
			if (!this.video) return;
			const videoContainer = document.createElement('div');
			videoContainer.innerHTML = this.videoIframe;
			document.body.appendChild(videoContainer);
		}

		showPlayButton() {
			if (!this.cachedPlayButton) return;

			this.cursor.classList.add('cursor-over-video');
			this.cursor.innerHTML = this.cachedPlayButton.outerHTML;
			this.cursor.style.transform = `translate(${this.mousePos[0]}px, ${this.mousePos[1]}px)`;
			if (this.video) {
				this.video.style.cursor = 'none';
			}
		}

		hideCursorType(type: CursorType) {
			this.cursor.classList.remove(`cursor-over-${type}`);
			this.cursor.innerHTML = '';
		}

		showImageCursor(link: HTMLElement) {
			const image = link.querySelector('[data-cursor-image]') as HTMLImageElement;
			if (!image) {
				return;
			}

			const hasCachedImage = this.cachedImageEls.has(image.src);
			const cachedImage = hasCachedImage
				? this.cachedImageEls.get(image.src)!
				: image.cloneNode(true) as HTMLElement;

			if (!hasCachedImage) {
				this.cachedImageEls.set(image.src, cachedImage);
			}
			this.cursor.classList.add('cursor-over-image');
			cachedImage.style.display = 'block';
			this.cursor.innerHTML = cachedImage.outerHTML;
		}

		// Mouse movement tracking
		updateMousePosition(e: MouseEvent) {
			this.mousePos = [e.clientX, e.clientY];
		}

		destroy() {
			if (this.animationId) {
				cancelAnimationFrame(this.animationId);
			}
			document.removeEventListener('mousemove', this.updateMousePosition);
		}
	}

	let cursorManager: CursorManager | null = null;

	function init() {
		cursorManager = new CursorManager();
	}

	onMount(() => {
		if (cursorManager) {
			cursorManager.destroy();
		}
		init();
	});

	onDestroy(() => {
		if (cursorManager) {
			cursorManager.destroy();
		}
	});
</script>

<div id="cursor" class="cursor overflow-hidden hidden">
</div>

<!-- <style>
	@import "./cursor.css";
</style> -->
