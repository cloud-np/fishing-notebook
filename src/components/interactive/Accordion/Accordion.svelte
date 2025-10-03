<script lang="ts" generics="T">
	import AccordionItem from './AccordionItem.svelte';
	import type { Snippet } from "svelte";

    let { title, content, allowMultiple = false, defaultOpenItems = [], accordionData = [] }: {
		title: Snippet<[T]>;
		content: Snippet<[T]>;
		allowMultiple?: boolean;
		defaultOpenItems?: number[];
		accordionData: T[];
	} = $props();

    let openItems = $state(new Set(defaultOpenItems));

    function toggleItem(index: number) {
        const newOpenItems = new Set(openItems);

        if (newOpenItems.has(index)) {
            newOpenItems.delete(index);
        } else {
            if (!allowMultiple) {
                newOpenItems.clear();
            }
            newOpenItems.add(index);
        }

        openItems = newOpenItems;
    }

    function isOpen(index: number) {
        return openItems.has(index);
    }
</script>

<div class="p-2 max-w-4xl mx-auto">
	<div class="space-y-2">
		{#each accordionData as item, index (index)}
			<AccordionItem
				{item}
				{title}
				{content}
                isOpen={isOpen(index)}
                onToggle={() => toggleItem(index)}
			/>
		{/each}
	</div>
</div>
