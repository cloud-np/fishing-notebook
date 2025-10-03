<script lang="ts">
	// Define the button classes constant
	const BUTTON_CLASSES =
		"cursor-pointer rounded-md py-2 px-4 m-1 text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:shadow-none active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

	// Props interface
	let { onPreference, onReject, onAccept, isPreferenceActive = false, t } = $props();
</script>

<div class="flex justify-center flex-col sm:flex-row w-full">
	<button
		id="cookie-preference-btn"
		onclick={isPreferenceActive ? onReject : onPreference}
		class={BUTTON_CLASSES + " border border-y-orange-200"}
		type="button">
		{isPreferenceActive ? t("cookie.reject") : t("cookie.preferences")}
	</button>
	<button
		id="cookie-reject-btn"
		onclick={isPreferenceActive ? onPreference : onReject}
		class={BUTTON_CLASSES + " border border-y-orange-200"}
		type="button">
		{isPreferenceActive ? t("cookie.save-preferences") : t("cookie.reject")}
	</button>
	<button
		id="cookie-accept-btn"
		onclick={onAccept}
		class={`${BUTTON_CLASSES} bg-orange-700 border-transparent hover:bg-orange-500 transition-all ease-in duration-100`}
		type="button">
		{t("cookie.accept")}
	</button>
</div>
