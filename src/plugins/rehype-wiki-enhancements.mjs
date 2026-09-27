/**
 * Wiki rendering enhancements:
 *  1. Wrap wide tables in a scroll container so they never break the layout.
 *  2. Re-enable task-list checkboxes (remark-gfm emits them `disabled`) so the
 *     iterative checklists can actually be ticked — see ui.js checklist memory.
 *  3. Tag external links so they open safely in a new tab.
 *  4. Prefix internal absolute links with the deployment base path.
 *
 * (4) matters because the site may be deployed under a sub-path, e.g.
 * https://<org>.github.io/eco-wiki/. A chapter that writes
 * `[相机参数](/wiki/photography/#参数速查表)` would otherwise 404, and forcing
 * every Markdown author to remember a prefix defeats the point of the wiki.
 * The base is injected from astro.config.mjs, which reads BASE_PATH.
 */

const EXTERNAL = /^https?:\/\//i;

function visit(node, fn) {
  if (!node || typeof node !== 'object') return;
  fn(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) visit(child, fn);
  }
}

export default function rehypeWikiEnhancements(options = {}) {
  /** Tracks tables already wrapped, so the recursive pass never nests them. */
  const wrapped = new WeakSet();

  // '' when deployed at the site root, '/eco-wiki' when deployed under a sub-path.
  const base =
    typeof options.base === 'string' && options.base !== '/' ? options.base.replace(/\/+$/, '') : '';

  return (tree) => {
    visit(tree, (node) => {
      if (!Array.isArray(node.children)) return;

      node.children = node.children.map((child) => {
        if (!child || child.type !== 'element') return child;

        if (child.tagName === 'table') {
          if (wrapped.has(child)) return child;
          wrapped.add(child);
          return {
            type: 'element',
            tagName: 'div',
            properties: { className: ['table-wrap'] },
            children: [child],
          };
        }

        if (child.tagName === 'input') {
          const props = child.properties || (child.properties = {});
          if (props.type === 'checkbox') {
            delete props.disabled;
            props.className = ['wiki-check'];
          }
        }

        if (child.tagName === 'a') {
          const props = child.properties || (child.properties = {});

          if (typeof props.href === 'string' && base && props.href.startsWith('/') && !props.href.startsWith('//')) {
            props.href = `${base}${props.href}`;
          }

          if (typeof props.href === 'string' && EXTERNAL.test(props.href)) {
            props.target = '_blank';
            props.rel = ['noopener', 'noreferrer'];
          }
        }

        return child;
      });
    });
  };
}
