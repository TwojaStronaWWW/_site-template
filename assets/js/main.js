/**
 * Główny moduł skryptów witryny (Vanilla JS)
 */

export function initNavigation(doc = document) {
  const menuBtn = doc.getElementById('menu-toggle');
  const navLinks = doc.getElementById('primary-nav');

  if (!menuBtn || !navLinks) return null;

  const toggleHandler = () => {
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    const nextState = !isExpanded;
    menuBtn.setAttribute('aria-expanded', String(nextState));
    navLinks.classList.toggle('is-open', nextState);
  };

  const keyHandler = (e) => {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      menuBtn.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
      menuBtn.focus?.();
    }
  };

  menuBtn.addEventListener('click', toggleHandler);
  doc.addEventListener('keydown', keyHandler);

  return { menuBtn, navLinks, toggleHandler, keyHandler };
}

/**
 * Komponent zakładek (WAI-ARIA Tabs Pattern)
 * Obsługuje klawiaturę (ArrowRight/Left/Up/Down, Home, End), stany aria-selected i tabindex.
 */
export function initTabs(doc = document) {
  const tabs = Array.from(doc.querySelectorAll('[role="tab"], .tab-btn'));
  const contents = Array.from(doc.querySelectorAll('[role="tabpanel"], .tab-panel'));

  if (!tabs.length || !contents.length) return null;

  const activateTab = (activeTab, setFocus = false) => {
    const targetId = activeTab.getAttribute('data-target') || activeTab.getAttribute('aria-controls');

    tabs.forEach(tab => {
      const isCurrent = (tab === activeTab);
      tab.classList.toggle('active', isCurrent);
      tab.setAttribute('aria-selected', String(isCurrent));
      tab.setAttribute('tabindex', isCurrent ? '0' : '-1');
    });

    contents.forEach(content => {
      const isTarget = content.id === targetId;
      content.classList.toggle('active', isTarget);
      if (isTarget) {
        content.removeAttribute('hidden');
      } else {
        content.setAttribute('hidden', '');
      }
    });

    if (setFocus && typeof activeTab.focus === 'function') {
      activeTab.focus();
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activateTab(tab, false);
    });

    tab.addEventListener('keydown', (e) => {
      let targetIndex = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetIndex = (index + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        targetIndex = 0;
      } else if (e.key === 'End') {
        targetIndex = tabs.length - 1;
      }

      if (targetIndex !== -1) {
        if (typeof e.preventDefault === 'function') e.preventDefault();
        activateTab(tabs[targetIndex], true);
      }
    });
  });

  return { tabs, contents, activateTab };
}

// Inicjalizacja automatyczna w przeglądarce
if (typeof document !== 'undefined') {
  const runInit = () => {
    initNavigation(document);
    initTabs(document);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInit);
  } else {
    runInit();
  }
}