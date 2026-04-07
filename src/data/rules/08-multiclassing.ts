import { GitBranch } from 'lucide-react';
import type { RulesSection } from './types';

export const multiclassingSection: RulesSection = {
  id: 'multiclassing',
  number: 8,
  title: { en: 'Multiclassing & Feats', pl: 'Wieloklasowość i atuty' },
  icon: GitBranch,
  subsections: [
    {
      id: 'multiclass-requirements',
      title: { en: 'Multiclassing Requirements', pl: 'Wymagania wieloklasowości' },
      tables: [
        {
          headers: [
            { en: 'Class', pl: 'Klasa' },
            { en: 'Minimum Ability Score', pl: 'Minimalna wartość cechy' },
          ],
          rows: [
            [{ en: 'Barbarian', pl: 'Barbarzyńca' }, { en: 'Str 13', pl: 'Siła 13' }],
            [{ en: 'Bard', pl: 'Bard' }, { en: 'Cha 13', pl: 'Charyzma 13' }],
            [{ en: 'Sorcerer', pl: 'Czarownik' }, { en: 'Cha 13', pl: 'Charyzma 13' }],
            [{ en: 'Druid', pl: 'Druid' }, { en: 'Wis 13', pl: 'Mądrość 13' }],
            [{ en: 'Cleric', pl: 'Kleryk' }, { en: 'Wis 13', pl: 'Mądrość 13' }],
            [{ en: 'Rogue', pl: 'Łotr' }, { en: 'Dex 13', pl: 'Zręczność 13' }],
            [{ en: 'Ranger', pl: 'Łowca' }, { en: 'Dex 13 and Wis 13', pl: 'Zręczność 13 i Mądrość 13' }],
            [{ en: 'Wizard', pl: 'Mag' }, { en: 'Int 13', pl: 'Inteligencja 13' }],
            [{ en: 'Monk', pl: 'Mnich' }, { en: 'Dex 13 and Wis 13', pl: 'Zręczność 13 i Mądrość 13' }],
            [{ en: 'Paladin', pl: 'Paladyn' }, { en: 'Str 13 and Cha 13', pl: 'Siła 13 i Charyzma 13' }],
            [{ en: 'Fighter', pl: 'Wojownik' }, { en: 'Str 13 OR Dex 13', pl: 'Siła 13 LUB Zręczność 13' }],
            [{ en: 'Warlock', pl: 'Zaklinacz' }, { en: 'Cha 13', pl: 'Charyzma 13' }],
          ],
        },
      ],
    },
    {
      id: 'multiclass-rules',
      title: { en: 'Multiclassing Rules', pl: 'Zasady wieloklasowości' },
      content: {
        en: '• Proficiency bonus = total character level (not class level).\n• XP to level up = total character level.\n• Extra Attack does NOT stack from a second class (exception: Fighter 20).\n• Unarmored Defense from different classes – pick only one (can\'t have two).\n• You don\'t get starting equipment for the new class.',
        pl: '• Premia z biegłości = całkowity poziom postaci (nie poziom klasy).\n• PD do awansu = całkowity poziom postaci.\n• Dodatkowy atak NIE kumuluje się z drugiej klasy (wyjątek: Wojownik 20).\n• Obrona bez pancerza z różnych klas – przyjmujesz tylko jedną (nie możesz mieć dwóch).\n• Nie dostajesz wyposażenia startowego nowej klasy.',
      },
    },
    {
      id: 'multiclass-proficiencies',
      title: { en: 'Proficiencies When Multiclassing', pl: 'Biegłości przy wieloklasowości' },
      tables: [
        {
          headers: [
            { en: 'Class', pl: 'Klasa' },
            { en: 'Proficiencies Gained on Entry', pl: 'Biegłości przy wejściu' },
          ],
          rows: [
            [{ en: 'Barbarian', pl: 'Barbarzyńca' }, { en: 'Shields, simple weapons, martial weapons', pl: 'Tarcze, bronie proste, bronie żołnierskie' }],
            [{ en: 'Bard', pl: 'Bard' }, { en: 'Light armor, 1 instrument, 1 skill', pl: 'Lekkie pancerze, 1 instrument, 1 umiejętność' }],
            [{ en: 'Cleric', pl: 'Kleryk' }, { en: 'Light & medium armor, shields', pl: 'Lekkie i średnie pancerze, tarcze' }],
            [{ en: 'Druid', pl: 'Druid' }, { en: 'Light & medium armor, shields', pl: 'Lekkie i średnie pancerze, tarcze' }],
            [{ en: 'Rogue', pl: 'Łotr' }, { en: 'Light armor, 1 skill, thieves\' tools', pl: 'Lekkie pancerze, 1 umiejętność, narzędzia złodziejskie' }],
            [{ en: 'Ranger', pl: 'Łowca' }, { en: 'Light & medium armor, shields, simple & martial weapons, 1 skill', pl: 'Lekkie i średnie pancerze, tarcze, bronie proste i żołnierskie, 1 umiejętność' }],
            [{ en: 'Monk', pl: 'Mnich' }, { en: 'Simple weapons, shortsword', pl: 'Bronie proste, miecz krótki' }],
            [{ en: 'Paladin', pl: 'Paladyn' }, { en: 'Light & medium armor, shields, simple & martial weapons', pl: 'Lekkie i średnie pancerze, tarcze, bronie proste i żołnierskie' }],
            [{ en: 'Fighter', pl: 'Wojownik' }, { en: 'Light & medium armor, shields, simple & martial weapons', pl: 'Lekkie i średnie pancerze, tarcze, bronie proste i żołnierskie' }],
          ],
        },
      ],
    },
    {
      id: 'feats-selected',
      title: { en: 'Feats – Selected', pl: 'Atuty – wybrane' },
      tables: [
        {
          headers: [
            { en: 'Feat', pl: 'Atut' },
            { en: 'Requirements', pl: 'Wymagania' },
            { en: 'Effect (summary)', pl: 'Efekt (skrót)' },
          ],
          rows: [
            [
              { en: 'Alert', pl: 'Alert' },
              { en: '—', pl: '—' },
              { en: '+5 to initiative; can\'t be surprised; hidden creatures don\'t gain advantage on you', pl: '+5 do inicjatywy; nie można być zaskoczonym; ukryte istoty nie mają ułatwienia ataku na ciebie' },
            ],
            [
              { en: 'Sharpshooter', pl: 'Celownik' },
              { en: 'Dex 13', pl: 'Zrc 13' },
              { en: 'Ignore half & 3/4 cover; no long range penalty; −5 to hit for +10 damage', pl: 'Ignorujesz połowiczną i ¾ osłonę; bez kary za długi dystans; opcja: −5 do ataku za +10 obrażeń' },
            ],
            [
              { en: 'Great Weapon Master', pl: 'Łupieżca ostrzy' },
              { en: 'Heavy weapon proficiency', pl: 'Biegłość w broni ciężkiej' },
              { en: '−5 to hit for +10 damage with heavy weapons', pl: '−5 do ataku za +10 obrażeń bronią ciężką' },
            ],
            [
              { en: 'Crossbow Expert', pl: 'Mistrz ataku z zask.' },
              { en: 'Finesse/ranged proficiency', pl: 'Biegłość w finezyjnej/dystansowej' },
              { en: '−5 to hit for +10 damage (finesse/ranged)', pl: '−5 do ataku za +10 obrażeń (finezjna/dystansowa)' },
            ],
            [
              { en: 'Tavern Brawler', pl: 'Mistrz walki wręcz' },
              { en: '—', pl: '—' },
              { en: 'Unarmed +1; after unarmed hit: bonus action grapple/shove', pl: 'Ataki bez broni +1; po ataku bez broni: akcja dodatkowa na chwyt/obalenie' },
            ],
            [
              { en: 'Resilient', pl: 'Odporny' },
              { en: '—', pl: '—' },
              { en: '+1 to ability + proficiency in chosen saving throw', pl: '+1 do cechy + biegłość w wybranym rzucie obronnym' },
            ],
            [
              { en: 'Observant', pl: 'Obserwator' },
              { en: 'Int/Wis/Cha 13', pl: 'Int/Mąd/Cha 13' },
              { en: 'Read lips; passive Perception and Investigation +5', pl: 'Czytanie z warg; pasywna Percepcja i Śledztwo +5' },
            ],
            [
              { en: 'Heavily Armored', pl: 'Opancerzony' },
              { en: 'No armor proficiency', pl: 'Brak biegłości w zbroi' },
              { en: 'Proficiency in light & medium armor; +1 to ability', pl: 'Biegłość w lekkiej i średniej zbroi; +1 do cechy' },
            ],
            [
              { en: 'Lucky', pl: 'Szczęśliwy' },
              { en: '—', pl: '—' },
              { en: '3 times/long rest: reroll any d20 and choose result', pl: '3 razy/długi odpoczynek: można przerzucić dowolny rzut k20 i wybrać wynik' },
            ],
            [
              { en: 'War Caster', pl: 'Wojenny rzucający' },
              { en: 'Spellcasting ability', pl: 'Zdolność rzucania czarów' },
              { en: 'Advantage on Concentration checks; cast with full hands; spell as opportunity attack', pl: 'Ułatwienie w rzutach Koncentracji; czary z pełnymi rękami; czar jako atak okazyjny' },
            ],
            [
              { en: 'Magic Initiate', pl: 'Zmysł magii' },
              { en: '—', pl: '—' },
              { en: '1 cantrip (any list); ability = Int/Wis/Cha', pl: '1 sztuczka (dowolna lista); cecha = Int/Mąd/Cha' },
            ],
          ],
        },
      ],
    },
  ],
};
