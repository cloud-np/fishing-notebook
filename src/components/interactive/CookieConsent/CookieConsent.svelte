<script lang="ts">
	import CloseIcon from "@assets/icons/close.svg?raw";
	import Buttons from "./Buttons.svelte";
	import { slide, fade } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import Preferences from "@components/interactive/CookieConsent/Preferences.svelte";
	import { deleteAllCookiesExceptConsent, disableGa, enableGa, getCookie, setCookie } from "@utils/browser";
	import { useTranslations } from "@i18n/utils";
	import { onMount } from "svelte";

	// Receive language as prop from Astro
	let { lang } = $props();
	const t = useTranslations(lang);

	// Reactive state using Svelte 5 runes
	let state = $state({
		isPreferenceActive: false,
		isVisible: false,
	});

	onMount(() => state.isVisible = !getCookie('consent'));

	// Event handlers
	function handlePreference() {
		if (!state.isPreferenceActive) {
			state.isPreferenceActive = true;
			return;
		}
	}

	function handleClose() {
		state.isPreferenceActive = false;
	}

	function handleReject() {
		setCookie("consent", "rejected", 365);
		setCookie("analytics-consent", "rejected", 365);
		state.isVisible = false;
		deleteAllCookiesExceptConsent();
		disableGa();
	}

	function handleAccept() {
		setCookie("consent", "accepted", 365);
		setCookie("analytics-consent", "accepted", 365);
		state.isVisible = false;
		enableGa();
	}
</script>

{#if state.isVisible}
	<div class="fixed bottom-0 left-0 w-full p-4 sm:w-auto z-10 text-white">
		{#if state.isPreferenceActive}
			<div
				in:slide={{ duration: 400, easing: quintOut }}
				out:fade={{ duration: 300 }}
				class="shadow-[0_-2px_10px_rgba(0,0,0,0.1)] bg-neutral-800 p-4 max-h-[80vh] flex flex-col">
				<div class="flex justify-between items-center mb-4">
					<h3>{t('cookie.title')}</h3>
					<button class="cursor-pointer" type="button" onclick={handleClose}>
						{@html CloseIcon}
					</button>
				</div>
				<div class="overflow-y-auto flex-1 max-h-[calc(80vh-120px)]">
					<Preferences {lang} />
				</div>
				<Buttons
					isPreferenceActive={true}
					onPreference={handlePreference}
					onReject={handleReject}
					onAccept={handleAccept}
					{t} />
			</div>
		{:else}
			<div
				in:slide={{ duration: 400, easing: quintOut }}
				out:fade={{ duration: 300 }}
				class="translate-y-0 visible opacity-100 bottom-4 transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] max-h-[90vh] overflow-y-auto shadow-[0_-2px_10px_rgba(0,0,0,0.1)] bg-neutral-800 max-w-120 rounded-md">
				<div class="text-base my-0 mx-auto flex items-center flex-wrap md:flex-col md:items-center md:pt-8 p-4 gap-4">
					<p class="mx-4">
						{t('cookie.description')}
						<a class="underline" href="/privacy-policy">{t('cookie.learn-more')}</a>
					</p>
					<Buttons onPreference={handlePreference} onReject={handleReject} onAccept={handleAccept} {t} />
				</div>
			</div>
		{/if}
	</div>
{/if}
