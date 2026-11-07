// @legalgen-ignore-scan
interface PillPlacement {
  active: string;
  transform: string;
  width: string;
  height: string;
}

const lastPlace = new Map<string, PillPlacement>();

const keyOf = (seg: Element): string =>
  Array.from(seg.querySelectorAll(':scope > button'))
    .map(button => (button.textContent || '').trim())
    .join('|');

const place = (seg: Element) => {
  let pill = seg.querySelector(':scope > .app-seg-pill') as HTMLElement | null;
  if (!pill) {
    pill = document.createElement('span');
    pill.className = 'app-seg-pill';
    pill.setAttribute('aria-hidden', 'true');
    seg.prepend(pill);
  }
  const active = seg.querySelector(':scope > button.bg-white') as HTMLElement | null;
  if (!active) {
    pill.style.opacity = '0';
    return;
  }
  const first = !pill.dataset.ready;
  const key = keyOf(seg);
  const before = lastPlace.get(key);
  const activeText = (active.textContent || '').trim();
  if (first) {
    pill.style.transition = 'none';
    if (before && before.active !== activeText) {
      pill.style.opacity = '1';
      pill.style.transform = before.transform;
      pill.style.width = before.width;
      pill.style.height = before.height;
      void pill.offsetWidth;
      pill.style.transition = '';
      pill.dataset.ready = '1';
    }
  }
  pill.style.opacity = '1';
  pill.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
  pill.style.width = `${active.offsetWidth}px`;
  pill.style.height = `${active.offsetHeight}px`;
  pill.style.borderRadius = getComputedStyle(active).borderRadius;
  if (!pill.dataset.ready) {
    void pill.offsetWidth;
    pill.style.transition = '';
    pill.dataset.ready = '1';
  }
  lastPlace.set(key, {
    active: activeText,
    transform: pill.style.transform,
    width: pill.style.width,
    height: pill.style.height
  });
};

const cleanup = () => {
  document.querySelectorAll('.app-seg-pill').forEach(pill => {
    if (!pill.parentElement || !pill.parentElement.classList.contains('app-seg')) {
      pill.remove();
    }
  });
};

let initialized = false;

export const startSegmented = () => {
  if (initialized || typeof document === 'undefined') return;
  initialized = true;
  let frame = 0;
  const ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => runUpdate())
    : null;
  const observeAll = () => {
    document.querySelectorAll('.app-seg').forEach(seg => {
      place(seg);
      if (ro) ro.observe(seg);
    });
    cleanup();
  };
  const runUpdate = () => {
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        observeAll();
      });
    }
  };
  new MutationObserver(runUpdate).observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class']
  });
  window.addEventListener('resize', runUpdate);
  runUpdate();
};

