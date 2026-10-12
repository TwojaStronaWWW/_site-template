<p align="center">
  <img src="assets/img/favicon.ico" alt="TwojaStronaWWW Logo" width="120" onerror="this.src='favicon.ico'" />
</p>

<h1 align="center">_site-template — Enterprise Web Starter & Blueprint</h1>

<p align="center">
  <strong>Nowoczesny standard jakości, testów jednostkowych i potoków CI/CD dla projektów ekosystemu TwojaStronaWWW.</strong><br>
  Czysty Vanilla Web (HTML5 / CSS3 / ES6+), Zero-Dependency Test Runner, zintegrowany audyt Lighthouse CI i automatyczny deploy SFTP.
</p>

<p align="center">
  <a href="https://github.com/TwojaStronaWWW/_site-template/actions/workflows/ci.yml"><img src="https://github.com/TwojaStronaWWW/_site-template/actions/workflows/ci.yml/badge.svg" alt="CI Quality Gate"></a>
  <img src="https://img.shields.io/badge/Node.js-22%20LTS-brightgreen?logo=node.js&logoColor=white" alt="Node.js 22 LTS">
  <img src="https://img.shields.io/badge/Stack-Vanilla%20HTML5%20%7C%20CSS3%20%7C%20ES6%2B-blue?logo=javascript&logoColor=black" alt="Vanilla Stack">
  <img src="https://img.shields.io/badge/Testy%20Jednostkowe-21%2F21%20(100%25%20PASS)-brightgreen" alt="21 Testów Zaliczone">
  <img src="https://img.shields.io/badge/Pokrycie%20Kodu-%3E85%25-brightgreen" alt="Pokrycie Kodu">
  <img src="https://img.shields.io/badge/Lighthouse-SEO%2090%2B%20%7C%20a11y%2090%2B-orange?logo=lighthouse" alt="Lighthouse CI">
  <img src="https://img.shields.io/badge/Licencja-MIT-yellow" alt="Licencja MIT">
</p>

<p align="center">
  <a href="https://github.com/TwojaStronaWWW/_site-template/generate" target="_blank">
    <img src="https://img.shields.io/badge/%E2%9C%A8_U%C5%BBVIJ_TEGO_SZABLONU_(USE_THIS_TEMPLATE)-2ea44f?style=for-the-badge&logo=github&logoColor=white" alt="Użyj szablonu" />
  </a>
</p>

---

## 📸 Podgląd Szablonu

<p align="center">
  <img src="assets/img/preview.png" alt="Podgląd szablonu _site-template" width="850" onerror="this.style.display='none'" style="border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);" />
</p>

---

## 🎯 Czym jest _site-template?

**_site-template** to oficjalny, wzorcowy szablon startowy (GitHub Template) stworzony dla programistów i asystentów AI w organizacji **TwojaStronaWWW**. Został zaprojektowany, aby wyeliminować powtarzalną konfigurację, dług technologiczny i ociężałe zależności przy tworzeniu nowych stron dla klientów.

W architekturze szablonu połączono bezkompromisową szybkość czystego frontendu z inżynierskim rygorem potoków CI/CD wzorowanych na projektach **Gal Anonim** i **Moje-CV**:
- **0 ciężkich bibliotek testowych:** Natywny silnik `node:test` i asercje `node:assert/strict` wbudowane w Node.js 18+ (brak Jesta, Mocha, Babela czy Webpacka).
- **Lekki Mock DOM (`tests/helpers/mock-dom.js`):** Umożliwia testowanie interakcji przeglądarkowych bez instalowania 150 MB paczki `jsdom`.
- **Wydajność CI/CD poniżej 60 sekund:** Cały pipeline (składnia JS, walidacja PHP, testy jednostkowe, audyt Lighthouse CI oraz transfer SFTP) zamyka się w kilkadziesiąt sekund.
- **Wczesne wykrywanie błędów (Pre-commit Hook & Commit-msg):** Fizyczna blokada wycieku plików sekretów (`.env`, `secrets.php`, `.htpasswd`) oraz wymuszenie formatu **Conventional Commits**.

---

## ✨ Kluczowe Możliwości i Architektura

### 📑 Zestawienie Komponentów Szablonu
| Moduł / Plik | Technologia / Narzędzie | Specyfikacja i Gwarancje |
| :--- | :--- | :--- |
| **Szkielet HTML5** (`index.html`) | Semantic HTML5 & WCAG 2.1 | Zgodność ze standardami W3C, poprawny DOCTYPE, meta viewport, single `<h1>`. |
| **System Stylów** (`main.css`) | Vanilla CSS3 & Custom Properties | Reset CSS, responsywny kontener, tokeny kolorów `:root`, obsługa Dark/Light Mode. |
| **Moduł Nawigacji** (`main.js`) | Vanilla JS (ES6+ Modules) | Dostępna nawigacja ARIA (`aria-expanded`), obsługa klawisza `Escape`, focus trap. |
| **Silnik Mock DOM** (`mock-dom.js`) | Pure ESM Mock Environment | Symulacja `window`, `document`, `localStorage`, `classList`, `addEventListener`. |
| **SEO & PWA** | `robots.txt`, `sitemap.xml`, manifest | Uniwersalny `site.webmanifest`, wielorozdzielczy `favicon.ico`, `theme-color`. |

---

## 🏛️ Struktura Katalogów Projektu

```plaintext
_site-template/
├── .github/
│   ├── dependabot.yml              # Automatyczne comiesięczne aktualizacje akcji i npm
│   └── workflows/
│       ├── ci.yml                  # Quality Gate + walidacja PHP + testy + Lighthouse CI
│       ├── deploy-staging.yml      # Bezpieczny transfer SFTP na staging LH (z Quality Gate)
│       └── deploy-production.yml   # Wdrożenie produkcyjne + automatyczny git tag wydania
├── .githooks/
│   ├── pre-commit                  # Lokalny strażnik jakości (blokada .env i npm run check)
│   └── commit-msg                  # Strażnik Conventional Commits (wzorowane na Gal Anonim)
├── assets/
│   ├── css/
│   │   └── main.css                # Responsywny system stylów (reset, zmienne, Dark Mode)
│   ├── js/
│   │   └── main.js                 # Moduł nawigacji i interakcji z obsługą a11y
│   └── img/                        # Zoptymalizowane grafiki i favikony
├── tests/
│   ├── helpers/
│   │   └── mock-dom.js             # Lekki mock przeglądarki w czystym Node.js (bez jsdom)
│   └── unit/
│       ├── html-integrity.test.js  # Weryfikacja struktury HTML5 i standardów WCAG
│       ├── main.test.js            # Uniwersalne testy interakcji UI (ARIA, Escape)
│       └── repo-hygiene.test.js    # Czystość repozytorium (brak konfliktów, hooki, SEO)
├── .gitattributes                  # Normalizacja LF dla skryptów/hooków i obsługa binary
├── .gitignore                      # Ignorowanie node_modules, .env, coverage
├── .lighthouserc.json              # Konfiguracja progów audytu Lighthouse CI
├── AGENTS.md                       # Zasady dla modeli AI (obowiązkowe TDD i Quality Gate)
├── BLUEPRINT.md                    # Szczegółowy manifest architektoniczny szablonu
├── favicon.ico                     # Wielorozdzielczy favicon (16x16, 32x32, 48x48)
├── site.webmanifest                # Manifest PWA (theme-color, standalone)
├── index.html                      # Semantyczny szkielet HTML5 (WCAG 2.1)
├── package.json                    # Konfiguracja skryptów npm (bez frameworków)
├── robots.txt                      # Szablon indeksowania dla botów
├── sitemap.xml                     # Szablon mapy witryny
└── README.md                       # Pełna dokumentacja i runbook
```

---

## 🛡️ Brama Jakości & Testy Jednostkowe (Quality Gate)

Szablon posiada zestaw 21 testów jednostkowych wykonywanych w czasie **< 150 ms**:

| Plik testowy | Zakres Weryfikacji |
| :--- | :--- |
| `tests/unit/html-integrity.test.js` | DOCTYPE, atrybut `lang`, kodowanie UTF-8, meta viewport, title, description, single `<h1>`. |
| `tests/unit/main.test.js` | Moduł nawigacji, przełączanie menu mobilnego, zamykanie klawiszem `Escape`, idempotencja. |
| `tests/unit/repo-hygiene.test.js` | Brak pozostałości po konfliktach gita, poprawność hooków, `.gitattributes`, manifest PWA. |

### Dostępne Komendy npm (`package.json`):

```bash
# 1. Błyskawiczne wykonanie testów jednostkowych
npm test

# 2. Pełny Quality Gate (sprawdzenie składni JS + testy jednostkowe)
npm run check

# 3. Raport pokrycia kodu (Code Coverage)
npm run test:coverage

# 4. Sprawdzenie poprawności składniowej JavaScript
npm run check:syntax

# 5. Automatyczna konfiguracja hooków Gita (.githooks)
npm run prepare

# 6. Tryb developerski TDD z automatycznym odświeżaniem testów
npm run test:watch
```

---

## 🚀 Trójstopniowy Pipeline CI/CD (GitHub Actions)

1. **`ci.yml` (CI & Quality Gate):**
   - Weryfikacja obecności pliku wejściowego (`index.html` lub `index.php`).
   - Skaner wycieków sekretów (`.env`, `secrets.php`, `.htpasswd`).
   - Walidacja składni PHP (jeśli występują pliki `.php`).
   - Weryfikacja składni JavaScript (`npm run check:syntax`).
   - Testy jednostkowe z analizą pokrycia (`npm test`).
   - Audyt jakości **Lighthouse CI** z zapisem artefaktów.
2. **`deploy-staging.yml` (Staging SFTP):**
   - Wymuszenie zaliczenia kroku Quality Gate przed transferem plików.
   - Wdrożenie na serwer testowy pod zmienną `${{ vars.STAGING_PATH }}`.
3. **`deploy-production.yml` (Production SFTP & Release Tag):**
   - Weryfikacja Quality Gate.
   - Wdrożenie produkcyjne pod `${{ vars.PRODUCTION_PATH }}`.
   - Automatyczne wygenerowanie taga wydania `vYYYY.MM.DD-<hash>`.

---

## 🏁 Szybki Start (Instrukcja Krok po Kroku)

### Krok 1: Utworzenie Nowego Projektu
1. Na GitHubie kliknij przycisk **"Use this template"** -> **"Create a new repository"**.
2. Sklonuj nowe repozytorium na dysk:
   ```bash
   git clone https://github.com/TwojaStronaWWW/twoj-nowy-projekt.git
   cd twoj-nowy-projekt
   ```
3. Aktywuj lokalne hooki gita:
   ```bash
   npm run prepare
   ```

### Krok 2: Konfiguracja Sekretów Wdrożeniowych
W ustawieniach repozytorium na GitHubie (`Settings` -> `Secrets and variables` -> `Actions`):
* **Secrets:** `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_PORT` (zwykle 22 dla SFTP).
* **Variables:** `STAGING_PATH` (katalog testowy na serwerze LH), `PRODUCTION_PATH` (katalog produkcyjny na serwerze LH).

### Krok 3: Praca i Wdrożenie
```bash
# Sprawdź jakość kodu przed commitem
npm run check

# Zacommituj zmiany zgodnie z Conventional Commits
git add .
git commit -m "feat(ui): dodaj sekcję cennika i formularz kontaktowy"

# Wypchnij na środowisko testowe
git push origin staging
```

---

## 👥 Autor i Licencja

* **Wdrożenie i Standardy:** [TwojaStronaWWW](https://github.com/TwojaStronaWWW)
* **Architektura & Engineering:** Krzysztof Początek
* **Licencja:** [MIT License](LICENSE)
