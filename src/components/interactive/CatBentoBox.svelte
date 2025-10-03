<script lang="ts">
	import { onMount } from 'svelte';
	const COUNT = 200;

	let catImages: (string | null)[] = Array(COUNT).fill(null);
	let loadingCount = COUNT;

	const fetchCatImage = async (index: number) => {
		try {
			const response = await fetch('https://api.thecatapi.com/v1/images/search?size=med');
			const data = await response.json();
			const imageUrl = data[0]?.url;

			if (imageUrl) {
				catImages[index] = imageUrl;
				loadingCount--;
				// Trigger reactivity
				catImages = [...catImages];
			}
		} catch (error) {
			console.error(`Failed to fetch cat image ${index}:`, error);
			loadingCount--;
		}
	};

	onMount(() => {
		// Start fetching all images simultaneously but update UI as each loads
		for (let i = 0; i < COUNT; i++) {
			fetchCatImage(i);
		}
	});
</script>

<section class="cat-bento-container">
	<div class="cat-bento-grid">
		{#each catImages as image, index}
			<div class="cat-item cat-item-{index + 1}">
				{#if image}
					<img src={image} alt="Random cat {index + 1}" loading="lazy" />
				{:else}
					<div class="loading-placeholder">
						<div class="loading-spinner"></div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</section>

<style>
	.cat-bento-container {
		padding: 2rem 1rem;
		background: transparent;
		min-height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loading-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
		background-size: 200% 100%;
		animation: shimmer 2s infinite;
	}

	.loading-spinner {
		width: 24px;
		height: 24px;
		border: 2px solid rgba(55, 65, 81, 0.3);
		border-top: 2px solid #374151;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.cat-bento-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(3, 120px);
		gap: 1rem;
		max-width: 800px;
		width: 100%;
	}

	.cat-item {
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	.cat-item:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
	}

	.cat-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Bento box layout variations */
	.cat-item-1 {
		grid-column: span 2;
		grid-row: span 2;
	}

	.cat-item-2 {
		grid-column: span 1;
		grid-row: span 1;
	}

	.cat-item-3 {
		grid-column: span 1;
		grid-row: span 1;
	}

	.cat-item-4 {
		grid-column: span 1;
		grid-row: span 2;
	}

	.cat-item-5 {
		grid-column: span 2;
		grid-row: span 1;
	}

	.cat-item-6 {
		grid-column: span 1;
		grid-row: span 1;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.cat-bento-grid {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(4, 100px);
			gap: 0.75rem;
		}

		.cat-item-1 {
			grid-column: span 2;
			grid-row: span 1;
		}

		.cat-item-2,
		.cat-item-3,
		.cat-item-4,
		.cat-item-5,
		.cat-item-6 {
			grid-column: span 1;
			grid-row: span 1;
		}

		.cat-bento-container {
			padding: 1.5rem 1rem;
			min-height: 350px;
		}
	}

	@media (max-width: 480px) {
		.cat-bento-grid {
			grid-template-columns: 1fr;
			grid-template-rows: repeat(6, 80px);
		}

		.cat-item-1,
		.cat-item-2,
		.cat-item-3,
		.cat-item-4,
		.cat-item-5,
		.cat-item-6 {
			grid-column: span 1;
			grid-row: span 1;
		}
	}
</style>
