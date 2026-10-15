import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupMockDom } from '../helpers/mock-dom.js';
import { formatMarkdown, getLocalFallbackAnswer, initAiWidget } from '../../assets/js/ai-widget.js';

describe('Uniwersalny Widget Asystenta AI (assets/js/ai-widget.js)', () => {
  let dom;

  beforeEach(() => {
    dom = setupMockDom();
    const scriptTag = dom.mockDocument.createElement('script');
    scriptTag.setAttribute('data-site-id', 'twojastronawww');
    scriptTag.setAttribute('data-title', 'Asystent TwojaStronaWWW');
    dom.elements.set('ai-script', scriptTag);
  });

  test('formatMarkdown bezpiecznie escapuje HTML (ochrona XSS) i formatuje pogrubienia, listy oraz linki', () => {
    const xss = '<script>alert("xss")</script> **Wycena 24h** kontakt@twojastronawww.pl https://twojastronawww.pl\n- Krok 1\n- Krok 2';
    const html = formatMarkdown(xss);

    assert.equal(html.includes('<script>'), false);
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(html.includes('<strong>Wycena 24h</strong>'));
    assert.ok(html.includes('href="mailto:kontakt@twojastronawww.pl"'));
    assert.ok(html.includes('href="https://twojastronawww.pl"'));
    assert.ok(html.includes('<ul class="tsw-ai-list"><li>Krok 1</li><li>Krok 2</li></ul>'));
  });

  test('getLocalFallbackAnswer zwraca merytoryczne odpowiedzi awaryjne (Zero-Downtime Fallback)', () => {
    assert.match(getLocalFallbackAnswer('Wdrożenie czatbota AI (RAG)'), /RAG/i);
    assert.match(getLocalFallbackAnswer('Ile kosztuje strona WWW?'), /wycen/i);
    assert.match(getLocalFallbackAnswer('Jak wygląda współpraca?'), /3 prostych krokach/i);
    assert.match(getLocalFallbackAnswer('Jak się skontaktować?'), /formularz/i);
    assert.match(getLocalFallbackAnswer('Dzień dobry!', 'twojastronawww'), /twojastronawww/i);
  });

  test('initAiWidget tworzy strukturę DOM, obsługuje otwieranie/zamykanie (w tym Escape) i chroni przed duplikacją', () => {
    const widget = initAiWidget(dom.mockDocument, dom.mockWindow);
    assert.ok(widget);
    assert.equal(widget.toggleBtn.getAttribute('aria-expanded'), 'false');

    // Druga próba inicjalizacji zwraca null (idempotentność)
    assert.equal(initAiWidget(dom.mockDocument, dom.mockWindow), null);

    // Otwarcie czatu
    widget.toggleChat();
    assert.equal(widget.chatWindow.classList.contains('tsw-open'), true);
    assert.equal(widget.toggleBtn.getAttribute('aria-expanded'), 'true');

    // Zamknięcie klawiszem Escape
    dom.mockDocument.dispatchEvent({ type: 'keydown', key: 'Escape' });
    assert.equal(widget.chatWindow.classList.contains('tsw-open'), false);
    assert.equal(widget.toggleBtn.getAttribute('aria-expanded'), 'false');
  });

  test('sendQuestion obsługuje odpowiedź z VPS AI Routera oraz fallback przy błędzie sieci', async () => {
    dom.mockWindow.fetch = async () => ({
      ok: true,
      json: async () => ({
        success: true,
        answer: 'Wdrożenie strony z modułem **AI RAG** zajmuje od 7 dni.'
      })
    });

    const widget = initAiWidget(dom.mockDocument, dom.mockWindow);
    await widget.sendQuestion('Ile trwa wdrożenie?');

    assert.equal(widget.getHistory().length, 2);
    assert.equal(widget.getHistory()[0].text, 'Ile trwa wdrożenie?');
    assert.match(widget.getHistory()[1].text, /AI RAG/);

    // Test awarii sieci -> automatyczny fallback bazy wiedzy
    dom.mockWindow.fetch = async () => {
      throw new Error('Network error');
    };
    await widget.sendQuestion('Jak wygląda współpraca?');
    assert.equal(widget.getHistory().length, 4);
    assert.match(widget.getHistory()[3].text, /3 prostych krokach/i);

    // Wyczyszczenie historii rozmowy
    widget.clearBtn.dispatchEvent({ type: 'click' });
    assert.equal(widget.getHistory().length, 0);
  });
});
