import GithubSlugger from "github-slugger";

export type TocItem = { id: string; text: string; level: 2 | 3 };

/**
 * Extracts h2/h3 headings with the same ids rehype-slug generates,
 * so the table of contents always links to the rendered headings.
 */
export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*_`~]|\[([^\]]*)\]\([^)]*\)/g, "$1").trim();
    const id = slugger.slug(text);
    const depth = match[1].length;
    if (depth === 2 || depth === 3) items.push({ id, text, level: depth });
  }
  return items;
}
