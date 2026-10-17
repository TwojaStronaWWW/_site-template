import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..', '..');

describe('Higiena repozytorium i bezpieczeństwo danych (ISO 27001)', () => {
  it('plik package.json powinien posiadać wymagane skrypty CI (test, check, check:syntax, prepare, serve, dev)', () => {
    const pkgPath = path.join(ROOT_DIR, 'package.json');
    assert.ok(fs.existsSync(pkgPath), 'Brak package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    assert.ok(pkg.scripts, 'Brak sekcji scripts w package.json');
    assert.ok(pkg.scripts.test, 'Brak skryptu test');
    assert.ok(pkg.scripts['check:syntax'], 'Brak skryptu check:syntax');
    assert.ok(pkg.scripts.check, 'Brak skryptu check');
    assert.ok(pkg.scripts.prepare, 'Brak skryptu prepare');
    assert.ok(pkg.scripts.serve, 'Brak skryptu serve');
    assert.ok(pkg.scripts.dev, 'Brak skryptu dev');
  });

  it('konfiguracja CI/CD (.github/workflows) powinna posiadać ci.yml, deploy-staging.yml, deploy-production.yml oraz dependabot-automerge.yml', () => {
    const workflows = ['ci.yml', 'deploy-staging.yml', 'deploy-production.yml', 'dependabot-automerge.yml'];
    for (const wf of workflows) {
      const wfPath = path.join(ROOT_DIR, '.github', 'workflows', wf);
      assert.ok(fs.existsSync(wfPath), `Brak pliku .github/workflows/${wf}`);
      const content = fs.readFileSync(wfPath, 'utf-8');
      assert.match(content, /runs-on:\s*ubuntu-latest/i);
    }
    const ciContent = fs.readFileSync(path.join(ROOT_DIR, '.github', 'workflows', 'ci.yml'), 'utf-8');
    assert.match(ciContent, /gitleaks/i);
    assert.match(ciContent, /smoke-diagnostics/i);

    for (const deployWf of ['deploy-staging.yml', 'deploy-production.yml']) {
      const deployContent = fs.readFileSync(path.join(ROOT_DIR, '.github', 'workflows', deployWf), 'utf-8');
      assert.match(deployContent, /!scripts\*/i, `${deployWf} musi wykluczać katalog scripts/ z transferu SFTP`);
      assert.match(deployContent, /!docker-compose\.yml/i, `${deployWf} musi wykluczać docker-compose.yml z transferu SFTP`);
    }
  });

  it('kluczowe pliki źródłowe nie mogą zawierać pozostałości po konfliktach gita (merge conflict markers)', () => {
    const extensionsToCheck = ['.html', '.js', '.css', '.json', '.yml', '.md', '.php'];
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

  it('pliki dokumentacji, standardów (.gitleaks.toml, .env.example, .htaccess, sw.js) oraz konfiguracji powinny istnieć', () => {
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'AGENTS.md')), 'Brak AGENTS.md');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'GEMINI.md')), 'Brak GEMINI.md');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'README.md')), 'Brak README.md');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'BLUEPRINT.md')), 'Brak BLUEPRINT.md');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'ROADMAP.template.md')), 'Brak ROADMAP.template.md');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'SECURITY.md')), 'Brak SECURITY.md');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'LICENSE')), 'Brak LICENSE');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, '.editorconfig')), 'Brak .editorconfig');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, '.gitleaks.toml')), 'Brak .gitleaks.toml');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, '.env.example')), 'Brak .env.example');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, '.htaccess')), 'Brak głównego .htaccess');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'sw.js')), 'Brak Service Workera sw.js');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'eslint.config.mjs')), 'Brak eslint.config.mjs');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, '.htmlhintrc')), 'Brak .htmlhintrc');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'tests', 'smoke', 'ui-smoke.js')), 'Brak tests/smoke/ui-smoke.js');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, '.github', 'pull_request_template.md')), 'Brak .github/pull_request_template.md');
  });

  it('katalogi api/, api/sessions oraz api/rate_limits posiadają ochronę .htaccess, moduł leads-store.php oraz RODO mask_ip w contact.php', () => {
    const apiHt = path.join(ROOT_DIR, 'api', '.htaccess');
    const leadsStore = path.join(ROOT_DIR, 'api', 'leads-store.php');
    const contactPhp = path.join(ROOT_DIR, 'api', 'contact.php');
    const sessionsHt = path.join(ROOT_DIR, 'api', 'sessions', '.htaccess');
    const rateLimitsHt = path.join(ROOT_DIR, 'api', 'rate_limits', '.htaccess');
    assert.ok(fs.existsSync(apiHt), 'Brak .htaccess w api/ chroniącego pliki CSV');
    assert.ok(fs.existsSync(leadsStore), 'Brak api/leads-store.php');
    assert.ok(fs.existsSync(sessionsHt), 'Brak .htaccess w api/sessions');
    assert.ok(fs.existsSync(rateLimitsHt), 'Brak .htaccess w api/rate_limits');
    assert.match(fs.readFileSync(apiHt, 'utf-8'), /csv/i);
    assert.match(fs.readFileSync(sessionsHt, 'utf-8'), /Deny from all/i);
    assert.match(fs.readFileSync(rateLimitsHt, 'utf-8'), /Deny from all/i);

    const contactCode = fs.readFileSync(contactPhp, 'utf-8');
    assert.match(contactCode, /function\s+mask_ip/i, 'Brak anonimizacji IP mask_ip() w api/contact.php');
    assert.match(contactCode, /function\s+get_env_secret/i, 'Brak get_env_secret() w api/contact.php');
    assert.match(contactCode, /OSTICKET_API_KEY/i, 'Brak integracji osTicket w api/contact.php');
  });

  it('plik .gitignore chroni sesje PHP, logi i dane leadów CSV (ISO 27001)', () => {
    const gitignorePath = path.join(ROOT_DIR, '.gitignore');
    assert.ok(fs.existsSync(gitignorePath), 'Brak .gitignore');
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    assert.match(content, /api\/sessions\/\*/i);
    assert.match(content, /api\/rate_limits\/\*\.json/i);
    assert.match(content, /api\/leads_\*\.csv/i);
  });

  it('git hook (.githooks/pre-commit) powinien istnieć, posiadać shebang bash i uruchamiać npm run check', () => {
    const hookPath = path.join(ROOT_DIR, '.githooks', 'pre-commit');
    assert.ok(fs.existsSync(hookPath), 'Brak .githooks/pre-commit');
    const content = fs.readFileSync(hookPath, 'utf-8');
    const firstLine = content.split(/\r?\n/)[0];

    assert.match(firstLine, /^#!\/(usr\/bin\/env bash|bin\/bash)\s*$/, 'Hook pre-commit nie posiada poprawnego shebangu bash');
    assert.ok(content.includes('npm run check'), 'Hook pre-commit nie wywołuje komendy npm run check');
  });

  it('git hook (.githooks/commit-msg) powinien weryfikować format Conventional Commits', () => {
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
    assert.ok(config.ci.collect && config.ci.collect.url, 'Brak definicji url w collect');
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

  it('szablony zgłoszeń GitHub (.github/ISSUE_TEMPLATE) oraz skrypty narzędziowe powinny istnieć i chronić przed Directory Traversal', async () => {
    assert.ok(fs.existsSync(path.join(ROOT_DIR, '.github', 'ISSUE_TEMPLATE', 'bug_report.yml')), 'Brak bug_report.yml');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, '.github', 'ISSUE_TEMPLATE', 'task.yml')), 'Brak task.yml');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, '.github', 'ISSUE_TEMPLATE', 'config.yml')), 'Brak config.yml');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'scripts', 'serve.js')), 'Brak scripts/serve.js');
    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'scripts', 'generate-pdf.js')), 'Brak scripts/generate-pdf.js');

    const serveModule = await import('../../scripts/serve.js');
    assert.strictEqual(typeof serveModule.resolveSafeFilePath, 'function');
    assert.strictEqual(serveModule.SECURITY_HEADERS['X-Content-Type-Options'], 'nosniff');
    assert.ok(serveModule.MIME_TYPES['.webmanifest']);

    const validResult = serveModule.resolveSafeFilePath('/', ROOT_DIR);
    assert.strictEqual(validResult.isAllowed, true);

    const traversalResult = serveModule.resolveSafeFilePath('/../../etc/passwd', ROOT_DIR);
    assert.strictEqual(traversalResult.isAllowed, false, 'Serwer powinien blokować próby Directory Traversal');

    const sensitiveResult = serveModule.resolveSafeFilePath('/.env', ROOT_DIR);
    assert.strictEqual(sensitiveResult.isAllowed, false, 'Serwer powinien blokować dostęp do pliku .env');

    const malformedResult = serveModule.resolveSafeFilePath('/%E0%A4%A', ROOT_DIR);
    assert.strictEqual(malformedResult.isMalformed, true, 'Serwer powinien wykrywać uszkodzone URI');

    // Weryfikacja obsługi odpowiedzi HTTP w scripts/serve.js (400, 403, 404)
    const dispatchReq = (url) => new Promise((resolve) => {
      let statusCode = 0;
      const res = {
        headersSent: false,
        writeHead(code) { statusCode = code; this.headersSent = true; },
        end(body) { resolve({ statusCode, body }); },
        on() {},
        once() {},
        emit() {}
      };
      serveModule.server.emit('request', { url }, res);
    });

    const res400 = await dispatchReq('/%E0%A4%A');
    assert.strictEqual(res400.statusCode, 400);

    const res403 = await dispatchReq('/.env');
    assert.strictEqual(res403.statusCode, 403);

    const res404 = await dispatchReq('/nie-istnieje-404.html');
    assert.strictEqual(res404.statusCode, 404);

    const pdfModule = await import('../../scripts/generate-pdf.js');
    assert.strictEqual(typeof pdfModule.findBrowserBinary, 'function');
    assert.strictEqual(typeof pdfModule.generatePdf, 'function');

    const pkgPath = path.join(ROOT_DIR, 'package.json');
    assert.strictEqual(pdfModule.findBrowserBinary('linux', { CHROME_PATH: pkgPath }), pkgPath);
    assert.strictEqual(pdfModule.findBrowserBinary('linux', {}, () => pkgPath), pkgPath);
    assert.strictEqual(pdfModule.findBrowserBinary('linux', {}, () => { throw new Error('missing'); }), null);
    const winResult = pdfModule.findBrowserBinary('win32', {});
    assert.ok(winResult === null || typeof winResult === 'string');

    assert.throws(
      () => pdfModule.generatePdf(path.join(ROOT_DIR, 'dist', 'test.pdf'), { inputHtml: path.join(ROOT_DIR, 'brak.html') }),
      /Plik źródłowy HTML nie istnieje/
    );
    assert.throws(
      () => pdfModule.generatePdf(path.join(ROOT_DIR, 'dist', 'test.pdf'), { browser: null }),
      /Nie znaleziono silnika Chromium/
    );
  });

  it('standard Asystenta AI (assets/js/ai-widget.js, docs/AI_KNOWLEDGE_TEMPLATE.md oraz test jednostkowy) powinien istnieć i nie zawierać kluczy API (ISO 27001)', () => {
    const widgetPath = path.join(ROOT_DIR, 'assets', 'js', 'ai-widget.js');
    const templatePath = path.join(ROOT_DIR, 'docs', 'AI_KNOWLEDGE_TEMPLATE.md');
    const testPath = path.join(ROOT_DIR, 'tests', 'unit', 'ai-widget.test.js');

    assert.ok(fs.existsSync(widgetPath), 'Brak assets/js/ai-widget.js');
    assert.ok(fs.existsSync(templatePath), 'Brak docs/AI_KNOWLEDGE_TEMPLATE.md');
    assert.ok(fs.existsSync(testPath), 'Brak tests/unit/ai-widget.test.js');

    const widgetCode = fs.readFileSync(widgetPath, 'utf-8');
    assert.ok(widgetCode.includes('https://ai.twojastronawww.pl/chat-router.php'), 'Widget AI musi wskazywać na centralny VPS AI Router');
    assert.strictEqual(/AIzaSy|gsk_|sk-or-v1-/i.test(widgetCode), false, 'Widget frontendowy nie może zawierać zahardkodowanych kluczy API');
  });
});
