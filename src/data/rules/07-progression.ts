import { TrendingUp } from 'lucide-react';
import type { RulesSection } from './types';

export const progressionSection: RulesSection = {
  id: 'progression',
  number: 7,
  title: { en: 'Character Progression', pl: 'Rozwój postaci' },
  icon: TrendingUp,
  subsections: [
    {
      id: 'xp-table',
      title: { en: 'Experience Points (XP) Table', pl: 'Tabela punktów doświadczenia (XP)' },
      content: {
        en: 'Milestone Leveling: alternative to XP – DM decides when the party levels up based on narrative achievements. Recommended for story-driven campaigns.',
        pl: 'Kamienie milowe (Milestone Leveling): alternatywa dla XP – MP decyduje kiedy drużyna awansuje na podstawie fabularnych osiągnięć. Polecane dla kampanii narracyjnych.',
      },
      tables: [
        {
          headers: [
            { en: 'Level', pl: 'Poziom' },
            { en: 'XP Required', pl: 'XP wymagane' },
            { en: 'Proficiency', pl: 'Premia z biegłości' },
          ],
          rows: [
            [{ en: '1', pl: '1' }, { en: '0', pl: '0' }, { en: '+2', pl: '+2' }],
            [{ en: '2', pl: '2' }, { en: '300', pl: '300' }, { en: '+2', pl: '+2' }],
            [{ en: '3', pl: '3' }, { en: '900', pl: '900' }, { en: '+2', pl: '+2' }],
            [{ en: '4', pl: '4' }, { en: '2,700', pl: '2 700' }, { en: '+2', pl: '+2' }],
            [{ en: '5', pl: '5' }, { en: '6,500', pl: '6 500' }, { en: '+3', pl: '+3' }],
            [{ en: '6', pl: '6' }, { en: '14,000', pl: '14 000' }, { en: '+3', pl: '+3' }],
            [{ en: '7', pl: '7' }, { en: '23,000', pl: '23 000' }, { en: '+3', pl: '+3' }],
            [{ en: '8', pl: '8' }, { en: '34,000', pl: '34 000' }, { en: '+3', pl: '+3' }],
            [{ en: '9', pl: '9' }, { en: '48,000', pl: '48 000' }, { en: '+4', pl: '+4' }],
            [{ en: '10', pl: '10' }, { en: '65,000', pl: '65 000' }, { en: '+4', pl: '+4' }],
            [{ en: '11', pl: '11' }, { en: '85,000', pl: '85 000' }, { en: '+4', pl: '+4' }],
            [{ en: '12', pl: '12' }, { en: '100,000', pl: '100 000' }, { en: '+4', pl: '+4' }],
            [{ en: '13', pl: '13' }, { en: '120,000', pl: '120 000' }, { en: '+5', pl: '+5' }],
            [{ en: '14', pl: '14' }, { en: '140,000', pl: '140 000' }, { en: '+5', pl: '+5' }],
            [{ en: '15', pl: '15' }, { en: '165,000', pl: '165 000' }, { en: '+5', pl: '+5' }],
            [{ en: '16', pl: '16' }, { en: '195,000', pl: '195 000' }, { en: '+5', pl: '+5' }],
            [{ en: '17', pl: '17' }, { en: '225,000', pl: '225 000' }, { en: '+6', pl: '+6' }],
            [{ en: '18', pl: '18' }, { en: '265,000', pl: '265 000' }, { en: '+6', pl: '+6' }],
            [{ en: '19', pl: '19' }, { en: '305,000', pl: '305 000' }, { en: '+6', pl: '+6' }],
            [{ en: '20', pl: '20' }, { en: '355,000', pl: '355 000' }, { en: '+6', pl: '+6' }],
          ],
        },
      ],
    },
    {
      id: 'armor',
      title: { en: 'Armor – Proficiency & Consequences', pl: 'Pancerze – biegłość i konsekwencje jej braku' },
      tables: [
        {
          headers: [
            { en: 'Armor Type', pl: 'Typ pancerza' },
            { en: 'AC (example)', pl: 'KP (przykład)' },
            { en: 'Required Str', pl: 'Wymagana Siła' },
            { en: 'Stealth Disadv.', pl: 'Dyskrecja' },
          ],
          rows: [
            [
              { en: 'Leather (light)', pl: 'Skórzany (lekki)' },
              { en: '11 + Dex mod', pl: '11 + mod. Zrc' },
              { en: '—', pl: '—' },
              { en: 'No', pl: 'Nie' },
            ],
            [
              { en: 'Chain shirt (medium)', pl: 'Kolczuga (średni)' },
              { en: '14 + Dex mod (max +2)', pl: '14 + mod. Zrc (max +2)' },
              { en: '—', pl: '—' },
              { en: 'No', pl: 'Nie' },
            ],
            [
              { en: 'Scale mail (medium)', pl: 'Zbroja łuskowa (średni)' },
              { en: '14 + Dex mod (max +2)', pl: '14 + mod. Zrc (max +2)' },
              { en: '—', pl: '—' },
              { en: 'Yes (disadvantage)', pl: 'Tak (utrudnienie)' },
            ],
            [
              { en: 'Plate (heavy)', pl: 'Zbroja płytowa (ciężka)' },
              { en: '18', pl: '18' },
              { en: 'Str 15', pl: 'Siła 15' },
              { en: 'Yes (disadvantage)', pl: 'Tak (utrudnienie)' },
            ],
            [
              { en: 'Shield', pl: 'Tarcza' },
              { en: '+2 to AC', pl: '+2 do KP' },
              { en: '—', pl: '—' },
              { en: '—', pl: '—' },
            ],
          ],
        },
      ],
      content: {
        en: 'No armor proficiency consequences:\n• Disadvantage on all attack rolls.\n• Disadvantage on all ability checks based on Strength or Dexterity.\n• Cannot cast spells (armor disrupts gestures).\n\nMissing Strength requirement for heavy armor: speed reduced by 3m.',
        pl: 'Brak biegłości w pancerzu – konsekwencje:\n• Utrudnienie we wszystkich testach ataku.\n• Utrudnienie we wszystkich testach cech opartych na Sile lub Zręczności.\n• Niemożność rzucania czarów (pancerz rozprasza i ogranicza fizycznie).\n\nBrak wymaganej Siły dla ciężkiego pancerza: szybkość spada o 3 m.',
      },
    },
    {
      id: 'weapon-properties',
      title: { en: 'Weapon Properties', pl: 'Właściwości broni' },
      tables: [
        {
          headers: [
            { en: 'Property', pl: 'Właściwość' },
            { en: 'Effect', pl: 'Efekt' },
          ],
          rows: [
            [
              { en: 'Finesse', pl: 'Finezjna' },
              { en: 'Use Str or Dex for attack and damage (same ability for both)', pl: 'Możesz używać Siły lub Zręczności do ataku i obrażeń (ta sama cecha do obu)' },
            ],
            [
              { en: 'Reach', pl: 'Zasięgowa' },
              { en: 'Threat zone 3m instead of 1.5m; opportunity attacks at 3m', pl: 'Strefa ataku 3 m zamiast 1,5 m; atak okazyjny w strefie 3 m' },
            ],
            [
              { en: 'Thrown', pl: 'Rzucana' },
              { en: 'Can throw weapon (range in parentheses); uses same ability as melee', pl: 'Możesz rzucić bronią (zasięg podany w nawiasach); używasz tej samej cechy co wręcz' },
            ],
            [
              { en: 'Light', pl: 'Lekka' },
              { en: 'Can be used for two-weapon fighting', pl: 'Może być używana do walki dwiema broniami' },
            ],
            [
              { en: 'Heavy', pl: 'Ciężka' },
              { en: 'Small and smaller creatures have disadvantage on attacks', pl: 'Małe (Small) i mniejsze istoty mają utrudnienie w testach ataku tą bronią' },
            ],
            [
              { en: 'Versatile', pl: 'Obustronna' },
              { en: 'Can be used two-handed for +1 damage die; does NOT give extra attack without Two-Weapon Fighting', pl: 'Można użyć oburącz za 1k dodatkowych obrażeń; NIE daje drugiego ataku bez Walki dwiema broniami' },
            ],
            [
              { en: 'Loading', pl: 'Ładowanie' },
              { en: 'Must reload after each ranged attack (only 1 attack per action, even with Extra Attack)', pl: 'Po każdym ataku dystansowym musisz przeładować (tylko 1 atak na akcję, nawet przy Dodatkowym ataku)' },
            ],
            [
              { en: 'Special', pl: 'Specjalna' },
              { en: 'Special rules described with the weapon (e.g., lance, net)', pl: 'Szczególne zasady opisane przy broni (np. włócznia, sieć)' },
            ],
          ],
        },
      ],
    },
  ],
  linkedDataType: 'weapon-properties',
};
