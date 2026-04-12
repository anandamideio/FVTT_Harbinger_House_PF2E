<script lang="ts">
	import type { SigilLocation, LocationCategory, RevealState } from '../data/sigil-locations';
	import type { LocationState } from '../types/module-flags';
	import { CATEGORY_COLORS_CSS } from './constants';

	// ========================================================================
	// Props
	// ========================================================================

	interface Props {
		locations: SigilLocation[];
		states: Record<string, LocationState>;
		onAdvanceState: (locationId: string) => Promise<void>;
		onSetState: (locationId: string, targetState: RevealState) => Promise<void>;
		onResetLocation: (locationId: string) => Promise<void>;
		onResetAll: () => Promise<void>;
		onBulkSetState: (locationIds: string[], targetState: RevealState) => Promise<void>;
		onBulkReset: (locationIds: string[]) => Promise<void>;
		onToggleClue: (locationId: string, clueId: string) => Promise<void>;
		onUpdateGMNotes: (locationId: string, notes: string) => Promise<void>;
		onOpenDetail: (locationId: string) => void;
		onOpenJournal: (locationId: string) => void;
	}

	let {
		locations,
		states,
		onAdvanceState,
		onSetState,
		onResetLocation,
		onResetAll,
		onBulkSetState,
		onBulkReset,
		onToggleClue,
		onUpdateGMNotes,
		onOpenDetail,
		onOpenJournal,
	}: Props = $props();

	// ========================================================================
	// Constants
	// ========================================================================

	const CATEGORY_ORDER: LocationCategory[] = [
		'murder-site', 'faction-hq', 'landmark', 'shop', 'encounter', 'hideout',
	];

	const CATEGORY_LABELS: Record<LocationCategory, string> = {
		'murder-site': 'Murder Sites',
		'faction-hq': 'Faction Headquarters',
		'shop': 'Shops',
		'landmark': 'Landmarks',
		'encounter': 'Encounters',
		'hideout': 'Hideouts',
	};

	const STATE_LABELS: Record<RevealState, string> = {
		hidden: 'Hidden',
		discovered: 'Discovered',
		investigated: 'Investigated',
	};

	const NEXT_STATE: Record<RevealState, RevealState | null> = {
		hidden: 'discovered',
		discovered: 'investigated',
		investigated: null,
	};

	// ========================================================================
	// Internal UI State
	// ========================================================================

	let searchQuery = $state('');
	let filterCategory = $state<LocationCategory | 'all'>('all');
	let filterChapter = $state<1 | 2 | 3 | 'all'>('all');
	let filterState = $state<RevealState | 'all'>('all');
	let selectedIds = $state<Set<string>>(new Set());
	let expandedId = $state<string | null>(null);

	// ========================================================================
	// Derived
	// ========================================================================

	function getState(locationId: string): LocationState {
		return states[locationId] ?? { revealState: 'hidden' as const, updatedAt: 0, discoveredClues: [] };
	}

	let filteredLocations = $derived.by(() => {
		let result = locations;

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter(
				(l) => l.name.toLowerCase().includes(q) || l.victim?.toLowerCase().includes(q),
			);
		}

		if (filterCategory !== 'all') {
			result = result.filter((l) => l.category === filterCategory);
		}

		if (filterChapter !== 'all') {
			result = result.filter((l) => l.chapter === filterChapter);
		}

		if (filterState !== 'all') {
			result = result.filter((l) => getState(l.id).revealState === filterState);
		}

		return result;
	});

	let groupedLocations = $derived.by(() => {
		const groups: { category: LocationCategory; label: string; locations: SigilLocation[] }[] = [];
		for (const cat of CATEGORY_ORDER) {
			const locs = filteredLocations.filter((l) => l.category === cat);
			if (locs.length > 0) {
				groups.push({ category: cat, label: CATEGORY_LABELS[cat], locations: locs });
			}
		}
		return groups;
	});

	let progressStats = $derived.by(() => {
		let hidden = 0;
		let discovered = 0;
		let investigated = 0;
		for (const loc of locations) {
			const s = getState(loc.id).revealState;
			if (s === 'hidden') hidden++;
			else if (s === 'discovered') discovered++;
			else investigated++;
		}
		return { total: locations.length, hidden, discovered, investigated };
	});

	let filteredIds = $derived(new Set(filteredLocations.map((l) => l.id)));
	let allFilteredSelected = $derived(
		filteredLocations.length > 0 && filteredLocations.every((l) => selectedIds.has(l.id)),
	);

	let selectionCount = $derived(selectedIds.size);

	// ========================================================================
	// Handlers
	// ========================================================================

	function toggleSelectAll() {
		if (allFilteredSelected) {
			// Deselect all visible
			selectedIds = new Set([...selectedIds].filter((id) => !filteredIds.has(id)));
		} else {
			// Select all visible
			selectedIds = new Set([...selectedIds, ...filteredIds]);
		}
	}

	function toggleSelect(id: string) {
		const next = new Set(selectedIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedIds = next;
	}

	function toggleExpand(id: string) {
		expandedId = expandedId === id ? null : id;
	}

	async function handleBulkReveal(targetState: RevealState) {
		const ids = [...selectedIds];
		if (ids.length === 0) return;
		await onBulkSetState(ids, targetState);
		selectedIds = new Set();
	}

	async function handleBulkReset() {
		const ids = [...selectedIds];
		if (ids.length === 0) return;
		await onBulkReset(ids);
		selectedIds = new Set();
	}

	function getCategoryColor(category: LocationCategory): string {
		return CATEGORY_COLORS_CSS[category] ?? '#888888';
	}

	function getClueCount(location: SigilLocation): { found: number; total: number } {
		const s = getState(location.id);
		const optionalClues = location.clues.filter((c) => c.optional);
		const found = optionalClues.filter((c) => s.discoveredClues.includes(c.id)).length;
		return { found, total: optionalClues.length };
	}
</script>

<div class="investigation-board">
	<!-- ================================================================ -->
	<!-- Progress Header                                                  -->
	<!-- ================================================================ -->
	<header class="board-header">
		<h2 class="board-title">Sigil Investigation Board</h2>
		<div class="progress-summary">
			<span class="progress-stat hidden-stat">
				<i class="fas fa-eye-slash"></i> {progressStats.hidden} Hidden
			</span>
			<span class="progress-stat discovered-stat">
				<i class="fas fa-eye"></i> {progressStats.discovered} Discovered
			</span>
			<span class="progress-stat investigated-stat">
				<i class="fas fa-search"></i> {progressStats.investigated} Investigated
			</span>
		</div>
		<div class="progress-bar">
			{#if progressStats.investigated > 0}
				<div
					class="progress-segment investigated"
					style="width: {(progressStats.investigated / progressStats.total) * 100}%"
				></div>
			{/if}
			{#if progressStats.discovered > 0}
				<div
					class="progress-segment discovered"
					style="width: {(progressStats.discovered / progressStats.total) * 100}%"
				></div>
			{/if}
			{#if progressStats.hidden > 0}
				<div
					class="progress-segment hidden-seg"
					style="width: {(progressStats.hidden / progressStats.total) * 100}%"
				></div>
			{/if}
		</div>
	</header>

	<!-- ================================================================ -->
	<!-- Filter Toolbar                                                   -->
	<!-- ================================================================ -->
	<div class="filter-toolbar">
		<div class="filter-search">
			<i class="fas fa-search"></i>
			<input
				type="text"
				placeholder="Search locations..."
				bind:value={searchQuery}
			/>
		</div>
		<select class="filter-select" bind:value={filterCategory}>
			<option value="all">All Categories</option>
			{#each CATEGORY_ORDER as cat}
				<option value={cat}>{CATEGORY_LABELS[cat]}</option>
			{/each}
		</select>
		<select class="filter-select" bind:value={filterChapter}>
			<option value="all">All Chapters</option>
			<option value={1}>Chapter 1</option>
			<option value={2}>Chapter 2</option>
			<option value={3}>Chapter 3</option>
		</select>
		<select class="filter-select" bind:value={filterState}>
			<option value="all">All States</option>
			<option value="hidden">Hidden</option>
			<option value="discovered">Discovered</option>
			<option value="investigated">Investigated</option>
		</select>
	</div>

	<!-- ================================================================ -->
	<!-- Bulk Action Bar                                                  -->
	<!-- ================================================================ -->
	{#if selectionCount > 0}
		<div class="bulk-actions">
			<label class="bulk-select-all">
				<input
					type="checkbox"
					checked={allFilteredSelected}
					onchange={toggleSelectAll}
				/>
				Select All Visible
			</label>
			<span class="bulk-count">{selectionCount} selected</span>
			<div class="bulk-buttons">
				<button class="bulk-btn discover-btn" onclick={() => handleBulkReveal('discovered')}>
					<i class="fas fa-eye"></i> Discover
				</button>
				<button class="bulk-btn investigate-btn" onclick={() => handleBulkReveal('investigated')}>
					<i class="fas fa-search"></i> Investigate
				</button>
				<button class="bulk-btn reset-btn" onclick={handleBulkReset}>
					<i class="fas fa-undo"></i> Reset
				</button>
			</div>
		</div>
	{/if}

	<!-- ================================================================ -->
	<!-- Location List                                                    -->
	<!-- ================================================================ -->
	<div class="location-list">
		{#if groupedLocations.length === 0}
			<div class="empty-state">
				<i class="fas fa-map-marked-alt"></i>
				<p>No locations match your filters.</p>
			</div>
		{/if}

		{#each groupedLocations as group (group.category)}
			<div class="category-group" style="--cat-color: {getCategoryColor(group.category)}">
				<div class="category-header">
					<span class="category-pip"></span>
					<h3>{group.label}</h3>
					<span class="category-count">{group.locations.length}</span>
				</div>

				{#each group.locations as location (location.id)}
					{@const locState = getState(location.id)}
					{@const nextState = NEXT_STATE[locState.revealState]}
					{@const isExpanded = expandedId === location.id}
					{@const clueCount = getClueCount(location)}

					<div class="location-row" class:expanded={isExpanded} data-state={locState.revealState}>
						<div class="location-main" role="button" tabindex="0"
							onclick={() => toggleExpand(location.id)}
							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(location.id); }}
						>
							<!-- Bulk select checkbox -->
							<input
								type="checkbox"
								class="location-select"
								checked={selectedIds.has(location.id)}
								onclick={(e) => e.stopPropagation()}
								onchange={() => toggleSelect(location.id)}
							/>

							<!-- Category color pip -->
							<span class="cat-pip" style="background: {getCategoryColor(location.category)}"></span>

							<!-- Name & info -->
							<div class="location-info">
								<span class="location-name">{location.name}</span>
								{#if location.victim}
									<span class="location-victim">{location.victim}</span>
								{/if}
							</div>

							<!-- Chapter badge -->
							<span class="chapter-badge">Ch.{location.chapter}</span>

							<!-- Clue counter (if has optional clues) -->
							{#if clueCount.total > 0}
								<span class="clue-counter" title="Optional clues found">
									<i class="fas fa-puzzle-piece"></i>
									{clueCount.found}/{clueCount.total}
								</span>
							{/if}

							<!-- State badge -->
							<span class="state-badge {locState.revealState}">
								{STATE_LABELS[locState.revealState]}
							</span>

							<!-- Quick action buttons -->
							<div class="quick-actions" role="toolbar" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
								{#if nextState}
									<button
										class="quick-btn advance-btn"
										title="Advance to {STATE_LABELS[nextState]}"
										onclick={() => onAdvanceState(location.id)}
									>
										<i class="fas fa-arrow-right"></i>
									</button>
								{/if}
								{#if locState.revealState !== 'hidden'}
									<button
										class="quick-btn reset-action-btn"
										title="Reset to Hidden"
										onclick={() => onResetLocation(location.id)}
									>
										<i class="fas fa-undo"></i>
									</button>
								{/if}
								<button
									class="quick-btn detail-btn"
									title="Open Detail Panel"
									onclick={() => onOpenDetail(location.id)}
								>
									<i class="fas fa-info-circle"></i>
								</button>
							</div>

							<!-- Expand indicator -->
							<i class="fas expand-icon" class:fa-chevron-down={!isExpanded} class:fa-chevron-up={isExpanded}></i>
						</div>

						<!-- Expanded section: clues + controls -->
						{#if isExpanded}
							<div class="location-expanded">
								<!-- Description -->
								<p class="expanded-description">{location.description}</p>

								<!-- Direct state controls -->
								<div class="state-controls">
									<button
										class="state-btn"
										class:active={locState.revealState === 'hidden'}
										disabled={locState.revealState === 'hidden'}
										onclick={() => onResetLocation(location.id)}
									>
										<i class="fas fa-eye-slash"></i> Hidden
									</button>
									<button
										class="state-btn"
										class:active={locState.revealState === 'discovered'}
										onclick={() => onSetState(location.id, 'discovered')}
									>
										<i class="fas fa-eye"></i> Discovered
									</button>
									<button
										class="state-btn"
										class:active={locState.revealState === 'investigated'}
										onclick={() => onSetState(location.id, 'investigated')}
									>
										<i class="fas fa-search"></i> Investigated
									</button>
								</div>

								<!-- Clues -->
								{#if location.clues.length > 0}
									<div class="clues-panel">
										<h4>Clues</h4>
										<ul class="clue-list">
											{#each location.clues as clue (clue.id)}
												<li class="clue-item" class:optional={clue.optional}>
													{#if clue.optional}
														<label class="clue-label">
															<input
																type="checkbox"
																checked={locState.discoveredClues.includes(clue.id)}
																onchange={() => onToggleClue(location.id, clue.id)}
															/>
															<span class="clue-text">{clue.text}</span>
														</label>
													{:else}
														<span class="clue-marker"><i class="fas fa-scroll"></i></span>
														<span class="clue-text">{clue.text}</span>
													{/if}
													{#if clue.gmNote}
														<span class="gm-note"><i class="fas fa-user-shield"></i> {clue.gmNote}</span>
													{/if}
												</li>
											{/each}
										</ul>
									</div>
								{/if}

								<!-- GM Notes -->
								<div class="gm-notes-section">
									<label for="gm-notes-{location.id}">GM Notes</label>
									<textarea
										id="gm-notes-{location.id}"
										value={locState.gmNotes ?? ''}
										onblur={(e) => onUpdateGMNotes(location.id, (e.target as HTMLTextAreaElement).value)}
										placeholder="Private notes..."
										rows="2"
									></textarea>
								</div>

								<!-- Journal link -->
								{#if location.journalId}
									<button class="journal-btn" onclick={() => onOpenJournal(location.id)}>
										<i class="fas fa-book-open"></i> Open Journal Entry
									</button>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<!-- ================================================================ -->
	<!-- Footer                                                           -->
	<!-- ================================================================ -->
	<footer class="board-footer">
		<button class="reset-all-btn" onclick={onResetAll}>
			<i class="fas fa-undo"></i> Reset All Locations
		</button>
	</footer>
</div>

<style>
	/* ================================================================
	   Root & Theme
	   ================================================================ */
	.investigation-board {
		--ib-bg: #1e1710;
		--ib-bg-card: #2a1e14;
		--ib-bg-expanded: #221a11;
		--ib-text: #e0d6c2;
		--ib-text-muted: #9a8e7a;
		--ib-text-heading: #c9aa71;
		--ib-border: #3d3225;
		--ib-border-light: #4a3d2e;
		--ib-accent: #c9a227;
		--ib-state-hidden: #5a5040;
		--ib-state-discovered: #c9a227;
		--ib-state-investigated: #44bb44;
		--ib-danger: #aa3333;

		font-family: 'Rotis Serif', Georgia, 'Times New Roman', serif;
		color: var(--ib-text);
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
		background:
			linear-gradient(180deg, rgba(30, 23, 16, 0.95) 0%, rgba(30, 23, 16, 0.98) 100%),
			url('/modules/harbinger-house-pf2e/dist/assets/style/old-paper.jpg') center / cover;
	}

	/* ================================================================
	   Progress Header
	   ================================================================ */
	.board-header {
		padding: 0.75rem 1rem 0.5rem;
		border-bottom: 1px solid var(--ib-border);
		flex-shrink: 0;
	}

	.board-title {
		font-family: 'Exocet Blizzard', Georgia, serif;
		color: var(--ib-text-heading);
		font-size: 1.2rem;
		margin: 0 0 0.4rem;
		letter-spacing: 1px;
		text-transform: uppercase;
	}

	.progress-summary {
		display: flex;
		gap: 1rem;
		font-size: 0.8rem;
		margin-bottom: 0.4rem;
	}

	.progress-stat {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}
	.progress-stat i { font-size: 0.7rem; }
	.hidden-stat { color: var(--ib-state-hidden); }
	.discovered-stat { color: var(--ib-state-discovered); }
	.investigated-stat { color: var(--ib-state-investigated); }

	.progress-bar {
		display: flex;
		height: 4px;
		border-radius: 2px;
		overflow: hidden;
		background: var(--ib-border);
	}

	.progress-segment {
		transition: width 0.3s ease;
	}
	.progress-segment.investigated { background: var(--ib-state-investigated); }
	.progress-segment.discovered { background: var(--ib-state-discovered); }
	.progress-segment.hidden-seg { background: var(--ib-state-hidden); }

	/* ================================================================
	   Filter Toolbar
	   ================================================================ */
	.filter-toolbar {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-bottom: 1px solid var(--ib-border);
		flex-shrink: 0;
		flex-wrap: wrap;
	}

	.filter-search {
		display: flex;
		align-items: center;
		background: var(--ib-bg-card);
		border: 1px solid var(--ib-border);
		border-radius: 3px;
		padding: 0 0.5rem;
		flex: 1;
		min-width: 140px;
	}
	.filter-search i { color: var(--ib-text-muted); font-size: 0.75rem; }
	.filter-search input {
		background: transparent;
		border: none;
		color: var(--ib-text);
		padding: 0.35rem 0.4rem;
		width: 100%;
		font-family: inherit;
		font-size: 0.85rem;
		outline: none;
	}
	.filter-search input::placeholder { color: var(--ib-text-muted); }

	.filter-select {
		background: var(--ib-bg-card);
		border: 1px solid var(--ib-border);
		border-radius: 3px;
		color: var(--ib-text);
		padding: 0.35rem 0.4rem;
		font-family: inherit;
		font-size: 0.8rem;
		cursor: pointer;
	}

	/* ================================================================
	   Bulk Action Bar
	   ================================================================ */
	.bulk-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.4rem 1rem;
		background: rgba(201, 162, 39, 0.08);
		border-bottom: 1px solid var(--ib-accent);
		flex-shrink: 0;
		flex-wrap: wrap;
	}

	.bulk-select-all {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.8rem;
		cursor: pointer;
		color: var(--ib-text-muted);
	}

	.bulk-count {
		font-size: 0.8rem;
		color: var(--ib-accent);
		font-weight: 600;
	}

	.bulk-buttons {
		display: flex;
		gap: 0.4rem;
		margin-left: auto;
	}

	.bulk-btn {
		padding: 0.25rem 0.6rem;
		border: 1px solid var(--ib-border);
		border-radius: 3px;
		background: var(--ib-bg-card);
		color: var(--ib-text);
		font-size: 0.75rem;
		font-family: inherit;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		transition: all 0.15s ease;
	}
	.bulk-btn:hover { border-color: var(--ib-text-muted); background: var(--ib-border); }
	.bulk-btn.discover-btn:hover { border-color: var(--ib-state-discovered); }
	.bulk-btn.investigate-btn:hover { border-color: var(--ib-state-investigated); }
	.bulk-btn.reset-btn:hover { border-color: var(--ib-danger); color: var(--ib-danger); }

	/* ================================================================
	   Location List
	   ================================================================ */
	.location-list {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 0.5rem 0;
		/* Firefox scrollbar */
		scrollbar-width: thin;
		scrollbar-color: #6b5a45 var(--ib-bg);
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--ib-text-muted);
	}
	.empty-state i { font-size: 2rem; margin-bottom: 0.5rem; display: block; }

	/* Category Group */
	.category-group {
		margin-bottom: 0.25rem;
	}

	.category-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 1rem;
		background: rgba(255, 255, 255, 0.03);
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.category-pip {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--cat-color);
		flex-shrink: 0;
	}

	.category-header h3 {
		font-family: 'Exocet Blizzard', Georgia, serif;
		font-size: 0.85rem;
		color: var(--ib-text-heading);
		margin: 0;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.category-count {
		font-size: 0.7rem;
		color: var(--ib-text-muted);
		background: var(--ib-border);
		padding: 0.1rem 0.4rem;
		border-radius: 8px;
	}

	/* Location Row */
	.location-row {
		border-bottom: 1px solid var(--ib-border);
	}
	.location-row:last-child { border-bottom: none; }

	.location-main {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 1rem;
		cursor: pointer;
		transition: background 0.1s ease;
	}
	.location-main:hover { background: rgba(255, 255, 255, 0.03); }
	.location-row.expanded .location-main { background: rgba(201, 162, 39, 0.05); }

	.location-select {
		flex-shrink: 0;
		cursor: pointer;
		accent-color: var(--ib-accent);
	}

	.cat-pip {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.location-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.location-name {
		font-size: 0.85rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.location-victim {
		font-size: 0.7rem;
		color: #cc6666;
		font-style: italic;
	}

	.chapter-badge {
		font-size: 0.65rem;
		color: var(--ib-text-muted);
		background: var(--ib-border);
		padding: 0.1rem 0.35rem;
		border-radius: 3px;
		flex-shrink: 0;
	}

	.clue-counter {
		font-size: 0.7rem;
		color: var(--ib-text-muted);
		display: flex;
		align-items: center;
		gap: 0.2rem;
		flex-shrink: 0;
	}
	.clue-counter i { font-size: 0.6rem; }

	/* State Badge */
	.state-badge {
		font-size: 0.65rem;
		padding: 0.15rem 0.5rem;
		border-radius: 3px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 600;
		flex-shrink: 0;
	}
	.state-badge.hidden {
		background: rgba(90, 80, 64, 0.3);
		color: var(--ib-state-hidden);
		border: 1px solid var(--ib-state-hidden);
	}
	.state-badge.discovered {
		background: rgba(201, 162, 39, 0.15);
		color: var(--ib-state-discovered);
		border: 1px solid var(--ib-state-discovered);
	}
	.state-badge.investigated {
		background: rgba(68, 187, 68, 0.15);
		color: var(--ib-state-investigated);
		border: 1px solid var(--ib-state-investigated);
	}

	/* Quick Actions */
	.quick-actions {
		display: flex;
		gap: 0.2rem;
		flex-shrink: 0;
	}

	.quick-btn {
		width: 24px;
		height: 24px;
		border: 1px solid transparent;
		border-radius: 3px;
		background: transparent;
		color: var(--ib-text-muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.7rem;
		transition: all 0.15s ease;
		padding: 0;
	}
	.quick-btn:hover { border-color: var(--ib-border-light); color: var(--ib-text); background: var(--ib-bg-card); }
	.advance-btn:hover { color: var(--ib-state-discovered); border-color: var(--ib-state-discovered); }
	.reset-action-btn:hover { color: var(--ib-danger); border-color: var(--ib-danger); }
	.detail-btn:hover { color: var(--ib-accent); border-color: var(--ib-accent); }

	.expand-icon {
		font-size: 0.6rem;
		color: var(--ib-text-muted);
		flex-shrink: 0;
		transition: transform 0.15s ease;
	}

	/* ================================================================
	   Expanded Section
	   ================================================================ */
	.location-expanded {
		padding: 0.6rem 1rem 0.8rem 2.8rem;
		background: var(--ib-bg-expanded);
		border-top: 1px solid var(--ib-border);
	}

	.expanded-description {
		font-size: 0.8rem;
		color: var(--ib-text-muted);
		font-style: italic;
		margin: 0 0 0.6rem;
		line-height: 1.4;
	}

	/* State Controls */
	.state-controls {
		display: flex;
		gap: 0.35rem;
		margin-bottom: 0.6rem;
	}

	.state-btn {
		flex: 1;
		padding: 0.3rem 0.5rem;
		border: 1px solid var(--ib-border);
		border-radius: 3px;
		background: var(--ib-bg-card);
		color: var(--ib-text-muted);
		font-size: 0.75rem;
		font-family: inherit;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
		transition: all 0.15s ease;
	}
	.state-btn:hover:not(:disabled):not(.active) {
		border-color: var(--ib-text-muted);
		color: var(--ib-text);
	}
	.state-btn.active {
		border-color: var(--ib-accent);
		background: rgba(201, 162, 39, 0.15);
		color: var(--ib-accent);
		cursor: default;
	}
	.state-btn:disabled { opacity: 0.4; cursor: default; }

	/* Clues Panel */
	.clues-panel {
		margin-bottom: 0.6rem;
	}

	.clues-panel h4 {
		font-family: 'Exocet Blizzard', Georgia, serif;
		font-size: 0.8rem;
		color: var(--ib-text-heading);
		margin: 0 0 0.3rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.clue-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.clue-item {
		padding: 0.3rem 0;
		border-bottom: 1px solid rgba(61, 50, 37, 0.5);
		font-size: 0.8rem;
		line-height: 1.4;
	}
	.clue-item:last-child { border-bottom: none; }

	.clue-label {
		display: flex;
		align-items: flex-start;
		gap: 0.4rem;
		cursor: pointer;
	}
	.clue-label input[type="checkbox"] {
		margin-top: 0.15rem;
		accent-color: var(--ib-accent);
		flex-shrink: 0;
	}

	.clue-marker {
		color: var(--ib-accent);
		margin-right: 0.3rem;
		font-size: 0.7rem;
	}

	.clue-text {
		color: var(--ib-text);
	}

	.clue-item.optional .clue-text {
		color: var(--ib-text-muted);
	}

	.gm-note {
		display: block;
		font-size: 0.72rem;
		color: #8899aa;
		font-style: italic;
		margin-top: 0.15rem;
		padding-left: 1.2rem;
	}
	.gm-note i { margin-right: 0.2rem; }

	/* GM Notes Section */
	.gm-notes-section {
		margin-bottom: 0.5rem;
	}

	.gm-notes-section label {
		font-size: 0.75rem;
		color: var(--ib-text-muted);
		display: block;
		margin-bottom: 0.2rem;
	}

	.gm-notes-section textarea {
		width: 100%;
		background: var(--ib-bg-card);
		border: 1px solid var(--ib-border);
		border-radius: 3px;
		color: var(--ib-text);
		padding: 0.35rem 0.5rem;
		font-family: inherit;
		font-size: 0.8rem;
		resize: vertical;
		outline: none;
	}
	.gm-notes-section textarea:focus { border-color: var(--ib-accent); }

	/* Journal Button */
	.journal-btn {
		padding: 0.3rem 0.6rem;
		border: 1px solid var(--ib-border);
		border-radius: 3px;
		background: var(--ib-bg-card);
		color: var(--ib-text-muted);
		font-size: 0.75rem;
		font-family: inherit;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		transition: all 0.15s ease;
	}
	.journal-btn:hover { border-color: var(--ib-accent); color: var(--ib-accent); }

	/* ================================================================
	   Footer
	   ================================================================ */
	.board-footer {
		padding: 0.5rem 1rem;
		border-top: 1px solid var(--ib-border);
		display: flex;
		justify-content: flex-end;
		flex-shrink: 0;
	}

	.reset-all-btn {
		padding: 0.3rem 0.8rem;
		border: 1px solid var(--ib-danger);
		border-radius: 3px;
		background: rgba(170, 51, 51, 0.1);
		color: var(--ib-danger);
		font-size: 0.8rem;
		font-family: inherit;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		transition: all 0.15s ease;
	}
	.reset-all-btn:hover {
		background: rgba(170, 51, 51, 0.25);
	}

	/* ================================================================
	   Scrollbar Styling
	   ================================================================ */
	.location-list::-webkit-scrollbar {
		width: 8px;
	}
	.location-list::-webkit-scrollbar-track {
		background: var(--ib-bg);
	}
	.location-list::-webkit-scrollbar-thumb {
		background: #6b5a45;
		border-radius: 4px;
		border: 1px solid var(--ib-bg);
	}
	.location-list::-webkit-scrollbar-thumb:hover {
		background: var(--ib-text-heading);
	}
</style>
