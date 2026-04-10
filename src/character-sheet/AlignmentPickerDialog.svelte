<script lang="ts">
	import { type AlignmentId, getAlignmentById } from './alignment';

	interface Props {
		currentAlignment: AlignmentId | '';
		actorName: string;
		onSelect: (alignmentId: AlignmentId) => void;
	}

	let { currentAlignment, actorName, onSelect }: Props = $props();

	/** The alignment the user is currently hovering / focusing */
	let hoveredId = $state<AlignmentId | null>(null);

	let activeAlignment = $derived(
		hoveredId ? getAlignmentById(hoveredId) : currentAlignment ? getAlignmentById(currentAlignment) : null,
	);

	function handleSelect(id: AlignmentId) {
		onSelect(id);
	}

	/** Axis labels for the header / side gutters */
	const LAW_AXIS = ['Lawful', 'Neutral', 'Chaotic'] as const;
	const MORAL_AXIS = ['Good', 'Neutral', 'Evil'] as const;

	/** 3×3 grid in reading order (row-major) */
	const GRID: AlignmentId[][] = [
		['LG', 'NG', 'CG'],
		['LN', 'N', 'CN'],
		['LE', 'NE', 'CE'],
	];
</script>

<div class="alignment-picker">
	<!-- ── Header ── -->
	<header class="ap-header">
		<div class="ap-sigil-rule"></div>
		<h2 class="ap-title">The Great Wheel Beckons</h2>
		<p class="ap-subtitle">
			Choose the alignment of <strong>{actorName}</strong>
		</p>
		<p class="ap-flavor">
			In Sigil, every cutter's moral compass matters - the blades of the Lady cut deeper when one's nature is known.
		</p>
		<div class="ap-sigil-rule"></div>
	</header>

	<div class="ap-grid-wrapper">
		<div class="ap-col-headers">
			{#each LAW_AXIS as label (label)}
				<span class="ap-axis-label">{label}</span>
			{/each}
		</div>

		<div class="ap-grid-body">
			<!-- Row labels (moral axis) + cells -->
			{#each GRID as row, rowIdx (rowIdx)}
				<span class="ap-row-label">{MORAL_AXIS[rowIdx]}</span>
				{#each row as cellId (cellId)}
					{@const alignment = getAlignmentById(cellId)}
					{#if alignment}
						<button
							class="ap-cell"
							class:selected={currentAlignment === cellId}
							style="--cell-hue: {alignment.hue}; --cell-sat: {alignment.sat};"
							role="option"
							aria-selected={currentAlignment === cellId}
							aria-label={alignment.name}
							onmouseenter={() => (hoveredId = cellId)}
							onmouseleave={() => (hoveredId = null)}
							onfocus={() => (hoveredId = cellId)}
							onblur={() => (hoveredId = null)}
							onclick={() => handleSelect(cellId)}
						>
							<span class="ap-cell-icon">{alignment.icon}</span>
							<span class="ap-cell-abbr">{cellId}</span>
							{#if currentAlignment === cellId}
								<span class="ap-cell-check"><i class="fa-solid fa-check"></i></span>
							{/if}
						</button>
					{/if}
				{/each}
			{/each}
		</div>
	</div>

	<!-- ── Detail panel ── -->
	<div class="ap-detail" class:visible={!!activeAlignment}>
		{#if activeAlignment}
			<div class="ap-detail-inner" style="--cell-hue: {activeAlignment.hue}; --cell-sat: {activeAlignment.sat};">
				<span class="ap-detail-icon">{activeAlignment.icon}</span>
				<div class="ap-detail-text">
					<strong class="ap-detail-name">{activeAlignment.name}</strong>
					<p class="ap-detail-desc">{activeAlignment.description}</p>
				</div>
			</div>
		{:else}
			<p class="ap-detail-placeholder">Hover over an alignment to learn more…</p>
		{/if}
	</div>

	<!-- ── Footer flavor ── -->
	<footer class="ap-footer">
		<span class="ap-footer-rule"></span>
		<span class="ap-footer-text">The planes remember what you choose</span>
		<span class="ap-footer-rule"></span>
	</footer>
</div>

<style>
	/* ═══════════════════════════════════════════════════════════
											Alignment Picker Theme
	   ═══════════════════════════════════════════════════════════ */

	.alignment-picker {
		display: flex;
		flex-direction: column;
		height: 100%;
		background:
			radial-gradient(ellipse at 50% 0%, rgba(110, 0, 0, 0.18) 0%, transparent 60%),
			radial-gradient(ellipse at 50% 100%, rgba(50, 30, 80, 0.15) 0%, transparent 50%),
			#0c0a0e;
		color: #e2d8c8;
		font-family: 'Rotis Serif', Georgia, serif;
		padding: 0.75rem 1rem;
		gap: 0.6rem;
		overflow: hidden;
	}

	/* ── Header ── */
	.ap-header {
		text-align: center;
		flex-shrink: 0;
	}

	.ap-title {
		font-family: 'Exocet Blizzard', 'Palatino Linotype', serif;
		font-weight: 700;
		font-size: 1.35rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #d4a017;
		margin: 0 0 0.15rem;
		text-shadow:
			0 0 12px rgba(212, 160, 23, 0.4),
			0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.ap-subtitle {
		margin: 0;
		font-size: 0.82rem;
		color: #c0b09a;
	}

	.ap-subtitle strong {
		color: #e8d9bf;
	}

	.ap-flavor {
		margin: 0.3rem 0 0;
		font-size: 0.72rem;
		font-style: italic;
		color: rgba(192, 176, 154, 0.55);
		line-height: 1.35;
	}

	/* Decorative rule */
	.ap-sigil-rule {
		height: 1px;
		margin: 0.4rem 2rem;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(212, 160, 23, 0.15) 15%,
			rgba(212, 160, 23, 0.5) 50%,
			rgba(212, 160, 23, 0.15) 85%,
			transparent 100%
		);
	}

	/* ── Grid Wrapper ── */
	.ap-grid-wrapper {
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
	}

	/* Column axis labels */
	.ap-col-headers {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		width: 276px; /* 3 × 88px cell + 2 × 6px gap */
		margin-left: 38px; /* offset for row labels */
		gap: 6px;
		margin-bottom: 3px;
	}

	.ap-axis-label {
		text-align: center;
		font-family: 'Exocet Blizzard Light', 'Palatino Linotype', serif;
		font-size: 0.62rem;
		font-weight: 300;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: rgba(212, 160, 23, 0.55);
	}

	/* Grid body: row-label + 3 cells per row */
	.ap-grid-body {
		display: grid;
		grid-template-columns: 32px repeat(3, 88px);
		grid-template-rows: repeat(3, 88px);
		gap: 6px;
		align-items: center;
	}

	/* Row axis labels */
	.ap-row-label {
		writing-mode: vertical-lr;
		transform: rotate(180deg);
		font-family: 'Exocet Blizzard Light', 'Palatino Linotype', serif;
		font-size: 0.6rem;
		font-weight: 300;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: rgba(212, 160, 23, 0.55);
		justify-self: center;
	}

	/* ── Individual Cell ── */
	.ap-cell {
		position: relative;
		width: 88px;
		height: 88px;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		border: 2px solid hsla(var(--cell-hue), var(--cell-sat), 45%, 0.25);
		background:
			radial-gradient(
				circle at 50% 45%,
				hsla(var(--cell-hue), var(--cell-sat), 30%, 0.25) 0%,
				transparent 70%
			),
			rgba(12, 10, 14, 0.85);
		transition:
			border-color 0.2s ease,
			transform 0.15s ease,
			box-shadow 0.25s ease,
			background 0.2s ease;
		outline: none;
		padding: 0;
		font-family: inherit;
		color: inherit;
	}

	.ap-cell::before {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: 7px;
		background: radial-gradient(
			circle at 50% 50%,
			hsla(var(--cell-hue), var(--cell-sat), 50%, 0.08) 0%,
			transparent 70%
		);
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.ap-cell:hover,
	.ap-cell:focus-visible {
		border-color: hsla(var(--cell-hue), var(--cell-sat), 55%, 0.6);
		transform: translateY(-2px) scale(1.03);
		box-shadow:
			0 6px 20px hsla(var(--cell-hue), var(--cell-sat), 25%, 0.35),
			0 0 15px hsla(var(--cell-hue), var(--cell-sat), 50%, 0.15);
	}

	.ap-cell:hover::before,
	.ap-cell:focus-visible::before {
		opacity: 1;
	}

	.ap-cell.selected {
		border-color: hsla(var(--cell-hue), var(--cell-sat), 60%, 0.75);
		background:
			radial-gradient(
				circle at 50% 45%,
				hsla(var(--cell-hue), var(--cell-sat), 35%, 0.4) 0%,
				transparent 70%
			),
			rgba(12, 10, 14, 0.7);
		box-shadow:
			0 0 0 1px hsla(var(--cell-hue), var(--cell-sat), 50%, 0.2) inset,
			0 4px 16px hsla(var(--cell-hue), var(--cell-sat), 30%, 0.35),
			0 0 25px hsla(var(--cell-hue), var(--cell-sat), 50%, 0.12);
	}

	.ap-cell.selected:hover,
	.ap-cell.selected:focus-visible {
		transform: translateY(-2px) scale(1.03);
		box-shadow:
			0 0 0 1px hsla(var(--cell-hue), var(--cell-sat), 50%, 0.3) inset,
			0 8px 24px hsla(var(--cell-hue), var(--cell-sat), 30%, 0.45),
			0 0 30px hsla(var(--cell-hue), var(--cell-sat), 50%, 0.18);
	}

	.ap-cell-icon {
		font-size: 1.65rem;
		line-height: 1;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
	}

	.ap-cell-abbr {
		font-family: 'Exocet Blizzard', 'Palatino Linotype', serif;
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: hsla(var(--cell-hue), var(--cell-sat), 75%, 0.85);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
	}

	.ap-cell-check {
		position: absolute;
		top: 5px;
		right: 5px;
		width: 18px;
		height: 18px;
		background: hsla(var(--cell-hue), var(--cell-sat), 45%, 0.9);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
	}

	.ap-cell-check i {
		color: #fff;
		font-size: 8px;
	}

	/* ── Detail Panel ── */
	.ap-detail {
		flex: 1;
		min-height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(212, 160, 23, 0.12);
		border-radius: 5px;
		background: rgba(0, 0, 0, 0.25);
		padding: 0.5rem 0.75rem;
		transition: border-color 0.2s ease;
		overflow: hidden;
	}

	.ap-detail.visible {
		border-color: rgba(212, 160, 23, 0.25);
	}

	.ap-detail-inner {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		width: 100%;
	}

	.ap-detail-icon {
		font-size: 2rem;
		line-height: 1;
		flex-shrink: 0;
		filter: drop-shadow(0 2px 6px hsla(var(--cell-hue), var(--cell-sat), 30%, 0.5));
	}

	.ap-detail-text {
		flex: 1;
		min-width: 0;
	}

	.ap-detail-name {
		font-family: 'Exocet Blizzard', 'Palatino Linotype', serif;
		font-size: 0.85rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: hsla(var(--cell-hue), var(--cell-sat), 75%, 0.95);
		text-shadow: 0 0 8px hsla(var(--cell-hue), var(--cell-sat), 40%, 0.35);
	}

	.ap-detail-desc {
		margin: 0.2rem 0 0;
		font-size: 0.72rem;
		line-height: 1.4;
		color: rgba(226, 216, 200, 0.7);
		font-style: italic;
	}

	.ap-detail-placeholder {
		margin: 0;
		font-size: 0.75rem;
		color: rgba(226, 216, 200, 0.3);
		font-style: italic;
	}

	/* ── Footer ── */
	.ap-footer {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-shrink: 0;
		padding-top: 0.15rem;
	}

	.ap-footer-rule {
		flex: 1;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(110, 0, 0, 0.4) 50%,
			transparent
		);
	}

	.ap-footer-text {
		font-size: 0.6rem;
		font-style: italic;
		color: rgba(192, 176, 154, 0.3);
		letter-spacing: 0.06em;
		white-space: nowrap;
	}
</style>
