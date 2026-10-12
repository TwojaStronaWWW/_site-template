import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..', '..');

describe('Higiena repozytorium (Repo Hygiene wzorowane na Gal Anonim i _site-template)', () => {
  it('plik package.json powinien posiadać wymagane skrypty CI (test, check, check:syntax, prepare)', () => {
    const pkgPath = path.join(ROOT_DIR, 'package.json');
    assert.ok(fs.existsSync(pkgPath), 'Brak package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    assert.ok(pkg.scripts, 'Brak sekcji scripts w package.json');
    assert.ok(pkg.scripts.test, 'Brak skryptu test');
    assert.ok(pkg.scripts['check:syntax'], 'Brak skryptu check:syntax');
    assert.ok(pkg.scripts.check, 'Brak skryptu check');
    assert.ok(pkg.scripts.prepare, 'Brak skryptu prepare');
  });

  it('konfiguracja CI/CD (.github/workflows) powinna posiadać ci.yml, deploy-staging.yml oraz deploy-production.yml', () => {
    const workflows = ['ci.yml', 'deploy-staging.yml', 'deploy-production.yml'];
    for (const wf of workflows) {
      const wfPath = path.join(ROOT_DIR, '.github', 'workflows', wf);
      assert.ok(fs.existsSync(wfPath), `Brak pliku .github/workflows/${wf}`);
      const content = fs.readFileSync(wfPath, 'utf-8');
      assert.match(content, /runs-on:\s*ubuntu-latest/i);
      assert.match(content, /actions\/checkout@v4/i);
    }
  });

  it('kluczowe pliki źródłowe nie mogą zawierać pozostałości po konfliktach gita (merge conflict markers)', () => {
    const extensionsToCheck = ['.html', '.js', '.css', '.json', '.yml', '.md'];
    const CONFLICT_START = '<<<<<<<' + ' ';
    const CONFLICT_END = '>>>>>>>' + ' ';

    function scanDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.git') || entry.name === 'node_modules') continue;
        const fullPath = path.join(dir, entry.name);
        if (fullPath === __filename) continue;
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (extensionsToCheck.some(ext => entry.name.endsWith(ext))) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          assert.strictEqual(
            content.includes(CONFLICT_START) || content.includes(CONFLICT_END),
            false,
            `Wykryto marker konfliktu git w pliku: ${path.relative(ROOT_DIR, fullPath)}`
          );
        }
      }
    }

    scanDir(ROOT_DIR);
  });

  it('pliki dokumentacji i zasad AGENTS.md, README.md oraz BLUEPRINT.md powinny istnieć', () => {
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'AGENTS.md')), 'Brak AGENTS.md');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'README.md')), 'Brak README.md');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'BLUEPRINT.md')), 'Brak BLUEPRINT.md');
  });

  it('git hook (.githooks/pre-commit) powinien istnieć, posiadać shebang bash i uruchamiać npm run check', () => {
    const hookPath = path.join(ROOT_DIR, '.githooks', 'pre-commit');
    assert.ok(fs.existsSync(hookPath), 'Brak .githooks/pre-commit');
    const content = fs.readFileSync(hookPath, 'utf-8');
    const firstLine = content.split(/\r?\n/)[0];

    assert.match(firstLine, /^#!\/(usr\/bin\/env bash|bin\/bash)\s*$/, 'Hook pre-commit nie posiada poprawnego shebangu bash');
    assert.ok(content.includes('npm run check'), 'Hook pre-commit nie wywołuje komendy npm run check');
  });

  it('git hook (.githooks/commit-msg) powinien weryfikować format Conventional Commits (jak w Gal Anonim)', () => {
    const hookPath = path.join(ROOT_DIR, '.githooks', 'commit-msg');
    assert.ok(fs.existsSync(hookPath), 'Brak .githooks/commit-msg');
    const content = fs.readFileSync(hookPath, 'utf-8');
    const firstLine = content.split(/\r?\n/)[0];

    assert.match(firstLine, /^#!\/(usr\/bin\/env bash|bin\/bash)\s*$/, 'Hook commit-msg nie posiada poprawnego shebangu bash');
    assert.match(content, /build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test/i);
    assert.match(content, /Conventional Commits/i);
  });

  it('plik .gitattributes powinien normalizować końce linii LF dla skryptów i hooków', () => {
    const gitAttrPath = path.join(ROOT_DIR, '.gitattributes');
    assert.ok(fs.existsSync(gitAttrPath), 'Brak .gitattributes');
    const content = fs.readFileSync(gitAttrPath, 'utf-8');

    assert.match(content, /\* text=auto eol=lf/i);
    assert.match(content, /\.githooks\/\* text eol=lf/i);
  });

  it('konfiguracja audytu Lighthouse CI (.lighthouserc.json) powinna istnieć i definiować asercje jakościowe', () => {
    const lhciPath = path.join(ROOT_DIR, '.lighthouserc.json');
    assert.ok(fs.existsSync(lhciPath), 'Brak .lighthouserc.json');

    const config = JSON.parse(fs.readFileSync(lhciPath, 'utf-8'));
    assert.ok(config.ci, 'Brak klucza ci');
    assert.ok(config.ci.assert && config.ci.assert.assertions, 'Brak definicji asercji w lighthouserc.json');
    assert.ok(config.ci.assert.assertions['categories:accessibility']);
    assert.ok(config.ci.assert.assertions['categories:seo']);
  });

  it('pliki robots.txt, sitemap.xml, site.webmanifest oraz favicon.ico powinny istnieć i definiować poprawne reguły', () => {
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'favicon.ico')), 'Brak favicon.ico');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'site.webmanifest')), 'Brak site.webmanifest');

    const robotsPath = path.join(ROOT_DIR, 'robots.txt');
    assert.ok(fs.existsSync(robotsPath), 'Brak robots.txt');
    const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
    assert.match(robotsContent, /User-agent:\s*\*/i);

    const sitemapPath = path.join(ROOT_DIR, 'sitemap.xml');
    assert.ok(fs.existsSync(sitemapPath), 'Brak sitemap.xml');
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    assert.match(sitemapContent, /<loc>/i);
  });

  it('konfiguracja Dependabot (.github/dependabot.yml) powinna istnieć i chronić akcje GitHub i npm', () => {
    const dependabotPath = path.join(ROOT_DIR, '.github', 'dependabot.yml');
    assert.ok(fs.existsSync(dependabotPath), 'Brak .github/dependabot.yml');
    const content = fs.readFileSync(dependabotPath, 'utf-8');
    assert.match(content, /package-ecosystem:\s*"github-actions"/i);
    assert.match(content, /package-ecosystem:\s*"npm"/i);
  });
});
