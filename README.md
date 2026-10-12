# ENTERPRISE WEB TEMPLATE BLUEPRINT & RUNBOOK
## Nowoczesny standard jakości, testów jednostkowych i CI/CD dla projektów TwojaStronaWWW

[![CI Quality Gate](https://github.com/TwojaStronaWWW/_site-template/actions/workflows/ci.yml/badge.svg)](https://github.com/TwojaStronaWWW/_site-template/actions/workflows/ci.yml)
[![Node.js 22+](https://img.shields.io/badge/node-22%2B-brightgreen.svg)](https://nodejs.org/)
[![Vanilla JS](https://img.shields.io/badge/stack-Vanilla%20HTML%2FCSS%2FJS-blue.svg)](https://developer.mozilla.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Niniejsze repozytorium to oficjalny **szablon startowy (GitHub Template)** dla komercyjnych i wewnętrznych projektów organizacji **TwojaStronaWWW**. Łączy sprawdzone wzorce produkcyjne (testy jednostkowe bez zewnętrznych bibliotek, audyt Lighthouse CI, ochrona pre-commit, SEO) z infrastrukturą wdrożeniową (podział Staging/Production na serwerze LH, automatyczne wersjonowanie i tagowanie wydań).

---

## SPIS TREŚCI
1. [Szybki start (Jak użyć szablonu)](#1-szybki-start-jak-użyć-szablonu)
2. [Filozofia szablonu: Lekkość, zero zbędnych zależności i automatyzacja](#2-filozofia-szablonu)
3. [Zawartość i architektura szablonu](#3-zawartość-i-architektura-szablonu)
   - [3.1 Struktura katalogów](#31-struktura-katalogów)
   - [3.2 Skrypty npm (`package.json`)](#32-skrypty-npm-packagejson)
   - [3.3 Wbudowany silnik testów jednostkowych (`node:test`)](#33-wbudowany-silnik-testów-jednostkowych-nodetest)
   - [3.4 Ochrona pre-commit hook (`.githooks/pre-commit`)](#34-ochrona-pre-commit-hook-githookspre-commit)
   - [3.5 Konfiguracja audytu Lighthouse CI (`.lighthouserc.json`)](#35-konfiguracja-audytu-lighthouse-ci-lighthousercjson)
   - [3.6 Automatyzacja aktualizacji akcji (`.github/dependabot.yml`)](#36-automatyzacja-aktualizacji-akcji-githubdependabotyml)
   - [3.7 Nowoczesny potok `.github/workflows/ci.yml`](#37-nowoczesny-potok-githubworkflowsciyml)
   - [3.8 Szablony bazowe SEO (`robots.txt`, `sitemap.xml`)](#38-szablony-bazowe-seo-robotstxt-sitemapxml)
4. [Procedura krok po kroku (Runbook) – gdy strona jest już gotowa](#4-procedura-krok-po-kroku-runbook-gdy-strona-jest-już-gotowa)
   - [Krok 1: Utworzenie projektu z szablonu](#krok-1-utworzenie-projektu-z-szablonu)
   - [Krok 2: Konfiguracja zmiennych środowiskowych i sekretów](#krok-2-konfiguracja-zmiennych-środowiskowych-i-sekretów)
   - [Krok 3: Dostosowanie testu spójności HTML (`html-integrity.test.js`)](#krok-3-dostosowanie-testu-spójności-html-html-integritytestjs)
   - [Krok 4: Pokrycie logiki JavaScript testami UI (`main.test.js`)](#krok-4-pokrycie-logiki-javascript-testami-ui-maintestjs)
   - [Krok 5: Aktualizacja i publikacja SEO (`robots.txt`, `sitemap.xml`)](#krok-5-aktualizacja-i-publikacja-seo-robotstxt-sitemapxml)
   - [Krok 6: (Opcjonalnie) Generator PDF dla ofert, cenników lub portfolio](#krok-6-opcjonalnie-generator-pdf-dla-ofert-cenników-lub-portfolio)
   - [Krok 7: Lokalna weryfikacja i pre-commit](#krok-7-lokalna-weryfikacja-i-pre-commit)
   - [Krok 8: Wypchnięcie kodu na Staging i Production](#krok-8-wypchnięcie-kodu-na-staging-i-production)

---

## 1. Szybki start (Jak użyć szablonu)

1. Na GitHubie kliknij zielony przycisk **"Use this template"** -> **"Create a new repository"**.
2. Sklonuj nowo utworzone repozytorium na swój dysk:
   ```bash
   git clone https://github.com/TwojaStronaWWW/twoj-nowy-projekt.git
   cd twoj-nowy-projekt
   ```
3. Aktywuj lokalnego strażnika jakości Git Hook:
   ```bash
   git config core.hooksPath .githooks
   ```
4. Uruchom weryfikację testów:
   ```bash
   npm test
   ```

---

## 2. Filozofia szablonu

Tradycyjne projekty frontendowe często cierpią na tzw. *dependency bloat* – instalację setek megabajtów paczek w `node_modules` (Jest, Babel, Webpack, ESLint, jsdom), co spowalnia potok CI/CD i stwarza podatności bezpieczeństwa.

W standardzie TwojaStronaWWW:
- **0 ciężkich bibliotek testowych:** Używamy natywnego silnika `node:test` i asercji `node:assert/strict` wbudowanych w Node.js (od wersji 18+).
- **Lekki Mock DOM:** Zamiast pamięciożernego `jsdom`, stosujemy minimalistyczny, 80-linijkowy `mock-dom.js`.
- **Wydajność CI/CD:** Cały proces (testy jednostkowe, analiza składni, audyt a11y/SEO) wykonuje się w **kilka sekund**.
- **Wczesne wykrywanie błędów:** Lokalny pre-commit hook uniemożliwia zatwierdzenie commita z uszkodzonym HTML-em lub wyciekiem pliku `.env`.

---

## 3. Zawartość i architektura szablonu

### 3.1 Struktura katalogów

```plaintext
_site-template/
├── .github/
│   ├── dependabot.yml              # Automatyczne comiesięczne aktualizacje akcji
│   └── workflows/
│       ├── ci.yml                  # Testy jednostkowe + walidacja PHP + Lighthouse
│       ├── deploy-staging.yml      # Bezpieczny transfer SFTP na staging LH
│       └── deploy-production.yml   # Wdrożenie produkcyjne + automatyczny git tag
├── .githooks/
│   └── pre-commit                  # Lokalny strażnik jakości (uruchamia npm test)
├── assets/
│   ├── css/
│   │   └── main.css                # Responsywny system stylów (reset, zmienne, Dark Mode)
│   ├── js/
│   │   └── main.js                 # Moduł nawigacji i interakcji z obsługą a11y
│   └── img/
├── tests/
│   ├── helpers/
│   │   └── mock-dom.js             # Lekki mock przeglądarki w czystym Node.js
│   └── unit/
│       ├── html-integrity.test.js  # Weryfikacja struktury HTML5 i standardów WCAG
│       └── main.test.js            # Uniwersalne testy interakcji UI (ARIA, Escape)
├── .gitignore                      # Ignorowanie node_modules, .env, coverage
├── .lighthouserc.json              # Konfiguracja progów audytu Lighthouse CI
├── index.html                      # Semantyczny szkielet HTML5 (WCAG 2.1)
├── package.json                    # Konfiguracja skryptów npm (bez frameworków)
├── robots.txt                      # Szablon indeksowania dla botów
├── sitemap.xml                     # Szablon mapy witryny
└── README.md                       # Pełna dokumentacja i runbook
```

---

### 3.2 Skrypty npm (`package.json`)

```json
{
  "name": "site-template",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "node --test tests/unit/*.test.js",
    "test:coverage": "node --test --experimental-test-coverage tests/unit/*.test.js",
    "test:watch": "node --test --watch tests/unit/*.test.js",
    "audit:lighthouse": "lhci autorun"
  },
  "devDependencies": {
    "@lhci/cli": "^0.14.0"
  }
}
```

* **`npm test`**: Błyskawiczne wykonanie testów jednostkowych w czystym Node.js.
* **`npm run test:coverage`**: Generowanie raportu pokrycia linii i gałęzi.
* **`npm run test:watch`**: Tryb developerski automatycznie powtarzający testy przy zapisie pliku.

---

### 3.3 Wbudowany silnik testów jednostkowych (`node:test`)

1. **`tests/helpers/mock-dom.js`**: Symuluje obiekty przeglądarkowe (`window`, `document`, `localStorage`, `matchMedia`, zdarzenia, klasy `classList`) bez konieczności instalowania bibliotek zewnętrznych.
2. **`tests/unit/html-integrity.test.js`**: Bada plik `index.html` pod kątem:
   - Poprawnego `<!DOCTYPE html>` oraz `lang="pl"`.
   - Zdefiniowania kodowania `UTF-8` i znacznika `viewport`.
   - Obecności wartościowego `<title>` i `<meta name="description">`.
   - Zasady dokładnie jednego znacznika `<h1>` per strona.
   - Prawidłowości linków (brak pustych `href="#"`).

---

### 3.4 Ochrona pre-commit hook (`.githooks/pre-commit`)

Automatyczny skrypt Bash w `.githooks/pre-commit`:
1. Skanuje pliki przygotowane do commita (`git diff --cached`) i **blokuje zatwierdzenie, jeśli wykryto plik `.env`**.
2. Odpala `npm test`. W przypadku błędu w testach zatrzymuje proces commitowania.

---

### 3.5 Konfiguracja audytu Lighthouse CI (`.lighthouserc.json`)

Wymusza w potoku CI minimalny wynik **90%** w kategoriach:
- **Accessibility (Dostępność)**
- **Best Practices (Dobre praktyki)**
- **SEO (Optymalizacja wyszukiwarek)**

---

### 3.6 Automatyzacja aktualizacji akcji (`.github/dependabot.yml`)

Dependabot automatycznie raz w miesiącu sprawdza wersje akcji w katalogu `.github/workflows/` (np. `actions/checkout@v4`, `actions/setup-node@v4`) i w razie wydań nowszych wersji zakłada bezpieczny Pull Request.

---

### 3.7 Nowoczesny potok `.github/workflows/ci.yml`

Potok CI uruchamiany na gałęziach `staging` oraz `main`:
1. Sprawdza obecność pliku wejściowego (`index.html` lub `index.php`).
2. Weryfikuje brak wycieku sekretów `.env`.
3. Jeśli w repozytorium znajdują się pliki PHP, waliduje ich składnię poleceniem `php -l`.
4. Konfiguruje Node.js 22 i odpala `npm test -- --experimental-test-coverage`.

---

## 4. Procedura krok po kroku (Runbook) – gdy strona jest już gotowa

Gdy zakodujesz już widoki dla nowego klienta lub nowego projektu, wykonaj tę procedurę:

### Krok 1: Utworzenie projektu z szablonu
Użyj przycisku **"Use this template"**, sklonuj kod i aktywuj pre-commit hook:
```bash
git config core.hooksPath .githooks
```

### Krok 2: Konfiguracja zmiennych środowiskowych i sekretów
W ustawieniach nowego repozytorium na GitHubie (`Settings` -> `Secrets and variables` -> `Actions`):
* **Secrets:** `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_PORT` (port 22 dla SFTP).
* **Variables:** `STAGING_PATH` (katalog testowy na serwerze LH), `PRODUCTION_PATH` (katalog produkcyjny na serwerze LH).

### Krok 3: Dostosowanie testu spójności HTML (`html-integrity.test.js`)
Dopisz asercje specyficzne dla witryny (np. weryfikacja istnienia formularza kontaktowego, atrybutów `alt` w obrazkach czy numerów telefonu).

### Krok 4: Pokrycie logiki JavaScript testami UI (`main.test.js`)
Przetestuj interakcje specyficzne dla projektu (np. menu mobilne, modale, kalkulatory, walidację pól).

### Krok 5: Aktualizacja i publikacja SEO (`robots.txt`, `sitemap.xml`)
* W `robots.txt` zmień `twojadomena.pl` na docelową domenę.
* W `sitemap.xml` podmień adresy URL oraz ustaw dzisiejszą datę w `<lastmod>`.

### Krok 6: (Opcjonalnie) Generator PDF dla ofert, cenników lub portfolio
Jeśli projekt wymaga eksportu PDF, dołącz skrypt Chromium Headless i arkusz `@media print`.

### Krok 7: Lokalna weryfikacja i pre-commit
```bash
npm run test:coverage
git add .
git commit -m "feat: Wdrożenie widoków strony i konfiguracja SEO"
```

### Krok 8: Wypchnięcie kodu na Staging i Production
* **Staging:** `git push origin staging` -> automatyczny deploy na serwer testowy.
* **Produkcja:** `git push origin main` -> automatyczny deploy na domenę główną oraz wygenerowanie taga wydania `vYYYY.MM.DD-<hash>`.

---
*Szablon rozwijany i utrzymywany przez organizację TwojaStronaWWW.*
