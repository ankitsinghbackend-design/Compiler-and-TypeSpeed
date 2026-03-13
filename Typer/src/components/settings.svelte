<script lang="ts">
	import { fly } from "svelte/transition";
	import { refreshCosmetics, settings, template } from "../store";
	import Input from "./ui/input.svelte";
	import Select from "./ui/select.svelte";
	import Checkbox from "./ui/checkbox.svelte";
	import Button from "./ui/button.svelte";
	import {
		getFonts,
		loadTextFileList,
		randomizeSettings,
		type Wordlists,
	} from "./ts/settings";
	import Tooltip from "./ui/tooltip.svelte";
	import { resetRun } from "./ts/textbox";
	import { renewCache } from "../lib/cache";

	let fonts: string[];
	(async () => {
		fonts = await getFonts();
	})();

	const resetToDefault = () => {
		$settings = template;
		refreshCosmetics();
	};

	let fontsFocus = false;
	let wordlists: Wordlists = [];

	(async () => {
		wordlists = await loadTextFileList();
	})();

	// Debounce for Sec input so timer refreshes as user types, without spamming resets
	let timeDebounce: ReturnType<typeof setTimeout>;
	const applyTimeChange = () => {
		clearTimeout(timeDebounce);
		timeDebounce = setTimeout(() => {
			resetRun();
		}, 600);
	};
</script>

{#if $settings.opened}
	<div
		transition:fly={{ duration: 400, x: -100 }}
		style="direction: rtl; background-color: var(--bg-color, #f5f0e8);"
		class="fixed h-full z-2 overflow-x-hidden overflow-y-scroll scrollbar scrollbar-rounded scrollbar-track-color-transparent scrollbar-thumb-color-current w-128 max-w-full"
	>
		<div class="pl-5 py-5 inline" style="direction: ltr;">
			<div class="grid grid-cols-4 auto-rows-auto gap-3 p-3">
				<h1 class="font-bold text-xl flex items-center gap-6">
					Settings
				</h1>

				<h2 class="text-base font-normal m-0 col-span-4">Font Family</h2>

				<Select
					class="col-span-4 w-full"
					bind:value={$settings.cosmetics.family}
					on:change={refreshCosmetics}
					on:mouseenter={() => {
						fontsFocus = true;
					}}
				>
					{#if fonts && fontsFocus}
						{#each fonts as font}
							<option value={font}>{font}</option>
						{/each}
					{:else}
						<option value={$settings.cosmetics.family}
							>{$settings.cosmetics.family}</option
						>
					{/if}
				</Select>

				<div class="col-span-2">
					<div>Mode</div>
					<Select class="mt-3 w-full" bind:value={$settings.modeName} on:change={resetRun}>
						<option value="countdown">Countdown</option>
						<option value="countup">Countup</option>
					</Select>
				</div>
				<div>
					<div>Sec</div>
					<Input
						class="mt-3 text-center w-full"
						bind:value={$settings.mode.time}
						on:input={applyTimeChange}
					/>
				</div>
				<div>
					<div>Words</div>
					<Input class="mt-3 text-center w-full" bind:value={$settings.words} on:change={resetRun} />
				</div>

				<h2 class="text-base m-0 mt-3 font-normal col-span-4">Textbox</h2>

				<Tooltip hoverText="'Downfall' is experimental.">
					<div>
						<div class="text-xs">Mode</div>
						<Select
							class="w-full mt-2"
							on:change={resetRun}
							bind:value={$settings.cosmetics.textBox.mode}
						>
							<option value="classic">Classic</option>
							<option value="downfall">Downfall</option>
						</Select>
					</div>
				</Tooltip>
				<div>
					<div class="text-xs">Width</div>
					<Input
						class="mt-2 text-center w-full"
						bind:value={$settings.cosmetics.textBox.width}
						on:change={resetRun}
					/>
				</div>
				<div>
					<div class="text-xs">Lines</div>
					<Input
						class="mt-2 text-center w-full"
						bind:value={$settings.cosmetics.textBox.lines}
						on:change={resetRun}
					/>
				</div>
				<div>
					<div class="text-xs">Line Height</div>
					<Input
						class="mt-2 text-center w-full"
						bind:value={$settings.cosmetics.textBox.lineHeight}
						on:change={resetRun}
					/>
				</div>
				<div>
					<div class="text-xs">Letter Spacing</div>
					<Input
						class="mt-2 text-center w-full"
						bind:value={$settings.cosmetics.textBox.letterSpacing}
						on:change={resetRun}
					/>
				</div>

				<div>
					<div class="text-xs">Font Size</div>
					<Input
						class="mt-2 text-center w-full"
						bind:value={$settings.cosmetics.textBox.fontSize}
						on:change={resetRun}
					/>
				</div>
				<div>
					<div class="text-xs">Space Width</div>
					<Input
						class="mt-2 text-center w-full"
						bind:value={$settings.cosmetics.textBox.spaceWidth}
						on:change={resetRun}
					/>
				</div>
				<div class="col-span-1" />

				<h2 class="text-base m-0 mt-3 font-normal col-span-4">
					Text Generation
				</h2>

				<div class="col-span-2">
					<div class="text-xs">Choose text source</div>
					<Select class="w-full mt-2" bind:value={$settings.gen.set} on:change={resetRun}>
						<option value="preset">Preset</option>
						<option value="api">Api</option>
						<option value="custom">Custom</option>
					</Select>
				</div>

				{#if $settings.gen.set === "preset" || $settings.gen.set === "api"}
					<div class="col-span-2">
						<div class="text-xs">Presets</div>
						<Select class="w-full mt-2" bind:value={$settings.gen.preSet} on:change={resetRun}>
							{#if $settings.gen.set === "api"}
								<option value="wikipedia">Wikipedia</option>
							{:else}
								{#each wordlists as list}
									<option value={list.file}>{list.alias}</option>
								{/each}
							{/if}
						</Select>
					</div>
				{:else if $settings.gen.set === "custom"}
					<div class="col-span-2">
						<div class="text-xs">Custom Text</div>
						<Input
							class="w-full mt-2"
							placeholder="Input custom text here"
							bind:value={$settings.gen.customTxT}
						/>
					</div>
				{/if}

				<h3 class="col-span-4 font-normal m-0 text-sm">Text Filters</h3>

				<div class="col-span-4 text-xs">Casing</div>
				<Select
					class="col-span-4 w-full"
					bind:value={$settings.gen.filters.casing}
					on:change={resetRun}
				>
					<option value="default">Default</option>
					<option value="lowercase">Lowercase</option>
					<option value="uppercase">Uppercase</option>
					<option value="random">Random</option>
					<option value="wordBeginning"
						>Uppercase first letter of every Word</option
					>
				</Select>

				<h3 class="col-span-2 text-base font-normal m-0 mt-3">Caret</h3>

				<h3 class="col-span-2 text-base font-normal m-0 mt-3">Infobar</h3>

				<div class="flex gap-2">
					<Checkbox bind:checked={$settings.cosmetics.textBox.caret.rounded} />
					<div class="text-xs">Rounded</div>
				</div>

				<div class="flex gap-2">
					<Checkbox bind:checked={$settings.cosmetics.textBox.caret.colored} />
					<div class="text-xs">Colored</div>
				</div>

				<div class="flex gap-2">
					<Checkbox
						bind:checked={$settings.cosmetics.textBox.infobar.liveAccuracy}
					/>
					<div class="text-xs">L. Accuracy</div>
				</div>

				<div class="flex gap-2">
					<Checkbox
						bind:checked={$settings.cosmetics.textBox.infobar.liveLpm}
					/>
					<div class="text-xs">Live SPM</div>
				</div>

				<Tooltip hoverText="You can set the speed to 1 for instant movement.">
					<div class="text-xs">Speed in ms</div>
					<Input
						class="mt-2 text-center w-full"
						bind:value={$settings.cosmetics.textBox.caret.duration}
					/>
				</Tooltip>

				<div>
					<div class="text-xs">Width</div>
					<Input
						class="mt-2 text-center w-full"
						bind:value={$settings.cosmetics.textBox.caret.width}
					/>
				</div>

				<div class="flex gap-2">
					<Checkbox
						bind:checked={$settings.cosmetics.textBox.infobar.liveWpm}
					/>
					<div class="text-xs">Live WPM</div>
				</div>

				<div class="flex gap-2">
					<Checkbox
						bind:checked={$settings.cosmetics.textBox.infobar.liveTime}
					/>
					<div class="text-xs">Live Time</div>
				</div>

				<h3 class="col-span-full text-base font-normal m-0 mt-3">Randomize Settings</h3>

				<Button class="col-span-2" on:click={randomizeSettings}
					>Randomize</Button
				>
				<Button class="col-span-2" on:click={resetToDefault}
					>Reset to Default</Button
				>

				<h3 class="col-span-full text-base font-normal m-0 mt-3">Keybindings</h3>

				<div>
					<div class="text-sm">Leaderkey</div>
					<Input
						class="mt-2 w-full"
						bind:value={$settings.keybindings.leader.key}
					/>
				</div>

				<div>
					<div class="text-sm">Reset Run</div>
					<Input class="mt-2 w-full" bind:value={$settings.keybindings.reset} />
				</div>

				<div>
					<div class="text-sm">Randomize</div>
					<Input
						class="mt-2 w-full"
						bind:value={$settings.keybindings.randomizeSettings}
					/>
				</div>

				<div>
					<div class="text-sm">Settings</div>
					<Input
						class="mt-2 w-full"
						bind:value={$settings.keybindings.toggleSettings}
					/>
				</div>

				<div>
					<div class="text-sm">Themes</div>
					<Input
						class="mt-2 w-full"
						bind:value={$settings.keybindings.toggleTheme}
					/>
				</div>

				<h3 class="col-span-full text-base font-normal m-0 mt-3">Misc</h3>

				<div class="flex items-center gap-2 col-span-4 text-sm">
					<Checkbox bind:checked={$settings.showToolTips} />
					<div>Show Tooltips</div>
					<Checkbox bind:checked={$settings.highlighting.wrong} />
					<div>Highlight wrongly typed letters</div>
					<Checkbox bind:checked={$settings.highlighting.words} />
					<div>Highlight active word</div>
				</div>

				<Button class="col-span-2" on:click={renewCache}>Refresh Cache</Button>
			</div>
		</div>
	</div>
{/if}
