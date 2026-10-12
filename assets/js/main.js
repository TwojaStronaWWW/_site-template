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

// Inicjalizacja automatyczna w przeglądarce
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initNavigation(document));
  } else {
    initNavigation(document);
  }
}
