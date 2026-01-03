/**
 * Journal Data Structure
 * Parses the Harbinger House markdown into structured journal entries
 * 
 * Why this structure?
 * - FoundryVTT V13 uses "Journal Entries" as containers with multiple "Pages"
 * - Each page can have different content types (text, image, PDF, video)
 * - We organize by chapter, with each major section as a separate page
 * - This mirrors how published adventures organize content in FoundryVTT
 */

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
        markdown: currentContent.join('\n')
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
        sort: journalCounter * 100
      };
      continue;
    }
    
    // Level 2 header - new page in current journal
    if (line.match(/^## /)) {
      if (!currentJournal) {
        // Create a default journal if we don't have one
        journalCounter++;
        currentJournal = {
          id: `journal-${journalCounter}`,
          name: 'Harbinger House',
          pages: [],
          sort: journalCounter * 100
        };
      }
      
      flushPage();
      if (currentPage) {
        currentJournal.pages.push(currentPage);
      }
      
      const title = line.replace(/^## /, '').trim();
      currentPage = {
        name: title,
        type: 'text',
        title: {
          show: true,
          level: 1
        }
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
  return journals.map(j => {
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

/**
 * Convert markdown to HTML for FoundryVTT display
 * 
 * Why not use a library?
 * - We want lightweight, specific conversion for our content
 * - FoundryVTT has its own markdown renderer, but HTML gives us more control
 * - We handle the most common markdown patterns used in the adventure
 */
function markdownToHTML(markdown: string): string {
  let html = markdown;
  
  // Convert headers (we start at h2 since pages already have titles)
  html = html.replace(/^### (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##### (.*?)$/gm, '<h4>$1</h4>');
  
  // Convert blockquotes (very important for Planescape flavor text!)
  html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');
  // Merge consecutive blockquotes
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br>');
  
  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert unordered lists
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>\n)+/g, match => `<ul>${match}</ul>`);
  
  // Convert numbered lists
  html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
  
  // Convert paragraphs
  const lines = html.split('\n');
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];
  
  for (const line of lines) {
    if (line.trim() === '' || line.match(/^<[hbu]/)) {
      if (currentParagraph.length > 0) {
        paragraphs.push(`<p>${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
      }
      if (line.match(/^<[hbu]/)) {
        paragraphs.push(line);
      }
    } else if (!line.match(/^<\/?(li|ul|blockquote)>/)) {
      currentParagraph.push(line);
    } else {
      paragraphs.push(line);
    }
  }
  
  if (currentParagraph.length > 0) {
    paragraphs.push(`<p>${currentParagraph.join(' ')}</p>`);
  }
  
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
const JOURNAL_DATA: HarbingerJournal[] = MARKDOWN_CONTENT
  ? parseMarkdownToJournals(MARKDOWN_CONTENT)
  : [];

export const ALL_JOURNALS = JOURNAL_DATA;

export const JOURNALS_BY_FOLDER = JOURNAL_DATA.reduce((acc, journal) => {
  const folder = journal.folder || 'Reference';
  if (!acc[folder]) {
    acc[folder] = [];
  }
  acc[folder].push(journal);
  return acc;
}, {} as Record<string, HarbingerJournal[]>);

export type JournalFolder = keyof typeof JOURNALS_BY_FOLDER;

export function getFolderLabel(folder: JournalFolder): string {
  return folder;
}
