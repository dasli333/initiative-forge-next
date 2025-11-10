# Dokument wymagań produktu (PRD) - Initiative Forge

## 1. Przegląd produktu

Initiative Forge to aplikacja internetowa zaprojektowana jako centrum dowodzenia dla Mistrzów Gry (DM) prowadzących sesje RPG w systemie Dungeons & Dragons 5e. Celem produktu jest usprawnienie i przyspieszenie zarządzania kampanią, a w szczególności prowadzenia walki, poprzez centralizację kluczowych informacji i automatyzację powtarzalnych zadań. Aplikacja oferuje globalne biblioteki potworów i czarów, system zarządzania kampaniami oraz dedykowany moduł do śledzenia i prowadzenia starć w czasie rzeczywistym. Głównym odbiorcą są Mistrzowe Gry, zwłaszcza ci początkujący, którzy szukają narzędzia ułatwiającego wejście w rolę i odciążającego ich od konieczności wertowania podręczników podczas sesji.

## 2. Problem użytkownika

Prowadzenie sesji D&D 5e, zwłaszcza przez początkujących Mistrzów Gry, wiąże się z szeregiem wyzwań, które mogą spowalniać rozgrywkę i negatywnie wpływać na jej płynność. Główne problemy to:

- Konieczność zarządzania wieloma źródłami informacji jednocześnie (podręczniki, notatki, karty postaci), co jest czasochłonne i rozpraszające.
- Ręczne śledzenie inicjatywy, punktów życia, statusów i kolejności tur dla wielu postaci i potworów podczas walki, co jest podatne na błędy.
- Powolne wyszukiwanie statystyk potworów, opisów czarów czy zasad dotyczących konkretnych stanów (conditions), co wybija graczy i DMa z rytmu gry.
- Brak jednego, dedykowanego miejsca do przechowywania podstawowych danych o kampanii i postaciach graczy, co utrudnia przygotowania do sesji.

Initiative Forge adresuje te problemy, dostarczając zintegrowane, cyfrowe środowisko, które automatyzuje zarządzanie walką i zapewnia natychmiastowy dostęp do niezbędnych danych.

## 3. Wymagania funkcjonalne

Aplikacja w wersji MVP (Minimum Viable Product) będzie posiadała następujące moduły i funkcjonalności:

### 3.1. System Użytkowników

- Użytkownik może założyć konto przy użyciu adresu e-mail i hasła.
- Użytkownik może zalogować się na swoje konto.
- Tylko zalogowany użytkownik ma dostęp do dalszych modułów aplikacji

### 3.2. Zarządzanie Kampanią

- Użytkownik (DM) może stworzyć nową, pustą kampanię, nadając jej nazwę.
- Stworzone kampanie są przypisane do konta zalogowanego użytkownika.
- Użytkownik może dodać do kampanii uproszczone karty postaci graczy.

### 3.3. Karta Postaci Gracza (wersja MVP)

- Karta pozwala na wprowadzenie imienia postaci, maksymalnych punktów życia (HP), klasy pancerza (AC), szybkości poruszania się oraz wartości sześciu głównych atrybutów (Siła, Zręczność, Kondycja, Inteligencja, Mądrość, Charyzma).
- System automatycznie oblicza i wyświetla modyfikator inicjatywy (na podstawie Zręczności) oraz pasywną percepcję (na podstawie Mądrości).

### 3.4. Globalna Biblioteka Potworów

- Aplikacja zawiera przeszukiwalną listę potworów opartą na danych SRD (z dostarczonego pliku JSON).
- Użytkownik może wyszukiwać potwory po nazwie.
- Użytkownik może filtrować listę potworów po Stopniu Wyzwania (CR).
- Biblioteka jest dostępna globalnie, bez konieczności wybierania kampanii.

### 3.5. Globalna Biblioteka Czarów

- Aplikacja zawiera przeszukiwalną listę czarów opartą na danych SRD (z dostarczonego pliku JSON).
- Użytkownik może wyszukiwać czary po nazwie.
- Użytkownik może filtrować listę czarów po poziomie oraz klasie postaci, która może go używać.
- Biblioteka jest dostępna globalnie, bez konieczności wybierania kampanii.

### 3.6. Moduł Walki

- Użytkownik może stworzyć nową walkę w ramach wybranej kampanii.
- Do walki można dodać postacie graczy (z danej kampanii), dowolne potwory (z biblioteki) oraz niezależnych bohaterów (NPC) zdefiniowanych na poczekaniu.
- Możliwość dodania wielu potworów tego samego typu jednym działaniem.
- System automatycznie wykonuje rzuty na inicjatywę dla wszystkich uczestników i sortuje ich w odpowiedniej kolejności.
- Interfejs śledzenia walki jest czytelny, podzielony na trzy kolumny (np. lista inicjatywy, karta aktywnej postaci, panel akcji).
- Dla aktywnej postaci/potwora wyświetlana jest jej karta z listą dostępnych akcji.
- Kliknięcie w akcję (np. atak) powoduje wykonanie odpowiedniego rzutu kością z uwzględnieniem modyfikatorów.
- System obsługuje rzuty normalne, z ułatwieniem (advantage) i utrudnieniem (disadvantage).
- Dedykowane przyciski/pola pozwalają na łatwe zadawanie obrażeń i leczenie uczestników walki.
- Użytkownik może przypisywać postaciom i potworom stany (conditions). Opis każdego stanu jest łatwo dostępny z poziomu interfejsu walki.

### 3.7. Moduł Zarządzania Fabułą (World Building)

Moduł zapewnia kompleksowe narzędzia do budowania i organizowania świata kampanii, umożliwiając DM centralizację wszystkich informacji fabularnych w jednym miejscu.

#### 3.7.1. Lokacje (Locations)

- DM może tworzyć lokacje z nazwą, opisem (rich text), typem (kontynent/królestwo/miasto/budynek/dungeon/inne) oraz opcjonalnym obrazem.
- Lokacje mogą być organizowane hierarchicznie - każda lokacja może mieć lokację nadrzędną (parent location).
- System wyświetla hierarchię lokacji w formie drzewa z nawigacją breadcrumb.
- Opis lokacji obsługuje formatowanie rich text oraz system @mentions.
- Limit rozmiaru obrazu: 5 MB, automatyczna kompresja do formatu WebP.

#### 3.7.2. Postacie Niezależne (NPCs)

- DM może tworzyć NPCs z imieniem, rolą, biografią (rich text), opcjonalnym obrazem, przypisaniem do frakcji i aktualnej lokacji.
- Każdy NPC posiada dual-tab system:
  - **Zakładka Story**: biografia, osobowość, relacje z innymi postaciami (free text), informacje fabularne.
  - **Zakładka Combat (opcjonalna)**: pełne statystyki walki (HP, AC, atrybuty, akcje) - umożliwia użycie NPC jako uczestnika walki.
- System pozwala na śledzenie relacji między NPCs w formie tekstowej (np. "brat", "wróg", "nauczyciel").
- Biografia i notatki obsługują formatowanie rich text oraz @mentions.
- Przycisk "Use in Combat" w zakładce Combat pozwala na dodanie NPC do aktywnej walki.

#### 3.7.3. Zadania (Quests)

- DM może tworzyć questy z tytułem, opisem (rich text), celami (objectives), nagrodami oraz statusem.
- Statusy questów: Not Started, Active, Completed, Failed.
- Quest może być przypisany do Story Arc (wątku fabularnego).
- System umożliwia linkowanie questów z NPCs i lokacjami (@mentions lub explicit relationships).
- Nagrody przechowywane w formacie strukturalnym (gold, items, XP, inne).
- Opis i cele obsługują formatowanie rich text oraz @mentions.

#### 3.7.4. Wątki Fabularne (Story Arcs)

- DM może tworzyć Story Arcs reprezentujące główne lub poboczne wątki fabularne kampanii.
- Story Arc zawiera tytuł, opis (rich text), status (Planning/Active/Completed/Abandoned), opcjonalne daty rozpoczęcia i zakończenia (in-game).
- System pozwala na przypisywanie questów do Story Arc, tworząc łańcuchy zadań.
- Opis obsługuje formatowanie rich text oraz @mentions.

#### 3.7.5. Frakcje (Factions)

- DM może tworzyć frakcje (organizacje, gildie, królestwa) z nazwą, opisem (rich text), celami i opcjonalnym obrazem.
- System umożliwia śledzenie relacji między frakcjami w formie tekstowej (np. "sojusz", "wojna", "rywalizacja", "neutralność").
- NPCs mogą być przypisani do frakcji jako członkowie.
- Frakcje są narzędziem narrative-only, bez mechanik wpływu czy zasobów (może być dodane w przyszłości).
- Opis i cele obsługują formatowanie rich text oraz @mentions.

#### 3.7.6. Notatki Lore

- DM może tworzyć notatki o świecie (Lore Notes) z tytułem, treścią (rich text), kategorią i tagami.
- Kategorie: Historia, Geografia, Religia, Kultura, Magia, Legendy, Inne (customizable).
- System tagów umożliwia elastyczne organizowanie notatek (np. #elfy, #wojna, #bogowie).
- Wyszukiwanie i filtrowanie po tytule, kategorii i tagach.
- Treść obsługuje formatowanie rich text oraz @mentions.

#### 3.7.7. Przedmioty Fabularne (Story Items)

- DM może tworzyć przedmioty fabularne (nie combat equipment) z nazwą, opisem (rich text) i opcjonalnym obrazem.
- System śledzi aktualnego właściciela przedmiotu (NPC, PC, Faction, Location lub "unknown").
- Przedmioty fabularne służą do śledzenia kluczowych artefaktów, dokumentów, klejnotów rodzinnych itp.
- Opis obsługuje formatowanie rich text oraz @mentions.

#### 3.7.8. Oś Czasu (Timeline)

- DM może tworzyć wydarzenia na osi czasu kampanii z tytułem, opisem (rich text), datą in-game (fantasy calendar) i datą rzeczywistą.
- Wydarzenia mogą być powiązane z encjami kampanii (NPCs, locations, quests, etc.) przez @mentions.
- Timeline wyświetla chronologiczny przegląd wydarzeń w kampanii.
- Opis obsługuje formatowanie rich text oraz @mentions.

### 3.8. Moduł Przygotowania Sesji (Session Preparation)

Moduł zapewnia narzędzia do planowania nadchodzącej sesji, umożliwiając DM szybkie przygotowanie i organizację materiałów.

#### 3.8.1. Plan Sesji (Session Plan)

- DM może tworzyć plan sesji z numerem, datą rzeczywistą, datą in-game (opcjonalnie) i tytułem.
- Plan sesji zawiera:
  - Cele sesji (rich text) - co DM chce osiągnąć podczas sesji.
  - Planowane encounters (story encounters i potential combat encounters).
  - Lista NPCs do wprowadzenia - quick links do kart NPCs.
  - Lista lokacji do odwiedzenia - quick links do kart lokacji.
  - Plot points do ujawnienia (lista punktów fabularnych).
  - Prep checklist (TODO list dla DM) - zadania do wykonania przed sesją.
  - Notatki i przypomnienia (rich text).
- Wszystkie pola tekstowe obsługują formatowanie rich text oraz @mentions.
- Status planu: Draft, Ready, In Progress, Completed.

#### 3.8.2. Panel Szybkiego Dostępu (Quick Access Panel)

- DM może "przypinać" encje (NPCs, locations, quests, items) do panelu quick access dla bieżącej sesji.
- Przypięte encje są dostępne jednym kliknięciem podczas sesji.
- Panel wyświetla miniaturowe karty z kluczowymi informacjami.

### 3.9. Dziennik Sesji (Session Journal)

Moduł umożliwia dokumentowanie przeprowadzonych sesji, tworząc historię kampanii dostępną do późniejszego przeglądu.

#### 3.9.1. Log Sesji (Session Log)

- DM może tworzyć wpis dziennika po zakończonej sesji z numerem sesji, datą rzeczywistą i datą in-game.
- Log sesji zawiera:
  - Podsumowanie sesji (rich text z @mentions) - co się wydarzyło podczas sesji.
  - Kluczowe wydarzenia (lista key events).
  - Decyzje postaci graczy i ważne momenty roleplay.
  - Rozdany loot i experience points.
  - Cliffhanger i notatki na następną sesję.
- Wszystkie pola tekstowe obsługują formatowanie rich text oraz @mentions.
- System automatycznie śledzi @mentioned encje w logu.

#### 3.9.2. Integracja z Timeline

- DM może dodawać wydarzenia z session log do osi czasu kampanii (timeline).
- System sugeruje automatyczne dodanie kluczowych wydarzeń z loga do timeline.
- Wydarzenia dodane do timeline zawierają link zwrotny do session log.

### 3.10. System @Mentions i Linkowania Encji

System @mentions umożliwia tworzenie powiązań między encjami kampanii bezpośrednio w treści opisów, tworząc sieć wzajemnie powiązanych informacji.

#### 3.10.1. Funkcjonalność @Mentions

- We wszystkich polach rich text, wpisanie znaku `@` otwiera dropdown z autocomplete.
- Autocomplete wyświetla wszystkie encje kampanii z fuzzy search (inteligentne wyszukiwanie).
- Dostępne typy mentions:
  - `@NPC-name` - link do karty NPC
  - `@Location-name` - link do lokacji
  - `@Quest-name` - link do questa
  - `@Faction-name` - link do frakcji
  - `@Item-name` - link do story item
  - `@Arc-name` - link do story arc
  - `@Session-XX` - link do poprzedniej sesji (np. @Session-05)
- Mentions są renderowane jako kolorowe badges z ikoną typu encji.
- Każdy typ encji ma dedykowany kolor (NPC - niebieski, Location - zielony, Quest - fioletowy, etc.).

#### 3.10.2. Interakcja z Mentions

- **Hover**: najechanie kursorem na mention wyświetla quick preview card z kluczowymi informacjami o encji (miniatura).
- **Click**: kliknięcie na mention nawiguje do pełnej karty encji w nowej zakładce lub w panelu bocznym.
- **Autocomplete**: podczas pisania, system priorytetyzuje recently used entities oraz context-aware suggestions (np. related NPCs dla danej lokacji).

#### 3.10.3. Backlinks (Wsteczne Odnośniki)

- Każda encja automatycznie śledzi wszystkie miejsca, gdzie jest @mentioned.
- W karcie encji wyświetlana jest sekcja "Mentioned In" z listą wszystkich odniesień.
- Lista backlinks zawiera typ źródła (NPC/Quest/Session Log/etc.), nazwę źródła i link do niego.
- Backlinks tworzą dwukierunkowe relacje między encjami automatycznie.

#### 3.10.4. Zarządzanie Mentions

- **Rename Entity**: zmiana nazwy encji automatycznie aktualizuje wszystkie mentions tej encji.
- **Delete Entity**: przed usunięciem encji, system wyświetla ostrzeżenie o istniejących mentions z opcją ich zastąpienia lub usunięcia.
- **Search Integration**: mentions są uwzględniane w globalnym wyszukiwaniu kampanii.

#### 3.10.5. Rich Text Editor - Standard

Wszystkie pola rich text w aplikacji obsługują następujące funkcje:
- Formatowanie tekstu: pogrubienie, kursywa, podkreślenie
- Nagłówki (H1, H2, H3)
- Listy punktowane i numerowane
- Cytaty (blockquotes)
- Bloki kodu
- Tabele
- Linie poziome (horizontal rules)
- Zwykłe linki URL
- Wstawianie obrazów (upload lub paste, max 5 MB)
- **@Mentions** (custom extension)

## 4. Granice produktu

### 4.1. Funkcjonalności w zakresie MVP

Aplikacja w wersji MVP ZAWIERA następujące zaawansowane funkcjonalności:

- **Rich Text Editor** z pełnym formatowaniem (nagłówki, listy, tabele, obrazy, cytaty).
- **System @Mentions** do linkowania encji kampanii bezpośrednio w treści opisów.
- **Upload i zarządzanie obrazami** (max 5 MB per obraz, automatyczna kompresja do WebP).
- **World Building Tools**: lokacje z hierarchią, NPCs z dual-tab (story + combat), questy, story arcs, frakcje, lore notes, story items, timeline.
- **Session Management**: przygotowanie sesji (session plan, quick access panel) i dziennik sesji (session log z integracją timeline).
- **Entity Relationships & Linking**: automatyczne backlinks, relacje między encjami, dwukierunkowe powiązania.
- **Advanced Search**: wyszukiwanie wszystkich encji kampanii z fuzzy search i filtrowaniem.

### 4.2. Funkcjonalności poza zakresem MVP

Następujące funkcjonalności celowo nie wchodzą w zakres wersji MVP:

- **Responsywność mobilna**: aplikacja responsywna dla desktop/tablet, ale bez dedykowanej wersji mobilnej.
- **Biblioteka magicznych przedmiotów** (combat magic items z mechanikami D&D).
- **System automatycznego zapisywania** stanu walki po każdej turze (obecnie manual save).
- **Rozbudowana karta postaci** dla graczy (ekwipunek, umiejętności, historia, tracking progression).
- **Random tables generator** (generatory losowych nazw, plotek, encounters - planowane na przyszłość).
- **Real-time collaboration** (multi-DM, współdzielone kampanie).
- **AI-generated content** (automatyczne generowanie opisów, NPCs, questów).
- **Voice recording/playback** dla sesji.
- **Tactical map drawing tools** (mapy taktyczne, grid, tokens).
- **PDF/Markdown export** kampanii i notatek.
- **Player-facing interface** (aplikacja jest tylko dla DM, nie dla graczy).
- **Automation mechanics** dla frakcji (influence, power, zasoby - obecnie narrative-only).
- **Advanced calendar system** z fazami księżyca, porami roku, świętami (obecnie prosty fantasy calendar).

## 5. Historyjki użytkowników

### Moduł: Uwierzytelnianie i Zarządzanie Kontem

#### ID: US-001

**Tytuł:** Rejestracja nowego użytkownika

**Opis:** Jako nowy użytkownik, chcę móc założyć konto za pomocą adresu e-mail i hasła, aby móc zapisywać swoje kampanie i mieć do nich dostęp w przyszłości.

**Kryteria akceptacji:**

- Formularz rejestracji zawiera pola na adres e-mail, hasło i potwierdzenie hasła.
- System waliduje poprawność formatu adresu e-mail.
- System sprawdza, czy hasła w obu polach są identyczne.
- Po pomyślnej rejestracji, system wysyła email weryfikacyjny na podany adres.
- Użytkownik otrzymuje czytelną informację o konieczności weryfikacji adresu email.
- Po kliknięciu w link weryfikacyjny w emailu, konto użytkownika zostaje aktywowane.
- Użytkownik może zalogować się dopiero po weryfikacji adresu email.
- Jeśli adres e-mail jest już zajęty, system wyświetla czytelny komunikat o błędzie.

#### ID: US-002

**Tytuł:** Logowanie użytkownika

**Opis:** Jako zarejestrowany użytkownik, chcę móc zalogować się na swoje konto, aby uzyskać dostęp do moich kampanii.

**Kryteria akceptacji:**

- Formularz logowania zawiera pola na adres e-mail i hasło.
- Po poprawnym wprowadzeniu danych, użytkownik jest zalogowany i przekierowany do panelu głównego.
- W przypadku podania błędnego e-maila lub hasła, system wyświetla odpowiedni komunikat.
- Jeśli użytkownik nie zweryfikował jeszcze adresu email, system wyświetla odpowiedni komunikat.
- Tylko zalogowany użytkownik ma dostęp do aplikacji

#### ID: US-003

**Tytuł:** Odzyskiwanie hasła

**Opis:** Jako użytkownik, który zapomniał hasła, chcę móc zresetować swoje hasło za pomocą adresu e-mail, aby odzyskać dostęp do mojego konta.

**Kryteria akceptacji:**

- Na stronie logowania znajduje się link "Zapomniałem hasła".
- Po kliknięciu użytkownik jest przekierowany do formularza resetowania hasła.
- Formularz zawiera pole na adres e-mail.
- Po podaniu adresu email, system wysyła wiadomość z linkiem do zmiany hasła.
- Użytkownik otrzymuje czytelną informację o wysłaniu emaila z instrukcjami.
- Link z emaila prowadzi do formularza ustawienia nowego hasła.
- Po pomyślnej zmianie hasła, użytkownik może zalogować się nowymi danymi.

### Moduł: Zarządzanie Kampanią i Postaciami

#### ID: US-004

**Tytuł:** Tworzenie nowej kampanii

**Opis:** Jako DM, chcę stworzyć nową kampanię i nadać jej nazwę, aby mieć wydzielone miejsce na postacie i walki z nią związane.

**Kryteria akceptacji:**

- W panelu głównym znajduje się przycisk "Stwórz nową kampanię".
- Po kliknięciu pojawia się pole do wpisania nazwy kampanii.
- Po zatwierdzeniu nazwy, nowa kampania pojawia się na liście moich kampanii.
- Użytkownik może wejść w szczegóły nowo utworzonej kampanii.

#### ID: US-005

**Tytuł:** Dodawanie postaci gracza do kampanii

**Opis:** Jako DM, po wybraniu kampanii, chcę dodać do niej postacie moich graczy, wpisując ich podstawowe statystyki, aby móc później wykorzystać je w module walki.

**Kryteria akceptacji:**

- W widoku kampanii znajduje się opcja "Dodaj postać gracza".
- Formularz dodawania postaci zawiera pola na: imię, HP, AC, szybkość oraz 6 atrybutów.
- Po zapisaniu postaci, jest ona widoczna na liście postaci w danej kampanii.
- System poprawnie oblicza i wyświetla inicjatywę oraz pasywną percepcję na podstawie wprowadzonych atrybutów.

### Moduł: Biblioteki Danych

#### ID: US-006

**Tytuł:** Przeglądanie i filtrowanie biblioteki potworów

**Opis:** Jako DM, chcę móc szybko przeszukiwać globalną bibliotekę potworów i filtrować ją po CR, aby sprawnie znaleźć przeciwnika do planowanej walki.

**Kryteria akceptacji:**

- Dostępna jest globalna sekcja "Biblioteka Potworów".
- Pole wyszukiwania pozwala na dynamiczne filtrowanie listy potworów po wpisywanej nazwie.
- Dostępny jest filtr (np. dropdown lub suwak) pozwalający na wybranie konkretnego CR lub zakresu CR.
- Kliknięcie na potwora na liście rozwija jego pełną kartę statystyk.

#### ID: US-007

**Tytuł:** Przeglądanie i filtrowanie biblioteki czarów

**Opis:** Jako DM, chcę móc przeglądać globalną bibliotekę czarów i filtrować ją po poziomie i klasie, aby szybko sprawdzić działanie czaru.

**Kryteria akceptacji:**

- Dostępna jest globalna sekcja "Biblioteka Czarów".
- Pole wyszukiwania pozwala na filtrowanie listy czarów po nazwie.
- Dostępne są filtry pozwalające na zawężenie wyników do konkretnego poziomu czaru (0-9) oraz klasy postaci.
- Kliknięcie na czar na liście wyświetla jego pełny opis.

### Moduł: Walka

#### ID: US-008

**Tytuł:** Rozpoczynanie nowej walki

**Opis:** Jako DM, w zakładce "Combat", chcę rozpocząć nową walkę, dodając do niej postacie graczy, potwory z biblioteki i NPC, aby przygotować starcie.

**Kryteria akceptacji:**

- W widoku "Combat" znajduje się przycisk "Rozpocznij nową walkę".
- W widoku "Combat" znajdują się zapisane walki
- Interfejs pozwala na wybranie postaci graczy z listy postaci kampanii.
- Interfejs pozwala na wyszukanie i dodanie potworów z biblioteki.
- System pozwala na dodanie wielu kopii tego samego potwora (np. 3 gobliny), które będą traktowane jako osobne jednostki.
- Po dodaniu wszystkich uczestników, przycisk "Rzuć na inicjatywę" staje się aktywny.

#### ID: US-009

**Tytuł:** Ustalanie kolejności w walce

**Opis:** Jako DM, po dodaniu wszystkich uczestników walki, chcę, aby system automatycznie rzucił za wszystkich na inicjatywę i posortował ich od najwyższego do najniższego wyniku, aby natychmiast rozpocząć pierwszą rundę.

**Kryteria akceptacji:**

- Po kliknięciu "Rzuć na inicjatywę", system dla każdej postaci wykonuje rzut k20 i dodaje jej modyfikator do inicjatywy.
- Uczestnicy walki są wyświetleni w formie listy w porządku malejącej inicjatywy.
- Pierwsza postać na liście jest oznaczona jako aktywna.

#### ID: US-010

**Tytuł:** Śledzenie tur i stanu postaci

**Opis:** Jako DM, w trakcie walki, chcę wyraźnie widzieć, czyja jest tura, przechodzić do następnej postaci i na bieżąco modyfikować punkty życia uczestników, aby płynnie prowadzić starcie.

**Kryteria akceptacji:**

- Aktywna postać jest wizualnie wyróżniona.
- Przycisk "Następna tura" przesuwa wskaźnik aktywnej postaci na kolejną na liście inicjatywy.
- Po ostatniej postaci w rundzie, licznik rund zwiększa się o 1, a tura wraca na początek listy.
- Przy każdej postaci widoczne są przyciski/pola do wpisania wartości obrażeń lub leczenia, które aktualizują jej aktualne HP.
- Postaci z 0 HP są wyraźnie oznaczone (np. wyszarzone, przekreślone).

#### ID: US-011

**Tytuł:** Wykonywanie akcji w turze

**Opis:** Jako DM, gdy jest tura potwora lub NPC, chcę widzieć jego kartę z dostępnymi akcjami i jednym kliknięciem wykonywać rzuty na atak, aby przyspieszyć rozgrywkę.

**Kryteria akceptacji:**

- W centralnej części ekranu walki wyświetlana jest uproszczona karta aktywnej postaci/potwora.
- Karta zawiera listę akcji (np. "Atak mieczem", "Ugryzienie").
- Kliknięcie w nazwę akcji powoduje wykonanie rzutu na trafienie (k20 + modyfikator) i wyświetlenie wyniku.
- System wyświetla również rzut na obrażenia powiązany z daną akcją.

#### ID: US-012

**Tytuł:** Rzuty z ułatwieniem i utrudnieniem

**Opis:** Jako DM, podczas wykonywania rzutu na atak, chcę mieć możliwość wybrania, czy rzut ma być wykonany normalnie, z ułatwieniem (advantage) czy z utrudnieniem (disadvantage).

**Kryteria akceptacji:**

- Przy każdej akcji wymagającej rzutu k20 znajdują się przełączniki/przyciski do wyboru trybu rzutu (Normalny, Ułatwienie, Utrudnienie).
- Wybranie "Ułatwienia" powoduje rzut dwiema kośćmi k20 i wybranie wyższego wyniku.
- Wybranie "Utrudnienia" powoduje rzut dwiema kośćmi k20 i wybranie niższego wyniku.

#### ID: US-013

**Tytuł:** Zarządzanie stanami (conditions)

**Opis:** Jako DM, chcę móc przypisać postaci dowolny stan (np. "oszołomiony", "spętany") i łatwo sprawdzić jego opis bez opuszczania ekranu walki.

**Kryteria akceptacji:**

- Przy każdej postaci na liście inicjatywy jest opcja "Dodaj stan".
- Po kliknięciu pojawia się lista wszystkich dostępnych stanów w D&D 5e.
- Wybrany stan pojawia się jako ikona/tag przy nazwie postaci.
- Najechanie kursorem na ikonę/tag stanu wyświetla jego pełny opis z zasadami.

### Moduł: Zarządzanie Fabułą (World Building)

#### ID: US-014

**Tytuł:** Tworzenie lokacji z hierarchią

**Opis:** Jako DM, chcę tworzyć lokacje w mojej kampanii i organizować je hierarchicznie (np. kontynent → królestwo → miasto → gospoda), aby mieć uporządkowany przegląd świata gry.

**Kryteria akceptacji:**

- W widoku kampanii dostępna jest sekcja "Locations" (Lokacje).
- Formularz tworzenia lokacji zawiera pola: nazwa, typ (kontynent/królestwo/miasto/budynek/dungeon/inne), parent location (opcjonalne), opis (rich text), upload obrazu (max 5 MB).
- System wyświetla lokacje w formie drzewa hierarchicznego.
- Kliknięcie w lokację wyświetla jej pełną kartę z breadcrumb navigation (np. Faerûn > Sword Coast > Waterdeep > Yawning Portal).
- Opis lokacji obsługuje rich text oraz @mentions.
- Obraz jest automatycznie kompresowany do formatu WebP.

#### ID: US-015

**Tytuł:** Tworzenie NPC z kartą fabularną

**Opis:** Jako DM, chcę tworzyć NPCs z bogatymi informacjami fabularnymi, aby mieć szybki dostęp do ich biografii, osobowości i powiązań podczas sesji.

**Kryteria akceptacji:**

- W widoku kampanii dostępna jest sekcja "NPCs".
- Formularz tworzenia NPC zawiera pola: imię, rola (np. "Tavernkeeper", "Quest Giver", "Villain"), biografia (rich text), personality traits (rich text), current location (link do lokacji), faction (link do frakcji), upload obrazu (max 5 MB).
- NPC ma zakładkę "Story" wyświetlającą wszystkie informacje fabularne.
- Biografia i personality traits obsługują rich text oraz @mentions.
- Obraz jest automatycznie kompresowany do formatu WebP.
- Po zapisaniu NPC jest widoczny na liście NPCs kampanii z filtrowaniem i wyszukiwaniem.

#### ID: US-016

**Tytuł:** Opcjonalna karta combat dla NPC

**Opis:** Jako DM, chcę móc dodać statystyki walki do wybranych NPCs, aby móc wykorzystać ich w module combat bez konieczności duplikowania informacji.

**Kryteria akceptacji:**

- Karta NPC posiada drugi tab "Combat" (początkowo pusty).
- W zakładce Combat znajduje się przycisk "Add Combat Stats".
- Po kliknięciu pojawia się formularz podobny do karty postaci gracza: HP, AC, Speed, 6 atrybutów, lista akcji.
- Akcje można dodawać ręcznie (nazwa, typ, opis, attack bonus, damage dice).
- Po zapisaniu combat stats, w karcie NPC pojawia się przycisk "Use in Combat".
- Kliknięcie "Use in Combat" przekierowuje do modułu combat z możliwością dodania NPC do aktywnej walki.
- Zakładka Combat jest opcjonalna - NPCs mogą istnieć tylko z informacjami story.

#### ID: US-017

**Tytuł:** Zarządzanie questami

**Opis:** Jako DM, chcę tworzyć i śledzić questy w mojej kampanii, aby mieć przegląd aktywnych zadań i ich postępów.

**Kryteria akceptacji:**

- W widoku kampanii dostępna jest sekcja "Quests".
- Formularz tworzenia questa zawiera pola: tytuł, opis (rich text), objectives (lista celów), rewards (structured: gold, items, XP, other), status (Not Started/Active/Completed/Failed), story arc (opcjonalnie przypisz do wątku fabularnego).
- Opis i objectives obsługują rich text oraz @mentions (linkowanie NPCs/locations).
- Status questa można zmieniać jednym kliknięciem.
- Lista questów posiada filtrowanie po statusie.
- W karcie questa widoczna jest sekcja "Related Entities" z listą @mentioned NPCs/locations.

#### ID: US-018

**Tytuł:** Tworzenie Story Arcs

**Opis:** Jako DM, chcę organizować questy w wątki fabularne (Story Arcs), aby strukturyzować główne i poboczne historie w kampanii.

**Kryteria akceptacji:**

- W widoku kampanii dostępna jest sekcja "Story Arcs".
- Formularz tworzenia story arc zawiera pola: tytuł, opis (rich text), status (Planning/Active/Completed/Abandoned), start date (in-game, opcjonalnie), end date (in-game, opcjonalnie).
- Opis obsługuje rich text oraz @mentions.
- W karcie story arc wyświetlana jest lista powiązanych questów.
- Questy można przypisywać do story arc z poziomu formy questa lub karty arc.

#### ID: US-019

**Tytuł:** Tworzenie frakcji

**Opis:** Jako DM, chcę tworzyć organizacje i frakcje w świecie gry, aby śledzić ich cele, członków i relacje między sobą.

**Kryteria akceptacji:**

- W widoku kampanii dostępna jest sekcja "Factions".
- Formularz tworzenia frakcji zawiera pola: nazwa, opis (rich text), goals (rich text), upload obrazu (max 5 MB).
- Opis i cele obsługują rich text oraz @mentions.
- W karcie frakcji wyświetlana jest lista członków (NPCs przypisanych do tej frakcji).
- System umożliwia dodanie relacji z innymi frakcjami (free text, np. "Sojusz z @Harpers", "Wojna z @Zhentarim").
- Obraz jest automatycznie kompresowany do formatu WebP.

#### ID: US-020

**Tytuł:** Notatki Lore z kategoriami i tagami

**Opis:** Jako DM, chcę tworzyć notatki o świecie gry i organizować je za pomocą kategorii i tagów, aby łatwo znaleźć informacje podczas sesji.

**Kryteria akceptacji:**

- W widoku kampanii dostępna jest sekcja "Lore".
- Formularz tworzenia notatki zawiera pola: tytuł, treść (rich text), kategoria (dropdown: Historia/Geografia/Religia/Kultura/Magia/Legendy/Inne), tagi (multi-select z możliwością tworzenia nowych).
- Treść obsługuje rich text oraz @mentions.
- Lista notatek posiada search bar oraz filtrowanie po kategorii i tagach.
- Tagi są wyświetlane jako badges z możliwością kliknięcia (filtrowanie po danym tagu).

#### ID: US-021

**Tytuł:** Przedmioty fabularne

**Opis:** Jako DM, chcę śledzić ważne przedmioty fabularne (artefakty, dokumenty, klejnoty rodzinne) i ich aktualnych właścicieli.

**Kryteria akceptacji:**

- W widoku kampanii dostępna jest sekcja "Story Items".
- Formularz tworzenia przedmiotu zawiera pola: nazwa, opis (rich text), upload obrazu (max 5 MB), current owner (opcjonalnie: link do NPC/PC/Faction/Location lub "unknown").
- Opis obsługuje rich text oraz @mentions.
- W karcie przedmiotu widoczny jest aktualny właściciel z linkiem.
- System śledzi historię własności (opcjonalne pole "ownership history").
- Obraz jest automatycznie kompresowany do formatu WebP.

#### ID: US-022

**Tytuł:** Oś czasu kampanii (Timeline)

**Opis:** Jako DM, chcę tworzyć chronologiczną oś czasu wydarzeń w mojej kampanii, aby śledzić historię i wydarzenia fabularne.

**Kryteria akceptacji:**

- W widoku kampanii dostępna jest sekcja "Timeline".
- Formularz tworzenia wydarzenia zawiera pola: tytuł, opis (rich text), in-game date (fantasy calendar format, np. "15 Mirtul, 1492 DR"), real date (opcjonalnie).
- Opis obsługuje rich text oraz @mentions.
- Timeline wyświetla wydarzenia w porządku chronologicznym (według in-game date).
- System automatycznie wykrywa @mentioned entities w opisie i wyświetla je jako "Related Entities".
- Wydarzenia można filtrować po zakresie dat lub po related entities.

### Moduł: Przygotowanie i Dziennik Sesji

#### ID: US-023

**Tytuł:** Przygotowanie nadchodzącej sesji

**Opis:** Jako DM, chcę przygotować plan nadchodzącej sesji z celami, encounters i quick links do relevant NPCs/locations, aby mieć wszystko pod ręką podczas gry.

**Kryteria akceptacji:**

- W widoku kampanii dostępna jest sekcja "Sessions" z zakładką "Prep".
- Formularz session plan zawiera pola: session number, session date (real date), in-game date (opcjonalnie), tytuł, cele sesji (rich text), planned encounters (lista z możliwością dodania story/combat encounters), prep checklist (TODO list), notes (rich text).
- Cele i notes obsługują rich text oraz @mentions.
- System pozwala na "pinning" entities (NPCs/locations/quests/items) do Quick Access Panel dla tej sesji.
- Przypięte entities są wyświetlane w panelu bocznym z miniaturowymi kartami.
- Status planu: Draft/Ready/In Progress/Completed.

#### ID: US-024

**Tytuł:** Dokumentowanie zakończonej sesji

**Opis:** Jako DM, po zakończonej sesji, chcę zapisać podsumowanie wydarzeń i kluczowych momentów, aby mieć historię kampanii do późniejszego przeglądu.

**Kryteria akceptacji:**

- W sekcji "Sessions" dostępna jest zakładka "Journal".
- Formularz session log zawiera pola: session number, session date (real date), in-game date (opcjonalnie), summary (rich text z @mentions), key events (lista wydarzeń), character decisions (rich text), loot given (structured list), XP given (liczba), next session notes/cliffhanger (rich text).
- Summary, character decisions i next session notes obsługują rich text oraz @mentions.
- System automatycznie śledzi wszystkie @mentioned entities w logu.
- Po zapisaniu loga, system sugeruje dodanie key events do Timeline.
- W karcie session log widoczna jest lista "Mentioned Entities" z linkami.

#### ID: US-025

**Tytuł:** Integracja session log z Timeline

**Opis:** Jako DM, chcę móc dodać ważne wydarzenia z session log do osi czasu kampanii jednym kliknięciem.

**Kryteria akceptacji:**

- W formularzu session log, przy każdym key event znajduje się checkbox "Add to Timeline".
- Po zapisaniu session log, zaznaczone wydarzenia są automatycznie dodawane do Timeline z datą in-game i linkiem zwrotnym do session log.
- W karcie Timeline, wydarzenia pochodzące z session log mają specjalną ikonę/badge.
- Kliknięcie na takie wydarzenie w Timeline przekierowuje do odpowiedniego session log.

### Moduł: System @Mentions i Wyszukiwanie

#### ID: US-026

**Tytuł:** Linkowanie encji przez @mentions

**Opis:** Jako DM, podczas pisania w polach rich text, chcę móc linkować inne encje kampanii za pomocą @mentions, aby tworzyć powiązania między informacjami.

**Kryteria akceptacji:**

- We wszystkich polach rich text, wpisanie znaku `@` otwiera dropdown z autocomplete.
- Dropdown wyświetla wszystkie encje kampanii (NPCs, locations, quests, factions, items, arcs, sessions) z fuzzy search.
- Wyszukiwanie działa w czasie rzeczywistym przy wprowadzaniu kolejnych znaków.
- Każda encja w dropdown ma ikonę typu (różne ikony dla NPC/location/quest/etc.).
- Wybór encji (klik lub Enter) wstawia mention jako badge z kolorem odpowiadającym typowi.
- Mentions są zapisywane w formacie strukturalnym (JSON) z ID encji.
- System priorytetyzuje recently used entities oraz context-aware suggestions.

#### ID: US-027

**Tytuł:** Interakcja z mentions i backlinks

**Opis:** Jako DM, chcę móc kliknąć na mention aby przejść do encji oraz widzieć wszystkie miejsca gdzie dana encja została wspomniana.

**Kryteria akceptacji:**

- Najechanie kursorem na mention wyświetla HoverCard z quick preview (nazwa, typ, miniatura kluczowych info, obraz jeśli dostępny).
- Kliknięcie na mention otwiera pełną kartę encji (w nowej zakładce lub w side panel).
- W karcie każdej encji znajduje się sekcja "Mentioned In" (Backlinks).
- Sekcja backlinks wyświetla listę wszystkich miejsc gdzie encja jest @mentioned (typ źródła, nazwa, link).
- Backlinks są automatycznie aktualizowane przy dodawaniu/usuwaniu mentions.
- Kliknięcie na backlink nawiguje do źródła i podświetla mention.

#### ID: US-028

**Tytuł:** Globalne wyszukiwanie encji kampanii

**Opis:** Jako DM, chcę móc szybko wyszukać dowolną encję w mojej kampanii, aby znaleźć potrzebne informacje podczas sesji.

**Kryteria akceptacji:**

- W interfejsie aplikacji dostępny jest globalny search bar (np. w górnym menu lub skrót klawiaturowy Ctrl+K).
- Wyszukiwanie działa na wszystkich typach encji (NPCs, locations, quests, story arcs, factions, lore notes, items, sessions).
- System używa fuzzy search (tolerancja na literówki).
- Wyniki wyświetlane są pogrupowane po typie encji.
- Każdy wynik pokazuje ikonę typu, nazwę, snippet treści i breadcrumb (jeśli dotyczy, np. lokacja hierarchiczna).
- Kliknięcie na wynik nawiguje do pełnej karty encji.
- Search obsługuje filtrowanie po typie encji (np. tylko NPCs, tylko quests).

## 6. Metryki sukcesu

Sukces produktu w wersji MVP będzie mierzony za pomocą następujących kryteriów:

### 6.1. Kryterium Jakościowe

Głównym wskaźnikiem sukcesu jest możliwość płynnego i bezproblemowego przeprowadzenia pełnego scenariusza walki w aplikacji — od momentu jej utworzenia i wylosowania inicjatywy, poprzez śledzenie tur i akcji, aż do pokonania jednej ze stron konfliktu. Aplikacja musi być stabilna i intuicyjna na tyle, by nie przeszkadzać, a pomagać w prowadzeniu starcia.

### 6.2. Kluczowy Mierzalny Wskaźnik (KPI) - Combat

Średni czas trwania jednej, standardowej rundy walki prowadzonej w aplikacji (dla 4 graczy i 3 potworów) powinien być znacząco krótszy niż w przypadku prowadzenia jej tradycyjnymi metodami. Celem jest osiągnięcie średniego czasu trwania całej walki poniżej 10 minut. Pomiar będzie realizowany na podstawie testów z grupą docelową.

### 6.3. Kluczowe Wskaźniki - World Building i Session Management

Moduły zarządzania fabułą i sesjami będą mierzone za pomocą następujących wskaźników:

#### 6.3.1. Session Prep Time

**Cel:** Średni czas przygotowania sesji przy użyciu narzędzi aplikacji powinien wynosić poniżej 30 minut.

**Pomiar:** Czas od otwarcia Session Prep do oznaczenia planu jako "Ready", mierzony dla DMs przygotowujących standardową 3-4 godzinną sesję.

**Sukces:** 80% DMs przygotowuje sesję w czasie poniżej 30 minut przy użyciu quick links, @mentions i pinned entities.

#### 6.3.2. Information Retrieval Speed

**Cel:** Znalezienie konkretnej informacji o encji (NPC/location/quest) powinno trwać poniżej 5 sekund.

**Pomiar:** Czas od rozpoczęcia wyszukiwania (Ctrl+K lub search bar) do otwarcia karty encji.

**Sukces:** 90% wyszukiwań kończy się sukcesem w czasie poniżej 5 sekund dzięki fuzzy search i @mentions w opisach.

#### 6.3.3. Relationship Discovery

**Cel:** DM powinien móc szybko odpowiedzieć na pytanie "kto to zna?" lub "gdzie to było wspomniane?" poniżej 10 sekund.

**Pomiar:** Czas od otwarcia karty encji do znalezienia odpowiedzi w sekcji backlinks lub relationships.

**Sukces:** 85% queries dotyczących relacji rozwiązanych poniżej 10 sekund dzięki automatycznym backlinks z @mentions.

#### 6.3.4. Session Continuity

**Cel:** Minimum 90% DMs regularnie korzysta z Session Journal dla przypomnienia wydarzeń z poprzedniej sesji.

**Pomiar:** Procent sesji, które mają uzupełniony session log oraz procent DMs otwierających poprzedni log przed nową sesją.

**Sukces:** 90%+ aktywnych kampanii ma wypełnione logi dla co najmniej 80% sesji. 85%+ DMs przegląda poprzedni log przed rozpoczęciem nowej sesji.

### 6.4. Adoption Metrics

**World Building Usage:**
- Cel: 70% aktywnych kampanii ma minimum 5 NPCs, 3 lokacje i 2 questy po miesiącu użytkowania.
- Cel: 50% kampanii używa @mentions w opisach (średnio 3+ mentions per entity).

**Rich Text Engagement:**
- Cel: 60% opisów zawiera formatowanie (nagłówki, listy, pogrubienie) lub obrazy.

**Backlinks Utility:**
- Cel: 40% użytkowników klika na backlinks minimum raz na sesję (wskaźnik użyteczności dwukierunkowych relacji).
