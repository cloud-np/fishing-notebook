<script lang="ts">
    import { onMount, type Snippet } from 'svelte';

    let {
        startingHeightClass,
        content,
        buttonLabels = { more: 'Show more', less: 'Show less' }
    }: {
        startingHeightClass: string;
        content: Snippet;
        buttonLabels?: { more: string, less: string };
    } = $props();

    let contentRef = $state();
    let contentHeight = $state(0);
    let isExpanded = $state(false);
    let showToggle = $state(false);

    function toggleExpand() {
        isExpanded = !isExpanded;
    }

    onMount(() => {
        if (contentRef) {
            // Get the actual content height
            const height = (contentRef as HTMLElement).scrollHeight;
            contentHeight = height;
        }
    });
</script>

<div bind:this={contentRef}
    class="relative text-base inline-flex overflow-hidden text-ellipsis {isExpanded ? 'max-h-full' : startingHeightClass}"
>
    {@render content()}
</div>
<button class="underline text-base cursor-pointer my-4" onclick={toggleExpand} >
    {isExpanded ? buttonLabels.less : buttonLabels.more}
</button>
