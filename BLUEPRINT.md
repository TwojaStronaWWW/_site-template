# ENTERPRISE WEB PLATFORM BLUEPRINT & RUNBOOK
## Nowoczesny standard inżynieryjny, testów jednostkowych, bezpieczeństwa i CI/CD dla platformy TwojaStronaWWW

Niniejszy dokument stanowi kompletny, ustandaryzowany przewodnik po architekturze serwisów internetowych realizowanych w ekosystemie **TwojaStronaWWW**. Definiuje standardy produkcyjne: natywne testy jednostkowe (`node:test`), audyt Lighthouse CI, ochronę pre-commit hookami, rygor bezpieczeństwa danych ISO 27001 (PHP Flat-File CRM), integrację z Cloudflare oraz 3-etapowy potok wdrożeniowy CI/CD na serwery LH.

---

## SPIS TREŚCI
1. [Filozofia architektury: Platform-First, Zero-Bloat i automatyzacja](#1-filozofia-architektury-platform-first-zero-bloat-i-automatyzacja)
2. [ETAP 1: Standard struktury projektu i komponentów bazowych](#2-etap-1-standard-struktury-projektu-i-komponentów-bazowych)
   - [2.1 Uniwersalna struktura katalogów](#21-uniwersalna-struktura-katalogów)
   - [2.2 Uniwersalny `package.json`](#22-uniwersalny-packagejson)
   - [2.3 Wbudowany silnik testów jednostkowych (`node:test`)](#23-wbudowany-silnik-testów-jednostkowych-nodetest)
   - [2.4 Ochrona pre-commit hook (`.githooks/pre-commit`)](#24-ochrona-pre-commit-hook-githookspre-commit)
   - [2.5 Konfiguracja audytu Lighthouse CI (`.lighthouserc.json`)](#25-konfiguracja-audytu-lighthouse-ci-lighthousercjson)
   - [2.6 Automatyzacja aktualizacji akcji (`.github/dependabot.yml`)](#26-automatyzacja-aktualizacji-akcji-githubdependabotyml)
   - [2.7 Potok wdrożeniowy CI/CD (`.github/workflows/deploy-production.yml`)](#27-potok-wdrożeniowy-cicd-githubworkflowsdeploy-productionyml)
   - [2.8 Standardy SEO i PWA (`robots.txt`, `sitemap.xml`, `site.webmanifest`)](#28-standardy-seo-i-pwa-robotstxt-sitemapxml-sitewebmanifest)
3. [ETAP 2: Procedura wdrożeniowa krok po kroku (Runbook)](#3-etap-2-procedura-wdrożeniowa-krok-po-kroku-runbook)
   - [Krok 1: Utworzenie i inicjalizacja repozytorium](#krok-1-utworzenie-i-inicjalizacja-repozytorium)
   - [Krok 2: Konfiguracja zmiennych środowiskowych i sekretów](#krok-2-konfiguracja-zmiennych-środowiskowych-i-sekretów)
   - [Krok 3: Dostosowanie testu spójności HTML (`html-integrity.test.js`)](#krok-3-dostosowanie-testu-spójności-html-html-integritytestjs)
   - [Krok 4: Pokrycie logiki JavaScript testami UI (`main.test.js`, `ai-widget.test.js`)](#krok-4-pokrycie-logiki-javascript-testami-ui-maintestjs-ai-widgettestjs)
   - [Krok 5: Aktualizacja i publikacja SEO (`robots.txt`, `sitemap.xml`)](#krok-5-aktualizacja-i-publikacja-seo-robotstxt-sitemapxml)
   - [Krok 6: (Opcjonalnie) Generator PDF dla ofert, cenników lub portfolio](#krok-6-opcjonalnie-generator-pdf-dla-ofert-cenników-lub-portfolio)
   - [Krok 7: Lokalna weryfikacja i pre-commit](#krok-7-lokalna-weryfikacja-i-pre-commit)
   - [Krok 8: Wypchnięcie kodu na Staging i Production](#krok-8-wypchnięcie-kodu-na-staging-i-production)
   - [Krok 9: Bezpieczny moduł pozyskiwania leadów i formularza kontaktowego (PHP Flat-File CRM)](#krok-9-bezpieczny-moduł-pozyskiwania-leadów-i-formularza-kontaktowego-php-flat-file-crm)
   - [Krok 10: Standard konfiguracji Cloudflare & automatyczny Purge Cache (CDN / DNS)](#krok-10-standard-konfiguracji-cloudflare--automatyczny-purge-cache-cdn--dns)
   - [Krok 11: Architektura Multi-Site / Subdomain / Monorepo & Pre-Deploy Remote Backup](#krok-11-architektura-multi-site--subdomain--monorepo--pre-deploy-remote-backup)
   - [Krok 12: Zaawansowana mitygacja botów i ochrona formularzy (Multi-Layer Bot Mitigation)](#krok-12-zaawansowana-mitygacja-botów-i-ochrona-formularzy-multi-layer-bot-mitigation)
   - [Krok 13: Natywna walidacja schematów danych (JSON & Markdown) w node:test](#krok-13-natywna-walidacja-schematów-danych-json--markdown-w-nodetest)
   - [Krok 14: Natywne Web Audio i MediaSession API (Lockscreen Controls)](#krok-14-natywne-web-audio-i-mediasession-api-lockscreen-controls)
   - [Krok 15: Zero-Dependency Link & Asset Integrity Checker w potoku CI](#krok-15-zero-dependency-link--asset-integrity-checker-w-potoku-ci)
   - [Krok 16: Błyskawiczny Podgląd Krawędziowy (Cloudflare Quick Tunnel)](#krok-16-błyskawiczny-podgląd-krawędziowy-cloudflare-quick-tunnel)
   - [Krok 17: Środowisko Lokalne Docker (PHP 8.3 Full-Stack Parity)](#krok-17-środowisko-lokalne-docker-php-83-full-stack-parity)
   - [Krok 18: Rejestracja w Centralnym Monitoringu VPS (Uptime Kuma & Ntfy)](#krok-18-rejestracja-w-centralnym-monitoringu-vps-uptime-kuma--ntfy)
   - [Krok 19: Wdrożenie Asystenta AI z Bazą Wiedzy Firmy (Obszar 3 RAG & Centralny VPS AI Router)](#krok-19-wdrożenie-asystenta-ai-z-bazą-wiedzy-firmy-obszar-3-rag--centralny-vps-ai-router)
   - [Krok 20: Transakcyjna Współbieżność Read-Modify-Write (Anti-TOCTOU), Odblokowanie Sesji PHP i Strażnicy In-Flight](#krok-20-transakcyjna-współbieżność-read-modify-write-anti-toctou-odblokowanie-sesji-php-i-strażnicy-in-flight)
   - [Krok 21: Dwutrybowy Ranking Trafności Wyszukiwania (Search Relevance Ranking vs. A–Z)](#krok-21-dwutrybowy-ranking-trafności-wyszukiwania-search-relevance-ranking-vs-az)

---

## 1. Filozofia architektury: Platform-First, Zero-Bloat i automatyzacja

Tradycyjne projekty frontendowe często cierpią na tzw. *dependency bloat* – instalację setek megabajtów paczek w `node_modules` (Jest, Babel, Webpack, ESLint, Puppeteer), co spowalnia pipeline i stwarza podatności bezpieczeństwa.

W architekturze TwojaStronaWWW przyjęto model Platform-First:
- **0 ciężkich bibliotek testowych:** Natywny silnik `node:test` i asercje `node:assert/strict` wbudowane w Node.js (od wersji 18+).
- **Lekki Mock DOM:** Zamiast pamięciożernego `jsdom` (wymagającego dziesiątek podzależności), stosujemy minimalistyczny `tests/helpers/mock-dom.js`.
- **Wydajność CI/CD:** Cały proces (testy jednostkowe, audyt a11y/SEO i wdrożenie SFTP) zamyka się w **poniżej 60 sekund**.
- **Wczesne wykrywanie błędów:** Lokalny pre-commit hook uniemożliwia zatwierdzenie commita z uszkodzonym HTML-em lub wyciekiem pliku `.env`.

---

## 2. ETAP 1: Standard struktury projektu i komponentów bazowych

W każdym repozytorium platformy wdrożony jest spójny ekosystem narzędziowy.

### 2.1 Uniwersalna struktura katalogów

```plaintext
_site-template/
├── .github/
│   ├── dependabot.yml                  # Automatyczne aktualizacje akcji i npm
│   ├── pull_request_template.md        # Quality gate checklist dla PR
│   ├── ISSUE_TEMPLATE/                 # Szablony zgłoszeń błędów i zadań (bug, task, config)
│   └── workflows/
│       ├── ci.yml                      # Quality Gate + Gitleaks + PHP + node:test + Playwright Smoke + Lighthouse CI
│       ├── dependabot-automerge.yml    # Automatyczne scalanie aktualizacji patch/minor z Dependabota
│       ├── deploy-staging.yml          # Bezpieczny transfer SFTP na staging LH (z Quality Gate)
│       └── deploy-production.yml       # Wdrożenie produkcyjne SFTP + Cloudflare Purge Cache + release tag
├── .githooks/
│   ├── pre-commit                      # Lokalny strażnik jakości (blokada sekretów + npm run check)
│   └── commit-msg                      # Wymuszenie formatu Conventional Commits
├── api/
│   ├── .htaccess                       # Blokada bezpośredniego odczytu plików CSV
│   ├── contact.php                     # Backend formularza (Multi-Honeypot, RODO mask_ip, osTicket + Autoresponder)
│   ├── leads-store.php                 # Atomowy zapis i odczyt leadów CSV (flock LOCK_EX)
│   ├── rate-limit.php                  # Plikowy Rate-Limiter IP z Garbage Collectorem
│   ├── lead_recovery.php               # Endpoint informacyjny o RODO-zgodnym zapisie szkicu w localStorage
│   ├── R2Client.php                    # Natywny klient obiektowy Cloudflare R2 (AWS SigV4 bez zewnętrznego SDK)
│   ├── rate_limits/                    # Pamięć liczników IP rate-limitera (.htaccess: Deny from all)
│   └── sessions/                       # Bezpieczny magazyn sesji PHP (.htaccess: Deny from all)
├── assets/
│   ├── css/
│   │   └── main.css                    # Design System (tokeny :root, RWD, Tabs, Lightbox, Formularz)
│   ├── js/
│   │   ├── main.js                     # Moduły UI: initNavigation, initTabs, initLightbox, initContactForm
│   │   └── ai-widget.js                # Uniwersalny widget Asystenta AI (RAG via VPS, Multi-Turn, XSS-safe)
│   └── img/                            # Zoptymalizowane zasoby graficzne i ikony SVG
├── docs/
│   ├── AI_KNOWLEDGE_TEMPLATE.md        # Szablon bazy wiedzy RAG (<site_id>-knowledge.txt) dla VPS AI Routera
│   └── CLOUDFLARE_STANDARDS.md         # Standard konfiguracji Cloudflare CDN / DNS / R2
├── scripts/
│   ├── serve.js                        # Lokalny serwer developerski w czystym Node.js (ochrona Path Traversal)
│   ├── generate-pdf.js                 # Bezbiblioteczny generator ofert PDF przez Headless Chromium
│   ├── migrate-to-r2.php               # Skrypt CLI do migracji mediów do Cloudflare R2
│   └── preview-tunnel.ps1 / .sh        # Szyfrowany podgląd na żywo przez Cloudflare Quick Tunnel
├── tests/
│   ├── helpers/
│   │   └── mock-dom.js                 # Lekkie środowisko przeglądarki w czystym Node.js (bez jsdom)
│   ├── smoke/
│   │   └── ui-smoke.js                 # Przeglądarkowy test dymny UI (Playwright Chromium)
│   └── unit/
│       ├── ai-widget.test.js           # Testy widgetu AI (ochrona XSS, pamięć rozmowy, fallback offline)
│       ├── css-integrity.test.js       # Testy spójności CSS i zmiennych systemowych
│       ├── html-integrity.test.js      # Weryfikacja struktury HTML5, linków lokalnych i WCAG
│       ├── main.test.js                # Testy interakcji UI (nawigacja, zakładki, lightbox, formularz)
│       └── repo-hygiene.test.js        # Testy rygoru repozytorium, ISO 27001, hooków i CI/CD
├── .editorconfig                       # Standard formatowania kodu w IDE
├── .env.example                        # Wzorzec zmiennych środowiskowych (ISO 27001)
├── .gitattributes                      # Normalizacja końców linii LF
├── .gitignore                          # Ignorowanie sesji, logów, CSV i sekretów (ISO 27001)
├── .gitleaks.toml                      # Reguły skanera wycieków sekretów Gitleaks
├── .htaccess                           # Nagłówki bezpieczeństwa OWASP i blokada plików wrażliwych
├── .htmlhintrc                         # Reguły walidacji statycznej HTML
├── .lighthouserc.json                  # Konfiguracja audytu Lighthouse CI (min. 90% a11y, SEO, BP)
├── docker-compose.yml                  # Lokalne środowisko PHP 8.3 + Apache
├── eslint.config.mjs                   # Konfiguracja reguł statycznej analizy JS (ES2025)
├── sw.js                               # Service Worker (PWA Stale-While-Revalidate)
├── index.html                          # Semantyczny szkielet HTML5
├── robots.txt                          # Konfiguracja indeksowania botów wyszukiwarek
├── sitemap.xml                         # Mapa witryny
├── site.webmanifest                    # Manifest PWA
├── package.json                        # Konfiguracja skryptów npm (zero zbędnych zależności)
├── AGENTS.md / GEMINI.md               # Wytyczne architektoniczne dla asystentów AI
├── BLUEPRINT.md                        # Niniejszy podręcznik architektury i procedur
├── ROADMAP.template.md                 # Szablon rejestru sprintów i wydań
├── SECURITY.md                         # Polityka bezpieczeństwa ISO 27001
└── README.md                           # Dokumentacja projektu i status odznak
```

---

## 3. ETAP 2: Procedura wdrożeniowa krok po kroku (Runbook)

Procedura krok po kroku dla tworzenia nowego projektu lub standaryzacji istniejącej witryny.

### Krok 1: Utworzenie i inicjalizacja repozytorium
1. Zainicjalizuj repozytorium na GitHubie w organizacji `TwojaStronaWWW`.
2. Sklonuj repozytorium na dysk lokalny:
   ```bash
   git clone https://github.com/TwojaStronaWWW/twoj-nowy-projekt.git
   cd twoj-nowy-projekt
   ```
3. Aktywuj lokalne hooki git:
   ```bash
   git config core.hooksPath .githooks
   ```

---

### Krok 2: Konfiguracja zmiennych środowiskowych i sekretów
W ustawieniach repozytorium na GitHubie (`Settings` -> `Secrets and variables` -> `Actions`):

1. **Repository Secrets:**
   - `FTP_SERVER`: adres serwera hostingowego (np. `serwer417204.lh.pl`)
   - `FTP_USERNAME`: login konta SFTP/FTP
   - `FTP_PASSWORD`: bezpieczne hasło do konta
   - `FTP_PORT`: `22` (dla SFTP) lub `21` (dla FTP)
   - `CLOUDFLARE_ZONE`: identyfikator strefy domeny w Cloudflare
   - `CLOUDFLARE_TOKEN`: API Token z uprawnieniem `Zone.Cache Purge`
2. **Repository Variables:**
   - `PRODUCTION_PATH`: podkatalog serwera produkcyjnego (np. `/home/platne/serwer417204/public_html/twojadomena.pl`)
   - `STAGING_PATH`: podkatalog serwera testowego (np. `/home/platne/serwer417204/public_html/dev.twojadomena.pl`)

---

### Krok 3: Dostosowanie testu spójności HTML (`html-integrity.test.js`)
Gdy strona posiada docelową zawartość w plikach HTML (`index.html`, podstrony):
1. Otwórz `tests/unit/html-integrity.test.js`.
2. Dostosuj asercje do specyfiki witryny (poprawne nagłówki H1, atrybuty `alt`, unikalne `id`, dostępność a11y, spójność linków wewnętrznych).

---

### Krok 4: Pokrycie logiki JavaScript testami UI (`main.test.js`, `ai-widget.test.js`)
Dla każdego modułu JavaScript w `assets/js/`:
1. Zdefiniuj testy jednostkowe w `tests/unit/`.
2. Zainicjalizuj środowisko symulujące DOM za pomocą pomocnika `tests/helpers/mock-dom.js`.
3. Przetestuj zdarzenia kliknięć, nawigację mobilną, zakładki, lightbox, dostępność (klawisz Escape, atrybuty `aria-expanded`), formularz kontaktowy (`initContactForm`) oraz widget AI (`ai-widget.js`).

---

### Krok 5: Aktualizacja i publikacja SEO (`robots.txt`, `sitemap.xml`)
1. **W `robots.txt`:** Ustaw właściwy adres domeny produkcyjnej dla mapy witryny oraz upewnij się, że katalogi prywatne (`/api/`) są zablokowane dla botów.
2. **W `sitemap.xml`:** Podmień adresy URL `<loc>` na domenę docelową i zaktualizuj datę `<lastmod>`.
3. **W `site.webmanifest`:** Ustaw nazwę serwisu, kolory motywu i ikony PWA.

---

### Krok 6: (Opcjonalnie) Generator PDF dla ofert, cenników lub portfolio
Jeśli projekt wymaga generowania dokumentów PDF (np. oferta, specyfikacja, cennik):
- Wykorzystaj wbudowany, bezbiblioteczny skrypt `scripts/generate-pdf.js` (`npm run build:pdf`) oparty na lokalnej przeglądarce Chromium/Edge/Chrome Headless.
- Generuj wektorowy plik PDF A4 bezpośrednio z dedykowanego widoku HTML/CSS zoptymalizowanego pod `@media print`.

---

### Krok 7: Lokalna weryfikacja i pre-commit
Przed wysłaniem zmian na serwer uruchom pełną weryfikację jakościową:
```bash
npm run check
```
Hook `.githooks/pre-commit` automatycznie zweryfikuje składnię JS, zgodność PHP, testy jednostkowe oraz brak plików wrażliwych. Zatwierdź commit w formacie Conventional Commits:
```bash
git add .
git commit -m "feat(seo): skonfigurowanie metadanych i sitemap dla domeny produkcyjnej"
```

---

### Krok 8: Wypchnięcie kodu na Staging i Production
1. **Staging / PR:** Wypchnij branch roboczy lub gałąź `staging`. Potoki `.github/workflows/ci.yml` oraz `.github/workflows/deploy-staging.yml` zweryfikują jakość kodu i wdrożą go na środowisko testowe.
2. **Produkcja:** Po scaleniu do gałęzi `main`, potok `.github/workflows/deploy-production.yml` automatycznie:
   - Zrealizuje pełny Quality Gate (`npm run check`),
   - Prześle zmienione pliki przez SFTP na serwer LH (z wykluczeniem katalogów `tests/`, `scripts/` i plików konfiguracyjnych),
   - Wykona natychmiastowe czyszczenie pamięci podręcznej Cloudflare (Purge Cache API) i utworzy tag wydania.

---

### Krok 9: Bezpieczny moduł pozyskiwania leadów i formularza kontaktowego (PHP Flat-File CRM)
Dla serwisów firmowych wymagających obsługi formularza kontaktowego bez konieczności wdrażania bazy danych:
1. **Architektura Flat-File CSV (`api/leads-store.php`):**
   - Eliminacja ryzyka SQL Injection dzięki zapisowi do plików CSV (`api/leads_YYYY-MM.csv`).
   - Atomowy zapis z blokadą wyłączną `LOCK_EX` (`flock($fp, LOCK_EX)`), gwarantujący integralność danych przy równoległych żądaniach.
2. **Zgodność z RODO / Privacy-by-Design (`api/contact.php`, `api/lead_recovery.php`):**
   - Anonimizacja adresu IP funkcją `mask_ip()` (zerowanie ostatniego oktetu IPv4/końcówki IPv6) oraz haszowanie SHA-256 przy zapisie leada.
   - Zapis szkicu formularza przed wysłaniem odbywa się wyłącznie lokalnie w przeglądarce użytkownika (`localStorage` w `initContactForm`).
3. **Mitygacja spamu i botów (`api/rate-limit.php`, `api/contact.php`):**
   - Wielopolowy Honeypot, weryfikacja `js_check` oraz pomiar czasu interakcji (`submission_seconds >= 2.5s`).
   - Plikowy Rate-limiter IP z losowym Garbage Collectorem w `api/rate_limits/`.
4. **Zgodność z ISO 27001 (Zero Data Leakage):**
   - W plikach `.htaccess` w katalogach `api/`, `api/sessions/` oraz `api/rate_limits/` bezwzględna blokada odczytu plików CSV i sesji (`Deny from all`).
   - W pliku `.gitignore` reguły wykluczające: `api/sessions/*`, `api/rate_limits/*.json`, `api/leads_*.csv` oraz `*.log`.

---

### Krok 10: Standard konfiguracji Cloudflare & automatyczny Purge Cache (CDN / DNS)
Dla witryn korzystających z ochrony i przyspieszania Cloudflare CDN/Proxy:
1. **Wzorzec parametrów DNS i SSL/TLS:**
   - Pełna specyfikacja parametrów znajduje się w dedykowanym dokumencie: [`docs/CLOUDFLARE_STANDARDS.md`](docs/CLOUDFLARE_STANDARDS.md).
   - SSL/TLS Encryption Mode: **Full** (lub Full Strict) — zakaz Flexible.
   - Always Use HTTPS: **ON**, Min TLS Version: **1.2**, TLS 1.3: **ON**, HTTP/3 (QUIC): **ON**.
   - Speed Brain: **ON**, Rocket Loader: **OFF** (dla maksymalnej stabilności czystego Vanilla JS).
2. **Automatyczny Purge Cache w CI/CD:**
   - Dodaj w GitHub Secrets: `CLOUDFLARE_ZONE` oraz `CLOUDFLARE_TOKEN`.
   - Potok `deploy-production.yml` automatycznie odświeży pamięć podręczną krawędzi Cloudflare zaraz po pomyślnym transferze SFTP na hosting.
3. **Prawidłowy odczyt IP w PHP:**
   - Odczytuj prawdziwe IP użytkownika za pośrednictwem nagłówka Cloudflare:
     ```php
     $clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'];
     ```
4. **Domyślny standard przechowywania mediów: Cloudflare R2 (Zero-Bloat Media):**
   - Repozytorium Git służy wyłącznie do wersjonowania kodu (zakaz trzymania wielomegabajtowych plików graficznych i wideo w Git).
   - Zdjęcia i pliki multimedialne przechowywane są w dedykowanym zasobniku Cloudflare R2 (`<projekt>-media`) i serwowane z subdomeny `https://media.twojadomena.pl/`.
   - Do komunikacji z bucketem służy natywny, bezbiblioteczny klient `api/R2Client.php` (AWS SigV4) oraz skrypt migracyjny `scripts/migrate-to-r2.php` (`npm run media:r2`).


---

### Krok 11: Architektura Multi-Site / Subdomain / Monorepo & Pre-Deploy Remote Backup
Dla projektów łączących wiele powiązanych portali lub subdomen w jednym repozytorium (wzorowane na Kato Salsa Hub & DancePuls):
1. **Separacja katalogów i routing lokalny:**
   - Każda aplikacja/portal znajduje się w dedykowanym katalogu (np. `portal.pl/` oraz `subdomain.pl/`).
   - Wbudowany serwer deweloperski `scripts/serve.js` obsługuje routing do obu witryn na jednym porcie (np. `http://localhost:3000/` dla portalu głównego i `http://localhost:3000/subdomain/` dla subdomeny) lub na osobnych portach bez zewnętrznych zależności.
2. **Pre-Deploy Snapshot (Zdalny backup przed wdrożeniem):**
   - Zanim potok CI/CD nadpisze pliki na serwerze produkcyjnym, pobierany jest automatyczny snapshot istniejących plików przez SFTP/lftp:
     ```yaml
     - name: Pobierz aktualną wersję z serwera (Snapshot)
       run: |
         sudo apt-get install -y -qq lftp > /dev/null 2>&1
         mkdir -p backup/portal backup/subdomain
         lftp -u "${{ secrets.FTP_USERNAME }}","${{ secrets.FTP_PASSWORD }}" \
           -p 40022 sftp://${{ secrets.FTP_SERVER }} \
           -e "
             set net:timeout 60;
             set sftp:auto-confirm yes;
             mirror --verbose /home/platne/serwer417204/public_html/${{ env.MAIN_PATH }} ./backup/portal;
             mirror --verbose /home/platne/serwer417204/public_html/${{ env.SUB_PATH }} ./backup/subdomain;
             quit
           "
     - name: Zapisz backup jako artefakt
       uses: actions/upload-artifact@v4
       with:
         name: backup-${{ github.ref_name }}-${{ github.run_number }}
         path: backup/
         retention-days: 7
     ```
   - Gwarancja natychmiastowego rollbacku w razie awarii z poziomu zakładki Actions na GitHubie.

---

### Krok 12: Zaawansowana mitygacja botów i ochrona formularzy (Multi-Layer Bot Mitigation)
Wzorzec wypracowany w Kato Salsa Hub i zaimplementowany w `api/contact.php`:
1. **Wielopolowy Honeypot z Cichym Sukcesem (200 OK):**
   - Zamiast jednego pola, boty sprawdzają kilka popularnych nazw (`website_url`, `hp_chk`, `website`, `company_name`, `phone_extra`).
   - Gdy którekolwiek pole zostanie wypełnione, backend zwraca kod 200 OK z komunikatem „Wiadomość wysłana pomyślnie!”. Bot uważa misję za zakończoną i nie ponawia ataku, nie obciążając bazy ani skrzynek pocztowych.
2. **Wymóg wykonania kodu JavaScript w przeglądarce (`js_check`):**
   - Formularz na frontendzie w momencie submitu generuje token `js_check`.
   - Proste curl-boty wysyłające POST bezpośrednio na endpoint bez renderowania i wykonania JS są natychmiast ignorowane.
3. **Pomiar czasu interakcji (`submission_seconds >= 2.5s`):**
   - Człowiek fizycznie potrzebuje co najmniej 3-5 sekund na przeczytanie i wypełnienie pól.
   - Formularz mierzy czas od otwarcia/pierwszej interakcji do kliknięcia wyślij. Zgłoszenia poniżej 2.5 sekundy są odrzucane.
4. **Filtry antyspamowe treści:**
   - Wykrywanie niepożądanego alfabetu (np. `preg_match('/\p{Cyrillic}/u', $message)`).
   - Ograniczenie liczby linków URL w wiadomości (`preg_match_all('/https?:\/\//i', $message) > 2`).
5. **Hybrydowa integracja zgłoszeń (Helpdesk API / Email Fallback & Autoresponder):**
   - Bezpośrednie wysyłanie zgłoszenia do wewnętrznego API osTicket / Helpdesku, fallback do wiadomości e-mail oraz automatyczne potwierdzenie dla klienta.

---

### Krok 13: Natywna walidacja schematów danych (JSON & Markdown) w node:test
Dla projektów przechowujących bazy wiedzy, wydarzeń lub słowników w plikach JSON i Markdown:
1. **Walidacja spójności bez zewnętrznych bibliotek:**
   - Brak konieczności instalowania bibliotek typu Zod, Yup czy Joi.
   - Weryfikacja struktury tablic, wymaganych kluczy, typów pól i niepustych wartości w dedykowanym teście `tests/unit/data-schema.test.js`:
     ```javascript
     const { describe, it } = require('node:test');
     const assert = require('node:assert/strict');
     const fs = require('node:fs');

     describe('Walidacja schematu danych JSON', () => {
       it('każdy wpis w bazie musi posiadać unikalne ID i wymagane atrybuty', () => {
         const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
         assert.ok(Array.isArray(data) && data.length > 0);
         for (const item of data) {
           assert.ok(item.id && typeof item.id === 'string');
           assert.ok(item.title && typeof item.title === 'string');
         }
       });
     });
     ```
2. **Ochrona przed uszkodzeniem layoutu:** Test uniemożliwia wdrożenie pliku JSON z uszkodzonym formatowaniem lub brakującymi polami.

---

### Krok 14: Natywne Web Audio i MediaSession API (Lockscreen Controls)
Dla aplikacji odtwarzających streaming radiowy, podcasty lub muzykę (wzorowane na Kato Salsa Hub Radio Player):
1. **Platform-First Audio:** Wykorzystanie standardowego elementu `<audio>` z atrybutami dostępności (`aria-label`, stany ARIA).
2. **Integracja z MediaSession API:**
   - Synchronizacja metadanych utworu, okładki, nazwy audycji oraz sterowania z systemem operacyjnym użytkownika:
     ```javascript
     if ('mediaSession' in navigator) {
       navigator.mediaSession.metadata = new MediaMetadata({
         title: 'Kato Salsa Hub Radio',
         artist: 'Salsa, Bachata & Kizomba Live Stream',
         artwork: [
           { src: '/assets/images/radio-cover-512.png', sizes: '512x512', type: 'image/png' }
         ]
       });
       navigator.mediaSession.setActionHandler('play', () => audio.play());
       navigator.mediaSession.setActionHandler('pause', () => audio.pause());
     }
     ```
   - Użytkownik może pauzować i wznawiać odtwarzanie bezpośrednio z ekranu blokady telefonu, paska powiadomień lub smartwatcha.

---

### Krok 15: Zero-Dependency Link & Asset Integrity Checker w potoku CI
1. **Eliminacja błędów 404 w zasobach statycznych:**
   - W potoku CI wykonywany jest skrypt weryfikujący, czy każdy lokalny plik zadeklarowany w tagach `src="..."` oraz `href="..."` fizycznie istnieje w drzewie repozytorium:
     ```bash
     for html_file in $(find . -maxdepth 2 -name "*.html" -not -path "*/node_modules/*"); do
       [ -f "$html_file" ] || continue
       base=$(dirname "$html_file")
       grep -oP '(?:src|href)="(?!https?://|#|javascript:|mailto:|tel:)([^"]+)"' "$html_file" 2>/dev/null | \
       sed 's/.*="\(.*\)"/\1/' | sed 's/?.*//' | \
       while read -r ref; do
         if [ ! -f "$base/$ref" ] && [ ! -d "$base/$ref" ]; then
           echo "❌ BRAK ZASOBU: $html_file → $ref"
           exit 1
         fi
       done
     done
     ```
   - Skrypt natychmiast przerywa build w przypadku literówki w nazwie grafiki, arkusza stylów lub brakującego pliku widoku.

---

### Krok 16: Błyskawiczny Podgląd Krawędziowy (Cloudflare Quick Tunnel)
1. **Zastosowanie:**
   - Prezentacja postępów klientowi oraz weryfikacja responsywności na urządzeniach mobilnych bez konieczności utrzymywania subdomen testowych (`test.nazwa.pl`) ani otwierania portów w routerze.
2. **Uruchomienie:**
   ```bash
   npm run serve
   # W drugim terminalu:
   npm run preview:share
   ```
   - Skrypt `scripts/preview-tunnel.ps1` / `scripts/preview-tunnel.sh` uruchamia kontener `cloudflare/cloudflared` łączący lokalny port `3000` z siecią Cloudflare pod domeną `*.trycloudflare.com`.
   - Zakończenie procesu (`Ctrl+C`) natychmiastowo niszczy tunel.

---

### Krok 17: Środowisko Lokalne Docker (PHP 8.3 Full-Stack Parity)
1. **Zastosowanie:**
   - Weryfikacja formularza `api/contact.php`, mechanizmu rate-limitera oraz reguł `.htaccess` na stacjach roboczych bez zainstalowanego lokalnie PHP lub Apache.
2. **Uruchomienie:**
   ```bash
   npm run dev:docker
   ```
   - Kontener `php:8.3-apache` montuje katalog projektu w `/var/www/html` z włączonymi modułami `rewrite` i `headers`.
   - Środowisko dostępne pod adresem `http://localhost:8080`.

---

### Krok 18: Rejestracja w Centralnym Monitoringu VPS (Uptime Kuma & Ntfy)
1. **Zastosowanie:**
   - Ciągły monitoring dostępności witryny 24/7/365, czasu odpowiedzi oraz ważności certyfikatu SSL.
2. **Procedura:**
   - Po wdrożeniu na serwer produkcyjny, witrynę dopisuje się do skryptu `VPS/scripts/setup-kuma.js` (idempotentna rejestracja monitora HTTP(s) z interwałem 60s i powiadomieniami Ntfy) oraz prezentuje na dashboardzie Grafany **Centrum Monitoringu Stron WWW & Usług** (`uid: uptime-kuma-overview`).

---

### Krok 19: Wdrożenie Asystenta AI z Bazą Wiedzy Firmy (Obszar 3 RAG, Dynamic KB, Response Cache & 1-Klik Lead Extractor v3.0)
Wzorzec wypracowany w **TwojaStronaWWW**, **Fuego Lingua** oraz **Kato Salsa Hub** i scentralizowany w `VPS/services/ai-router`:
1. **Architektura (0,00 PLN / mies., 0 kluczy API na frontendzie):**
   - W sekcji `<head>` witryna definiuje `<link rel="preconnect" href="https://ai.twojastronawww.pl" crossorigin>`, a przed `</body>` ładuje lekki, bezbiblioteczny moduł `assets/js/ai-widget.js` (`<script type="module" src="assets/js/ai-widget.js" data-site-id="twojprojekt" data-title="Asystent Twojej Firmy" data-kb-url="assets/data/knowledge.json"></script>`).
   - Widget wysyła zapytania `POST` (z `AbortController` 9s timeout) wraz z pamięcią rozmowy (`history` do 8 wiadomości z `sessionStorage`), sygnaturą wersji bazy wiedzy (`kb_version`) oraz dynamicznym kontekstem (`dynamic_context`) na adres `https://ai.twojastronawww.pl/chat-router.php`.
2. **Dwupoziomowy Response Cache (Query Cache), Automatyczna Inwalidacja i Ekstrakcja Leadów 1-Klik:**
   - **Cache po stronie przeglądarki (`tsw_ai_cache_<siteId>`):** Gdy użytkownik zadaje to samo pytanie po raz drugi, znormalizowany klucz (`normalizeCacheQuery`) zwraca odpowiedź natychmiast (0 ms) bez ponownego odpytywania modelu AI.
   - **Priorytetowe przechwytywanie telefonów i e-maili (`hasContactPii` $\rightarrow$ Ntfy 1-Klik):** Wiadomości zawierające numer telefonu lub adres e-mail celowo omijają cache przeglądarki i trafiają bezpośrednio do `chat-router.php` na VPS. Router automatycznie wyodrębnia i formatuje numer (`📞 TELEFON: +48 XXX XXX XXX`) oraz e-mail (`✉️ E-MAIL: ...`), umieszczając je bezpośrednio w tytule (`Title:`) i pierwszych dwóch liniach powiadomienia Push w **Ntfy.sh** (z przyciskami 1-Klik `tel:` / `mailto:` oraz opcjonalnym webhookiem `LEAD_WEBHOOK_URL`), zachowując 100% rygor Zero-PII na dysku.
   - **Dynamiczna synchronizacja z bazą wiedzy (np. Salsopedią):** Widget wylicza deterministyczny skrót FNV-1a (`computeKnowledgeVersion`) ze wszystkich wpisów bazy wiedzy. Każda zmiana w bazie wiedzy (dodanie, edycja, weryfikacja lub usunięcie hasła przez `salsopedia:updated` / `updateKnowledgeEntries`) natychmiast unieważnia nieaktualny cache i **automatycznie odświeża odpowiedzi na wcześniej zadane pytania w bieżącej sesji czatu**.
   - **Cache po stronie serwera (`chat-router.php` + `warm-ai-cache.sh`):** Klucz SHA-256 uwzględnia `site_id`, `filemtime`, `kb_version`, `dynamic_context` oraz historię rozmowy (czas odpowiedzi `< 5 ms`).
3. **11-Modelowa Kaskada High-Availability i Cooldown na VPS:**
   - Centralny router na VPS posiada 6 niezależnych kluczy API zarejestrowanych w sejfie **KeePass** (`Databasekpoczatek.kdbx` $\rightarrow$ `VPS - TwojaStronaWWW`): `GEMINI_API_KEY`, `GROQ_API_KEY`, `CEREBRAS_API_KEY`, `CF_AI_API_TOKEN`, `OPENROUTER_API_KEY` oraz `ANTHROPIC_API_KEY`.
   - W razie limitu (`429`), przeciążenia (`503`) lub ucięcia odpowiedzi (`MAX_TOKENS`), router automatycznie przełącza zapytanie przez 11 modeli (`gemini-3.5-flash` $\rightarrow$ `gemini-3.5-flash-lite` $\rightarrow$ `gemini-3.7-flash` $\rightarrow$ `gemini-3.8-flash` $\rightarrow$ `gemma-4-31b-it` $\rightarrow$ `groq/gpt-oss-120b` $\rightarrow$ `cerebras/gpt-oss-120b` $\rightarrow$ `cerebras/qwen-3.8-27b` $\rightarrow$ `cloudflare/llama-3.3-70b` $\rightarrow$ `openrouter/nemotron-3-super-120b:free` $\rightarrow$ `anthropic/claude-haiku-4-5`) i nakłada tymczasowy cooldown na przeciążony model (`ai-stats.php`).
4. **Przygotowanie Bazy Wiedzy RAG dla Nowego Klienta:**
   - Skopiuj szablon `docs/AI_KNOWLEDGE_TEMPLATE.md` do repozytorium `VPS/services/ai-router/data/<site_id>-knowledge.txt`.
   - Uzupełnij cennik, ofertę, proces współpracy oraz sekcję **Guardrails (Twarde Reguły Anty-Halucynacyjne)** określającą, jakich usług firma nie świadczy i kiedy odsyłać do kontaktu bezpośredniego.
   - Dopisz domenę produkcyjną witryny do zmiennej `ALLOWED_ORIGINS` w `/opt/devops-stack/.env` na serwerze VPS oraz pytania startowe do `VPS/scripts/warm-ai-cache.sh`.
5. **Bezpieczeństwo XSS, Zero-Downtime Fallback i Obserwowalność:**
   - Odpowiedzi na frontendzie są parsowane przez `formatMarkdown()` (escapowanie `& < > " '` przed renderowaniem pogrubień, list i linków).
   - W razie braku internetu po stronie klienta lub chwilowej niedostępności sieci, widget automatycznie odpowiada z lokalnej funkcji `getLocalFallbackAnswer()` połączonej z wyszukiwarką `searchKnowledgeEntries()`.
   - Ruch, trafienia w Cache RAG, pozyskane leady (`ai_router_leads_total`), latencja `p50`/`p95`, wykorzystanie modeli i powody odrzuceń są monitorowane w czasie rzeczywistym na dashboardzie Grafany **AI Router - Gemini Proxy Monitor** (`uid: ai-router-overview`, bez logowania treści pytań ani adresów IP zgodnie z ISO 27001).

---

### Krok 20: Transakcyjna Współbieżność Read-Modify-Write (Anti-TOCTOU), Odblokowanie Sesji PHP i Strażnicy In-Flight
Wzorzec wypracowany w **Kato Salsa Hub** i wbudowany w `api/leads-store.php` oraz `assets/js/main.js`:
1. **Eliminacja luki TOCTOU (Lost Update) przy operacjach Read-Modify-Write w PHP (`update_json_file`):**
   - Rozdzielenie odczytu (`read_json_file` z `LOCK_SH`) i zapisu (`save_json_file` z `LOCK_EX`) otwiera okno wyścigu: gdy dwóch użytkowników lub moderatorów zapisze zmianę w tej samej milisekundzie, drugi proces nadpisze plik stanem sprzed modyfikacji pierwszego.
   - Wszystkie mutacje plików JSON muszą korzystać z funkcji `update_json_file(string $file, callable $mutator, bool $purgeCache = true)`, która utrzymuje **jedną nieprzerwaną blokadę wyłączną `flock($fp, LOCK_EX)`** na cały cykl:
     `fopen('c+b') -> flock(LOCK_EX) -> stream_get_contents -> $mutator($data) -> kopia .bak -> ftruncate(0) -> fwrite -> fflush -> flock(LOCK_UN)`.
2. **Sprawdzanie rozmiaru nowego pliku CSV wewnątrz sekcji krytycznej `LOCK_EX`:**
   - W funkcji `save_lead()` sprawdzenie, czy plik CSV wymaga dopisania wiersza nagłówkowego (`clearstatcache` + `fstat($fp)['size'] === 0`), odbywa się wyłącznie **po** założeniu `flock($fp, LOCK_EX)`, co wyklucza duplikację nagłówka CSV przy równoczesnych zgłoszeniach na początku miesiąca.
3. **Wczesne zwalnianie blokady sesji PHP (`@session_write_close()`):**
   - Domyślny mechanizm sesji PHP blokuje plik sesji do końca skryptu. W każdym endpoincie korzystającym z `session_start()` należy wywołać `@session_write_close()` natychmiast po odczytaniu/zapisaniu `$_SESSION`, zanim skrypt przejdzie do operacji plikowych lub wywołań sieciowych cURL (np. osTicket / Webhooki).
4. **Izolacja PID przy zapisach atomowych w Node.js (`writeFileAtomically`):**
   - Przy generowaniu plików JSON/MD w skryptach Node.js nazwa pliku tymczasowego musi zawierać unikalny sufiks procesu i czasu (`${filePath}.${process.pid}.${Date.now()}.${rand}.tmp`) przed atomowym `fs.renameSync()`.
5. **Strażnicy In-Flight na frontendzie (`inFlightMutations` / `isSubmitting`):**
   - Formularze (`initContactForm`) oraz przyciski akcji moderacyjnych używają blokady *in-flight* (`Set` / flaga `isSubmitting` zwalniana w `finally`), uniemożliwiając wysłanie zduplikowanych żądań `POST` przy podwójnym kliknięciu.
6. **Kolejkowanie wdrożeń i zadań cron w GitHub Actions (`concurrency`):**
   - Potoki wdrożeniowe (`deploy-*.yml`) oraz cykliczne raporty (`weekly-report.yml`) stosują `concurrency` z `cancel-in-progress: false` (kolejkowanie transferów SFTP) oraz wykluczają pliki żywego stanu (`--exclude-glob` dla kolejek moderacji, kont i liczników rate-limitera).

---

### Krok 21: Dwutrybowy Ranking Trafności Wyszukiwania (Search Relevance Ranking vs. A–Z)
Wzorzec UX wypracowany w encyklopedii **Salsopedia** (`katosalsahub.pl`) i udostępniony w `assets/js/main.js` (`computeSearchRelevance`, `sortAndFilterByRelevance`):
1. **Dwa tryby sortowania:**
   - **Tryb przeglądania (gdy pole wyszukiwania jest puste):** Wyniki sortowane są alfabetycznie **A–Z** (`localeCompare(..., 'pl', { sensitivity: 'base' })`), co ułatwia przeglądanie katalogu.
   - **Tryb wyszukiwania (gdy użytkownik wpisze frazę):** Wyniki sortowane są malejąco według punktacji trafności (`computeSearchRelevance`), a kolejność alfabetyczna pełni wyłącznie rolę *tie-breakera* przy równej liczbie punktów.
2. **Hierarchia wag punktowych (`computeSearchRelevance`):**
   - **`100 pkt` — Dokładne dopasowanie tytułu (Exact Title Match):** np. hasło `Timba` dla zapytania `"timba"`.
   - **`90 pkt` — Dokładne dopasowanie głównego członu tytułu (przed nawiasem/ukośnikiem/myślnikiem):** np. `Clave (Rytm)` dla `"clave"` lub `Bongó (Bongosy)` dla `"bongo"`.
   - **`80 pkt` — Dopasowanie prefiksowe tytułu (Prefix Match):** np. `Timbales (Pailas)` dla `"timba"`.
   - **`75 pkt` — Dopasowanie prefiksowe polskiego rdzenia fleksyjnego (`getPolishStem`):** np. `Timbero / Timbera` dla `"timba"`.
   - **`70–60 pkt` — Pełne słowo, podciąg lub odmiana fleksyjna w dalszej części tytułu:** np. `Bombo i Songo Drumset (Perkusja w Timbie)` (`60 pkt`).
   - **`25–20 pkt` — Wystąpienie wyłącznie w treści definicji/opisu lub autorze:** hasła powiązane kontekstowo prezentowane są zawsze **za** wszystkimi trafieniami tytułowymi.

---
*Dokumentacja inżynierska platformy TwojaStronaWWW.*


