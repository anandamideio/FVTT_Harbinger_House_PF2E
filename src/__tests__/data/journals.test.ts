import { describe, expect, it } from 'vitest';
import { parseMarkdownToJournals } from '../../data/content/journals';

describe('parseMarkdownToJournals', () => {
	it('returns empty array for empty input', () => {
		expect(parseMarkdownToJournals('')).toEqual([]);
	});

	it('skips the main "Harbinger House" title', () => {
		const md = '# Harbinger House\n\nSome intro text';
		const result = parseMarkdownToJournals(md);
		expect(result).toEqual([]);
	});

	it('creates a journal from a level-1 header with a level-2 page', () => {
		const md = `# Chapter 1: The Beginning
## Opening Scene
The adventure begins here.`;

		const result = parseMarkdownToJournals(md);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe('Chapter 1: The Beginning');
		expect(result[0].pages).toHaveLength(1);
		expect(result[0].pages[0].name).toBe('Opening Scene');
		expect(result[0].pages[0].type).toBe('text');
		expect(result[0].pages[0].text?.content).toContain('The adventure begins here.');
		expect(result[0].pages[0].text?.format).toBe(1); // HTML
		expect(result[0].pages[0].text?.markdown).toContain('The adventure begins here.');
	});

	it('creates multiple pages under one journal', () => {
		const md = `# Chapter 1
## Scene A
Content A
## Scene B
Content B`;

		const result = parseMarkdownToJournals(md);
		expect(result).toHaveLength(1);
		expect(result[0].pages).toHaveLength(2);
		expect(result[0].pages[0].name).toBe('Scene A');
		expect(result[0].pages[1].name).toBe('Scene B');
	});

	it('creates multiple journals from multiple level-1 headers', () => {
		const md = `# Chapter 1
## Scene 1
Text
# Chapter 2
## Scene 2
Text`;

		const result = parseMarkdownToJournals(md);
		expect(result).toHaveLength(2);
		expect(result[0].name).toBe('Chapter 1');
		expect(result[1].name).toBe('Chapter 2');
	});

	it('assigns sort order by journal counter', () => {
		const md = `# First
## Page
Text
# Second
## Page
Text`;

		const result = parseMarkdownToJournals(md);
		expect(result[0].sort).toBe(100);
		expect(result[1].sort).toBe(200);
	});

	it('assigns "Chapters" folder to chapter journals', () => {
		const md = `# Chapter 3: Descent
## Scene
Text`;
		const result = parseMarkdownToJournals(md);
		expect(result[0].folder).toBe('Chapters');
	});

	it('assigns "Introduction" folder and renames "intro" to "Introduction"', () => {
		const md = `# intro
## Overview
Text`;
		const result = parseMarkdownToJournals(md);
		expect(result[0].folder).toBe('Introduction');
		expect(result[0].name).toBe('Introduction');
	});

	it('assigns "Introduction" folder for "Introduction" title', () => {
		const md = `# Introduction
## Overview
Text`;
		const result = parseMarkdownToJournals(md);
		expect(result[0].folder).toBe('Introduction');
	});

	it('assigns "Reference" folder to non-chapter, non-intro journals', () => {
		const md = `# Appendix A
## NPCs
Text`;
		const result = parseMarkdownToJournals(md);
		expect(result[0].folder).toBe('Reference');
	});

	it('creates a default journal when ## appears without a preceding #', () => {
		const md = `## Orphan Page
Some content here.`;

		const result = parseMarkdownToJournals(md);
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe('Harbinger House');
		expect(result[0].pages).toHaveLength(1);
		expect(result[0].pages[0].name).toBe('Orphan Page');
	});

	it('converts markdown formatting to HTML in page content', () => {
		const md = `# Test
## Page
**Bold text** and *italic text*`;

		const result = parseMarkdownToJournals(md);
		const content = result[0].pages[0].text?.content || '';
		expect(content).toContain('<strong>Bold text</strong>');
		expect(content).toContain('<em>italic text</em>');
	});

	it('converts blockquotes to HTML', () => {
		const md = `# Test
## Page
> This is a quote`;

		const result = parseMarkdownToJournals(md);
		const content = result[0].pages[0].text?.content || '';
		expect(content).toContain('<blockquote>');
		expect(content).toContain('This is a quote');
	});

	it('converts sub-headers (### and ####) within page content', () => {
		const md = `# Test
## Page
### Sub Section
#### Sub Sub Section`;

		const result = parseMarkdownToJournals(md);
		const content = result[0].pages[0].text?.content || '';
		expect(content).toContain('<h2>Sub Section</h2>');
		expect(content).toContain('<h3>Sub Sub Section</h3>');
	});

	it('sets page title show and level', () => {
		const md = `# Test
## My Page
Content`;

		const result = parseMarkdownToJournals(md);
		expect(result[0].pages[0].title).toEqual({ show: true, level: 1 });
	});

	it('ignores journals with no pages', () => {
		const md = `# Empty Journal
# Journal With Page
## Page
Content`;

		const result = parseMarkdownToJournals(md);
		// The empty journal has no ## pages so it gets no pages and is skipped
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe('Journal With Page');
	});

	it('skips the Table of Contents section', () => {
		const md = `# Harbinger House

## Table of Contents

1. [Intro](#intro)
   - [Background](#background)
2. [Chapter 1](#chapter-1)

---

# intro
## Introduction
The adventure begins.`;

		const result = parseMarkdownToJournals(md);
		// TOC should be skipped; only the Introduction journal should exist
		expect(result).toHaveLength(1);
		expect(result[0].name).toBe('Introduction');
		expect(result[0].pages[0].name).toBe('Introduction');
		// No page should be named "Table of Contents"
		const allPages = result.flatMap((j) => j.pages);
		expect(allPages.every((p) => p.name !== 'Table of Contents')).toBe(true);
	});

	it('converts markdown tables to HTML tables', () => {
		const md = `# Test
## Page
| Stat | Value |
|---|---|
| hp | 42 |
| AC | 5 |`;

		const result = parseMarkdownToJournals(md);
		const content = result[0].pages[0].text?.content || '';
		expect(content).toContain('<table>');
		expect(content).toContain('<th>Stat</th>');
		expect(content).toContain('<th>Value</th>');
		expect(content).toContain('<td>hp</td>');
		expect(content).toContain('<td>42</td>');
		expect(content).toContain('<td>AC</td>');
		expect(content).toContain('</table>');
	});

	it('handles table column alignment', () => {
		const md = `# Test
## Page
| Left | Right | Center |
|---|---:|:---:|
| a | b | c |`;

		const result = parseMarkdownToJournals(md);
		const content = result[0].pages[0].text?.content || '';
		expect(content).toContain('<th>Left</th>');
		expect(content).toContain('<th style="text-align:right">Right</th>');
		expect(content).toContain('<th style="text-align:center">Center</th>');
		expect(content).toContain('<td style="text-align:right">b</td>');
		expect(content).toContain('<td style="text-align:center">c</td>');
	});

	it('converts [!statblock] callouts with inner markdown processing', () => {
		const md = `# Test
## Page
> [!statblock]
> **Trolan the Mad**
>
> ### Combat
> | Stat | Value |
> |---|---|
> | hp | 41 |
>
> - SA: wizard spells`;

		const result = parseMarkdownToJournals(md);
		const content = result[0].pages[0].text?.content || '';
		expect(content).toContain('<div class="statblock">');
		expect(content).toContain('<strong>Trolan the Mad</strong>');
		expect(content).toContain('<h2>Combat</h2>');
		expect(content).toContain('<table>');
		expect(content).toContain('<td>hp</td>');
		expect(content).toContain('<li>SA: wizard spells</li>');
		expect(content).toContain('</div>');
	});

	it('converts markdown links to HTML anchors', () => {
		const md = `# Test
## Page
See [the guide](#guide) for details.`;

		const result = parseMarkdownToJournals(md);
		const content = result[0].pages[0].text?.content || '';
		expect(content).toContain('<a href="#guide">the guide</a>');
	});
});
