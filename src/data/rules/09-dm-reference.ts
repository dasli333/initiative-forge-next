import { BookOpen } from 'lucide-react';
import type { RulesSection } from './types';

export const dmReferenceSection: RulesSection = {
  id: 'dm-reference',
  number: 9,
  title: { en: 'DM Quick Reference', pl: 'Szybka referencja MP' },
  icon: BookOpen,
  subsections: [
    {
      id: 'common-questions',
      title: { en: 'Common Table Questions', pl: 'Najczęstsze pytania przy stole' },
      tables: [
        {
          headers: [
            { en: 'Question', pl: 'Pytanie' },
            { en: 'Answer', pl: 'Odpowiedź' },
          ],
          rows: [
            [{ en: 'Two bonus actions?', pl: 'Dwie akcje dodatkowe?' }, { en: 'No – only one per turn', pl: 'Nie – tylko jedna na turę' }],
            [{ en: 'Bonus action spell + leveled action spell?', pl: 'Czar akcją dodatkową + czar z komórki akcją?' }, { en: 'No – with bonus action spell you can only cast cantrips as action', pl: 'Nie – przy czarze akcją dodatkową akcją możesz rzucić tylko sztuczki' }],
            [{ en: 'Leveled action spell + bonus action spell?', pl: 'Czar z komórki akcją + czar akcją dodatkową?' }, { en: 'No – restriction works both ways', pl: 'Nie – ograniczenie działa w obie strony' }],
            [{ en: 'Bonus action spell + cantrip (1 action)?', pl: 'Czar akcją dodatkową + sztuczka (1 akcja)?' }, { en: 'Yes – cantrips as action are always allowed', pl: 'Tak – sztuczki jako akcja są zawsze dozwolone' }],
            [{ en: 'Move between attacks (Extra Attack)?', pl: 'Ruch między atakami (Dodatkowy atak)?' }, { en: 'Yes – you can split movement', pl: 'Tak – można podzielić ruch' }],
            [{ en: 'Opportunity attack during own movement?', pl: 'Atak okazyjny podczas własnego ruchu?' }, { en: 'Yes – when leaving enemy\'s reach (1.5m or 3m with reach weapon)', pl: 'Tak – gdy opuszczasz strefę ataku wroga (1,5 m lub 3 m przy broni zasięgowej)' }],
            [{ en: 'Grapple someone bigger?', pl: 'Pochwycić kogoś większego?' }, { en: 'Target max 1 size larger than you', pl: 'Cel max o 1 rozmiar większy od ciebie' }],
            [{ en: 'Stand up while prone?', pl: 'Wstać będąc powalonym?' }, { en: 'Yes, costs half your speed (impossible at speed 0)', pl: 'Tak, kosztuje połowę szybkości (niemożliwe przy szybkości 0)' }],
            [{ en: 'Dash – action or bonus action?', pl: 'Sprint to akcja czy akcja dodatkowa?' }, { en: 'Action', pl: 'Akcja' }],
            [{ en: 'Hide in combat?', pl: 'Ukryć się w walce?' }, { en: 'Dex (Stealth) check as action; need conditions (cover, darkness)', pl: 'Test Zrc (Skradanie) jako akcja; muszą być warunki (osłona, ciemność)' }],
            [{ en: 'Concentrate on 2 spells?', pl: 'Koncentracja na 2 czarach?' }, { en: 'Impossible', pl: 'Niemożliwe' }],
            [{ en: 'Ready a concentration spell?', pl: 'Przygotowanie czaru wymagającego koncentracji?' }, { en: 'Yes, but holding the spell = concentration', pl: 'Tak, ale trzymanie czaru = koncentracja – inny czar koncentracji ją przerywa' }],
            [{ en: 'Natural 20 on death save?', pl: 'Naturalne 20 na rzucie przeciw śmierci?' }, { en: 'Regain 1 HP and conscious – NOT "2 successes"', pl: 'Odzysk 1 PW i powrót do przytomności – NIE „2 sukcesy"' }],
            [{ en: 'Knock out instead of kill?', pl: 'Pozbawić przytomności zamiast zabić?' }, { en: 'Yes – decision at moment of melee attack reducing to 0 HP', pl: 'Tak – decyzja w chwili ataku wręcz redukującego do 0 PW' }],
            [{ en: 'No armor proficiency – cast spells?', pl: 'Brak biegłości w pancerzu – rzucanie czarów?' }, { en: 'Impossible – armor blocks gestures', pl: 'Niemożliwe – pancerz blokuje gestykulację' }],
            [{ en: 'Can you have two inspirations?', pl: 'Inspiracja – można mieć dwie?' }, { en: 'No – max one at a time; can give to another player', pl: 'Nie – max jedna naraz; można przekazać innemu graczowi' }],
          ],
        },
      ],
    },
    {
      id: 'suggested-dcs',
      title: { en: 'Suggested DCs for Common Tasks', pl: 'Zalecane ST dla typowych zadań' },
      tables: [
        {
          headers: [
            { en: 'Task', pl: 'Zadanie' },
            { en: 'DC', pl: 'ST' },
          ],
          rows: [
            [{ en: 'Break simple door', pl: 'Wyważenie prostych drzwi' }, { en: '10–13', pl: '10–13' }],
            [{ en: 'Break reinforced door', pl: 'Wyważenie wzmocnionych drzwi' }, { en: '15–18', pl: '15–18' }],
            [{ en: 'Climb steep cliff', pl: 'Wspinaczka po stromym klifie' }, { en: '15', pl: '15' }],
            [{ en: 'Climb smooth wall', pl: 'Wspinaczka po gładkiej ścianie' }, { en: '20–25', pl: '20–25' }],
            [{ en: 'Swim in calm water', pl: 'Pływanie w spokojnej wodzie' }, { en: '10', pl: '10' }],
            [{ en: 'Swim in rough sea', pl: 'Pływanie w burzliwym morzu' }, { en: '15–20', pl: '15–20' }],
            [{ en: 'Sneak past sleeping guard', pl: 'Przekradanie obok śpiącego strażnika' }, { en: '10', pl: '10' }],
            [{ en: 'Sneak past alert guard', pl: 'Przekradanie obok czujnego strażnika' }, { en: '15', pl: '15' }],
            [{ en: 'Pickpocket (inattentive)', pl: 'Kradzież kieszonkowa (nieuważny cel)' }, { en: '13', pl: '13' }],
            [{ en: 'Pickpocket (attentive)', pl: 'Kradzież kieszonkowa (uważny cel)' }, { en: '18', pl: '18' }],
            [{ en: 'Calm panicked horse', pl: 'Opanowanie spanikowanego konia' }, { en: '15 (Wis, Animal Handling)', pl: '15 (Mąd, Opieka nad zwierzętami)' }],
          ],
        },
      ],
    },
    {
      id: 'improvising-rules',
      title: { en: 'Improvising Rules', pl: 'Improwizowanie zasad' },
      content: {
        en: '1. Is there a chance of success? If yes → d20 + modifier vs DC.\n2. What DC? Very Easy = 5 to Nearly Impossible = 30.\n3. Which ability? Str = physical power; Dex = speed/precision; Con = endurance; Int = knowledge/logic; Wis = perception/instinct; Cha = personality/influence.\n4. Proficiency? Only if skill/tool/weapon directly applies.\n5. Consequences of failure? Always state what\'s at stake – not just "you fail."',
        pl: '1. Czy istnieje szansa sukcesu? Jeśli tak → k20 + modyfikator vs ST.\n2. Który ST? Bardzo łatwe = 5 do prawie niemożliwego = 30.\n3. Jaka cecha? Siła = fizyczna moc; Zrc = szybkość/precyzja; Kon = odporność; Int = wiedza/logika; Mąd = percepcja/instynkt; Cha = osobowość/wpływ.\n4. Biegłość? Tylko jeśli umiejętność/narzędzie/broń bezpośrednio się stosuje.\n5. Konsekwencje porażki? Zawsze powiedz, co grozi – nie tylko "nie dajesz rady".',
      },
      tips: [
        {
          en: 'Golden rule: Rules serve fun, not the other way around. If a rule slows or ruins the session – DM has the final word.',
          pl: 'Zasada złotej reguły: Reguły służą zabawie, nie odwrotnie. Jeśli zasada spowalnia lub psuje sesję – MP ma ostatnie słowo.',
        },
      ],
    },
    {
      id: 'initiative-practices',
      title: { en: 'Initiative – Best Practices', pl: 'Inicjatywa – dobre praktyki' },
      content: {
        en: '• Dexterity check (no proficiency, unless an ability says otherwise).\n• DM–Player tie: DM decides.\n• Player–Player tie: players decide among themselves (or roll d20).\n• Initiative order does not change between rounds.\n• DM can roll initiative for entire groups of identical monsters.',
        pl: '• Test Zręczności (bez biegłości, chyba że zdolność mówi inaczej).\n• Remis MP–Gracz: MP decyduje.\n• Remis Gracz–Gracz: gracze decydują między sobą (lub rzut k20).\n• Kolejność inicjatywy nie zmienia się między rundami.\n• MP może rzucać inicjatywę za całe grupy identycznych potworów.',
      },
    },
    {
      id: 'session-structure',
      title: { en: 'Session Structure (Skeleton)', pl: 'Struktura sesji (szkielet)' },
      content: {
        en: '1. INTRO → brief recap of previous session\n2. EXPLORATION → descriptions, Perception checks (passive!), traps, discoveries\n3. INTERACTIONS → NPCs, negotiations, information, social checks\n4. COMBAT → when tension or story demands it\n5. CLIFFHANGER → end at a moment of tension\n6. SUMMARY → XP, loot, world changes',
        pl: '1. INTRO → krótkie przypomnienie poprzedniej sesji\n2. EKSPLORACJA → opisy, testy Percepcji (pasywne!), pułapki, odkrycia\n3. INTERAKCJE → BN, negocjacje, informacje, testy społeczne\n4. WALKA → gdy napięcie lub fabuła tego wymagają\n5. CLIFFHANGER → zakończ w momencie napięcia\n6. PODSUMOWANIE → XP, łupy, zmiany w świecie',
      },
    },
    {
      id: 'movement-speeds-summary',
      title: { en: 'Movement Speeds – Summary', pl: 'Prędkości ruchu – podsumowanie' },
      tables: [
        {
          headers: [
            { en: 'Movement Type', pl: 'Rodzaj ruchu' },
            { en: 'Cost (per meter)', pl: 'Koszt (na metr)' },
          ],
          rows: [
            [{ en: 'Normal walk', pl: 'Normalny chód' }, { en: '1m of speed', pl: '1 m szybkości' }],
            [{ en: 'Difficult terrain', pl: 'Trudny teren' }, { en: '2m of speed', pl: '2 m szybkości' }],
            [{ en: 'Climbing (no ability)', pl: 'Wspinaczka (bez zdolności)' }, { en: '2m of speed', pl: '2 m szybkości' }],
            [{ en: 'Swimming (no ability)', pl: 'Pływanie (bez zdolności)' }, { en: '2m of speed', pl: '2 m szybkości' }],
            [{ en: 'Crawling', pl: 'Czołganie' }, { en: '2m of speed', pl: '2 m szybkości' }],
            [{ en: 'Crawling on difficult terrain', pl: 'Czołganie po trudnym terenie' }, { en: '3m of speed', pl: '3 m szybkości' }],
          ],
        },
      ],
    },
    {
      id: 'underwater-combat',
      title: { en: 'Underwater Combat', pl: 'Walka pod wodą' },
      content: {
        en: '• Melee without swim speed → disadvantage (exception: shortsword, javelin, dagger, trident, spear).\n• Ranged beyond normal range → automatic miss.\n• Ranged within normal range → disadvantage (exception: crossbow, net, javelin/spear/trident).\n• Objects and creatures submerged → resistance to fire damage.',
        pl: '• Atak wręcz bez szybkości pływania → utrudnienie (wyjątek: krótki miecz, oszczep, sztylet, trójząb, włócznia).\n• Atak dystansowy poza normalnym zasięgiem → automatyczny chybik.\n• Atak dystansowy w normalnym zasięgu → utrudnienie (wyjątek: kusza, sieć, oszczep/włócznia/trójząb).\n• Obiekty i stworzenia zanurzone w wodzie → odporność na obrażenia od ognia.',
      },
    },
    {
      id: 'mounted-combat',
      title: { en: 'Mounted Combat', pl: 'Walka z wierzchowca' },
      content: {
        en: '• Mounting/dismounting: half your speed.\n• If mount moved against your will: Dex save DC 10 or fall prone 1.5m from mount.\n• Controlled mount (trained): rider\'s initiative; only Dash/Disengage/Dodge.\n• Independent mount: own initiative; own actions; may act against rider.',
        pl: '• Dosiadanie/zsiadanie: połowa szybkości.\n• Gdy wierzchowiec poruszony wbrew woli: rzut obronny na Zrc ST 10 lub spadasz (powalony 1,5 m od wierzchowca).\n• Kontrolowany wierzchowiec (wytresowany): inicjatywa jeźdźca; tylko Sprint/Odstąpienie/Unik.\n• Niezależny wierzchowiec: własna inicjatywa; własne akcje; może działać wbrew jeźdźcy.',
      },
    },
  ],
};
