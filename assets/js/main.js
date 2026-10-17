/**
 * Główny moduł skryptów witryny (Vanilla JS ES6+) — TwojaStronaWWW Enterprise Site Template
 */

export function initNavigation(doc = document) {
  const menuBtn = doc.getElementById('menu-toggle') || doc.querySelector('.hamburger');
  const navLinks = doc.getElementById('primary-nav') || doc.querySelector('.nav-links');

  if (!menuBtn || !navLinks) return null;

  if (!menuBtn.hasAttribute('aria-expanded')) {
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  const toggleHandler = () => {
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    const nextState = !isExpanded;
    menuBtn.setAttribute('aria-expanded', String(nextState));
    navLinks.classList.toggle('is-open', nextState);
    navLinks.classList.toggle('active', nextState);
  };

  const closeMenu = () => {
    menuBtn.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
    navLinks.classList.remove('active');
    menuBtn.focus?.();
  };

  const keyHandler = (e) => {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  };

  menuBtn.addEventListener('click', toggleHandler);
  doc.addEventListener('keydown', keyHandler);

  return { menuBtn, navLinks, toggleHandler, keyHandler, closeMenu };
}

/**
 * Płynne przewijanie do sekcji kotwicowych (#id) z automatycznym zamykaniem menu mobilnego
 */
export function initSmoothScroll(doc = document) {
  const anchors = doc.querySelectorAll('a[href^="#"]');
  if (!anchors || !anchors.length) return null;

  const navLinks = doc.getElementById('primary-nav') || doc.querySelector('.nav-links');
  const menuBtn = doc.getElementById('menu-toggle') || doc.querySelector('.hamburger');

  anchors.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      if (navLinks && (navLinks.classList.contains('is-open') || navLinks.classList.contains('active'))) {
        navLinks.classList.remove('is-open');
        navLinks.classList.remove('active');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      }

      const targetElement = doc.querySelector(targetId);
      if (targetElement && typeof targetElement.scrollIntoView === 'function') {
        if (typeof e?.preventDefault === 'function') e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  return anchors;
}

/**
 * Wstrzymywanie i wznawianie animacji poza ekranem (IntersectionObserver + fallback scroll)
 * Optymalizuje zużycie GPU/CPU na urządzeniach mobilnych.
 */
export function initScrollAnimations(doc = document) {
  const target = doc.querySelector('[data-animate-on-scroll], .orbit-ring');
  if (!target) return null;

  const container = doc.querySelector('.orbit-container') || target.parentNode || target;

  if (typeof globalThis.IntersectionObserver === 'function') {
    const observer = new globalThis.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          container.classList?.toggle('is-visible', Boolean(entry.isIntersecting));
        }
      },
      { rootMargin: '100px 0px', threshold: 0.05 }
    );
    observer.observe(container);
    return { target, container, observer };
  }

  const handleScrollVisibility = () => {
    const scrollY = globalThis.window?.scrollY || 0;
    const isVisible = scrollY > 150 && scrollY < 1800;
    container.classList?.toggle('is-visible', isVisible);
  };

  globalThis.window?.addEventListener('scroll', handleScrollVisibility, { passive: true });
  return { target, container, handleScrollVisibility };
}

/**
 * Komponent zakładek (WAI-ARIA Tabs Pattern)
 * Obsługuje klawiaturę (ArrowRight/Left/Up/Down, Home, End), stany aria-selected i tabindex.
 */
export function initTabs(doc = document) {
  const tabs = Array.from(doc.querySelectorAll('[role="tab"], .tab-btn, .pricing-tab'));
  const contents = Array.from(doc.querySelectorAll('[role="tabpanel"], .tab-panel, .pricing-content'));

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
  const items = Array.from(doc.querySelectorAll('[data-lightbox], .gallery-item, .pricing-gallery-item'));

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

  const submitBtn = form.querySelector?.('button[type="submit"], input[type="submit"]');
  let isSubmitting = false;

  form.addEventListener?.('submit', async (e) => {
    if (typeof e?.preventDefault === 'function') e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;
    if (submitBtn) submitBtn.disabled = true;

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
    } finally {
      isSubmitting = false;
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  return { form, saveDraft, restoreDraft };
}

/**
 * Normalizuje ciąg wyszukiwania (usuwa znaki diakrytyczne PL/ES, zamienia ł -> l i małe litery)
 */
export function normalizeSearchString(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .trim();
}

/**
 * Lekki polski stemmer odcinający najczęstsze końcówki fleksyjne rzeczowników i przymiotników
 */
export function getPolishStem(normWord) {
  if (!normWord || normWord.length < 4) return normWord;
  return normWord.replace(/(ach|ami|owi|iem|om|ie|ow|ej|ym|im|ia|iu|ek|ka|ki|ce|ke|y|a|e|i|u|o)$/, '');
}

/**
 * Oblicza wynik trafności wyszukiwania (Search Relevance Ranking):
 * - 100 pkt: dokładne dopasowanie całego tytułu (np. "Timba" === "timba")
 * -  90 pkt: dokładne dopasowanie głównego członu tytułu przed nawiasem/ukośnikiem/myślnikiem
 * -  80 pkt: tytuł zaczyna się od szukanej frazy (Prefix Match)
 * -  75 pkt: tytuł zaczyna się od rdzenia fleksyjnego szukanej frazy
 * -  70 pkt: szukana fraza występuje jako pełne słowo w głównym tytule
 * -  65 pkt: szukana fraza występuje bezpośrednio w tytule (w tym w nawiasie)
 * -  60 pkt: rdzeń fleksyjny szukanej frazy występuje w tytule
 * -  25 pkt: dopasowanie w treści/opisie oraz w tagach/podkategorii
 * -  20 pkt: dopasowanie wyłącznie w treści definicji/opisu lub autorze
 * -   0 pkt: brak dopasowania
 */
export function computeSearchRelevance(item, rawQuery) {
  if (!item || !rawQuery) return 0;
  const qRaw = String(rawQuery).trim().toLowerCase();
  const qNorm = normalizeSearchString(qRaw);
  if (!qNorm) return 0;

  const qStem = getPolishStem(qNorm);
  const titleRaw = String(item.term || item.title || item.name || '').trim().toLowerCase();
  const titleNorm = normalizeSearchString(titleRaw);
  const baseTitleNorm = titleNorm.split(/[(\/—–-]/)[0].trim();

  if (titleRaw === qRaw || titleNorm === qNorm) return 100;
  if (baseTitleNorm && baseTitleNorm === qNorm) return 90;
  if (titleRaw.startsWith(qRaw) || titleNorm.startsWith(qNorm)) return 80;
  if (qStem && qStem.length >= 4 && titleNorm.startsWith(qStem)) return 75;

  const escapedQ = qNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wordRegex = new RegExp(`(?:^|[\\s(\\/„"'-])${escapedQ}(?:$|[\\s)\\/”"',.-])`, 'i');
  if (baseTitleNorm && wordRegex.test(baseTitleNorm)) return 70;

  if (titleRaw.includes(qRaw) || titleNorm.includes(qNorm)) return 65;
  if (qStem && qStem.length >= 4 && titleNorm.includes(qStem)) return 60;

  const bodyRaw = String(item.definition || item.description || item.content || '').toLowerCase();
  const bodyNorm = normalizeSearchString(bodyRaw);
  const authorNorm = normalizeSearchString(item.author || '');

  if (bodyRaw.includes(qRaw) || bodyNorm.includes(qNorm) || authorNorm.includes(qNorm)) {
    const subs = Array.isArray(item.subcategory)
      ? item.subcategory
      : (item.subcategory ? [item.subcategory] : []);
    const subMatch = subs.some(s => normalizeSearchString(s).includes(qNorm));
    return subMatch ? 25 : 20;
  }

  return 0;
}

/**
 * Dwutrybowy silnik filtrowania i sortowania wyników (Search Relevance Ranking vs. A–Z):
 * - Gdy zapytanie jest puste: zwraca listę posortowaną alfabetycznie A–Z (localeCompare 'pl').
 * - Gdy zapytanie jest aktywne: filtruje i sortuje wyniki malejąco wg wagi trafności (tytuł przed opisem).
 */
export function sortAndFilterByRelevance(items, rawQuery) {
  const list = Array.isArray(items) ? [...items] : [];
  const q = String(rawQuery || '').trim();
  const getTitle = (x) => String(x?.term || x?.title || x?.name || '');

  if (!q) {
    return list.sort((a, b) => getTitle(a).localeCompare(getTitle(b), 'pl', { sensitivity: 'base' }));
  }

  const scored = [];
  for (const item of list) {
    const score = computeSearchRelevance(item, q);
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return getTitle(a.item).localeCompare(getTitle(b.item), 'pl', { sensitivity: 'base' });
  });

  return scored.map(entry => entry.item);
}

// Inicjalizacja automatyczna w przeglądarce
if (typeof document !== 'undefined') {
  const runInit = () => {
    initNavigation(document);
    initSmoothScroll(document);
    initTabs(document);
    initLightbox(document);
    initScrollAnimations(document);
    initContactForm(document);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInit);
  } else {
    runInit();
  }
}