import { Moon } from 'lucide-react';
import type { RulesSection } from './types';

export const restSection: RulesSection = {
  id: 'rest',
  number: 4,
  title: { en: 'Rest & Recovery', pl: 'Odpoczynek i regeneracja' },
  icon: Moon,
  subsections: [
    {
      id: 'short-rest',
      title: { en: 'Short Rest', pl: 'Krótki odpoczynek' },
      tables: [
        {
          headers: [
            { en: 'Parameter', pl: 'Parametr' },
            { en: 'Value', pl: 'Wartość' },
          ],
          rows: [
            [{ en: 'Duration', pl: 'Czas' }, { en: 'Min. 1 hour', pl: 'Min. 1 godzina' }],
            [{ en: 'Activity', pl: 'Aktywność' }, { en: 'Eating, drinking, reading, tending wounds', pl: 'Jedzenie, picie, czytanie, opatrywanie ran' }],
            [{ en: 'Healing', pl: 'Leczenie' }, { en: 'Spend Hit Dice (max = your level)', pl: 'Wydajesz Kości Wytrzymałości (max = twój poziom)' }],
            [{ en: 'How to heal', pl: 'Jak leczyć' }, { en: 'Roll HD + Con modifier = HP regained', pl: 'Rzuć KW + mod. Kondycji = odzyskane PW' }],
            [{ en: 'HD recovery', pl: 'Odzysk KW' }, { en: 'After long rest: half spent (min 1)', pl: 'Po długim odpoczynku: połowa wydanych (min. 1)' }],
          ],
        },
      ],
    },
    {
      id: 'long-rest',
      title: { en: 'Long Rest', pl: 'Długi odpoczynek' },
      tables: [
        {
          headers: [
            { en: 'Parameter', pl: 'Parametr' },
            { en: 'Value', pl: 'Wartość' },
          ],
          rows: [
            [{ en: 'Duration', pl: 'Czas' }, { en: 'Min. 8 hours (incl. ≥6h sleep)', pl: 'Min. 8 godzin (w tym ≥6h snu)' }],
            [{ en: 'Interruption', pl: 'Przerwanie' }, { en: '≥1h of fighting/casting/activity = restart', pl: '≥1h walki/czarowania/aktywności = zacznij od nowa' }],
            [{ en: 'HP healing', pl: 'Leczenie PW' }, { en: 'Regain all HP', pl: 'Odzysk wszystkich PW' }],
            [{ en: 'Hit Dice', pl: 'Kości Wytrzymałości' }, { en: 'Regain half (min 1)', pl: 'Odzysk połowy (min. 1)' }],
            [{ en: 'Spell slots', pl: 'Komórki czarów' }, { en: 'All regained (exception: warlock, monk)', pl: 'Wszystkie odrzucone (wyjątek: czarownik, mnich)' }],
            [{ en: 'Limit', pl: 'Limit' }, { en: 'Max 1 long rest per 24 hours', pl: 'Max 1 długi odpoczynek na 24 godziny' }],
            [{ en: 'Start condition', pl: 'Warunek startu' }, { en: 'Min 1 HP', pl: 'Min. 1 PW' }],
            [{ en: 'Exhaustion', pl: 'Wyczerpanie' }, { en: 'Removes 1 level (if fed and watered)', pl: 'Usuwa 1 poziom (jeśli najedzony i napojony)' }],
          ],
        },
      ],
    },
    {
      id: 'exhaustion',
      title: { en: 'Exhaustion', pl: 'Wyczerpanie' },
      content: {
        en: 'Effects are cumulative (level 3 = effects of 1+2+3). Removal: long rest −1 level; some resurrection spells −1 level.',
        pl: 'Efekty kumulują się (poziom 3 = efekty 1+2+3). Usuwanie: długi odpoczynek −1 poziom; przywrócenie do życia −1 poziom; niektóre czary.',
      },
      tables: [
        {
          headers: [
            { en: 'Level', pl: 'Poziom' },
            { en: 'Effect', pl: 'Efekt' },
          ],
          rows: [
            [{ en: '1', pl: '1' }, { en: 'Disadvantage on ability checks', pl: 'Utrudnienie w testach cech' }],
            [{ en: '2', pl: '2' }, { en: 'Speed halved', pl: 'Szybkość zmniejszona o połowę' }],
            [{ en: '3', pl: '3' }, { en: 'Disadvantage on attack rolls and saving throws', pl: 'Utrudnienie w testach ataku i rzutach obronnych' }],
            [{ en: '4', pl: '4' }, { en: 'Max HP halved', pl: 'Maksymalne PW zmniejszone o połowę' }],
            [{ en: '5', pl: '5' }, { en: 'Speed = 0', pl: 'Szybkość = 0' }],
            [{ en: '6', pl: '6' }, { en: 'Death', pl: 'Śmierć' }],
          ],
        },
      ],
    },
  ],
};
