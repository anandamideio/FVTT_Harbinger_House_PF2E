<script lang="ts">
	import type { SigilLocation, LocationClue } from '../data/content/sigil-locations';
	import type { LocationState } from '../types/module-flags';
	import { CATEGORY_ICONS, FALLBACK_ICON, LOCATION_ICONS } from './constants';

	interface Props {
		location: SigilLocation;
		state: LocationState;
		isGM: boolean;
		hideOptionalFindingsUntilDiscovered: boolean;
		onToggleClue?: (clueId: string) => void;
		onAdvanceState?: (newState: 'discovered' | 'investigated') => void;
		onOpenJournal?: () => void;
		onUpdateGMNotes?: (notes: string) => void;
	}

	let {
		location,
		state: locationState,
		isGM,
		hideOptionalFindingsUntilDiscovered,
		onToggleClue,
		onAdvanceState,
		onOpenJournal,
		onUpdateGMNotes,
	}: Props = $props();

	const categoryLabels: Record<string, string> = {
		'murder-site': 'Murder Site',
		'faction-hq': 'Faction HQ',
		'shop': 'Shop',
		'landmark': 'Landmark',
		'encounter': 'Encounter',
		'hideout': 'Hideout',
	};

	let mandatoryClues = $derived(location.clues.filter((c: LocationClue) => !c.optional));
	let optionalClues = $derived(location.clues.filter((c: LocationClue) => c.optional));
	let discoveredOptionalClues = $derived(
		optionalClues.filter((clue: LocationClue) => locationState.discoveredClues.includes(clue.id))
	);
	let discoveredOptionalClueCount = $derived(
		discoveredOptionalClues.length
	);
	let optionalCluesForPlayers = $derived(
		hideOptionalFindingsUntilDiscovered ? discoveredOptionalClues : optionalClues
	);
	let shouldShowOptionalSectionToPlayers = $derived(
		!hideOptionalFindingsUntilDiscovered || discoveredOptionalClueCount > 0
	);
	let shouldShowOptionalSection = $derived(isGM || shouldShowOptionalSectionToPlayers);
	let gmNotesValue = $derived(locationState.gmNotes ?? '');

	function toAbsoluteAssetPath(path: string): string {
		if (
			path.startsWith('/') ||
			path.startsWith('http://') ||
			path.startsWith('https://') ||
			path.startsWith('data:') ||
			path.startsWith('blob:')
		) {
			return path;
		}
		return `/${path}`;
	}

	let locationIconPath = $derived(
		toAbsoluteAssetPath(
			LOCATION_ICONS[location.id] ?? CATEGORY_ICONS[location.category] ?? FALLBACK_ICON
		)
	);

	function handleClueToggle(clueId: string) {
		onToggleClue?.(clueId);
	}

	function handleAdvance(target: 'discovered' | 'investigated') {
		onAdvanceState?.(target);
	}

	function handleOpenJournal() {
		onOpenJournal?.();
	}

	function handleGMNotesBlur() {
		onUpdateGMNotes?.(gmNotesValue);
	}
</script>

<div class="sigil-location-detail" data-category={location.category}>
	<!-- Header -->
	<header class="location-header">
		<div class="location-icon {location.category}" style="--location-icon: url('{locationIconPath}')"></div>
		<div class="location-title">
			<h2>{location.name}</h2>
			<span class="location-category">{categoryLabels[location.category] ?? location.category}</span>
			{#if location.victim}
				<span class="location-victim">Victim: {location.victim}</span>
			{/if}
			{#if location.murderOrder}
				<span class="location-murder-order">Murder #{location.murderOrder}</span>
			{/if}
		</div>
		<span class="location-chapter">Ch. {location.chapter}</span>
	</header>

	<!-- Description -->
	<div class="location-description">
		<p>{location.description}</p>
	</div>

	<!-- Clues -->
	{#if locationState.revealState !== 'hidden'}
		{#if mandatoryClues.length > 0}
			<section class="clues-section">
				<h3>Clues Discovered</h3>
				<ul class="clue-list">
					{#each mandatoryClues as clue (clue.id)}
						<li class="clue-item mandatory">
							<span class="clue-text">{clue.text}</span>
							{#if isGM && clue.gmNote}
								<span class="gm-note">{clue.gmNote}</span>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if optionalClues.length > 0 && shouldShowOptionalSection}
			<section class="clues-section optional-section">
				<h3>Optional Findings</h3>
				<ul class="clue-list">
					{#if isGM}
						{#each optionalClues as clue (clue.id)}
							<li class="clue-item optional">
								<label class="clue-checkbox">
									<input
										type="checkbox"
										checked={locationState.discoveredClues.includes(clue.id)}
										onchange={() => handleClueToggle(clue.id)}
									/>
									<span class="clue-text">{clue.text}</span>
								</label>
								{#if clue.gmNote}
									<span class="gm-note">{clue.gmNote}</span>
								{/if}
							</li>
						{/each}
					{:else}
						{#each optionalCluesForPlayers as clue (clue.id)}
							<li class="clue-item optional">
								{#if locationState.discoveredClues.includes(clue.id)}
									<span class="clue-text discovered">{clue.text}</span>
								{:else}
									<span class="clue-text undiscovered">???</span>
								{/if}
							</li>
						{/each}
					{/if}
				</ul>
			</section>
		{/if}
	{:else}
		<p class="no-clues">No clues available yet.</p>
	{/if}

	<!-- Actions -->
	<footer class="location-actions">
		{#if location.journalId}
			<button class="action-btn journal-btn" onclick={handleOpenJournal}>
				Open Journal
			</button>
		{/if}

		{#if isGM}
			<hr class="gm-divider" />
			<div class="gm-controls">
				<span class="gm-label">GM Controls</span>
				<div class="gm-buttons">
					{#if locationState.revealState === 'hidden'}
						<button class="action-btn reveal-btn" onclick={() => handleAdvance('discovered')}>
							Reveal to Discovered
						</button>
					{/if}
					{#if locationState.revealState === 'discovered'}
						<button class="action-btn reveal-btn" onclick={() => handleAdvance('investigated')}>
							Reveal to Investigated
						</button>
					{/if}
					{#if locationState.revealState === 'investigated'}
						<span class="state-badge investigated">Fully Investigated</span>
					{/if}
				</div>

				<div class="gm-notes">
					<label for="gm-notes-{location.id}">GM Notes</label>
					<textarea
						id="gm-notes-{location.id}"
						bind:value={gmNotesValue}
						onblur={handleGMNotesBlur}
						placeholder="Private GM notes for this location..."
						rows="3"
					></textarea>
				</div>
			</div>
		{/if}
	</footer>
</div>
