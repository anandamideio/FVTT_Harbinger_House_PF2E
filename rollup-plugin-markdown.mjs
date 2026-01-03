/**
 * Rollup plugin to inject markdown content at build time
 *
 * This plugin reads harbinger_house_complete.md and makes it available
 * as a virtual module that can be imported by the journal data file.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

export default function markdownPlugin() {
  const virtualModuleId = 'virtual:harbinger-markdown';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'markdown-injector',

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    load(id) {
      if (id === resolvedVirtualModuleId) {
        try {
          // Read the markdown file from project root
          const markdownPath = join(process.cwd(), 'harbinger_house_complete.md');
          const markdown = readFileSync(markdownPath, 'utf-8');

          // Escape the content for safe JavaScript string injection
          const escaped = JSON.stringify(markdown);

          // Export as ES module
          return `export default ${escaped};`;
        } catch (error) {
          console.error('Failed to load harbinger_house_complete.md:', error);
          // Return empty string if file not found
          return 'export default "";';
        }
      }
    }
  };
}
