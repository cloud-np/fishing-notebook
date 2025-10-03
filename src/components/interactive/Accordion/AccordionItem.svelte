<script lang="ts" generics="T">
	import ArrowIcon from "@assets/icons/arrow.svg?raw";
	import type { Snippet } from "svelte";

	let {
		item,
		title,
		content,
		isOpen = false,
		onToggle,
	}: {
		item: T;
		title: Snippet<[T]>;
		content: Snippet<[T]>;
		isOpen: boolean;
		onToggle: () => void;
	} = $props();

	let contentRef = $state();
</script>

<div class="mb-2">
	<div class="flex flex-col">
		<button
			class="w-full px-4 py-3 text-left cursor-pointer flex items-center font-medium text-gray-400 focus:outline-none"
			onclick={onToggle}
			aria-expanded={isOpen}
			type="button">
			<span class="w-4 h-4 transition-transform transform duration-200 mr-2 {isOpen ? 'rotate-0' : '-rotate-90'}">
				{@html ArrowIcon}
			</span>
			{@render title(item)}
		</button>
		<!-- TODO: Clear this tech dept. This should be moved elsewhere -->
		{#if (item as any).subTitle}
			<span class="px-4 pb-2 text-sm text-gray-500">{(item as any).subTitle}</span>
		{/if}
	</div>

	<div
		bind:this={contentRef}
		class="transition-all duration-300 ease-in-out overflow-hidden {isOpen
			? 'max-h-screen opacity-100'
			: 'max-h-0 opacity-0'}">
		<div class="px-4 py-3">
			{@render content(item)}
		</div>
	</div>
</div>
