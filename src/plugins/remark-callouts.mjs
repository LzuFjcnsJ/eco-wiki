function walk(node, fn, parent = null) {
  fn(node, parent);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, fn, node);
  }
}

function textOf(node) {
  if (!node) return '';
  if (typeof node.value === 'string') return node.value;
  if (Array.isArray(node.children)) return node.children.map(textOf).join('');
  return '';
}

const CALLOUTS = {
  danger: { cls: 'callout callout--danger', icon: '!' , label: '红线规则' },
  warn: { cls: 'callout callout--warn', icon: '!', label: '注意' },
  tip: { cls: 'callout callout--tip', icon: '*', label: '提示' },
  info: { cls: 'callout callout--info', icon: 'i', label: '说明' },
  good: { cls: 'callout callout--good', icon: '+', label: '正确做法' },
  bad: { cls: 'callout callout--bad', icon: '-', label: '错误做法' },
};

/**
 * Turns :::danger[标题] ... ::: containers into themed <aside> blocks.
 * Keeps wiki source files plain Markdown while giving the renderer
 * semantically coloured callouts (red-line rules, tips, do/don't pairs).
 */
export default function remarkCallouts() {
  return (tree) => {
    const found = [];

    walk(tree, (node, parent) => {
      if (node.type === 'containerDirective' && CALLOUTS[node.name]) {
        found.push({ node, parent });
      }
    });

    for (const { node, parent } of found) {
      if (!parent || !Array.isArray(parent.children)) continue;

      const conf = CALLOUTS[node.name];
      const children = [...node.children];
      let title = conf.label;

      const first = children[0];
      const isLabel =
        first &&
        first.type === 'paragraph' &&
        first.data &&
        first.data.directiveLabel === true;

      if (isLabel) {
        const custom = textOf(first).trim();
        if (custom) title = custom;
        children.shift();
      }

      const open = {
        type: 'html',
        value:
          `<aside class="${conf.cls}">` +
          `<p class="callout__label">` +
          `<span class="callout__mark" aria-hidden="true">${conf.icon}</span>` +
          `<span class="callout__title">${escapeHtml(title)}</span>` +
          `</p>`,
      };
      const close = { type: 'html', value: '</aside>' };

      const index = parent.children.indexOf(node);
      parent.children.splice(index, 1, open, ...children, close);
    }
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
