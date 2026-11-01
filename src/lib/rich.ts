import type { Block, Run } from './types';

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Only web, mail and phone links are kept; anything else (javascript:, data:) is dropped. */
function safeHref(url: string | undefined): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(u.protocol) ? u.href : '';
  } catch {
    return '';
  }
}

function runsToHtml(runs: Run[]): string {
  return runs
    .map((run) => {
      let html = escapeHtml(run.t).replace(/(\r\n|\r|\n|\u000b)/g, '<br>');
      if (run.i) html = `<em>${html}</em>`;
      if (run.b) html = `<strong>${html}</strong>`;
      const href = safeHref(run.u);
      if (href) html = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
      return html;
    })
    .join('');
}

/** Turns the blocks of a Google Doc into safe HTML (all text is escaped; no raw HTML ever passes through). */
export function blocksToHtml(blocks: Block[]): string {
  const out: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const closeList = () => {
    if (!list) return;
    const tag = list.ordered ? 'ol' : 'ul';
    out.push(`<${tag}>${list.items.map((i) => `<li>${i}</li>`).join('')}</${tag}>`);
    list = null;
  };
  for (const block of blocks) {
    if (block.type === 'li') {
      if (list && list.ordered !== block.ordered) closeList();
      if (!list) list = { ordered: block.ordered, items: [] };
      list.items.push(runsToHtml(block.runs));
      continue;
    }
    closeList();
    out.push(block.type === 'h' ? `<h${block.level}>${runsToHtml(block.runs)}</h${block.level}>` : `<p>${runsToHtml(block.runs)}</p>`);
  }
  closeList();
  return out.join('');
}
