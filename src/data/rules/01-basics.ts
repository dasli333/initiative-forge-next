import { Dices } from 'lucide-react';
import type { RulesSection } from './types';

export const basicsSection: RulesSection = {
  id: 'basics',
  number: 1,
  title: { en: 'Basic Mechanics', pl: 'Podstawy mechaniki' },
  icon: Dices,
  subsections: [
    {
      id: 'inspiration',
      title: { en: 'Inspiration', pl: 'Inspiracja' },
      content: {
        en: 'DM grants inspiration for good roleplaying (traits, ideals, bonds, flaws). You hold at most one inspiration at a time. Spend it before a d20 roll (ability check, saving throw, attack roll) to gain advantage. You can give your inspiration to another player at any time. Inspiration does not stack.',
        pl: 'MP przyznaje inspirację graczowi za dobre odgrywanie postaci (zgodnie z jej cechami, ideałami, więziami lub wadami). Posiadasz co najwyżej jedną inspirację naraz. Gdy masz inspirację, możesz ją wydać przed rzutem k20 (test cechy, rzut obronny, test ataku) by uzyskać ułatwienie. Możesz przekazać inspirację innemu graczowi w dowolnym momencie. Inspiracja NIE kumuluje się.',
      },
    },
    {
      id: 'd20-rolls',
      title: { en: 'Three Types of d20 Rolls', pl: 'Trzy typy rzutów k20' },
      content: {
        en: 'General rule: roll d20 + modifiers ≥ DC or target AC → success.',
        pl: 'Zasada ogólna: rzuć k20 + modyfikatory ≥ ST lub KP celu → sukces.',
      },
      tables: [
        {
          headers: [
            { en: 'Roll Type', pl: 'Typ rzutu' },
            { en: 'When', pl: 'Kiedy' },
            { en: 'What You Add', pl: 'Co dodajesz' },
          ],
          rows: [
            [
              { en: 'Ability check', pl: 'Test cechy' },
              { en: 'When the character does something risky', pl: 'Gdy postać robi coś ryzykownego' },
              { en: 'Ability modifier (+proficiency if applicable)', pl: 'Modyfikator cechy (+biegłość jeśli dotyczy)' },
            ],
            [
              { en: 'Saving throw', pl: 'Rzut obronny' },
              { en: 'When a threat affects the character', pl: 'Gdy zagrożenie działa na postać' },
              { en: 'Ability modifier (+proficiency if applicable)', pl: 'Modyfikator cechy (+biegłość jeśli dotyczy)' },
            ],
            [
              { en: 'Attack roll', pl: 'Test ataku' },
              { en: 'In combat, when attacking', pl: 'W walce, gdy atakujesz' },
              { en: 'Ability modifier + proficiency bonus', pl: 'Modyfikator cechy + premia z biegłości' },
            ],
          ],
        },
      ],
    },
    {
      id: 'advantage-disadvantage',
      title: { en: 'Advantage & Disadvantage', pl: 'Ułatwienie i Utrudnienie' },
      content: {
        en: 'Advantage → roll 2d20, take higher. Disadvantage → roll 2d20, take lower. Advantage + disadvantage = normal roll (regardless of source count). Multiple advantages or disadvantages = still only 2 dice.',
        pl: 'Ułatwienie → rzuć 2k20, wybierz wyższy. Utrudnienie → rzuć 2k20, wybierz niższy. Ułatwienie + utrudnienie = normalny rzut (niezależnie od liczby źródeł). Wiele ułatwień lub utrudnień = nadal tylko 2 kości.',
      },
    },
    {
      id: 'difficulty-class',
      title: { en: 'Difficulty Class (DC)', pl: 'Stopnie Trudności (ST)' },
      tables: [
        {
          headers: [
            { en: 'Difficulty', pl: 'Trudność' },
            { en: 'DC', pl: 'ST' },
          ],
          rows: [
            [{ en: 'Very Easy', pl: 'Bardzo łatwe' }, { en: '5', pl: '5' }],
            [{ en: 'Easy', pl: 'Łatwe' }, { en: '10', pl: '10' }],
            [{ en: 'Medium', pl: 'Średnie' }, { en: '15', pl: '15' }],
            [{ en: 'Hard', pl: 'Trudne' }, { en: '20', pl: '20' }],
            [{ en: 'Very Hard', pl: 'Bardzo trudne' }, { en: '25', pl: '25' }],
            [{ en: 'Nearly Impossible', pl: 'Prawie niewykonalne' }, { en: '30', pl: '30' }],
          ],
        },
      ],
    },
    {
      id: 'proficiency-bonus',
      title: { en: 'Proficiency Bonus', pl: 'Premia z biegłości' },
      content: {
        en: 'Proficiency bonus can only be added to a roll once. With multiclassing: bonus depends on total character level, not class level.',
        pl: 'Premia z biegłości może być dodana do rzutu tylko raz. Przy wieloklasowości: premia zależy od całkowitego poziomu, nie poziomu klasy.',
      },
      tables: [
        {
          headers: [
            { en: 'Character Level', pl: 'Poziom postaci' },
            { en: 'Bonus', pl: 'Premia' },
          ],
          rows: [
            [{ en: '1–4', pl: '1–4' }, { en: '+2', pl: '+2' }],
            [{ en: '5–8', pl: '5–8' }, { en: '+3', pl: '+3' }],
            [{ en: '9–12', pl: '9–12' }, { en: '+4', pl: '+4' }],
            [{ en: '13–16', pl: '13–16' }, { en: '+5', pl: '+5' }],
            [{ en: '17–20', pl: '17–20' }, { en: '+6', pl: '+6' }],
          ],
        },
      ],
    },
    {
      id: 'ability-modifiers',
      title: { en: 'Ability Modifiers', pl: 'Modyfikatory cech' },
      content: {
        en: 'Formula: (ability_score − 10) / 2, round down.',
        pl: 'Formuła: (wartość_cechy − 10) / 2, zaokrąglaj w dół.',
      },
      tables: [
        {
          headers: [
            { en: 'Score', pl: 'Wartość cechy' },
            { en: 'Modifier', pl: 'Modyfikator' },
          ],
          rows: [
            [{ en: '1', pl: '1' }, { en: '−5', pl: '−5' }],
            [{ en: '2–3', pl: '2–3' }, { en: '−4', pl: '−4' }],
            [{ en: '4–5', pl: '4–5' }, { en: '−3', pl: '−3' }],
            [{ en: '6–7', pl: '6–7' }, { en: '−2', pl: '−2' }],
            [{ en: '8–9', pl: '8–9' }, { en: '−1', pl: '−1' }],
            [{ en: '10–11', pl: '10–11' }, { en: '+0', pl: '+0' }],
            [{ en: '12–13', pl: '12–13' }, { en: '+1', pl: '+1' }],
            [{ en: '14–15', pl: '14–15' }, { en: '+2', pl: '+2' }],
            [{ en: '16–17', pl: '16–17' }, { en: '+3', pl: '+3' }],
            [{ en: '18–19', pl: '18–19' }, { en: '+4', pl: '+4' }],
            [{ en: '20–21', pl: '20–21' }, { en: '+5', pl: '+5' }],
            [{ en: '22–23', pl: '22–23' }, { en: '+6', pl: '+6' }],
            [{ en: '24–25', pl: '24–25' }, { en: '+7', pl: '+7' }],
            [{ en: '26–27', pl: '26–27' }, { en: '+8', pl: '+8' }],
            [{ en: '28–29', pl: '28–29' }, { en: '+9', pl: '+9' }],
            [{ en: '30', pl: '30' }, { en: '+10', pl: '+10' }],
          ],
        },
      ],
    },
    {
      id: 'passive-checks',
      title: { en: 'Passive Checks', pl: 'Testy pasywne' },
      content: {
        en: 'Passive score = 10 + all normal modifiers to the check. +5 if advantage, −5 if disadvantage. Passive Perception = 10 + Wisdom mod (+ proficiency if proficient). Use when: players pass by a hidden threat, not actively searching.',
        pl: 'Pasywny wynik = 10 + wszystkie normalne modyfikatory do testu. +5 jeśli ułatwienie, −5 jeśli utrudnienie. Pasywna Percepcja = 10 + mod. Mądrości (+ premia z biegłości jeśli biegły). Używaj gdy: gracze przechodzą obok ukrytego zagrożenia, nie szukają aktywnie.',
      },
    },
    {
      id: 'contested-checks',
      title: { en: 'Contested Checks', pl: 'Testy sporne' },
      content: {
        en: 'Both sides roll appropriate ability checks. Higher result wins. Tie = situation unchanged (attacker makes no progress).',
        pl: 'Obie strony rzucają odpowiednimi testami cech. Wygrywa wyższy wynik. Remis = sytuacja bez zmian (atakujący nie czyni postępów).',
      },
    },
    {
      id: 'group-checks',
      title: { en: 'Group Checks', pl: 'Testy grupowe' },
      content: {
        en: 'Whole party rolls the same ability check. If half or more succeed → group success. Use when collective effort matters (e.g., whole party sneaking).',
        pl: 'Cała drużyna rzuca ten sam test cechy. Jeśli połowa lub więcej zdaje → sukces grupowy. Stosuj gdy liczy się zbiorowy wysiłek (np. skradanie całą drużyną).',
      },
    },
    {
      id: 'abilities-skills',
      title: { en: 'Six Abilities & Related Skills', pl: 'Sześć cech i powiązane umiejętności' },
      tables: [
        {
          headers: [
            { en: 'Ability', pl: 'Cecha' },
            { en: 'Related Skills', pl: 'Powiązane umiejętności' },
          ],
          rows: [
            [{ en: 'Strength', pl: 'Siła' }, { en: 'Athletics', pl: 'Atletyka' }],
            [{ en: 'Dexterity', pl: 'Zręczność' }, { en: 'Acrobatics, Stealth, Sleight of Hand', pl: 'Akrobatyka, Skradanie się, Zwinne dłonie' }],
            [{ en: 'Constitution', pl: 'Kondycja' }, { en: '(no skills – direct checks)', pl: '(brak umiejętności – testy bezpośrednie)' }],
            [{ en: 'Intelligence', pl: 'Inteligencja' }, { en: 'Arcana, History, Investigation, Nature, Religion', pl: 'Historia, Przyroda, Religia, Śledztwo, Wiedza tajemna' }],
            [{ en: 'Wisdom', pl: 'Mądrość' }, { en: 'Animal Handling, Insight, Medicine, Perception, Survival', pl: 'Intuicja, Medycyna, Opieka nad zwierzętami, Percepcja, Sztuka przetrwania' }],
            [{ en: 'Charisma', pl: 'Charyzma' }, { en: 'Deception, Intimidation, Performance, Persuasion', pl: 'Oszustwo, Perswazja, Występy, Zastraszanie' }],
          ],
        },
      ],
    },
  ],
};
