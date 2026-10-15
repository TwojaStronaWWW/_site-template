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

  it('arkusz nie powinien zawierać pustych reguł CSS bez deklaracji właściwości', () => {
    const emptyRuleRegex = /[^{}]+\{\s*\}/g;
    const emptyInMain = mainCss.match(emptyRuleRegex);
    assert.strictEqual(emptyInMain, null, `Wykryto puste reguły w main.css: ${emptyInMain}`);
  });
});