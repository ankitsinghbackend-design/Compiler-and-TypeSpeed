<script lang="ts">
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import { fade } from "svelte/transition";
	import ChangeTheme from "./components/changeTheme.svelte";
	import Notifications from "./components/notifications.svelte";
	import Settings from "./components/settings.svelte";
	import Textbox from "./components/textbox.svelte";
	import { refreshCosmetics, runState, settings } from "./store";
	import { remToPx } from "./lib/util";
	import { checkCacheAgeAndRenew } from "./lib/cache";
	import Results from "./components/results.svelte";
	import Downfall from "./components/downfall.svelte";

	let isMobile = false;

	const mouseMoved = (e: MouseEvent) => {
		if (isMobile) return; // disable hover on touch devices
		const s = get(settings);
		if (e.clientX < remToPx(32)) {
			s.opened = true;
			s.cosmetics.theme.opened = false;
		} else if (e.clientX > window.innerWidth - remToPx(24)) {
			s.opened = false;
			s.cosmetics.theme.opened = true;
		} else if (s.opened || s.cosmetics.theme.opened) {
			s.opened = false;
			s.cosmetics.theme.opened = false;
		} else return;

		settings.set(s);
	};

	const handleTouch = (e: TouchEvent) => {
		const s = get(settings);
		const touch = e.touches[0];
		if (!touch) return;

		// If settings is open and user taps to the right of the panel, close it
		if (s.opened && touch.clientX > Math.min(remToPx(32), window.innerWidth * 0.85)) {
			s.opened = false;
			settings.set(s);
		} else if (s.cosmetics.theme.opened && touch.clientX < window.innerWidth - remToPx(24)) {
			s.cosmetics.theme.opened = false;
			settings.set(s);
		}
	};

	const toggleSettings = () => {
		settings.update(s => {
			s.opened = !s.opened;
			if (s.opened) s.cosmetics.theme.opened = false;
			return s;
		});
	};

	refreshCosmetics();

	onMount(() => {
		isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
		checkCacheAgeAndRenew();
	});
</script>

<main
	class="h-full text-secondary"
	on:mousemove={mouseMoved}
	style="background-image: url({$settings.cosmetics.background
		.bgImg}); background: center center no-repeat; background-size: cover; z-index: -5;"
>
	<div
		class="main w-full h-full"
		style="opacity: {$settings.cosmetics.background.opacity};"
	>
		<Settings />
		<ChangeTheme />
		<Notifications />
		{#if !$settings.opened}
			<div
				transition:fade={{ duration: 400 }}
				class="text-xl p-5 fixed font-bold coffeetyper"
			>
				Coffeetyper
			</div>

			{#if !$runState.running}
				<div
					transition:fade={{ duration: 400 }}
					class="absolute bottom-0 text-xs p-5"
					style="color: var(--sub-color)"
				>
					Hover to open and close settings
				</div>
			{/if}
		{/if}
		{#if !$runState.running}
			<div
				transition:fade={{ duration: 400 }}
				class="absolute bottom-0 text-xs p-5"
				style="right: 0px; color: var(--sub-color)"
			>
				Hover to open and close themes
			</div>
		{/if}

		{#if $settings.cosmetics.textBox.mode === "downfall"}
			<Downfall />
		{:else if !$runState.ended}
			<Textbox />
		{:else}
			<Results />
		{/if}
	</div>
</main>
