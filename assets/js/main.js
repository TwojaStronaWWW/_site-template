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


/**
 * Komponent Lightbox do powiększania zdjęć i galerii (WAI-ARIA Dialog)
 */
export function initLightbox(doc = document) {
  const modal = doc.getElementById('image-lightbox');
  const items = Array.from(doc.querySelectorAll('[data-lightbox], .gallery-item'));

  if (!modal || !items.length) return null;

  const imgEl = modal.querySelector('#lightbox-image');
  const captionEl = modal.querySelector('#lightbox-caption');
  const closeBtn = modal.querySelector('#lightbox-close');
  const prevBtn = modal.querySelector('#lightbox-prev');
  const nextBtn = modal.querySelector('#lightbox-next');
  const backdrop = modal.querySelector('#lightbox-backdrop');

  let currentIndex = 0;
  let lastFocusedElement = null;

  const images = items.map(item => {
    const img = item.tagName === 'IMG' ? item : (item.querySelector?.('img') || item);
    return {
      src: img?.getAttribute?.('src') || item.getAttribute?.('data-lightbox-src') || '',
      alt: img?.getAttribute?.('alt') || item.getAttribute?.('data-lightbox-alt') || ''
    };
  });

  const updateLightbox = (index) => {
    currentIndex = (index + images.length) % images.length;
    const current = images[currentIndex];
    if (imgEl && current) {
      imgEl.setAttribute('src', current.src);
      imgEl.setAttribute('alt', current.alt);
    }
    if (captionEl && current) {
      captionEl.textContent = current.alt;
    }
  };

  const openLightbox = (index, triggerEl = null) => {
    lastFocusedElement = triggerEl;
    updateLightbox(index);
    modal.removeAttribute('hidden');
    modal.classList.add('is-open');
    if (doc.body) doc.body.classList.add('lightbox-open');
    if (closeBtn && typeof closeBtn.focus === 'function') {
      closeBtn.focus();
    }
  };

  const closeLightbox = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('hidden', '');
    if (doc.body) doc.body.classList.remove('lightbox-open');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  };

  const showNext = () => updateLightbox(currentIndex + 1);
  const showPrev = () => updateLightbox(currentIndex - 1);

  items.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      openLightbox(index, item);
    });
  });

  closeBtn?.addEventListener('click', closeLightbox);
  backdrop?.addEventListener('click', closeLightbox);
  nextBtn?.addEventListener('click', showNext);
  prevBtn?.addEventListener('click', showPrev);

  const keyHandler = (e) => {
    if (modal.hasAttribute('hidden') || !modal.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      showNext();
    } else if (e.key === 'ArrowLeft') {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      showPrev();
    }
  };

  doc.addEventListener('keydown', keyHandler);

  return { modal, items, openLightbox, closeLightbox, showNext, showPrev, keyHandler, getCurrentIndex: () => currentIndex };
}

/**
 * Obsługa formularza kontaktowego z zapisem szkicu w localStorage (100% zgodność z RODO)
 * oraz pomiarem czasu interakcji Anty-Bot.
 */
export function initContactForm(doc = document, storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  const form = doc.getElementById('contactForm');
  if (!form) return null;

  const DRAFT_KEY = 'tsw_contact_draft_v1';
  const formInitTime = Date.now();
  const inputs = Array.from(form.querySelectorAll?.('input, textarea') || []);
  const errorDiv = doc.getElementById('formErrors');
  const successMsg = doc.getElementById('formSuccess');

  const saveDraft = () => {
    if (!storage) return;
    try {
      const draft = {};
      inputs.forEach(el => {
        if (!el.name || el.name === 'website_url') return;
        draft[el.name] = el.type === 'checkbox' ? Boolean(el.checked) : (el.value || '');
      });
      draft.updatedAt = Date.now();
      storage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (_) {}
  };

  const restoreDraft = () => {
    if (!storage) return;
    try {
      const raw = storage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== 'object') return;
      inputs.forEach(el => {
        if (!el.name || el.name === 'website_url' || !(el.name in draft)) return;
        if (el.type === 'checkbox') {
          el.checked = Boolean(draft[el.name]);
        } else if (!el.value) {
          el.value = String(draft[el.name] || '');
        }
      });
    } catch (_) {}
  };

  restoreDraft();

  inputs.forEach(el => {
    if (el.name === 'website_url') return;
    el.addEventListener?.('input', saveDraft);
    el.addEventListener?.('change', saveDraft);
  });

  form.addEventListener?.('submit', async (e) => {
    if (typeof e?.preventDefault === 'function') e.preventDefault();
    if (errorDiv && errorDiv.style) errorDiv.style.display = 'none';
    if (successMsg && successMsg.style) successMsg.style.display = 'none';

    const payload = {
      js_check: '1',
      submission_seconds: ((Date.now() - formInitTime) / 1000).toFixed(2)
    };

    inputs.forEach(el => {
      if (!el.name) return;
      payload[el.name] = el.type === 'checkbox' ? (el.checked ? '1' : '0') : (el.value || '');
    });

    try {
      const res = await fetch('/api/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && (data.success || data.status === 'success')) {
        if (successMsg) {
          if (successMsg.style) successMsg.style.display = 'block';
          successMsg.textContent = data.message || 'Wiadomość wysłana pomyślnie!';
        }
        form.reset?.();
        try { storage?.removeItem(DRAFT_KEY); } catch (_) {}
      } else if (errorDiv) {
        if (errorDiv.style) errorDiv.style.display = 'block';
        errorDiv.textContent = data.message || 'Wystąpił błąd podczas wysyłki.';
      }
    } catch (_) {
      if (errorDiv) {
        if (errorDiv.style) errorDiv.style.display = 'block';
        errorDiv.textContent = 'Błąd połączenia. Spróbuj ponownie.';
      }
    }
  });

  return { form, saveDraft, restoreDraft };
}

// Inicjalizacja automatyczna w przeglądarce
if (typeof document !== 'undefined') {
  const runInit = () => {
    initNavigation(document);
    initTabs(document);
    initLightbox(document);
    initContactForm(document);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInit);
  } else {
    runInit();
  }
}