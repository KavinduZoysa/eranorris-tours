// Front matter for the Markdown content files (src/content/…): "key: value" lines, lists as
// "- item" lines under an empty "key:", inline lists as [a, b], and # comments. Shared by the
// build and scripts/owner-checklist.mjs.
export function parseFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src };
  const data = {};
  let listKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const li = line.match(/^\s+-\s+(.*)$/);
    if (li && listKey) {
      data[listKey].push(unquote(li[1]));
      continue;
    }
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) throw new Error(`Cannot parse front matter line: ${line}`);
    const v = kv[2].replace(/\s+#.*$/, '').trim();
    if (v === '') {
      data[kv[1]] = [];
      listKey = kv[1];
    } else {
      data[kv[1]] = /^\[.*\]$/.test(v) ? v.slice(1, -1).split(',').map((s) => unquote(s.trim())).filter(Boolean) : unquote(v);
      listKey = null;
    }
  }
  return { data, body: m[2] };
}
export const unquote = (s) => s.replace(/^(['"])(.*)\1$/, '$2');
