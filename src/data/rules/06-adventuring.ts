import { Compass } from 'lucide-react';
import type { RulesSection } from './types';

export const adventuringSection: RulesSection = {
  id: 'adventuring',
  number: 6,
  title: { en: 'Adventuring', pl: 'Poszukiwanie przygód' },
  icon: Compass,
  subsections: [
    {
      id: 'travel-pace',
      title: { en: 'Travel Pace', pl: 'Tempo podróży' },
      content: {
        en: 'Forced march: after 8h per day, each additional hour = Constitution save DC 10 + 1/hour. Failure: 1 level of exhaustion. Difficult terrain: each meter = +1 meter of speed (half distance).',
        pl: 'Forsowny marsz: po 8h dziennie, każda dodatkowa godzina = rzut obronny na Kondycję ST 10 + 1/godzinę. Porażka: 1 poziom wyczerpania. Trudny teren: każdy metr = +1 metr szybkości (połowa dystansu).',
      },
      tables: [
        {
          headers: [
            { en: 'Pace', pl: 'Tempo' },
            { en: 'Minute', pl: 'Minuta' },
            { en: 'Hour', pl: 'Godzina' },
            { en: 'Day', pl: 'Dzień' },
            { en: 'Effect', pl: 'Efekt' },
          ],
          rows: [
            [
              { en: 'Fast', pl: 'Szybkie' },
              { en: '120 m', pl: '120 m' },
              { en: '6 km', pl: '6 km' },
              { en: '45 km', pl: '45 km' },
              { en: '−5 to passive Perception', pl: '−5 do pasywnej Percepcji' },
            ],
            [
              { en: 'Normal', pl: 'Normalne' },
              { en: '90 m', pl: '90 m' },
              { en: '4.5 km', pl: '4,5 km' },
              { en: '36 km', pl: '36 km' },
              { en: '—', pl: '—' },
            ],
            [
              { en: 'Slow', pl: 'Wolne' },
              { en: '60 m', pl: '60 m' },
              { en: '3 km', pl: '3 km' },
              { en: '27 km', pl: '27 km' },
              { en: 'Can stealth', pl: 'Możliwość skradania się' },
            ],
          ],
        },
      ],
    },
    {
      id: 'jumping',
      title: { en: 'Jumping', pl: 'Skakanie' },
      content: {
        en: 'Example: character with Str 16 (mod +3) high jump: 0.9 + 3×0.3 = 1.8 m. Each meter of jump = 1 meter of speed.',
        pl: 'Przykład: postać z Siłą 16 (mod. +3) skacze wzwyż: 0,9 + 3×0,3 = 1,8 m. Każdy przebyty metr skoku = 1 metr szybkości.',
      },
      tables: [
        {
          headers: [
            { en: 'Jump', pl: 'Skok' },
            { en: 'With running start (≥3m)', pl: 'Z rozbiegu (≥3m przed skokiem)' },
            { en: 'Standing', pl: 'Z miejsca' },
          ],
          rows: [
            [
              { en: 'Long jump', pl: 'W dal' },
              { en: 'Str × 0.3 m', pl: 'Siła × 0,3 m' },
              { en: 'Half', pl: 'Połowa' },
            ],
            [
              { en: 'High jump', pl: 'Wzwyż' },
              { en: '0.9m + (Str mod × 0.3m)', pl: '0,9 m + (mod. Siły × 0,3 m)' },
              { en: 'Half', pl: 'Połowa' },
            ],
          ],
        },
      ],
    },
    {
      id: 'vision-light',
      title: { en: 'Vision & Light', pl: 'Widoczność i światło' },
      tables: [
        {
          headers: [
            { en: 'Lighting', pl: 'Oświetlenie' },
            { en: 'Effect', pl: 'Efekt' },
          ],
          rows: [
            [{ en: 'Bright light', pl: 'Jasne światło' }, { en: 'Normal vision', pl: 'Normalne widzenie' }],
            [{ en: 'Dim light (twilight, shadow)', pl: 'Słabe światło (zmierzch, cień)' }, { en: 'Lightly obscured → disadvantage on Perception (sight)', pl: 'Obszar o ograniczonej widoczności → utrudnienie w testach Percepcji wzrokowej' }],
            [{ en: 'Darkness', pl: 'Ciemność' }, { en: 'Heavily obscured → treated as blinded', pl: 'Obszar bez widoczności → traktowany jak oślepiony' }],
          ],
        },
      ],
      content: {
        en: 'Darkvision: darkness = dim light; no colors; range in stats.\nBlindsight: perceives without sight within range; sight-based effects don\'t work.\nTruesight: sees invisible, illusions, shapechangers, Ethereal Plane; range in ability.',
        pl: 'Widzenie w ciemności: ciemność = słabe światło; brak kolorów; zasięg w statystykach.\nŚlepowidzenie: postrzega bez wzroku w podanym zasięgu; efekty bazujące na wzroku nie działają.\nPrawdziwe widzenie: widzi niewidzialne, iluzje, zmiennokształtnych, Sferę Eteryczną; zasięg w zdolności.',
      },
    },
    {
      id: 'environmental-rules',
      title: { en: 'Environmental Rules', pl: 'Zasady środowiskowe' },
      tables: [
        {
          headers: [
            { en: 'Situation', pl: 'Sytuacja' },
            { en: 'Rule', pl: 'Zasada' },
          ],
          rows: [
            [
              { en: 'Falling', pl: 'Upadek' },
              { en: '1d6 bludgeoning per 3m (max 20d6); lands prone (unless 0 damage)', pl: '1k6 obrażeń obuchowych za każde 3 m (max 20k6); ląduje powalony (chyba że 0 obrażeń)' },
            ],
            [
              { en: 'Holding breath', pl: 'Wstrzymanie oddechu' },
              { en: '1 + Con mod minutes (min 30 sec)', pl: '1 + mod. Kondycji minut (min. 30 sekund)' },
            ],
            [
              { en: 'Suffocating', pl: 'Duszenie' },
              { en: 'After air runs out: Con mod rounds (min 1) → HP = 0, dying', pl: 'Po wyczerpaniu powietrza: mod. Kondycji rund (min. 1) → PW = 0, umiera' },
            ],
            [
              { en: 'Food', pl: 'Jedzenie' },
              { en: '0.5 kg/day; max without food: 3 + Con mod days (min 1); then 1 exhaustion/day', pl: '0,5 kg/dzień; max bez jedzenia: 3 + mod. Kondycji dni (min. 1); potem 1 poziom wyczerpania/dzień' },
            ],
            [
              { en: 'Water', pl: 'Woda' },
              { en: '2L/day (4L in heat); too little = Con DC 15 or 1 exhaustion. Dehydration exhaustion cannot be removed until full daily water is consumed.', pl: '2 l/dzień (4 l w upale); za mało = rzut Kondycja ST 15 lub 1 poziom wyczerpania. Wyczerpanie z odwodnienia nie może być usunięte dopóki stworzenie nie wypije pełnej wymaganej dziennej ilości wody.' },
            ],
          ],
        },
      ],
    },
    {
      id: 'social-interactions',
      title: { en: 'Social Interactions', pl: 'Interakcje społeczne' },
      content: {
        en: 'NPC attitude: Friendly / Indifferent / Hostile. Roleplaying can modify the result: great argument → advantage; insulting an NPC\'s ally → disadvantage.',
        pl: 'Nastawienie BN: Przyjazny / Obojętny / Wrogi. Odgrywanie postaci może modyfikować wynik: świetna argumentacja → ułatwienie; obraza sojusznika BN → utrudnienie.',
      },
      tables: [
        {
          headers: [
            { en: 'Check', pl: 'Test' },
            { en: 'When', pl: 'Kiedy' },
          ],
          rows: [
            [{ en: 'Charisma (Persuasion)', pl: 'Charyzma (Perswazja)' }, { en: 'Diplomacy, requests, good-faith negotiation', pl: 'Dyplomacja, prośby, negocjacje w dobrej wierze' }],
            [{ en: 'Charisma (Deception)', pl: 'Charyzma (Oszustwo)' }, { en: 'Lies, manipulation, false identities', pl: 'Kłamstwo, manipulacja, fałszywe tożsamości' }],
            [{ en: 'Charisma (Intimidation)', pl: 'Charyzma (Zastraszanie)' }, { en: 'Threats, show of force', pl: 'Groźby, demonstracja siły' }],
            [{ en: 'Wisdom (Insight)', pl: 'Mądrość (Intuicja)' }, { en: 'Detect lies, read intentions', pl: 'Wykrycie kłamstwa, odczytanie intencji' }],
            [{ en: 'Charisma (Performance)', pl: 'Charyzma (Występy)' }, { en: 'Entertainment, artistic performance', pl: 'Rozrywka, popis artystyczny' }],
          ],
        },
      ],
    },
    {
      id: 'downtime-activities',
      title: { en: 'Downtime Activities', pl: 'Aktywności między przygodami' },
      tables: [
        {
          headers: [
            { en: 'Activity', pl: 'Aktywność' },
            { en: 'Time', pl: 'Czas' },
            { en: 'Cost/Effect', pl: 'Koszt/Efekt' },
          ],
          rows: [
            [{ en: 'Crafting', pl: 'Rzemiosło' }, { en: 'Days of work', pl: 'Dni pracy' }, { en: '5 gp value/day; materials = ½ price', pl: '5 sz wartości/dzień; materiały = ½ ceny' }],
            [{ en: 'Practicing a profession', pl: 'Praca w zawodzie' }, { en: 'No limit', pl: 'Bez limitu' }, { en: 'Modest lifestyle for free', pl: 'Utrzymanie na skromnym poziomie za darmo' }],
            [{ en: 'Recuperating', pl: 'Powrót do zdrowia' }, { en: '3 days', pl: '3 dni' }, { en: 'Con DC 15 → end 1 effect blocking HP or advantage vs disease/poison', pl: 'Rzut Kondycja ST 15 → zakończ 1 efekt blokujący PW lub ułatwienie vs choroba/trucizna' }],
            [{ en: 'Research', pl: 'Badania' }, { en: 'Depends on info', pl: 'Zależy od info' }, { en: '1 gp/day; DM determines availability', pl: '1 sz/dzień; MP określa dostępność' }],
            [{ en: 'Training language/tool', pl: 'Trening języka/narzędzia' }, { en: '250 days', pl: '250 dni' }, { en: '1 gp/day; upon completion: new proficiency', pl: '1 sz/dzień; po zakończeniu: nowa biegłość' }],
          ],
        },
      ],
    },
  ],
};
