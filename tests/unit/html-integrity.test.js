import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Integralność semantyczna i standardy HTML5 (index.html)', () => {
  const rootDir = path.resolve('.');
  const htmlPath = path.resolve('index.html');
  const content = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';

  test('Plik index.html istnieje i posiada niezerową wielkość', () => {
    assert.ok(content.length > 50, 'index.html powinien zawierać szkielet dokumentu');
  });

  test('Posiada poprawny DOCTYPE HTML5 i zdefiniowany atrybut lang', () => {
    assert.match(content, /<!DOCTYPE html>/i, 'Brak standardowego <!DOCTYPE html>');
    assert.match(content, /<html\s+[^>]*lang=["'][a-z]{2}["']/i, 'Tag <html> musi posiadać atrybut lang');
  });

  test('Sekcja <head> zawiera kodowanie utf-8, meta viewport, manifest PWA oraz theme-color', () => {
    assert.match(content, /<meta\s+charset=["']?utf-8/i, 'Brak deklaracji kodowania UTF-8');
    assert.match(content, /<meta\s+name=["']viewport["']/i, 'Brak znacznika meta viewport dla responsywności');
    assert.match(content, /<link\s+rel=["']manifest["']\s+href=["']site\.webmanifest["']/i, 'Brak podpięcia manifestu PWA site.webmanifest');
    assert.match(content, /<meta\s+name=["']theme-color["']/i, 'Brak deklaracji meta theme-color');
  });

  test('Strona posiada niepusty tag <title> oraz opis <meta name="description">', () => {
    assert.match(content, /<title>.+<\/title>/i, 'Brak niepustego tagu <title>');
    assert.match(content, /<meta\s+name=["']description["']\s+content=["'][^"']+["']/i, 'Brak wartościowego meta description dla SEO');
  });

  test('Hierarchia nagłówków posiada dokładnie jeden główny tag <h1>', () => {
    const h1Matches = content.match(/<h1[\s>]/gi) || [];
    assert.equal(h1Matches.length, 1, 'Na stronie powinien znajdować się dokładnie jeden nagłówek <h1>');
  });

  test('Zawiera główny semantyczny kontener <main>', () => {
    assert.match(content, /<main[\s>]/i, 'Strona musi zawierać semantyczny znacznik <main>');
  });

  test('Nie zawiera niedozwolonych pustych linków nawigacyjnych (href="#")', () => {
    const emptyLinks = content.match(/href=["']#["']/gi) || [];
    assert.equal(emptyLinks.length, 0, 'Wykryto puste odnośniki href="#". Użyj znaczników <button> lub pełnych kotwic #id.');
  });

  test('Wszystkie odnośniki zewnętrzne z target="_blank" posiadają rel="noopener" (ochrona Reverse Tabnabbing)', () => {
    const targetBlankLinks = content.match(/<a\s+[^>]*target=["']_blank["'][^>]*>/gi) || [];
    for (const linkTag of targetBlankLinks) {
      assert.match(linkTag, /rel=["'][^"']*noopener[^"']*["']/i, `Link z target="_blank" nie posiada rel="noopener": ${linkTag}`);
    }
  });

  test('Wszystkie lokalne zasoby i kotwice (#id) w index.html fizycznie istnieją (Zero-Dependency Asset & Link Integrity)', () => {
    const attrRegex = /(?:src|href)=["']([^"']+)["']/gi;
    let match;
    let checkedAssets = 0;

    while ((match = attrRegex.exec(content)) !== null) {
      const rawRef = match[1];
      if (
        rawRef.startsWith('http://') ||
        rawRef.startsWith('https://') ||
        rawRef.startsWith('mailto:') ||
        rawRef.startsWith('tel:')
      ) {
        continue;
      }

      if (rawRef.startsWith('#')) {
        const targetId = rawRef.slice(1);
        const idRegex = new RegExp(`id=["']${targetId}["']`, 'i');
        assert.match(content, idRegex, `Kotwica nawigacyjna ${rawRef} wskazuje na nieistniejący element id="${targetId}" w index.html`);
        continue;
      }

      const cleanRelativePath = rawRef.split('?')[0].split('#')[0];
      const resolvedPath = path.join(rootDir, cleanRelativePath);
      assert.ok(
        fs.existsSync(resolvedPath),
        `Zasób lokalny zadeklarowany w index.html nie istnieje na dysku: ${rawRef} (${resolvedPath})`
      );
      checkedAssets++;
    }

    assert.ok(checkedAssets >= 3, `Oczekiwano sprawdzenia co najmniej 3 lokalnych zasobów, sprawdzono: ${checkedAssets}`);
  });
});