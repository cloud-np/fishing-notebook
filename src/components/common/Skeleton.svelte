<script lang="ts">
	import { type Snippet } from 'svelte';

	interface Props {
		isLoading: boolean;
		children: Snippet;
	}

	let { isLoading, children }: Props = $props();
</script>

{#if isLoading}
	<div class="flex items-center gap-3 w-full">
		<div class="flex-1">
			<div class="h-3 w-[95%] bg-dark-10 rounded animate-pulse mb-2"></div>
			<div class="h-5 w-full bg-dark-10 rounded animate-pulse mb-2"></div>
			<div class="h-3 w-[90%] bg-dark-10 rounded animate-pulse"></div>
		</div>
	</div>
{:else}
	{@render children()}
{/if}
