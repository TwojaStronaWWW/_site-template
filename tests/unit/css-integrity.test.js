import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..', '..');
const MAIN_CSS_PATH = path.join(ROOT_DIR, 'assets', 'css', 'main.css');

describe('Integralność i składnia arkuszy stylów CSS (assets/css/main.css)', () => {
  const mainCss = fs.readFileSync(MAIN_CSS_PATH, 'utf-8');

  it('główny arkusz stylów main.css powinien istnieć i posiadać zbalansowane nawiasy klamrowe {}', () => {
    const openBraces = (mainCss.match(/\{/g) || []).length;
    const closeBraces = (mainCss.match(/\}/g) || []).length;
    assert.strictEqual(
      openBraces,
      closeBraces,
      `Niezbalansowane nawiasy klamrowe w main.css: { (${openBraces}) vs } (${closeBraces})`
    );
  });

  it('główny arkusz stylów main.css powinien posiadać zbalansowane nawiasy okrągłe ()', () => {
    const mainOpenParen = (mainCss.match(/\(/g) || []).length;
    const mainCloseParen = (mainCss.match(/\)/g) || []).length;
    assert.strictEqual(mainOpenParen, mainCloseParen, 'Niezbalansowane nawiasy okrągłe w main.css');
  });

  it('główny arkusz powinien definiować spójną paletę zmiennych CSS (Design Tokens) w :root', () => {
    assert.match(mainCss, /:root\s*\{/i);
    assert.match(mainCss, /--color-primary:/i);
    assert.match(mainCss, /--color-bg:/i);
    assert.match(mainCss, /--color-text:/i);
  });

  it('wszystkie użyte zmienne var(--token) bez fallbacku posiadają definicję w :root', () => {
    const definedVars = new Set();
    const defRegex = /(--[a-zA-Z0-9-]+)\s*:/g;
    let m;
    while ((m = defRegex.exec(mainCss)) !== null) {
      definedVars.add(m[1]);
    }

    const useRegex = /var\(\s*(--[a-zA-Z0-9-]+)\s*\)/g;
    let u;
    while ((u = useRegex.exec(mainCss)) !== null) {
      const varName = u[1];
      assert.ok(
        definedVars.has(varName),
        `Niezdefiniowana zmienna CSS ${varName} użyta w main.css`
      );
    }
  });

  it('arkusz nie powinien zawierać pustych reguł CSS bez deklaracji właściwości oraz powinien wspierać prefers-reduced-motion', () => {
    const emptyRuleRegex = /[^{}]+\{\s*\}/g;
    const emptyInMain = mainCss.match(emptyRuleRegex);
    assert.strictEqual(emptyInMain, null, `Wykryto puste reguły w main.css: ${emptyInMain}`);
    assert.match(mainCss, /prefers-reduced-motion:\s*reduce/i);
  });
});