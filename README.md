<div align="center">

# 🌐 _site-template
### Oficjalny Standard Inżynieryjny, Testów Jednostkowych i CI/CD dla Platformy TwojaStronaWWW

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22%20LTS-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 22" />
  <img src="https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="Vanilla JS" />
  <img src="https://img.shields.io/badge/CSS3-Custom_Tokens-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/PHP-8+-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP 8" />
  <img src="https://img.shields.io/badge/Tests-node:test-success?style=flat-square&logo=node.js&logoColor=white" alt="Tests" />
  <img src="https://img.shields.io/badge/Lighthouse_CI-90+-FF4E42?style=flat-square&logo=lighthouse&logoColor=white" alt="Lighthouse CI" />
  <img src="https://img.shields.io/badge/Cloudflare-DNS%20%7C%20CDN%20%7C%20Purge-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare" />
  <img src="https://img.shields.io/badge/Security-ISO_27001-blue?style=flat-square" alt="ISO 27001" />
</p>

</div>

---

## 🌟 Czym jest _site-template?

**_site-template** to oficjalny, wzorcowy szablon startowy (GitHub Template) stworzony dla programistów i asystentów AI w ekosystemie **TwojaStronaWWW**. Został zaprojektowany, aby wyeliminować powtarzalną konfigurację, dług technologiczny i ociężałe zależności przy tworzeniu nowych stron dla klientów.

W architekturze szablonu połączono bezkompromisową szybkość czystego frontendu z inżynierskim rygorem potoków CI/CD standardu **TwojaStronaWWW Enterprise Web Platform**:
- **0 ciężkich bibliotek testowych:** Natywny silnik `node:test` i asercje `node:assert/strict` wbudowane w Node.js (brak Jesta, Mocha, Babela czy Webpacka).
- **Lekki Mock DOM (`tests/helpers/mock-dom.js`):** Umożliwia testowanie interakcji przeglądarkowych bez instalowania 150 MB paczki `jsdom`.
- **Integracja Cloudflare CDN & Purge Cache API:** Optymalizacja proxy DNS, ochrona DDoS i automatyczne czyszczenie cache po wdrożeniu produkcyjnym.
- **Bezpieczny backend PHP Flat-File CRM:** Ochrona sesji (`api/sessions/`), rate-limiting (`api/rate_limits/`) z `.htaccess: Deny from all`, honeypot oraz atomowy zapis `LOCK_EX`.
- **Wydajność CI/CD poniżej 60 sekund:** Cały pipeline (składnia JS, walidacja PHP, testy jednostkowe, audyt Lighthouse CI oraz transfer SFTP) zamyka się w kilkadziesiąt sekund.
- **Wczesne wykrywanie błędów (Pre-commit Hook & Commit-msg):** Fizyczna blokada wycieku plików sekretów (`.env`, `secrets.php`, `.htpasswd`) oraz wymuszenie formatu **Conventional Commits**.

---

## 🛠️ Kluczowe Możliwości i Architektura

### 📋 Zestawienie Komponentów Szablonu
| Moduł / Plik | Technologia / Narzędzie | Specyfikacja i Gwarancje |
| :--- | :--- | :--- |
| **Szkielet HTML5** (`index.html`) | Semantic HTML5 & WCAG 2.1 | Zgodność ze standardami W3C, poprawny DOCTYPE, meta viewport, single `<h1>`. |
| **System Stylów** (`main.css`) | Vanilla CSS3 & Custom Properties | Reset CSS, responsywny kontener, tokeny kolorów `:root`, obsługa Dark/Light Mode. |
| **Moduł Nawigacji** (`main.js`) | Vanilla JS (ES6+ Modules) | Dostępna nawigacja ARIA (`aria-expanded`), obsługa klawisza `Escape`, focus trap. |
| **Silnik Mock DOM** (`mock-dom.js`) | Pure ESM Mock Environment | Symulacja `window`, `document`, `localStorage`, `classList`, `addEventListener`. |
| **Backend Flat-File CRM** (`api/`) | PHP 8+ (Zero-DB Flat File) | CSRF, Honeypot antyspamowy, IP z Cloudflare (`HTTP_CF_CONNECTING_IP`), `.htaccess Deny from all`. |
| **Standard Cloudflare** (`docs/`) | Cloudflare CDN & Purge Cache API | Wzorzec DNS/SSL, TLS 1.3, HTTP/3 QUIC, automatyczny purge cache po deployu. |
| **SEO & PWA** | `robots.txt`, `sitemap.xml`, manifest | Uniwersalny `site.webmanifest`, wielorozdzielczy `favicon.ico`, `theme-color`. |

---

## 📐 Struktura Katalogów Projektu

```plaintext
_site-template/
├── .github/
│   ├── dependabot.yml              # Automatyczne comiesięczne aktualizacje akcji i npm
│   ├── pull_request_template.md    # Quality gate checklist dla PR
│   ├── ISSUE_TEMPLATE/             # Szablony zgłoszeń błędów i zadań (bug, task, config)
│   └── workflows/
│       ├── ci.yml                  # Quality Gate + walidacja PHP + testy + Lighthouse CI
│       ├── deploy-staging.yml      # Bezpieczny transfer SFTP na staging LH (z Quality Gate)
│       └── deploy-production.yml   # Wdrożenie produkcyjne + Cloudflare Purge Cache + release tag
├── .githooks/
│   ├── pre-commit                  # Lokalny strażnik jakości (blokada .env i npm run check)
│   └── commit-msg                  # Strażnik formatu Conventional Commits
├── api/
│   ├── rate_limits/                # Pamięć liczników IP rate-limitera (.htaccess: Deny from all)
│   ├── sessions/                   # Bezpieczny magazyn sesji PHP (.htaccess: Deny from all)
│   ├── contact.php                 # Wzorcowy backend formularza (Honeypot, Cloudflare IP, CSRF)
│   └── lead_recovery.php           # Wzorcowy mechanizm ratowania utraconych leadów
├── assets/
│   ├── css/
│   │   └── main.css                # Responsywny system stylów (reset, zmienne, Dark Mode)
│   ├── js/
│   │   └── main.js                 # Moduł nawigacji i interakcji z obsługą a11y
│   └── img/                        # Zoptymalizowane grafiki i favikony
├── docs/
│   └── CLOUDFLARE_STANDARDS.md     # Pełny standard konfiguracji Cloudflare CDN / DNS
├── scripts/
│   └── serve.js                    # Lekki lokalny serwer developerski w czystym Node.js
├── tests/
│   ├── helpers/
│   │   └── mock-dom.js             # Lekki mock przeglądarki w czystym Node.js (bez jsdom)
│   └── unit/
│       ├── html-integrity.test.js  # Weryfikacja struktury HTML5 i standardów WCAG
│       ├── main.test.js            # Uniwersalne testy interakcji UI (ARIA, Escape)
│       └── repo-hygiene.test.js    # Czystość repozytorium, ISO 27001, hooki, SEO, PWA
├── .editorconfig                   # Uniwersalny standard formatowania kodu w IDE
├── .gitattributes                  # Normalizacja LF dla skryptów/hooków i obsługa binary
├── .gitignore                      # Rygor ISO 27001: ignorowanie sesji, logów i danych leadów CSV
├── .lighthouserc.json              # Konfiguracja progów audytu Lighthouse CI (min. 90%)
├── AGENTS.md                       # Zasady dla modeli AI (obowiązkowe TDD i Quality Gate)
├── BLUEPRINT.md                    # Szczegółowy manifest architektoniczny szablonu
├── favicon.ico                     # Wielorozdzielczy favicon (16x16, 32x32, 48x48)
├── site.webmanifest                # Manifest PWA (theme-color, standalone)
├── index.html                      # Semantyczny szkielet HTML5 (WCAG 2.1)
├── package.json                    # Konfiguracja skryptów npm (bez frameworków)
├── robots.txt                      # Szablon indeksowania dla botów
├── sitemap.xml                     # Szablon mapy witryny
├── LICENSE                         # Prawa autorskie TwojaStronaWWW
├── SECURITY.md                     # Polityka bezpieczeństwa ISO 27001 (Responsible Disclosure)
└── README.md                       # Pełna dokumentacja i runbook
```

---

## 🚦 Brama Jakości & Testy Jednostkowe (Quality Gate)

Szablon posiada zestaw 24 testów jednostkowych wykonywanych w czasie **< 200 ms**:

| Plik testowy | Zakres Weryfikacji |
| :--- | :--- |
| `tests/unit/html-integrity.test.js` | DOCTYPE, atrybut `lang`, kodowanie UTF-8, meta viewport, title, description, single `<h1>`. |
| `tests/unit/main.test.js` | Moduł nawigacji, przełączanie menu mobilnego, zamykanie klawiszem `Escape`, idempotencja. |
| `tests/unit/repo-hygiene.test.js` | Bezpieczeństwo ISO 27001 (`.htaccess`, `.gitignore`), hooki gita, `.editorconfig`, SEO, PWA. |

### Dostępne Komendy npm (`package.json`):

```bash
# 1. Błyskawiczne wykonanie testów jednostkowych
npm test

# 2. Pełny Quality Gate (sprawdzenie składni JS + testy jednostkowe)
npm run check

# 3. Raport pokrycia kodu (Code Coverage >= 90%)
npm run test:coverage

# 4. Sprawdzenie poprawności składniowej JavaScript
npm run check:syntax

# 5. Automatyczna konfiguracja hooków Gita (.githooks)
npm run prepare

# 6. Lokalny serwer developerski HTTP (zero-dependency)
npm run serve

# 7. Szyfrowany podgląd na żywo dla klienta przez Cloudflare Quick Tunnel (bez konfiguracji DNS)
npm run preview:share

# 8. Lokalne środowisko full-stack PHP 8.3 + Apache w Dockerze (obsługa formularzy i .htaccess)
npm run dev:docker
```

---

## 🚀 Trójstopniowy Pipeline CI/CD (GitHub Actions)

1. **`ci.yml` (CI & Quality Gate):**
   - Weryfikacja obecności pliku wejściowego (`index.html` lub `index.php`).
   - Skaner wycieków sekretów (`.env`, `secrets.php`, `.htpasswd`).
   - Walidacja składni PHP (`php -l`).
   - Weryfikacja składni JavaScript (`npm run check:syntax`).
   - Testy jednostkowe z analizą pokrycia (`npm test`).
   - Audyt jakości **Lighthouse CI** z progami min. 90% (SEO, a11y, Best Practices).
2. **`deploy-staging.yml` (Staging SFTP):**
   - Wymuszenie zaliczenia kroku Quality Gate przed transferem plików.
   - Wdrożenie na serwer testowy pod zmienną `${{ vars.STAGING_PATH }}`.
3. **`deploy-production.yml` (Production SFTP & Cloudflare Purge Cache):**
   - Weryfikacja Quality Gate i audyt Lighthouse CI.
   - Wdrożenie produkcyjne pod `${{ vars.PRODUCTION_PATH }}`.
   - Automatyczny Purge Cache API na serwerach brzegowych Cloudflare.
   - Automatyczne wygenerowanie taga wydania `vYYYY.MM.DD-<hash>`.

---

## 👥 Autor i Licencja

* **Wdrożenie i Standardy:** [TwojaStronaWWW](https://github.com/TwojaStronaWWW)
* **Architektura & Engineering:** Krzysztof Początek
* **Licencja:** [TwojaStronaWWW Proprietary](LICENSE) (Wszelkie prawa zastrzeżone)

