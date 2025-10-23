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

## 4. Granice produktu

Następujące funkcjonalności celowo nie wchodzą w zakres wersji MVP:

- Pełna responsywność i dedykowana wersja na urządzenia mobilne.
- Biblioteka magicznych przedmiotów.
- Zaawansowany dziennik sesji (notatki o fabule, świecie, NPC).
- System automatycznego zapisywania stanu walki po każdej turze.
- Rozbudowana karta postaci (ekwipunek, umiejętności, historia postaci itp.).

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

## 6. Metryki sukcesu

Sukces produktu w wersji MVP będzie mierzony za pomocą następujących kryteriów:

### 6.1. Kryterium Jakościowe

Głównym wskaźnikiem sukcesu jest możliwość płynnego i bezproblemowego przeprowadzenia pełnego scenariusza walki w aplikacji — od momentu jej utworzenia i wylosowania inicjatywy, poprzez śledzenie tur i akcji, aż do pokonania jednej ze stron konfliktu. Aplikacja musi być stabilna i intuicyjna na tyle, by nie przeszkadzać, a pomagać w prowadzeniu starcia.

### 6.2. Kluczowy Mierzalny Wskaźnik (KPI)

Średni czas trwania jednej, standardowej rundy walki prowadzonej w aplikacji (dla 4 graczy i 3 potworów) powinien być znacząco krótszy niż w przypadku prowadzenia jej tradycyjnymi metodami. Celem jest osiągnięcie średniego czasu trwania całej walki poniżej 10 minut. Pomiar będzie realizowany na podstawie testów z grupą docelową.
