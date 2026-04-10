<script lang="ts">
	import { SIGIL_FACTIONS } from './sigil-faction';

	interface Props {
		currentFaction: string;
		onSelect: (factionId: string) => void;
	}

	let { currentFaction, onSelect }: Props = $props();

	let searchQuery = $state('');

	let filteredFactions = $derived(
		searchQuery.trim() === ''
			? SIGIL_FACTIONS
			: SIGIL_FACTIONS.filter((f) =>
					f.name.toLowerCase().includes(searchQuery.toLowerCase()),
				),
	);

	function handleSelect(id: string) {
		onSelect(id);
	}
</script>

<div class="harbinger-faction-picker">
	<div class="faction-search">
		<i class="fa-solid fa-search faction-search-icon"></i>
		<input
			class="faction-search-input"
			type="text"
			bind:value={searchQuery}
			placeholder="Search factions..."
			autocomplete="off"
			spellcheck="false"
		/>
	</div>

	<div class="faction-grid" role="listbox" aria-label="Sigil Factions">
		<!-- Unaffiliated -->
		<div
			class="faction-card unaffiliated"
			class:selected={currentFaction === ''}
			role="option"
			aria-selected={currentFaction === ''}
			onclick={() => handleSelect('')}
			onkeydown={(e) => e.key === 'Enter' && handleSelect('')}
			tabindex="0"
		>
			{#if currentFaction === ''}
				<span class="faction-card-badge"><i class="fa-solid fa-check"></i></span>
			{/if}
			<span class="faction-card-name">— Unaffiliated —</span>
		</div>

		{#each filteredFactions as faction (faction.id)}
			<div
				class="faction-card"
				class:selected={currentFaction === faction.id}
				style="--faction-img: url('{faction.image}')"
				role="option"
				aria-selected={currentFaction === faction.id}
				onclick={() => handleSelect(faction.id)}
				onkeydown={(e) => e.key === 'Enter' && handleSelect(faction.id)}
				tabindex="0"
			>
				{#if currentFaction === faction.id}
					<span class="faction-card-badge"><i class="fa-solid fa-check"></i></span>
				{/if}
				<div class="faction-card-footer">
					<span class="faction-card-name">{faction.name}</span>
				</div>
			</div>
		{/each}

		{#if filteredFactions.length === 0}
			<p class="faction-no-results">No factions match your search.</p>
		{/if}
	</div>
</div>

<style>
	/* ── Shell ── */
	.harbinger-faction-picker {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #120e09;
		color: #e8d9bf;
		font-family: var(--body-serif, serif);
	}

	/* ── Search bar ── */
	.faction-search {
		position: relative;
		padding: 0.55rem 0.75rem;
		border-bottom: 1px solid rgba(200, 150, 70, 0.2);
		background: rgba(0, 0, 0, 0.35);
		flex-shrink: 0;
	}

	.faction-search-icon {
		position: absolute;
		left: 1.3rem;
		top: 50%;
		transform: translateY(-50%);
		color: rgba(200, 150, 70, 0.45);
		font-size: 11px;
		pointer-events: none;
	}

	.faction-search-input {
		width: 100%;
		padding: 0.35rem 0.5rem 0.35rem 2rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(200, 150, 70, 0.25);
		border-radius: 3px;
		color: #e8d9bf;
		font-size: 13px;
		font-family: var(--body-serif, serif);
		outline: none;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
	}

	.faction-search-input::placeholder {
		color: rgba(232, 217, 191, 0.35);
	}

	.faction-search-input:focus {
		border-color: rgba(200, 150, 70, 0.55);
		box-shadow: 0 0 0 2px rgba(200, 150, 70, 0.1);
	}

	/* ── Card grid ── */
	.faction-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 7px;
		padding: 8px;
		overflow-y: auto;
		flex: 1;
		scrollbar-width: thin;
		scrollbar-color: rgba(200, 150, 70, 0.25) transparent;
	}

	/* ── Base card ── */
	.faction-card {
		position: relative;
		height: 112px;
		border-radius: 5px;
		overflow: hidden;
		cursor: pointer;
		border: 2px solid rgba(200, 150, 70, 0.12);
		background-color: #1e1812;
		background-image: var(--faction-img, none);
		background-size: 72%;
		background-repeat: no-repeat;
		background-position: center 38%;
		transition:
			border-color 0.18s ease,
			transform 0.14s ease,
			box-shadow 0.18s ease;
		outline: none;
	}

	/* Dark vignette so the name stays readable */
	.faction-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.08) 0%,
			rgba(0, 0, 0, 0) 35%,
			rgba(0, 0, 0, 0.55) 70%,
			rgba(0, 0, 0, 0.82) 100%
		);
		z-index: 1;
		pointer-events: none;
	}

	.faction-card:hover,
	.faction-card:focus-visible {
		border-color: rgba(200, 150, 70, 0.5);
		transform: translateY(-2px);
		box-shadow:
			0 6px 18px rgba(0, 0, 0, 0.55),
			0 0 0 1px rgba(200, 150, 70, 0.15) inset;
	}

	.faction-card.selected {
		border-color: #c89640;
		box-shadow:
			0 0 0 1px rgba(200, 150, 64, 0.4) inset,
			0 6px 20px rgba(200, 150, 64, 0.25),
			0 0 12px rgba(200, 150, 64, 0.15);
	}

	.faction-card.selected:hover,
	.faction-card.selected:focus-visible {
		transform: translateY(-2px);
		box-shadow:
			0 0 0 1px rgba(200, 150, 64, 0.4) inset,
			0 8px 24px rgba(200, 150, 64, 0.35),
			0 0 14px rgba(200, 150, 64, 0.2);
	}

	/* ── Name label at card bottom ── */
	.faction-card-footer {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 0.3rem 0.45rem 0.35rem;
		z-index: 2;
	}

	.faction-card-name {
		display: block;
		font-size: 10.5px;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #f0e4c8;
		text-shadow:
			0 1px 4px rgba(0, 0, 0, 1),
			0 0 8px rgba(0, 0, 0, 0.8);
		line-height: 1.25;
	}

	/* ── Selected badge (top-right checkmark) ── */
	.faction-card-badge {
		position: absolute;
		top: 7px;
		right: 7px;
		width: 20px;
		height: 20px;
		background: #c89640;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 3;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
	}

	.faction-card-badge i {
		color: #fff;
		font-size: 9px;
	}

	/* ── Unaffiliated card (spans both cols, no emblem) ── */
	.faction-card.unaffiliated {
		grid-column: 1 / -1;
		height: 42px;
		background-image: none;
		background-color: rgba(255, 255, 255, 0.03);
		border-style: dashed;
		border-color: rgba(200, 150, 70, 0.18);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.faction-card.unaffiliated::before {
		display: none;
	}

	.faction-card.unaffiliated .faction-card-name {
		color: rgba(232, 217, 191, 0.45);
		font-style: italic;
		font-weight: 400;
		font-size: 12px;
		letter-spacing: 0.02em;
		text-transform: none;
		text-shadow: none;
		text-align: center;
	}

	.faction-card.unaffiliated.selected {
		border-color: rgba(200, 150, 70, 0.45);
		background-color: rgba(200, 150, 70, 0.07);
	}

	.faction-card.unaffiliated.selected .faction-card-name {
		color: rgba(232, 217, 191, 0.7);
	}

	/* ── No results ── */
	.faction-no-results {
		grid-column: 1 / -1;
		padding: 1.5rem 1rem;
		text-align: center;
		color: rgba(232, 217, 191, 0.35);
		font-style: italic;
		font-size: 13px;
		margin: 0;
	}
</style>
