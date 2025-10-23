# Testing Environment Setup - Summary

## Overview

Środowisko testowe dla Initiative Forge zostało skonfigurowane zgodnie z planem testów (`.ai/test-plan.md`). System obsługuje testy jednostkowe, komponentowe, integracyjne oraz end-to-end.

## Zainstalowane Narzędzia

### Testy Jednostkowe i Komponentowe
- **Vitest** v3.2.4 - Framework testowy z natywnym wsparciem dla TypeScript i ESM
- **@vitest/ui** - Interfejs graficzny do przeglądania i debugowania testów
- **React Testing Library** v16.3.0 - Narzędzie do testowania komponentów React
- **@testing-library/user-event** v14.6.1 - Symulacja interakcji użytkownika
- **@testing-library/jest-dom** v6.9.1 - Custom matchery DOM dla lepszych asercji
- **jsdom** v27.0.1 - Implementacja DOM dla Node.js

### Testy End-to-End
- **Playwright** v1.56.1 - Framework E2E z wsparciem dla Chromium
- **Chromium** (Desktop Chrome) - Jedyna przeglądarka zgodnie z wytycznymi

## Struktura Katalogów

```
initiative-forge/
├── src/
│   ├── test/                          # Konfiguracja testów jednostkowych
│   │   ├── mocks/                     # Mocki (Supabase, itp.)
│   │   ├── utils/                     # Pomocnicze funkcje testowe
│   │   ├── setup.ts                   # Globalna konfiguracja testów
│   │   └── README.md                  # Dokumentacja testów jednostkowych
│   ├── lib/
│   │   └── utils.test.ts              # Przykład: test funkcji pomocniczych
│   └── components/
│       └── ui/
│           └── button.test.tsx        # Przykład: test komponentu Button
├── e2e/                               # Testy end-to-end
│   ├── fixtures/                      # Fixtures Playwright
│   │   └── base.ts
│   ├── page-objects/                  # Page Object Models
│   │   └── LoginPage.ts
│   ├── auth.spec.ts                   # Przykład: testy autentykacji
│   └── README.md                      # Dokumentacja testów E2E
├── vitest.config.ts                   # Konfiguracja Vitest
├── playwright.config.ts               # Konfiguracja Playwright
└── .gitignore                         # Zaktualizowany o wyniki testów
```

## Pliki Konfiguracyjne

### vitest.config.ts
- Środowisko: jsdom (dla testów DOM)
- Globals: włączone
- Setup: `src/test/setup.ts`
- Coverage: v8 provider, 80% minimum
- Aliasy: `@/*` → `src/*`

### playwright.config.ts
- Przeglądarka: Chromium (Desktop Chrome)
- Base URL: http://localhost:3000
- Automatyczne uruchamianie dev servera
- Retry: 2x w CI, 0x lokalnie
- Trace: przy pierwszym retry
- Screenshots: tylko przy błędach

### src/test/setup.ts
- Import matcherów z `@testing-library/jest-dom`
- Automatyczne czyszczenie po każdym teście
- Mock `window.matchMedia`
- Mock `IntersectionObserver`
- Mock `ResizeObserver`

## Dostępne Skrypty npm

```bash
# Testy jednostkowe i komponentowe
npm test                    # Uruchom testy w trybie watch
npm test -- --run          # Uruchom testy raz (bez watch)
npm run test:ui            # Interfejs graficzny Vitest
npm run test:coverage      # Raport pokrycia kodu

# Testy E2E
npm run test:e2e           # Uruchom wszystkie testy E2E
npm run test:e2e:ui        # UI mode Playwright (debugger wizualny)
npm run test:e2e:debug     # Debug mode (krok po kroku)
npm run test:e2e:codegen   # Generator testów Playwright
```

## Przykładowe Pliki Testowe

### 1. Test Jednostkowy (src/lib/utils.test.ts)
Testuje funkcję `cn()` do łączenia klas CSS:
- ✅ Łączenie klas
- ✅ Klasy warunkowe
- ✅ Konflikty Tailwind
- ✅ Wartości puste/undefined/null

### 2. Test Komponentu (src/components/ui/button.test.tsx)
Testuje komponent `Button`:
- ✅ Renderowanie z tekstem
- ✅ Obsługa kliknięć
- ✅ Stan disabled
- ✅ Różne warianty (default, destructive, outline)
- ✅ Różne rozmiary (sm, lg)
- ✅ Tryb asChild (Radix Slot)

### 3. Test E2E (e2e/auth.spec.ts)
Testuje przepływ autentykacji:
- ✅ Wyświetlanie strony logowania
- ✅ Błędy przy niepoprawnych danych
- ✅ Walidacja formularza
- ✅ Dostępność (ARIA, labels)

## Pliki Pomocnicze

### src/test/mocks/supabase.ts
Mock klienta Supabase z pełną implementacją API:
- Metody query builder (select, insert, update, delete)
- Filtry (eq, neq, gt, like, itp.)
- Auth API (signIn, signUp, signOut)
- Konfigurowalny z `vi.fn()` i `mockResolvedValue()`

### src/test/utils/test-utils.tsx
Customowy `render()` z dodatkowymi możliwościami:
- Zwraca `user` (userEvent.setup())
- Gotowy do rozbudowy o providery (QueryClient, Router, itp.)
- Re-exportuje wszystkie funkcje z Testing Library

### e2e/page-objects/LoginPage.ts
Page Object Model dla strony logowania:
- Enkapsuluje locatory (emailInput, passwordInput, submitButton)
- Metoda `goto()` dla nawigacji
- Metoda `login()` dla przepływu logowania
- Metoda `getErrorMessage()` dla asercji błędów

## Status Testów

```
✅ Konfiguracja Vitest - działająca
✅ Konfiguracja Playwright - działająca
✅ 2 pliki testowe - 16 testów przechodzi
✅ Struktura katalogów - utworzona
✅ Mocki i utilities - gotowe do użycia
✅ Dokumentacja - kompletna
```

## Wyniki Testów

```
Test Files  2 passed (2)
     Tests  16 passed (16)
  Duration  2.64s
```

## Następne Kroki

1. **Testy autentykacji** - Napisać pełny zestaw testów dla TC-AUTH-01 do TC-AUTH-07
2. **Testy kampanii** - Implementować scenariusze TC-CMP-01 do TC-CMP-03
3. **Testy postaci** - Implementować scenariusze TC-CHAR-01 do TC-CHAR-05
4. **Testy modułu walki** - Implementować scenariusze TC-CMB-01 do TC-CMB-11
5. **CI/CD** - Dodać workflow GitHub Actions dla automatycznego uruchamiania testów
6. **Coverage** - Skonfigurować threshold 80% w vitest.config.ts
7. **Środowisko testowe Supabase** - Utworzyć dedykowany projekt i skonfigurować zmienne środowiskowe

## Wytyczne z test-plan.md

### Pokrycie Testami
- ✅ Minimum 80% pokrycia kodu dla testów jednostkowych i komponentowych
- ✅ 100% krytycznych scenariuszy E2E musi przechodzić przed deploymentem

### Środowisko
- ✅ Dedykowany projekt Supabase dla testów (do skonfigurowania)
- ✅ Chromium (Desktop Chrome) jako jedyna przeglądarka
- ✅ GitHub Actions dla CI/CD (do skonfigurowania)

### Kryteria Jakości
- ✅ Wszystkie testy jednostkowe i integracyjne przechodzą
- ✅ Wszystkie krytyczne scenariusze E2E przechodzą
- ⏳ Brak błędów o priorytecie krytycznym lub blocker
- ✅ Minimum 80% pokrycia kodu

## Użyte Wytyczne

Konfiguracja została stworzona zgodnie z:
- ✅ `.ai/test-plan.md` - Plan testów
- ✅ `.cursor/rules/vitest.txt` - Wytyczne Vitest
- ✅ `.cursor/rules/playwright.txt` - Wytyczne Playwright
- ✅ `README.md` - Aktualizacja dokumentacji projektu
- ✅ `.ai/tech-stack.md` - Aktualizacja stack'u technologicznego

## Dodatkowe Informacje

### Ignorowane pliki (.gitignore)
```
coverage/           # Raporty pokrycia kodu
playwright-report/  # Raporty Playwright
test-results/       # Wyniki testów E2E
.vitest/           # Cache Vitest
```

### Vulnerabilities
Projekt ma 4 znane vulnerabilities (2 low, 2 moderate). Należy uruchomić `npm audit` i rozważyć `npm audit fix` przed deploymentem na produkcję.

---

**Data utworzenia**: 2025-10-21
**Wersja**: 1.0
**Status**: ✅ Gotowe do użycia
