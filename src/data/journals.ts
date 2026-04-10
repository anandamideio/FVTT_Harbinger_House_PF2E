export interface JournalPage {
	name: string;
	type: 'text' | 'image' | 'pdf' | 'video';
	text?: {
		content: string;
		format: number; // 1 = HTML, 2 = Markdown
		markdown?: string;
	};
	title?: {
		show: boolean;
		level: number;
	};
	src?: string; // For images/PDFs
	video?: {
		controls: boolean;
		loop: boolean;
		autoplay: boolean;
		volume: number;
	};
}

export interface HarbingerJournal {
	id: string;
	name: string;
	pages: JournalPage[];
	folder?: string; // Folder name for organization
	sort?: number;
}

/**
 * Parse markdown content into journal entries
 *
 * Strategy:
 * - Level 1 headers (#) become separate journal entries
 * - Level 2-4 headers (##, ###, ####) become pages within those entries
 * - Content between headers becomes the page content
 * - We preserve markdown for better formatting control
 */
export function parseMarkdownToJournals(markdown: string): HarbingerJournal[] {
	const journals: HarbingerJournal[] = [];
	const lines = markdown.split('\n');

	let currentJournal: HarbingerJournal | null = null;
	let currentPage: JournalPage | null = null;
	let currentContent: string[] = [];
	let journalCounter = 0;

	const flushPage = () => {
		if (currentPage && currentContent.length > 0) {
			currentPage.text = {
				content: markdownToHTML(currentContent.join('\n')),
				format: 1, // HTML format
				markdown: currentContent.join('\n'),
			};
			currentContent = [];
		}
	};

	const flushJournal = () => {
		flushPage();
		if (currentJournal && currentPage) {
			currentJournal.pages.push(currentPage);
			currentPage = null;
		}
		if (currentJournal && currentJournal.pages.length > 0) {
			journals.push(currentJournal);
		}
		currentJournal = null;
	};

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Level 1 header - new journal entry
		if (line.match(/^# [^#]/)) {
			flushJournal();

			const title = line.replace(/^# /, '').trim();
			// Skip the main title
			if (title === 'Harbinger House') continue;

			journalCounter++;
			currentJournal = {
				id: `journal-${journalCounter}`,
				name: title,
				pages: [],
				sort: journalCounter * 100,
			};
			continue;
		}

		// Level 2 header - new page in current journal
		if (line.match(/^## /)) {
			const rawTitle = line.replace(/^## /, '').trim();

			// Skip the Table of Contents — Foundry sidebar provides navigation
			if (rawTitle === 'Table of Contents') continue;

			if (!currentJournal) {
				// Create a default journal if we don't have one
				journalCounter++;
				currentJournal = {
					id: `journal-${journalCounter}`,
					name: 'Harbinger House',
					pages: [],
					sort: journalCounter * 100,
				};
			}

			flushPage();
			if (currentPage) {
				currentJournal.pages.push(currentPage);
			}

			currentPage = {
				name: rawTitle,
				type: 'text',
				title: {
					show: true,
					level: 1,
				},
			};
			continue;
		}

		// Content line
		if (currentPage) {
			currentContent.push(line);
		}
	}

	// Flush any remaining content
	flushJournal();

	// Assign folders based on content type
	return journals.map((j) => {
		if (j.name.startsWith('Chapter')) {
			j.folder = 'Chapters';
		} else if (j.name === 'intro' || j.name === 'Introduction') {
			j.folder = 'Introduction';
			j.name = 'Introduction';
		} else {
			j.folder = 'Reference';
		}
		return j;
	});
}

/** DM-facing paragraph prefixes that get auto-wrapped in .dm-note */
const DM_NOTE_PREFIXES = [
	'DM Note:',
	'The Real Chant:',
	'Sliding the Blinds:',
	'Slipping the Blinds:',
	'Discrimination:',
];

/**
 * Process blockquote blocks, converting callout-tagged blocks to styled divs.
 *
 * Callout syntax (first line of a blockquote block):
 *   > [!read-aloud]
 *   > [!dm-note]
 *   > [!planar-note]
 *   > [!faction-callout believers]
 *   > [!statblock]
 *
 * Untagged blockquotes are preserved as regular <blockquote> elements.
 *
 * For [!statblock] callouts, inner content is emitted raw so that
 * subsequent pipeline phases (headers, tables, lists, etc.) can process it.
 */
function processBlockquotes(text: string): string {
	const lines = text.split('\n');
	const result: string[] = [];
	let i = 0;

	while (i < lines.length) {
		if (/^>/.test(lines[i])) {
			// Collect consecutive blockquote lines
			const blockLines: string[] = [];
			while (i < lines.length && /^>/.test(lines[i])) {
				blockLines.push(lines[i].replace(/^>\s?/, ''));
				i++;
			}

			// Check first line for callout tag [!type] or [!type modifier]
			const calloutMatch = blockLines[0].match(/^\[!(\S+?)(?:\s+(\S+))?\]\s*$/);

			if (calloutMatch) {
				const type = calloutMatch[1];
				const modifier = calloutMatch[2] || '';
				const className = modifier ? `${type} ${modifier}` : type;
				const content = blockLines.slice(1).join('\n');

				if (type === 'statblock') {
					// Statblock: emit raw inner content so the rest of the
					// markdown pipeline (headers, tables, lists) processes it.
					// Modifier (if present) is an NPC id used to link the
					// classic block to its PF2e actor data for the toggle.
					result.push(`<div class="${className}">`);
					result.push(content);
					result.push('</div>');
				} else {
					result.push(`<div class="${className}">`);
					const innerParagraphs = content.split(/\n{2,}/).filter((p) => p.trim());
					for (const para of innerParagraphs) {
						result.push(`<p>${para.replace(/\n/g, ' ').trim()}</p>`);
					}
					result.push('</div>');
				}
			} else {
				// Regular blockquote — merge lines with <br>
				const content = blockLines.map((l) => l || '').join('<br>');
				const cleaned = content.replace(/(<br>){2,}/g, '<br>');
				result.push(`<blockquote>${cleaned}</blockquote>`);
			}
		} else {
			result.push(lines[i]);
			i++;
		}
	}

	return result.join('\n');
}

/**
 * Convert markdown tables to HTML <table> elements.
 *
 * Recognises the standard GFM table format:
 *   | Header | Header |
 *   |--------|--------|
 *   | Cell   | Cell   |
 *
 * Supports column alignment via the separator row (:--:, ---:, :---, ---).
 */
function convertTables(html: string): string {
	const lines = html.split('\n');
	const result: string[] = [];
	let i = 0;

	while (i < lines.length) {
		if (/^\|/.test(lines[i])) {
			// Collect consecutive table-like lines
			const tableLines: string[] = [];
			while (i < lines.length && /^\|/.test(lines[i])) {
				tableLines.push(lines[i]);
				i++;
			}

			// Valid table: at least header + separator, separator matches ---
			if (tableLines.length >= 2 && /^\|[\s\-:|]+\|$/.test(tableLines[1])) {
				const headers = splitTableRow(tableLines[0]);
				const alignments = parseAlignments(tableLines[1]);
				const rows = tableLines.slice(2).map(splitTableRow);

				let table = '<table><thead><tr>';
				headers.forEach((h, idx) => {
					const align = alignments[idx];
					const style = align ? ` style="text-align:${align}"` : '';
					table += `<th${style}>${h}</th>`;
				});
				table += '</tr></thead>';

				if (rows.length) {
					table += '<tbody>';
					for (const row of rows) {
						table += '<tr>';
						row.forEach((cell, idx) => {
							const align = alignments[idx];
							const style = align ? ` style="text-align:${align}"` : '';
							table += `<td${style}>${cell}</td>`;
						});
						table += '</tr>';
					}
					table += '</tbody>';
				}

				table += '</table>';
				result.push(table);
			} else {
				// Not a valid table — output lines as-is
				result.push(...tableLines);
			}
		} else {
			result.push(lines[i]);
			i++;
		}
	}

	return result.join('\n');
}

function splitTableRow(line: string): string[] {
	return line
		.replace(/^\|/, '')
		.replace(/\|$/, '')
		.split('|')
		.map((s) => s.trim());
}

function parseAlignments(separator: string): string[] {
	return separator
		.replace(/^\|/, '')
		.replace(/\|$/, '')
		.split('|')
		.map((cell) => {
			cell = cell.trim();
			if (/^:-+:$/.test(cell)) return 'center';
			if (/-+:$/.test(cell)) return 'right';
			return '';
		});
}

/**
 * Convert markdown to HTML for FoundryVTT display
 */
function markdownToHTML(markdown: string): string {
	let html = markdown;

	// Phase 1: Process blockquote blocks (callouts + regular)
	html = processBlockquotes(html);

	// Phase 2: Convert headers
	// Location headers: ### N. Room Name or ### NA. Room Name (numbered areas)
	html = html.replace(/^### (\d+[A-Za-z]?\.\s+.*)$/gm, (_, title) => {
		return `<div class="location-header">${title.trim()}</div>`;
	});
	// Regular headers (non-location)
	html = html.replace(/^### (.*?)$/gm, '<h2>$1</h2>');
	html = html.replace(/^#### (.*?)$/gm, '<h3>$1</h3>');
	html = html.replace(/^##### (.*?)$/gm, '<h4>$1</h4>');

	// Phase 3: Section dividers
	html = html.replace(/^---$/gm, '<hr class="section-divider">');

	// Phase 4: Inline formatting
	html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
	html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

	// Phase 5: Tables (markdown → HTML)
	html = convertTables(html);

	// Phase 6: Lists
	html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
	html = html.replace(/(<li>.*?<\/li>\n)+/g, (match) => `<ul>${match}</ul>`);
	html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');

	// Phase 7: Paragraphs (with DM note auto-detection)
	const lines = html.split('\n');
	const paragraphs: string[] = [];
	let currentParagraph: string[] = [];

	const flushParagraph = () => {
		if (currentParagraph.length > 0) {
			const text = currentParagraph.join(' ');
			// Auto-detect DM-facing note paragraphs by bold prefix
			const isDmNote = DM_NOTE_PREFIXES.some((prefix) =>
				text.startsWith(`<strong>${prefix}</strong>`),
			);
			if (isDmNote) {
				paragraphs.push(`<div class="dm-note"><p>${text}</p></div>`);
			} else {
				paragraphs.push(`<p>${text}</p>`);
			}
			currentParagraph = [];
		}
	};

	for (const line of lines) {
		if (line.trim() === '') {
			flushParagraph();
		} else if (/^<\/?(div|h[1-6]|hr|blockquote|ul|ol|li|p|table)\b/.test(line)) {
			// Block-level HTML element — flush paragraph buffer, then emit as-is
			flushParagraph();
			paragraphs.push(line);
		} else {
			currentParagraph.push(line);
		}
	}
	flushParagraph();

	html = paragraphs.join('\n');

	// Clean up extra whitespace
	html = html.replace(/\n\n+/g, '\n');

	return html;
}

// Export the journal data from the markdown file
// The markdown content is injected at build time by the rollup-plugin-markdown
import MARKDOWN_CONTENT from 'virtual:harbinger-markdown';

// Parse the markdown content into journal entries
// This happens once when the module loads
const JOURNAL_DATA: HarbingerJournal[] = MARKDOWN_CONTENT ? parseMarkdownToJournals(MARKDOWN_CONTENT) : [];

/**
 * Handouts Journal with Image Assets
 * Contains all handout images and artwork for the adventure
 */
const HANDOUTS_JOURNAL: HarbingerJournal = {
	id: 'journal-handouts',
	name: 'Handouts & Artwork',
	folder: 'Reference',
	sort: 9000,
	pages: [
		{
			name: 'Harbinger House Exterior',
			type: 'image',
			src: 'modules/harbinger-house-pf2e/dist/assets/art/Harbinger_House_Exterior.jpg',
			title: {
				show: true,
				level: 1,
			},
		},
		{
			name: 'Lady of Pain with Worshipers',
			type: 'image',
			src: 'modules/harbinger-house-pf2e/dist/assets/art/Lady_of_Pain_with_worshipers.jpg',
			title: {
				show: true,
				level: 1,
			},
		},
		{
			name: 'Lawkiller Strikes Again',
			type: 'image',
			src: 'modules/harbinger-house-pf2e/dist/assets/handouts/Lawkiller_Strikes_Again.webp',
			title: {
				show: true,
				level: 1,
			},
		},
		{
			name: 'Artwork 1',
			type: 'image',
			src: 'modules/harbinger-house-pf2e/dist/assets/art/art_01.jpg',
			title: {
				show: true,
				level: 1,
			},
		},
		{
			name: 'Artwork 2',
			type: 'image',
			src: 'modules/harbinger-house-pf2e/dist/assets/art/art_02.jpg',
			title: {
				show: true,
				level: 1,
			},
		},
		{
			name: 'Artwork 3',
			type: 'image',
			src: 'modules/harbinger-house-pf2e/dist/assets/art/art_03.jpg',
			title: {
				show: true,
				level: 1,
			},
		},
	],
};

// Combine parsed journals with handouts journal
export const ALL_JOURNALS = [...JOURNAL_DATA, HANDOUTS_JOURNAL];

export const JOURNALS_BY_FOLDER = JOURNAL_DATA.reduce(
	(acc, journal) => {
		const folder = journal.folder || 'Reference';
		if (!acc[folder]) {
			acc[folder] = [];
		}
		acc[folder].push(journal);
		return acc;
	},
	{} as Record<string, HarbingerJournal[]>,
);

export type JournalFolder = keyof typeof JOURNALS_BY_FOLDER;

export function getFolderLabel(folder: JournalFolder): string {
	return folder;
}
