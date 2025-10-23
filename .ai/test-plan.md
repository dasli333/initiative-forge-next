# Plan Testów dla Aplikacji "Initiative Forge"

## 1. Wprowadzenie i Cele Testowania

### 1.1 Wprowadzenie
Niniejszy dokument przedstawia kompleksowy plan testów dla aplikacji internetowej "Initiative Forge", narzędzia do zarządzania kampaniami i starciami w grze Dungeons & Dragons 5e. Plan ten został opracowany w oparciu o analizę dostarczonego kodu źródłowego, architektury projektu oraz specyfikacji technologicznej. Jego celem jest zapewnienie systematycznego podejścia do weryfikacji jakości, funkcjonalności, wydajności i bezpieczeństwa aplikacji.

### 1.2 Cele Testowania
Główne cele procesu testowania to:
*   **Weryfikacja funkcjonalności MVP:** Zapewnienie, że wszystkie funkcje zdefiniowane w `Project Scope` działają zgodnie z założeniami.
*   **Zapewnienie stabilności i niezawodności:** Identyfikacja i eliminacja błędów, które mogłyby zakłócić płynność rozgrywki, w szczególności w krytycznym Module Walki.
*   **Walidacja kryteriów sukcesu:** Sprawdzenie, czy aplikacja spełnia zdefiniowane metryki, takie jak czas trwania rundy bojowej poniżej 10 minut.
*   **Potwierdzenie jakości kodu:** Upewnienie się, że aplikacja jest zbudowana zgodnie z dobrymi praktykami, jest łatwa w utrzymaniu i skalowalna.
*   **Zapewnienie dobrego doświadczenia użytkownika (UX):** Weryfikacja, czy interfejs jest intuicyjny, responsywny i dostępny.

## 2. Zakres Testów

### 2.1 Funkcjonalności w Zakresie Testów (In-Scope)
Testy obejmą wszystkie funkcjonalności zdefiniowane jako MVP w pliku `README.md`:
*   **Zarządzanie Użytkownikami:** Rejestracja, logowanie, obsługa sesji.
*   **Zarządzanie Kampaniami:** Tworzenie, edycja, usuwanie i wyświetlanie kampanii.
*   **Zarządzanie Postaciami Graczy:** Tworzenie, edycja i usuwanie uproszczonych kart postaci w ramach kampanii.
*   **Globalne Biblioteki:** Wyszukiwanie i filtrowanie potworów oraz czarów z danych SRD.
*   **Moduł Walki:**
    *   Tworzenie starć za pomocą kreatora.
    *   Dodawanie postaci, potworów i NPC.
    *   Automatyczne rzuty na inicjatywę (w tym z utrudnieniem/ułatwieniem).
    *   Śledzenie kolejności tur.
    *   Zarządzanie punktami życia (zadawanie obrażeń, leczenie).
    *   Zarządzanie kondycjami (nakładanie, usuwanie).
    *   Wykonywanie akcji z automatycznymi rzutami na atak i obrażenia.

### 2.2 Funkcjonalności Poza Zakresem Testów (Out-of-Scope)
Testy w tej fazie **nie obejmą** funkcjonalności zdefiniowanych jako "Out of Scope (MVP)":
*   Biblioteka magicznych przedmiotów.
*   Zaawansowane notatki sesyjne.
*   Automatyczny zapis stanu walki po każdej turze.
*   Pełne karty postaci (ekwipunek, umiejętności, tło fabularne).

## 3. Typy Testów

W projekcie zostaną przeprowadzone następujące rodzaje testów:

*   **Testy Jednostkowe (Unit Tests):**
    *   **Cel:** Weryfikacja poprawności działania pojedynczych funkcji, hooków i logiki biznesowej w izolacji.
    *   **Zakres:** Funkcje pomocnicze (`/lib/dice.ts`, `/lib/utils.ts`), customowe hooki Reacta (`/src/components/characters/hooks/useCharacterCalculations.ts`), logika store'ów Zustand (`/src/stores/useCombatStore.ts`).

*   **Testy Komponentów (Component Tests):**
    *   **Cel:** Sprawdzenie, czy poszczególne komponenty React (`.tsx`) renderują się poprawnie i reagują na interakcje użytkownika.
    *   **Zakres:** Komponenty UI z biblioteki Shadcn, komponenty formularzy (`CharacterForm.tsx`), interaktywne elementy modułu walki (`HPControls.tsx`, `ConditionBadge.tsx`).

*   **Testy Integracyjne (Integration Tests):**
    *   **Cel:** Weryfikacja współpracy kilku komponentów lub modułów.
    *   **Zakres:** Całe formularze (np. kreator walki), interakcja między listą inicjatywy a kartą aktywnej postaci, działanie filtrowania w bibliotekach.

*   **Testy End-to-End (E2E):**
    *   **Cel:** Symulacja pełnych ścieżek użytkownika w działającej aplikacji, weryfikacja kluczowych przepływów danych od interfejsu po bazę danych.
    *   **Zakres:** Pełne scenariusze opisane w sekcji 4.

*   **Testy API:**
    *   **Cel:** Bezpośrednia weryfikacja endpointów API stworzonych w Astro (`/src/pages/api/`).
    *   **Zakres:** Sprawdzenie obsługi różnych metod HTTP, walidacji danych wejściowych, poprawności odpowiedzi i kodów statusu.

*   **Testy Dostępności (Accessibility Tests):**
    *   **Cel:** Zapewnienie, że aplikacja jest użyteczna dla osób z niepełnosprawnościami.
    *   **Zakres:** Automatyczne skany (np. `axe-core`) w ramach testów E2E oraz manualne testy z użyciem czytników ekranu dla kluczowych przepływów.

*   **Testy Wydajnościowe (Manualne):**
    *   **Cel:** Weryfikacja, czy aplikacja spełnia kryteria wydajnościowe.
    *   **Zakres:** Manualne przeprowadzenie starcia z dużą liczbą uczestników (np. 8 postaci, 15 potworów) i pomiar czasu trwania rundy oraz responsywności interfejsu.

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

### 4.1 Uwierzytelnianie
*   **TC-AUTH-01:** Użytkownik może pomyślnie założyć konto i otrzymuje e-mail weryfikacyjny.
*   **TC-AUTH-02:** Użytkownik nie może zalogować się bez weryfikacji e-maila.
*   **TC-AUTH-03:** Użytkownik może pomyślnie zalogować się przy użyciu poprawnych danych.
*   **TC-AUTH-04:** Użytkownik nie może zalogować się przy użyciu niepoprawnych danych.
*   **TC-AUTH-05:** Zalogowany użytkownik jest przekierowywany z `/auth/login` do panelu głównego.
*   **TC-AUTH-06:** Niezalogowany użytkownik próbujący uzyskać dostęp do chronionej trasy jest przekierowywany na stronę logowania.
*   **TC-AUTH-07:** Użytkownik może pomyślnie wylogować się z aplikacji.

### 4.2 Zarządzanie Kampaniami i Postaciami
*   **TC-CMP-01:** Użytkownik może stworzyć nową kampanię, która pojawia się na liście.
*   **TC-CMP-02:** Użytkownik może edytować nazwę istniejącej kampanii.
*   **TC-CMP-03:** Użytkownik może usunąć kampanię wraz z powiązanymi danymi (postaciami, walkami).
*   **TC-CHAR-01:** Użytkownik może dodać nową postać gracza do kampanii, wypełniając wszystkie wymagane pola.
*   **TC-CHAR-02:** Formularz postaci poprawnie waliduje dane wejściowe (np. zakresy wartości dla HP i atrybutów).
*   **TC-CHAR-03:** Inicjatywa i pasywna percepcja są automatycznie obliczane i wyświetlane w formularzu.
*   **TC-CHAR-04:** Użytkownik może edytować istniejącą postać.
*   **TC-CHAR-05:** Użytkownik może usunąć postać z kampanii.

### 4.3 Moduł Walki
*   **TC-CMB-01:** Użytkownik może pomyślnie przejść przez kreator walki, nadając nazwę i wybierając uczestników (PC, potwory, NPC).
*   **TC-CMB-02:** Aplikacja poprawnie dodaje wybraną liczbę instancji tego samego potwora.
*   **TC-CMB-03:** Po uruchomieniu walki, rzut na inicjatywę poprawnie generuje wartości dla wszystkich uczestników i sortuje listę.
*   **TC-CMB-04:** Podświetlenie aktywnego uczestnika poprawnie przechodzi na kolejną postać po kliknięciu "Next Turn".
*   **TC-CMB-05:** Licznik rund inkrementuje się poprawnie po zakończeniu pełnej kolejki.
*   **TC-CMB-06:** Zadawanie obrażeń i leczenie poprawnie aktualizuje HP uczestnika i wizualny pasek postępu.
*   **TC-CMB-07:** HP uczestnika nie może spaść poniżej 0 ani przekroczyć wartości maksymalnej.
*   **TC-CMB-08:** Użytkownik może nałożyć kondycję na uczestnika, która jest widoczna na jego karcie.
*   **TC-CMB-09:** Użytkownik może usunąć nałożoną kondycję.
*   **TC-CMB-10:** Kliknięcie akcji (np. ataku) na karcie aktywnej postaci generuje rzut na atak i obrażenia, a wyniki są wyświetlane w logu rzutów.
*   **TC-CMB-11:** Zmiana trybu rzutu (ułatwienie/utrudnienie) jest uwzględniana przy kolejnych rzutach.

## 5. Środowisko Testowe
*   **Infrastruktura:** Zostanie utworzony dedykowany projekt w Supabase na potrzeby testów automatycznych i manualnych. Klucze API do tego projektu będą przechowywane w sekretach CI/CD.
*   **Dane testowe:** Środowisko testowe będzie regularnie czyszczone i wypełniane zestawem predefiniowanych danych (użytkownicy, kampanie, postacie), aby zapewnić powtarzalność testów.
*   **Przeglądarki:** Testy E2E będą uruchamiane na najnowszych wersjach przeglądarek Google Chrome i Mozilla Firefox.
*   **Wersja Node.js:** Zgodnie z plikiem `.nvmrc` (v22.14.0).

## 6. Narzędzia do Testowania
*   **Framework testowy:** Vitest (dla testów jednostkowych i komponentowych).
*   **Biblioteka do testowania komponentów:** React Testing Library.
*   **Framework do testów E2E:** Playwright.
*   **Automatyzacja (CI/CD):** GitHub Actions (skonfigurowane w projekcie).
*   **Zarządzanie jakością kodu:** ESLint, Prettier (skonfigurowane w projekcie).

## 7. Harmonogram Testów
Testowanie będzie procesem ciągłym, zintegrowanym z cyklem deweloperskim:
*   **Testy jednostkowe i komponentowe:** Pisane przez deweloperów równolegle z implementacją nowych funkcji.
*   **Testy integracyjne i E2E:** Pisane przez inżyniera QA po zakończeniu implementacji większych modułów (np. po ukończeniu kreatora walki).
*   **Uruchamianie testów:** Pełen zestaw testów (jednostkowych, integracyjnych, API) będzie uruchamiany automatycznie w ramach pipeline'u CI/CD przy każdym pushu do gałęzi `main` oraz przy każdym Pull Requeście.
*   **Testy regresji:** Pełen zestaw testów E2E będzie uruchamiany przed każdym wdrożeniem na produkcję.
*   **Testy manualne:** Sesje testów eksploracyjnych będą przeprowadzane przed wydaniem większych aktualizacji.

## 8. Kryteria Akceptacji Testów
Wdrożenie nowej wersji aplikacji na środowisko produkcyjne będzie możliwe po spełnieniu następujących kryteriów:
*   **Kryteria wejścia (rozpoczęcie fazy testów):**
    *   Kod został pomyślnie zintegrowany i zbudowany w środowisku CI.
    *   Wszystkie nowe funkcje zostały zaimplementowane i zgłoszone jako gotowe do testów.
*   **Kryteria wyjścia (zakończenie fazy testów):**
    *   100% testów jednostkowych i integracyjnych w pipeline CI/CD przechodzi pomyślnie.
    *   100% krytycznych scenariuszy testowych E2E przechodzi pomyślnie.
    *   Brak otwartych błędów o priorytecie krytycznym (Blocker) lub wysokim (Critical).
    *   Pokrycie kodu testami jednostkowymi i komponentowymi utrzymuje się na poziomie co najmniej 80%.

## 9. Role i Odpowiedzialności
*   **Deweloperzy:**
    *   Odpowiedzialni za pisanie testów jednostkowych i komponentowych dla tworzonego przez siebie kodu.
    *   Naprawianie błędów zidentyfikowanych w procesie testowania.
    *   Utrzymywanie i dbanie o pipeline CI/CD.
*   **Inżynier QA (autor tego planu):**
    *   Projektowanie i utrzymanie planu testów.
    *   Implementacja i utrzymanie testów integracyjnych, API oraz E2E.
    *   Przeprowadzanie manualnych testów eksploracyjnych i wydajnościowych.
    *   Zarządzanie procesem raportowania błędów i weryfikacja poprawek.
*   **Project Manager / Product Owner:**
    *   Definiowanie priorytetów dla testowanych funkcjonalności.
    *   Podejmowanie ostatecznej decyzji o wdrożeniu na produkcję na podstawie raportów z testów.

## 10. Procedury Raportowania Błędów
Wszystkie zidentyfikowane błędy będą raportowane jako "Issues" w repozytorium GitHub projektu. Każdy raport o błędzie musi zawierać:
*   **Tytuł:** Zwięzły i jednoznaczny opis problemu.
*   **Środowisko:** Wersja aplikacji, przeglądarka, system operacyjny.
*   **Kroki do odtworzenia:** Szczegółowa, numerowana lista kroków prowadzących do wystąpienia błędu.
*   **Wynik oczekiwany:** Opis, jak aplikacja powinna się zachować.
*   **Wynik rzeczywisty:** Opis, jak aplikacja faktycznie się zachowała.
*   **Priorytet:**
    *   **Blocker:** Błąd uniemożliwiający dalsze testowanie lub korzystanie z kluczowej funkcji.
    *   **Critical:** Błąd w kluczowej funkcjonalności, który ma obejście, lub poważny błąd w mniej istotnej funkcji.
    *   **Major:** Błąd powodujący znaczące problemy, ale nie blokujący działania.
    *   **Minor:** Drobny błąd funkcjonalny lub problem z UI.
*   **Załączniki:** Zrzuty ekranu, nagrania wideo lub logi z konsoli.