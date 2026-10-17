import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupMockDom } from '../helpers/mock-dom.js';
import { initNavigation, initSmoothScroll, initScrollAnimations, initTabs, initLightbox, initContactForm } from '../../assets/js/main.js';

describe('Nawigacja i interakcje UI (assets/js/main.js)', () => {
  let dom;

  beforeEach(() => {
    dom = setupMockDom();
    const btn = dom.mockDocument.createElement('button');
    btn.id = 'menu-toggle';
    btn.setAttribute('aria-expanded', 'false');

    const nav = dom.mockDocument.createElement('ul');
    nav.id = 'primary-nav';

    dom.elements.set('menu-toggle', btn);
    dom.elements.set('primary-nav', nav);
  });

  test('initNavigation zwraca null, gdy brakuje wymaganych elementów w DOM', () => {
    const emptyDom = setupMockDom();
    const result = initNavigation(emptyDom.mockDocument);
    assert.equal(result, null);
  });

  test('Kliknięcie przycisku przełącza stan aria-expanded oraz klasę is-open', () => {
    const res = initNavigation(dom.mockDocument);
    assert.ok(res);

    res.toggleHandler();
    assert.equal(res.menuBtn.getAttribute('aria-expanded'), 'true');
    assert.ok(res.navLinks.classList.contains('is-open'));

    res.toggleHandler();
    assert.equal(res.menuBtn.getAttribute('aria-expanded'), 'false');
    assert.equal(res.navLinks.classList.contains('is-open'), false);
  });

  test('Wciśnięcie klawisza Escape zamyka otwarte menu i zwraca focus', () => {
    const res = initNavigation(dom.mockDocument);
    res.toggleHandler(); // otwórz
    assert.equal(res.menuBtn.getAttribute('aria-expanded'), 'true');

    res.keyHandler({ key: 'Escape' });
    assert.equal(res.menuBtn.getAttribute('aria-expanded'), 'false');
    assert.equal(res.navLinks.classList.contains('is-open'), false);
    assert.equal(res.menuBtn._focused, true);
  });

  test('Wciśnięcie innego klawisza nie wpływa na otwarte menu', () => {
    const res = initNavigation(dom.mockDocument);
    res.toggleHandler();

    res.keyHandler({ key: 'Enter' });
    assert.equal(res.menuBtn.getAttribute('aria-expanded'), 'true');
    assert.ok(res.navLinks.classList.contains('is-open'));
  });

  test('initTabs zwraca null, gdy brak elementów zakładek', () => {
    const emptyDom = setupMockDom();
    const res = initTabs(emptyDom.mockDocument);
    assert.equal(res, null);
  });

  test('initTabs przełącza zakładki, stany ARIA i panele po kliknięciu', () => {
    const tab1 = dom.mockDocument.createElement('button');
    tab1.className = 'tab-btn active';
    tab1.setAttribute('role', 'tab');
    tab1.setAttribute('data-target', 'panel-1');

    const tab2 = dom.mockDocument.createElement('button');
    tab2.className = 'tab-btn';
    tab2.setAttribute('role', 'tab');
    tab2.setAttribute('data-target', 'panel-2');

    const panel1 = dom.mockDocument.createElement('div');
    panel1.id = 'panel-1';
    panel1.className = 'tab-panel active';

    const panel2 = dom.mockDocument.createElement('div');
    panel2.id = 'panel-2';
    panel2.className = 'tab-panel';

    dom.elements.set('tab1', tab1);
    dom.elements.set('tab2', tab2);
    dom.elements.set('panel-1', panel1);
    dom.elements.set('panel-2', panel2);

    const tabsRes = initTabs(dom.mockDocument);
    assert.ok(tabsRes);
    assert.equal(tabsRes.tabs.length, 2);

    // Kliknięcie tab2
    tab2.dispatchEvent({ type: 'click' });
    assert.equal(tab2.classList.contains('active'), true);
    assert.equal(tab2.getAttribute('aria-selected'), 'true');
    assert.equal(tab2.getAttribute('tabindex'), '0');

    assert.equal(tab1.classList.contains('active'), false);
    assert.equal(tab1.getAttribute('aria-selected'), 'false');
    assert.equal(tab1.getAttribute('tabindex'), '-1');

    assert.equal(panel2.classList.contains('active'), true);
    assert.equal(panel1.classList.contains('active'), false);
    assert.equal(panel1.hasAttribute('hidden'), true);
  });

  test('initTabs obsługuje nawigację klawiaturą (ArrowRight, ArrowLeft, Home, End)', () => {
    const tab1 = dom.mockDocument.createElement('button');
    tab1.className = 'tab-btn active';
    tab1.setAttribute('role', 'tab');
    tab1.setAttribute('aria-controls', 'p1');

    const tab2 = dom.mockDocument.createElement('button');
    tab2.className = 'tab-btn';
    tab2.setAttribute('role', 'tab');
    tab2.setAttribute('aria-controls', 'p2');

    const tab3 = dom.mockDocument.createElement('button');
    tab3.className = 'tab-btn';
    tab3.setAttribute('role', 'tab');
    tab3.setAttribute('aria-controls', 'p3');

    const p1 = dom.mockDocument.createElement('div');
    p1.id = 'p1';
    p1.className = 'tab-panel active';

    const p2 = dom.mockDocument.createElement('div');
    p2.id = 'p2';
    p2.className = 'tab-panel';

    const p3 = dom.mockDocument.createElement('div');
    p3.id = 'p3';
    p3.className = 'tab-panel';

    dom.elements.set('t1', tab1);
    dom.elements.set('t2', tab2);
    dom.elements.set('t3', tab3);
    dom.elements.set('p1', p1);
    dom.elements.set('p2', p2);
    dom.elements.set('p3', p3);

    const res = initTabs(dom.mockDocument);
    assert.ok(res);

    // ArrowRight z t1 -> t2
    tab1.dispatchEvent({ type: 'keydown', key: 'ArrowRight', preventDefault: () => {} });
    assert.equal(tab2.classList.contains('active'), true);
    assert.equal(tab2._focused, true);

    // End z t2 -> t3
    tab2.dispatchEvent({ type: 'keydown', key: 'End', preventDefault: () => {} });
    assert.equal(tab3.classList.contains('active'), true);

    // ArrowRight z t3 -> zapętlenie do t1
    tab3.dispatchEvent({ type: 'keydown', key: 'ArrowRight', preventDefault: () => {} });
    assert.equal(tab1.classList.contains('active'), true);

    // ArrowLeft z t1 -> zapętlenie do t3
    tab1.dispatchEvent({ type: 'keydown', key: 'ArrowLeft', preventDefault: () => {} });
    assert.equal(tab3.classList.contains('active'), true);

    // Home z t3 -> t1
    tab3.dispatchEvent({ type: 'keydown', key: 'Home', preventDefault: () => {} });
    assert.equal(tab1.classList.contains('active'), true);
  });

  test('initLightbox zwraca null, gdy brak elementów modalu w DOM', () => {
    const emptyDom = setupMockDom();
    const res = initLightbox(emptyDom.mockDocument);
    assert.equal(res, null);
  });

  test('initLightbox otwiera powiększenie, zarządza fokusem i klawiaturą', () => {
    const modal = dom.mockDocument.createElement('div');
    modal.id = 'image-lightbox';
    modal.setAttribute('hidden', '');

    const imgEl = dom.mockDocument.createElement('img');
    imgEl.id = 'lightbox-image';

    const captionEl = dom.mockDocument.createElement('div');
    captionEl.id = 'lightbox-caption';

    const closeBtn = dom.mockDocument.createElement('button');
    closeBtn.id = 'lightbox-close';

    const prevBtn = dom.mockDocument.createElement('button');
    prevBtn.id = 'lightbox-prev';

    const nextBtn = dom.mockDocument.createElement('button');
    nextBtn.id = 'lightbox-next';

    const backdrop = dom.mockDocument.createElement('div');
    backdrop.id = 'lightbox-backdrop';

    modal.children.push(imgEl, captionEl, closeBtn, prevBtn, nextBtn, backdrop);

    const item1 = dom.mockDocument.createElement('button');
    item1.className = 'gallery-item';
    const img1 = dom.mockDocument.createElement('img');
    img1.setAttribute('src', '/img1.webp');
    img1.setAttribute('alt', 'Foto 1');
    item1.children.push(img1);

    const item2 = dom.mockDocument.createElement('button');
    item2.className = 'gallery-item';
    const img2 = dom.mockDocument.createElement('img');
    img2.setAttribute('src', '/img2.webp');
    img2.setAttribute('alt', 'Foto 2');
    item2.children.push(img2);

    dom.elements.set('image-lightbox', modal);
    dom.elements.set('lightbox-image', imgEl);
    dom.elements.set('lightbox-caption', captionEl);
    dom.elements.set('lightbox-close', closeBtn);
    dom.elements.set('lightbox-prev', prevBtn);
    dom.elements.set('lightbox-next', nextBtn);
    dom.elements.set('lightbox-backdrop', backdrop);
    dom.elements.set('it1', item1);
    dom.elements.set('it2', item2);

    const lb = initLightbox(dom.mockDocument);
    assert.ok(lb);

    // Otwarcie item1
    item1.dispatchEvent({ type: 'click' });
    assert.equal(modal.classList.contains('is-open'), true);
    assert.equal(modal.hasAttribute('hidden'), false);
    assert.equal(imgEl.getAttribute('src'), '/img1.webp');
    assert.equal(captionEl.textContent, 'Foto 1');
    assert.equal(closeBtn._focused, true);

    // ArrowRight -> przejście do item2
    dom.mockDocument.dispatchEvent({ type: 'keydown', key: 'ArrowRight', preventDefault: () => {} });
    assert.equal(imgEl.getAttribute('src'), '/img2.webp');
    assert.equal(lb.getCurrentIndex(), 1);

    // ArrowLeft -> powrót do item1
    dom.mockDocument.dispatchEvent({ type: 'keydown', key: 'ArrowLeft', preventDefault: () => {} });
    assert.equal(imgEl.getAttribute('src'), '/img1.webp');
    assert.equal(lb.getCurrentIndex(), 0);

    // Escape -> zamknięcie
    dom.mockDocument.dispatchEvent({ type: 'keydown', key: 'Escape', preventDefault: () => {} });
    assert.equal(modal.classList.contains('is-open'), false);
    assert.equal(modal.hasAttribute('hidden'), true);
    assert.equal(item1._focused, true);
  });

  test('initContactForm zwraca null, gdy brak formularza #contactForm w DOM', () => {
    const emptyDom = setupMockDom();
    const res = initContactForm(emptyDom.mockDocument, emptyDom.mockWindow.localStorage);
    assert.equal(res, null);
  });

  test('initContactForm zapisuje i odtwarza szkic w localStorage (z pominięciem honeypotu) oraz obsługuje wysyłkę i błędy', async () => {
    const storage = dom.mockWindow.localStorage;
    storage.setItem('tsw_contact_draft_v1', JSON.stringify({
      name: 'Jan Testowy',
      phone: '500600700',
      newsletter_consent: true,
      website_url: 'bot-spam'
    }));

    const form = dom.mockDocument.createElement('form');
    form.id = 'contactForm';
    const errorDiv = dom.mockDocument.createElement('div');
    errorDiv.id = 'formErrors';
    const successMsg = dom.mockDocument.createElement('p');
    successMsg.id = 'formSuccess';

    const hpInput = dom.mockDocument.createElement('input');
    hpInput.name = 'website_url';
    hpInput.type = 'text';

    const nameInput = dom.mockDocument.createElement('input');
    nameInput.name = 'name';
    nameInput.type = 'text';

    const phoneInput = dom.mockDocument.createElement('input');
    phoneInput.name = 'phone';
    phoneInput.type = 'tel';

    const consentInput = dom.mockDocument.createElement('input');
    consentInput.name = 'newsletter_consent';
    consentInput.type = 'checkbox';
    consentInput.checked = false;

    const msgArea = dom.mockDocument.createElement('textarea');
    msgArea.name = 'message';

    dom.elements.set('contactForm', form);
    dom.elements.set('formErrors', errorDiv);
    dom.elements.set('formSuccess', successMsg);
    dom.elements.set('hpInput', hpInput);
    dom.elements.set('nameInput', nameInput);
    dom.elements.set('phoneInput', phoneInput);
    dom.elements.set('consentInput', consentInput);
    dom.elements.set('msgArea', msgArea);

    const contact = initContactForm(dom.mockDocument, storage);
    assert.ok(contact);

    // Weryfikacja odtworzenia szkicu z localStorage (honeypot zignorowany)
    assert.equal(nameInput.value, 'Jan Testowy');
    assert.equal(phoneInput.value, '500600700');
    assert.equal(consentInput.checked, true);
    assert.equal(hpInput.value, '');

    // Zmiana pola aktualizuje szkic w localStorage
    msgArea.value = 'Proszę o szybki kontakt';
    msgArea.dispatchEvent({ type: 'input' });
    const savedDraft = JSON.parse(storage.getItem('tsw_contact_draft_v1'));
    assert.equal(savedDraft.message, 'Proszę o szybki kontakt');
    assert.equal('website_url' in savedDraft, false);

    // 1. Symulacja poprawnej wysyłki formularza (200 OK)
    const originalFetch = globalThis.fetch;
    let sentPayload = null;
    globalThis.fetch = async (_url, opts) => {
      sentPayload = JSON.parse(opts.body);
      return {
        ok: true,
        json: async () => ({ status: 'success', success: true, message: 'Wysłano OK!' })
      };
    };

    try {
      const submitFns = form._listeners.get('submit') || [];
      await submitFns[0]({ preventDefault: () => {} });

      assert.equal(sentPayload.js_check, '1');
      assert.equal(sentPayload.name, 'Jan Testowy');
      assert.equal(sentPayload.newsletter_consent, '1');
      assert.equal(successMsg.style.display, 'block');
      assert.equal(successMsg.textContent, 'Wysłano OK!');
      assert.equal(storage.getItem('tsw_contact_draft_v1'), null);

      // 2. Symulacja błędu walidacji z backendu (400 / success: false)
      globalThis.fetch = async () => ({
        ok: false,
        json: async () => ({ status: 'error', success: false, message: 'Brak telefonu lub e-maila' })
      });
      await submitFns[0]({ preventDefault: () => {} });
      assert.equal(errorDiv.style.display, 'block');
      assert.equal(errorDiv.textContent, 'Brak telefonu lub e-maila');

      // 3. Symulacja awarii sieciowej (wyjątek fetch)
      globalThis.fetch = async () => {
        throw new Error('Network error');
      };
      await submitFns[0]({ preventDefault: () => {} });
      assert.equal(errorDiv.style.display, 'block');
      assert.equal(errorDiv.textContent, 'Błąd połączenia. Spróbuj ponownie.');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('initSmoothScroll płynnie przewija do sekcji docelowej i zamyka otwarte menu mobilne', () => {
    const link = dom.mockDocument.createElement('a');
    link.setAttribute('href', '#services');

    const section = dom.mockDocument.createElement('section');
    section.id = 'services';
    let scrolled = false;
    section.scrollIntoView = () => { scrolled = true; };

    dom.elements.get('primary-nav').classList.add('is-open');
    dom.elements.set('anchor-services', link);
    dom.elements.set('services', section);

    const anchors = initSmoothScroll(dom.mockDocument);
    assert.ok(anchors);
    link.dispatchEvent({ type: 'click', preventDefault: () => {} });
    assert.equal(scrolled, true);
    assert.equal(dom.elements.get('primary-nav').classList.contains('is-open'), false);
  });

  test('initScrollAnimations wstrzymuje i wznawia animacje na podstawie widoczności (IntersectionObserver / scroll)', () => {
    const orbitContainer = dom.mockDocument.createElement('div');
    orbitContainer.className = 'orbit-container';

    const orbitRing = dom.mockDocument.createElement('div');
    orbitRing.className = 'orbit-ring';
    orbitContainer.appendChild(orbitRing);

    dom.elements.set('orbit-container', orbitContainer);
    dom.elements.set('orbit-ring', orbitRing);

    let observerCallback = null;
    const origIO = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      constructor(cb) {
        observerCallback = cb;
      }
      observe() {}
    };

    try {
      const res = initScrollAnimations(dom.mockDocument);
      assert.ok(res);
      assert.equal(orbitContainer.classList.contains('is-visible'), false);

      observerCallback([{ isIntersecting: true }]);
      assert.equal(orbitContainer.classList.contains('is-visible'), true);

      observerCallback([{ isIntersecting: false }]);
      assert.equal(orbitContainer.classList.contains('is-visible'), false);
    } finally {
      globalThis.IntersectionObserver = origIO;
    }
  });
});