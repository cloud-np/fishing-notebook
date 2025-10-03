<script lang="ts">
    import ShowMore from '../ShowMore.svelte';
    import Accordion from "../Accordion/Accordion.svelte";
    import { useTranslations, getTranslatedCookieCategories } from "@i18n/utils";

    // Receive language as prop from parent component
    let { lang } = $props();
    const t = useTranslations(lang);

    const translatedCategories = getTranslatedCookieCategories(lang);
    const cookiesWithChecks = translatedCategories.map(c => ({
        ...c,
        checked: c.type.toLowerCase() === 'necessary'
    }));
</script>

{#snippet field(label, value)}
    <div class="flex items-start gap-8 text-gray-500">
        <p class="text-sm font-bold w-24 mb-2">{label}:</p>
        <p class="text-sm text-left flex-1">{value}</p>
    </div>
{/snippet}

<ShowMore startingHeightClass="max-h-28">
    {#snippet content()}
        <p class="mt-4">
            {t('cookie.pref.description')}
        </p>
    {/snippet}
</ShowMore>

<Accordion accordionData={cookiesWithChecks}>
    {#snippet title(category)}
        <div class="flex items-center justify-between w-full">
            <h4 class="text-lg font-semibold text-white">{category.displayName}</h4>
            <div class="flex items-center ml-6">
                <input
                    onclick={(e) => e.stopPropagation()}
                    bind:checked={category.checked}
                    disabled={category.type.toLowerCase() === 'necessary'}
                    type="checkbox"
                    class="w-5 h-5 accent-orange-500 border-2 border-gray-300 rounded-md focus:ring-orange-500 focus:ring-2 transition-all duration-200 ease-in-out hover:border-orange-400 cursor-pointer checkbox-white-check {category.type.toLowerCase() === 'necessary' ? 'opacity-75 cursor-not-allowed' : ''}"
                >
            </div>
        </div>
    {/snippet}

	<!-- Detailed description showcasing each cookie -->
    {#snippet content(category)}
        <ul class="flex flex-col mb-2 border-b border-gray-400 border-opacity-70">
            {#each category.cookies as cookie}
                <li class="pb-4">
                    {@render field(t('cookie.field.cookie'), cookie.name)}
                    {@render field(t('cookie.field.duration'), cookie.duration)}
                    {@render field(t('cookie.field.description'), cookie.description)}
                </li>
            {/each}
        </ul>
    {/snippet}
</Accordion>
