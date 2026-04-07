import { Swords } from 'lucide-react';
import type { RulesSection } from './types';

export const combatSection: RulesSection = {
  id: 'combat',
  number: 2,
  title: { en: 'Combat', pl: 'Walka' },
  icon: Swords,
  subsections: [
    {
      id: 'combat-structure',
      title: { en: 'Combat Structure – Step by Step', pl: 'Struktura starcia – krok po kroku' },
      content: {
        en: '1. Determine surprise – DM compares Stealth checks with passive Perception.\n2. Establish positions – DM places characters and monsters.\n3. Roll initiative – everyone rolls Dexterity check; DM one roll per identical monster group.\n4. Take turns – from highest initiative to lowest.\n5. New round – 1 round ≈ 6 seconds. Order does not change.',
        pl: '1. Ustalenie zaskoczenia – MP porównuje testy Skradania z pasywną Percepcją przeciwników.\n2. Określenie pozycji – MP ustawia postacie i potwory.\n3. Rzut na inicjatywę – wszyscy rzucają test Zręczności; MP jeden rzut za identyczne grupy potworów.\n4. Rozgrywanie tur – od najwyższego wyniku inicjatywy do najniższego.\n5. Nowa runda – 1 runda = ok. 6 sekund. Kolejność nie zmienia się.',
      },
    },
    {
      id: 'surprise',
      title: { en: 'Surprise', pl: 'Zaskoczenie' },
      content: {
        en: 'Surprised creature in first round: no actions, no movement, no reactions. Only some combatants may be surprised. Check: Dexterity (Stealth) vs. passive Wisdom (Perception).',
        pl: 'Zaskoczona istota w pierwszej turze: brak akcji, brak ruchu, brak reakcji. Można zaskoczyć tylko część walczących. Test: Zręczność (Skradanie) vs. pasywna Mądrość (Percepcja).',
      },
    },
    {
      id: 'turn-structure',
      title: { en: 'Turn Structure', pl: 'Tura postaci' },
      tables: [
        {
          headers: [
            { en: 'Turn Element', pl: 'Element tury' },
            { en: 'Details', pl: 'Szczegóły' },
          ],
          rows: [
            [
              { en: 'MOVEMENT', pl: 'RUCH' },
              { en: 'Up to your speed in meters; can split before/after action', pl: 'Do wartości szybkości metrów; można podzielić przed/po akcji' },
            ],
            [
              { en: 'ACTION', pl: 'AKCJA' },
              { en: 'One of the actions listed below', pl: 'Jedna z akcji wymienionych poniżej' },
            ],
            [
              { en: 'BONUS ACTION', pl: 'AKCJA DODATKOWA' },
              { en: 'Only when an ability/spell/rule allows; only one per turn', pl: 'Tylko gdy zdolność/czar/zasada pozwala; tylko jedna na turę' },
            ],
            [
              { en: 'REACTION', pl: 'REAKCJA' },
              { en: "One per round; can use on someone else's turn (e.g., opportunity attack)", pl: 'Jedna na rundę; można użyć w turze kogoś innego (np. atak okazyjny)' },
            ],
            [
              { en: 'FREE INTERACTION', pl: 'DROBNA INTERAKCJA' },
              { en: 'One free (open door, draw weapon, pick up item)', pl: 'Jedna bezpłatnie (otwarcie drzwi, wyjęcie miecza, podniesienie przedmiotu)' },
            ],
          ],
        },
      ],
    },
    {
      id: 'combat-actions',
      title: { en: 'Actions in Combat', pl: 'Akcje w walce' },
      tables: [
        {
          headers: [
            { en: 'Action', pl: 'Akcja' },
            { en: 'Effect', pl: 'Efekt' },
          ],
          rows: [
            [
              { en: 'Attack', pl: 'Atak' },
              { en: 'One melee or ranged attack (or more with Extra Attack)', pl: 'Jeden atak wręcz lub dystansowy (lub więcej przy Dodatkowym ataku)' },
            ],
            [
              { en: 'Cast a Spell', pl: 'Rzucenie czaru' },
              { en: 'Cast a spell (depends on casting time)', pl: 'Rzucasz czar (zależy od czasu rzucania)' },
            ],
            [
              { en: 'Dash', pl: 'Sprint' },
              { en: 'Extra movement equal to speed (action, not bonus action)', pl: 'Dodatkowy ruch równy szybkości (akcja, nie akcja dodatkowa)' },
            ],
            [
              { en: 'Dodge', pl: 'Unik' },
              { en: 'Attacks against you have disadvantage (if attacker visible); advantage on Dex saves', pl: 'Ataki przeciwko tobie mają utrudnienie (jeśli atakujący widoczny); ułatwienie w rzut. obronnych na Zrc' },
            ],
            [
              { en: 'Disengage', pl: 'Odstąpienie' },
              { en: 'Your movement doesn\'t provoke opportunity attacks for the rest of the turn', pl: 'Twój ruch nie prowokuje ataków okazyjnych do końca tury' },
            ],
            [
              { en: 'Help', pl: 'Pomoc' },
              { en: 'Two variants: (1) Ability check: ally gains advantage on next check; (2) Attack: must be within 1.5m of target', pl: 'Dwa warianty: (1) Pomoc w teście cechy: sojusznik ma ułatwienie w następnym teście; (2) Pomoc w ataku: musisz być w odl. ≤1,5 m od celu ataku' },
            ],
            [
              { en: 'Hide', pl: 'Ukrycie się' },
              { en: 'Dex (Stealth) check; if success – you are hidden', pl: 'Test Zrc (Skradanie); jeśli sukces – jesteś ukryty' },
            ],
            [
              { en: 'Search', pl: 'Przeszukiwanie' },
              { en: 'Wisdom (Perception) or Int (Investigation) check', pl: 'Test Mądrości (Percepcja) lub Int (Śledztwo)' },
            ],
            [
              { en: 'Ready', pl: 'Przygotowanie' },
              { en: 'Choose action + trigger; execute as reaction when trigger occurs', pl: 'Wybierasz akcję + warunek; realizujesz jako reakcję gdy warunek zajdzie' },
            ],
            [
              { en: 'Use an Object', pl: 'Użycie obiektu' },
              { en: 'When object requires an action or you want to use 2+ objects in a turn', pl: 'Gdy obiekt wymaga akcji lub chcesz użyć 2+ obiektów w turze' },
            ],
            [
              { en: 'Grapple', pl: 'Pochwycenie' },
              { en: 'Replaces one attack; contested Str (Athletics) – target max 1 size larger', pl: 'Zastępuje jeden atak; test Siły (Atletyka) sporny – cel max o 1 rozmiar większy' },
            ],
            [
              { en: 'Shove', pl: 'Odepchnięcie' },
              { en: 'Replaces one attack; target knocked prone or pushed 1.5m', pl: 'Zastępuje jeden atak; cel powalony lub odsunięty o 1,5 m' },
            ],
          ],
        },
      ],
    },
    {
      id: 'attack-rolls',
      title: { en: 'Attack Rolls', pl: 'Test ataku' },
      content: {
        en: 'd20 + ability modifier + proficiency bonus ≥ target AC → HIT',
        pl: 'k20 + modyfikator z cechy + premia z biegłości ≥ KP celu → TRAFIENIE',
      },
      tables: [
        {
          headers: [
            { en: 'Weapon/Attack Type', pl: 'Typ broni/ataku' },
            { en: 'Attack Ability', pl: 'Cecha do ataku' },
            { en: 'Damage Ability', pl: 'Cecha do obrażeń' },
          ],
          rows: [
            [
              { en: 'Melee weapon', pl: 'Broń biała (wręcz)' },
              { en: 'Strength', pl: 'Siła' },
              { en: 'Strength', pl: 'Siła' },
            ],
            [
              { en: 'Ranged weapon', pl: 'Broń dystansowa' },
              { en: 'Dexterity', pl: 'Zręczność' },
              { en: 'Dexterity', pl: 'Zręczność' },
            ],
            [
              { en: 'Finesse weapon', pl: 'Broń finezjna' },
              { en: 'Str OR Dex (your choice)', pl: 'Siła LUB Zręczność (wybierasz)' },
              { en: 'Same as attack', pl: 'Ta sama co do ataku' },
            ],
            [
              { en: 'Unarmed strike', pl: 'Atak bez broni (pięść)' },
              { en: 'Strength', pl: 'Siła' },
              { en: 'Strength (min 1 bludgeoning)', pl: 'Siła (min. 1 obrażenie obuchowe)' },
            ],
            [
              { en: 'Spell attack', pl: 'Czar (test ataku)' },
              { en: 'Class spellcasting ability + proficiency', pl: 'Cecha bazowa klasy + biegłość' },
              { en: '(described in spell)', pl: '(opisane w czarze)' },
            ],
          ],
        },
      ],
    },
    {
      id: 'natural-1-20',
      title: { en: 'Natural 1 and 20', pl: 'Naturalne 1 i 20' },
      content: {
        en: 'Natural 1 = automatic miss (regardless of modifiers). Natural 20 = automatic hit + Critical Hit.',
        pl: 'Naturalne 1 = automatyczny chybik (bez względu na modyfikatory). Naturalne 20 = automatyczne trafienie + Trafienie krytyczne.',
      },
    },
    {
      id: 'critical-hits',
      title: { en: 'Critical Hits', pl: 'Trafienie krytyczne' },
      content: {
        en: 'Roll double the number of damage dice (don\'t double the result). Example: dagger 1d4 → crit: 2d4 + modifier. All extra damage dice (e.g., Sneak Attack) are also doubled. Any hit on an unconscious target from ≤1.5m = auto crit. Any hit on a paralyzed target from ≤1.5m = auto crit.',
        pl: 'Rzucasz podwójną liczbę kości obrażeń (nie podwajasz wyniku). Przykład: sztylet 1k4 → krytyk: 2k4 + modyfikator. Wszystkie dodatkowe kości obrażeń (np. Ukradkowy atak łotra) też podwajane. Każde trafienie nieprzytomnego celu z odległości ≤1,5 m = automatyczny krytyk. Każde trafienie sparaliżowanego celu z odległości ≤1,5 m = automatyczny krytyk.',
      },
    },
    {
      id: 'unseen-attackers',
      title: { en: 'Unseen Attackers & Targets', pl: 'Niewidoczni atakujący i atakowani' },
      content: {
        en: 'Attack a target you can\'t see → disadvantage. Target can\'t see you → advantage. When hidden and you attack → you reveal your position (hit or miss).',
        pl: 'Atakujesz cel, którego nie widzisz → utrudnienie w teście ataku. Cel nie widzi ciebie → ułatwienie w teście ataku. Gdy jesteś ukryty i atakujesz → zdradzasz swoją pozycję (niezależnie od trafienia).',
      },
    },
    {
      id: 'ranged-attacks',
      title: { en: 'Ranged Attacks', pl: 'Ataki dystansowe' },
      content: {
        en: 'Ranged attack in melee (≤1.5m from a seeing, non-incapacitated enemy) → disadvantage. Target at long range (beyond normal) → disadvantage. Target beyond long range → impossible.',
        pl: 'Atak dystansowy w zwarciu (≤1,5 m od widzącego cię, nieobezwładnionego wroga) → utrudnienie. Cel w zasięgu dalekim (poza normalnym) → utrudnienie. Cel poza zasięgiem dalekim → niemożliwe.',
      },
    },
    {
      id: 'movement-position',
      title: { en: 'Movement & Position', pl: 'Ruch i pozycja' },
      tables: [
        {
          headers: [
            { en: 'Situation', pl: 'Sytuacja' },
            { en: 'Extra Cost', pl: 'Koszt dodatkowy' },
          ],
          rows: [
            [{ en: 'Difficult terrain', pl: 'Trudny teren' }, { en: '+1m per meter', pl: '+1 m za każdy przebyty metr' }],
            [{ en: 'Climbing (no special speed)', pl: 'Wspinaczka (bez specjalnej szybkości)' }, { en: '+1m per meter', pl: '+1 m za każdy metr' }],
            [{ en: 'Swimming (no special speed)', pl: 'Pływanie (bez specjalnej szybkości)' }, { en: '+1m per meter', pl: '+1 m za każdy metr' }],
            [{ en: 'Crawling', pl: 'Czołganie' }, { en: '+1m per meter', pl: '+1 m za każdy metr' }],
            [{ en: 'Standing from prone', pl: 'Wstanie po powaleniu' }, { en: 'Half your speed', pl: 'Połowa szybkości' }],
          ],
        },
      ],
    },
    {
      id: 'prone',
      title: { en: 'Prone', pl: 'Powalenie' },
      content: {
        en: 'You can drop prone for free (no speed cost). Standing up = costs half your speed. Can\'t stand if speed is 0 or not enough speed left. Prone creature attacks with disadvantage. Attack on prone from ≤1.5m: advantage; from farther: disadvantage.',
        pl: 'Możesz upaść samemu (bez kosztu szybkości). Wstanie = wydatek połowy szybkości. Nie możesz wstać jeśli masz 0 szybkości lub za mało szybkości. Powalone stworzenie atakuje z utrudnieniem. Atak na powalone stworzenie z ≤1,5 m: ułatwienie; z dalej: utrudnienie.',
      },
    },
    {
      id: 'opportunity-attacks',
      title: { en: 'Opportunity Attacks', pl: 'Atak okazyjny' },
      content: {
        en: 'When a visible hostile creature leaves your reach → you can use your reaction for one melee attack. Disengage action prevents provoking. Teleportation and forced movement (e.g., pushed by spell) do NOT provoke.',
        pl: 'Gdy widziana wroga istota opuszcza twoją strefę ataku → możesz użyć reakcji na jeden atak wręcz. Akcja Odstąpienia zapobiega prowokacji. Teleportacja i przymusowe ruchy (np. odrzucenie przez czar) NIE prowokują.',
      },
    },
    {
      id: 'reach-weapons',
      title: { en: 'Reach Weapons', pl: 'Bronie zasięgowe (Reach)' },
      content: {
        en: 'Weapon with Reach property has threat zone of 3m instead of standard 1.5m. Opportunity attacks are possible when a target leaves the 3m zone (not 1.5m).',
        pl: 'Broń z właściwością Zasięgowa ma strefę ataku 3 m zamiast standardowych 1,5 m. Atak okazyjny jest możliwy gdy cel opuszcza strefę 3 m (nie 1,5 m).',
      },
    },
    {
      id: 'knocking-out',
      title: { en: 'Knocking Out Instead of Killing', pl: 'Pozbawianie przytomności zamiast zabijania' },
      content: {
        en: 'When a melee attack reduces HP to 0, attacker can choose to knock out instead of kill. Target is stable and unconscious (no death saves). Only works with melee attacks (not ranged, not spells).',
        pl: 'Gdy atakujący redukuje PW celu do 0 atakiem wręcz, może w chwili zadawania obrażeń zdecydować o pozbawieniu przytomności zamiast zabicia. Cel jest wtedy stabilny i nieprzytomny (nie rzuca rzutów przeciw śmierci). Działa tylko przy atakach wręcz (nie dystansowych, nie czarach).',
      },
    },
    {
      id: 'two-weapon-fighting',
      title: { en: 'Two-Weapon Fighting', pl: 'Walka dwiema broniami' },
      content: {
        en: 'Both weapons must be Light. After Attack action with a light weapon: bonus action = attack with other weapon. Damage of second weapon does NOT add ability modifier (unless negative).',
        pl: 'Obydwie bronie muszą być lekkie. Po akcji Ataku lekką bronią: akcja dodatkowa = atak drugą bronią. Do obrażeń drugiej broni NIE dodajesz modyfikatora z cechy (chyba że jest ujemny).',
      },
    },
    {
      id: 'cover',
      title: { en: 'Cover', pl: 'Osłona' },
      tables: [
        {
          headers: [
            { en: 'Cover Level', pl: 'Poziom osłony' },
            { en: 'Condition', pl: 'Warunek' },
            { en: 'Effect', pl: 'Efekt' },
          ],
          rows: [
            [
              { en: 'Half', pl: 'Połowiczna' },
              { en: '≥ half body covered', pl: '≥ połowa ciała zasłonięta' },
              { en: '+2 AC and Dex saves', pl: '+2 do KP i rzutów obronnych na Zrc' },
            ],
            [
              { en: 'Three-quarters', pl: '3/4' },
              { en: 'Nearly entire body covered', pl: 'Prawie całe ciało zasłonięte' },
              { en: '+5 AC and Dex saves', pl: '+5 do KP i rzutów obronnych na Zrc' },
            ],
            [
              { en: 'Total', pl: 'Całkowita' },
              { en: 'Fully covered', pl: 'Całkowicie zasłonięty' },
              { en: 'Cannot be targeted by attack/spell', pl: 'Nie można być celem ataku/czaru' },
            ],
          ],
        },
      ],
      content: {
        en: 'If multiple sources of cover – only the best applies. Cover levels do not stack.',
        pl: 'Jeśli kilka źródeł osłony – liczy się tylko najlepsza. Poziomy nie sumują się.',
      },
    },
    {
      id: 'damage-types',
      title: { en: 'Damage Types', pl: 'Typy obrażeń' },
      tables: [
        {
          headers: [
            { en: 'Type', pl: 'Typ' },
            { en: 'Examples', pl: 'Przykłady' },
          ],
          rows: [
            [{ en: 'Bludgeoning', pl: 'Obuchowe' }, { en: 'Mace, fist, fall', pl: 'Maczuga, pięść, upadek' }],
            [{ en: 'Slashing', pl: 'Cięte' }, { en: 'Sword, axe, claws', pl: 'Miecz, topór, pazury' }],
            [{ en: 'Piercing', pl: 'Kłute' }, { en: 'Spear, arrows, bites', pl: 'Włócznia, strzały, ukąszenia' }],
            [{ en: 'Fire', pl: 'Ogień' }, { en: 'Fireball, red dragon', pl: 'Kula ognia, czerwony smok' }],
            [{ en: 'Cold', pl: 'Zimno' }, { en: 'Ice spells, white dragon', pl: 'Lodowe czary, biały smok' }],
            [{ en: 'Lightning', pl: 'Elektryczność' }, { en: 'Lightning bolt, blue dragon', pl: 'Piorun, niebieski smok' }],
            [{ en: 'Acid', pl: 'Kwas' }, { en: 'Acid, black dragon, oozes', pl: 'Kwas, czarny smok, szlamy' }],
            [{ en: 'Poison', pl: 'Trucizna' }, { en: 'Venoms, green dragon', pl: 'Jady, zielony smok' }],
            [{ en: 'Necrotic', pl: 'Nekrotyczne' }, { en: 'Undead, chill touch', pl: 'Nieumarli, mrożący dotyk' }],
            [{ en: 'Force', pl: 'Od mocy' }, { en: 'Magic missile, spiritual weapon', pl: 'Magiczny pocisk, duchowa broń' }],
            [{ en: 'Radiant', pl: 'Od światłości' }, { en: 'Flame strike, angelic weapon', pl: 'Słup ognia, anielska broń' }],
            [{ en: 'Psychic', pl: 'Psychiczne' }, { en: 'Psionic attacks', pl: 'Ataki psioniczne' }],
            [{ en: 'Thunder', pl: 'Dźwięk' }, { en: 'Thunderwave', pl: 'Fala gromu' }],
          ],
        },
      ],
    },
    {
      id: 'resistance-vulnerability',
      title: { en: 'Resistance & Vulnerability', pl: 'Odporność i podatność' },
      content: {
        en: 'Resistance: damage ÷ 2 (after other modifiers). Vulnerability: damage × 2. Multiple resistances/vulnerabilities applied only once. Order: modifiers → resistance → vulnerability.',
        pl: 'Odporność: obrażenia ÷ 2 (po innych modyfikatorach). Podatność: obrażenia × 2. Wielokrotne odporności/podatności stosowane tylko raz. Kolejność: modyfikatory → odporność → podatność.',
      },
    },
    {
      id: 'zero-hp',
      title: { en: '0 Hit Points', pl: '0 Punktów Wytrzymałości' },
      content: {
        en: 'Instant death: damage reduces HP to 0 and remaining damage ≥ max HP. Falling unconscious: HP = 0, but no instant death.',
        pl: 'Natychmiastowa śmierć: gdy obrażenia redukują PW do 0 i pozostałe obrażenia ≥ maksymalne PW postaci. Utrata przytomności: PW = 0, ale brak natychmiastowej śmierci.',
      },
    },
    {
      id: 'death-saving-throws',
      title: { en: 'Death Saving Throws', pl: 'Rzuty przeciw śmierci' },
      tables: [
        {
          headers: [
            { en: 'Situation', pl: 'Sytuacja' },
            { en: 'Effect', pl: 'Efekt' },
          ],
          rows: [
            [{ en: 'When', pl: 'Kiedy' }, { en: 'Start of each turn at 0 HP', pl: 'Na początku każdej tury z 0 PW' }],
            [{ en: 'How', pl: 'Jak' }, { en: 'd20 with no modifiers', pl: 'k20 bez żadnych modyfikatorów' }],
            [{ en: '10–19', pl: '10–19' }, { en: 'Success', pl: 'Sukces' }],
            [{ en: '1–9', pl: '1–9' }, { en: 'Failure', pl: 'Porażka' }],
            [{ en: 'Natural 1', pl: 'Naturalne 1' }, { en: '2 failures at once', pl: '2 porażki naraz' }],
            [{ en: 'Natural 20', pl: 'Naturalne 20' }, { en: 'Regain 1 HP → conscious, can act!', pl: 'Natychmiastowy odzysk 1 PW → wstajesz przytomny w tej samej turze (możesz działać!)' }],
            [{ en: '3 successes total', pl: '3 sukcesy łącznie' }, { en: 'Stabilized – stop rolling, remain unconscious', pl: 'Stabilizacja – nie rzucasz więcej, pozostajesz nieprzytomny' }],
            [{ en: '3 failures total', pl: '3 porażki łącznie' }, { en: 'Death', pl: 'Śmierć' }],
            [{ en: 'Hit at 0 HP', pl: 'Trafiony przy 0 PW' }, { en: '+1 automatic failure', pl: '+1 porażka automatycznie' }],
            [{ en: 'Critical hit at 0 HP', pl: 'Trafienie krytyczne przy 0 PW' }, { en: '+2 automatic failures', pl: '+2 porażki automatycznie' }],
            [{ en: 'Damage ≥ max HP at 0 HP', pl: 'Obrażenia ≥ max PW przy 0 PW' }, { en: 'Instant death', pl: 'Natychmiastowa śmierć' }],
          ],
        },
      ],
      content: {
        en: 'Successes and failures don\'t have to be consecutive – tally both separately to 3. Reset counters when HP is regained or stabilized.',
        pl: 'Sukcesy i porażki nie muszą być kolejne – zliczaj oba osobno do 3. Reset liczników: gdy odzyska jakiekolwiek PW lub się ustabilizuje.',
      },
      tips: [
        {
          en: 'Natural 20 means regain 1 HP, NOT "2 successes" – this is a common table mistake.',
          pl: 'Naturalne 20 to odzysk 1 PW, a NIE „2 sukcesy" – to częsty błąd przy stole.',
        },
      ],
    },
    {
      id: 'stabilization',
      title: { en: 'Stabilization', pl: 'Stabilizacja' },
      content: {
        en: 'Wisdom (Medicine) DC 10 → creature is stable (no more death saves). Stable creature at 0 HP: regains 1 HP after 1d4 hours. Any healing → immediate stabilization + HP.',
        pl: 'Test Mądrości (Medycyna) ST 10 → istota stabilna (nie rzuca rzutów przeciw śmierci). Stabilna istota z 0 PW: odzyska 1 PW po 1k4 godzinach. Jakiekolwiek leczenie → natychmiastowa stabilizacja + PW.',
      },
    },
    {
      id: 'temporary-hp',
      title: { en: 'Temporary HP', pl: 'Tymczasowe PW' },
      content: {
        en: 'Separate pool – lost before real HP. Do not stack – choose the higher of two sources. Healing does not restore temporary HP. Last until depleted or long rest.',
        pl: 'Osobna pula – tracone przed właściwymi PW. Nie sumują się – wybierasz wyższe z dwóch źródeł. Leczenie nie przywraca tymczasowych PW. Trwają do wyczerpania lub długiego odpoczynku.',
      },
    },
    {
      id: 'creature-sizes',
      title: { en: 'Creature Sizes', pl: 'Rozmiary istot' },
      tables: [
        {
          headers: [
            { en: 'Size', pl: 'Rozmiar' },
            { en: 'Space', pl: 'Przestrzeń' },
          ],
          rows: [
            [{ en: 'Tiny', pl: 'Malutki (Tiny)' }, { en: '0.75 × 0.75 m', pl: '0,75 × 0,75 m' }],
            [{ en: 'Small', pl: 'Mały (Small)' }, { en: '1.5 × 1.5 m', pl: '1,5 × 1,5 m' }],
            [{ en: 'Medium', pl: 'Średni (Medium)' }, { en: '1.5 × 1.5 m', pl: '1,5 × 1,5 m' }],
            [{ en: 'Large', pl: 'Duży (Large)' }, { en: '3 × 3 m', pl: '3 × 3 m' }],
            [{ en: 'Huge', pl: 'Wielki (Huge)' }, { en: '4.5 × 4.5 m', pl: '4,5 × 4,5 m' }],
            [{ en: 'Gargantuan', pl: 'Ogromny (Gargantuan)' }, { en: '6 × 6 m+', pl: '6 × 6 m lub więcej' }],
          ],
        },
      ],
    },
  ],
};
