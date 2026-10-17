import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupMockDom } from '../helpers/mock-dom.js';
import {
  formatMarkdown,
  getLocalFallbackAnswer,
  computeKnowledgeVersion,
  searchKnowledgeEntries,
  initAiWidget
} from '../../assets/js/ai-widget.js';

describe('Uniwersalny Widget Asystenta AI v3.0 (assets/js/ai-widget.js)', () => {
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

  test('sendQuestion korzysta z Response Cache (drugie identyczne pytanie nie odpytuje ponownie AI) oraz obsługuje fallback', async () => {
    let fetchCalls = 0;
    dom.mockWindow.fetch = async () => {
      fetchCalls++;
      return {
        ok: true,
        json: async () => ({
          success: true,
          answer: 'Wdrożenie strony z modułem **AI RAG** zajmuje od 7 dni.'
        })
      };
    };

    const widget = initAiWidget(dom.mockDocument, dom.mockWindow);
    const firstRes = await widget.sendQuestion('Ile trwa wdrożenie?');
    assert.equal(fetchCalls, 1);
    assert.equal(firstRes.cached, false);

    // Drugie identyczne pytanie -> odpowiedź z Response Cache bez wywołania fetch!
    const secondRes = await widget.sendQuestion('ile trwa wdrożenie?!');
    assert.equal(fetchCalls, 1, 'Drugie pytanie o to samo nie powinno odpytywać sieci/AI');
    assert.equal(secondRes.cached, true);
    assert.match(secondRes.answer, /AI RAG/);

    // Test awarii sieci dla nowego pytania -> automatyczny fallback bazy wiedzy
    dom.mockWindow.fetch = async () => {
      fetchCalls++;
      throw new Error('Network error');
    };
    await widget.sendQuestion('Jak wygląda współpraca?');
    assert.equal(fetchCalls, 2);
    assert.match(widget.getHistory()[5].text, /3 prostych krokach/i);

    // Wyczyszczenie historii rozmowy
    widget.clearBtn.dispatchEvent({ type: 'click' });
    assert.equal(widget.getHistory().length, 0);
  });

  test('Dynamic Knowledge Base: zmiana hasła w Salsopedii zmienia kbVersion, inwaliduje cache i aktualizuje zapisaną odpowiedź', async () => {
    const initialTerms = [
      {
        id: 'term_32',
        term: 'Enchufla',
        definition: 'Podstawowy obrót i zamiana miejsc na 1-2-3.',
        category: ['figures', 'steps'],
        status: 'verified',
        verification_count: 1
      }
    ];

    let fetchCalls = 0;
    dom.mockWindow.fetch = async () => {
      fetchCalls++;
      throw new Error('Offline mode - use local knowledge base');
    };

    const widget = initAiWidget(dom.mockDocument, dom.mockWindow, {
      siteId: 'katosalsahub',
      initialKnowledge: initialTerms,
      skipInitialFetch: true
    });

    const v1 = widget.getKnowledgeVersion();
    const res1 = await widget.sendQuestion('Co to jest Enchufla?');
    assert.equal(fetchCalls, 1);
    assert.match(res1.answer, /Podstawowy obrót i zamiana miejsc na 1-2-3/);

    // Drugie zapytanie przed zmianą w Salsopedii -> trafia w cache, brak wywołania fetch
    const resCached = await widget.sendQuestion('Co to jest Enchufla?');
    assert.equal(fetchCalls, 1);
    assert.equal(resCached.cached, true);

    // Zmiana definicji hasła w Salsopedii
    const updatedTerms = [
      {
        id: 'term_32',
        term: 'Enchufla',
        definition: 'Zaktualizowana definicja: obrót partnerki pod lewą ręką na 1-2-3 i wymiana miejsc na 5-6-7.',
        category: ['figures', 'steps'],
        status: 'verified',
        verification_count: 2
      }
    ];
    widget.updateKnowledgeEntries(updatedTerms);

    const v2 = widget.getKnowledgeVersion();
    assert.notEqual(v1, v2, 'Wersja wiedzy kbVersion musi ulec zmianie po edycji Salsopedii');

    // Zapisana wcześniej odpowiedź oraz nowe zapytanie mają już zaktualizowaną wiedzę z Salsopedii
    const resAfterUpdate = await widget.sendQuestion('Co to jest Enchufla?');
    assert.match(resAfterUpdate.answer, /Zaktualizowana definicja: obrót partnerki pod lewą ręką/);
    assert.equal(searchKnowledgeEntries('Enchufla', updatedTerms).length, 1);
    assert.ok(computeKnowledgeVersion(updatedTerms).startsWith('kb_v1_'));
  });
});
