<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		data: number | string | null | undefined;
		type?: 'number' | 'string';
		class?: string;
		children: Snippet
	}

	let { data, type, children, class: className, }: Props = $props();

	const displayValue = $derived(() => {
		if (data === null || data === undefined || data === '') {
			// If type is explicitly provided, use that
			if (type === 'number') {
				return 'N/A';
			} else if (type === 'string') {
				return 'No info';
			}
			// Otherwise, infer from the data type
			return typeof data === 'number' ? 'N/A' : 'No info';
		}
		return data;
	});
</script>

<span class={className}>
	{displayValue()}
	{@render children()}
</span>
