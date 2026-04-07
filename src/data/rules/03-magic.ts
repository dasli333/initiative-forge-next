import { Sparkles } from 'lucide-react';
import type { RulesSection } from './types';

export const magicSection: RulesSection = {
  id: 'magic',
  number: 3,
  title: { en: 'Magic & Spells', pl: 'Magia i czary' },
  icon: Sparkles,
  subsections: [
    {
      id: 'spell-save-dc',
      title: { en: 'Spell Save DC', pl: 'ST rzutu obronnego przeciw czarom' },
      content: {
        en: 'Spell Save DC = 8 + spellcasting ability modifier + proficiency bonus\nSpell Attack Bonus = spellcasting ability modifier + proficiency bonus',
        pl: 'ST = 8 + modyfikator z cechy bazowej + premia z biegłości\nBonus do ataku czarem = modyfikator z cechy bazowej + premia z biegłości',
      },
    },
    {
      id: 'spellcasting-abilities',
      title: { en: 'Spellcasting Abilities by Class', pl: 'Cechy bazowe klas czarujących' },
      tables: [
        {
          headers: [
            { en: 'Class', pl: 'Klasa' },
            { en: 'Spellcasting Ability', pl: 'Cecha bazowa' },
          ],
          rows: [
            [{ en: 'Wizard', pl: 'Mag' }, { en: 'Intelligence', pl: 'Inteligencja' }],
            [{ en: 'Cleric', pl: 'Kleryk' }, { en: 'Wisdom', pl: 'Mądrość' }],
            [{ en: 'Druid', pl: 'Druid' }, { en: 'Wisdom', pl: 'Mądrość' }],
            [{ en: 'Ranger', pl: 'Łowca' }, { en: 'Wisdom', pl: 'Mądrość' }],
            [{ en: 'Monk (Way of 4 Elements)', pl: 'Mnich (Droga 4 Żywiołów)' }, { en: 'Wisdom', pl: 'Mądrość' }],
            [{ en: 'Bard', pl: 'Bard' }, { en: 'Charisma', pl: 'Charyzma' }],
            [{ en: 'Sorcerer', pl: 'Czarownik' }, { en: 'Charisma', pl: 'Charyzma' }],
            [{ en: 'Warlock', pl: 'Zaklinacz' }, { en: 'Charisma', pl: 'Charyzma' }],
            [{ en: 'Paladin', pl: 'Paladyn' }, { en: 'Charisma', pl: 'Charyzma' }],
          ],
        },
      ],
    },
    {
      id: 'casting-time',
      title: { en: 'Casting Time', pl: 'Czas rzucania czaru' },
      tables: [
        {
          headers: [
            { en: 'Casting Time', pl: 'Czas rzucania' },
            { en: 'Rules', pl: 'Zasady' },
          ],
          rows: [
            [{ en: '1 action', pl: '1 akcja' }, { en: 'Standard', pl: 'Standardowo' }],
            [{ en: '1 bonus action', pl: '1 akcja dodatkowa' }, { en: 'Bonus action restriction rule (see below)', pl: 'Zasada obustronnego ograniczenia (patrz niżej)' }],
            [{ en: 'Reaction', pl: 'Reakcja' }, { en: 'Specific trigger in spell description', pl: 'Określony warunek w opisie czaru' }],
            [{ en: '1 minute+', pl: '1 minuta+' }, { en: 'Must concentrate during incantation; interruption = no spell, no slot loss', pl: 'Musisz koncentrować się przez całą inkantację; przerwanie = brak czaru, brak utraty komórki' }],
          ],
        },
      ],
      content: {
        en: 'Bonus action spell rule (works BOTH ways):\n• If you cast a spell as a bonus action → you can only cast cantrips (casting time 1 action) as your action. No leveled spells as action.\n• If you cast a leveled spell as an action → you cannot cast any spell as a bonus action (not even bonus action cantrips).\n• Cantrips (1 action) are always allowed as your action when bonus action was a spell.\n• Reaction spell on your own turn after a bonus action spell: not allowed (RAW).\n\nCorrect: Healing Word (bonus action, spell slot) + Chill Touch (cantrip, 1 action) ✓\nWrong: Misty Step (bonus action) + Fireball (1 action, spell slot) ✗',
        pl: 'Zasada akcji dodatkowej i czarów (obowiązuje w obie strony):\n• Jeśli rzucasz czar jako akcję dodatkową → tego samego runda możesz rzucić tylko sztuczki (casting time 1 akcja) jako akcję. Żadnych czarów z komórek jako akcja.\n• Jeśli rzucasz czar z komórek jako akcję → tego samego runda NIE możesz rzucić żadnego czaru jako akcji dodatkowej (nawet sztuczki o casting time bonus action).\n• Sztuczki (1 akcja) są zawsze dozwolone jako akcja, gdy akcja dodatkowa była czarem.\n• Reakcja-czar na własnej turze po rzuceniu czaru akcją dodatkową: niedozwolone (RAW).\n\nPrawidłowo: Leczące słowo (akcja dodatkowa, czar z komórki) + Mrożący dotyk (sztuczka, 1 akcja) ✓\nBłędnie: Misty Step (akcja dodatkowa) + Fireball (1 akcja, z komórki) ✗',
      },
    },
    {
      id: 'concentration',
      title: { en: 'Concentration', pl: 'Koncentracja' },
      content: {
        en: 'Breaks concentration:\n• Casting another concentration spell.\n• Taking damage → Constitution saving throw DC = max(10, half damage).\n• Incapacitation or death.\n• DM may require a check in extreme circumstances (e.g., storm, DC 10).\n\nDoes NOT break: movement, attack, most actions.\nYou can end concentration voluntarily at any time (no action required).',
        pl: 'Przerywa ją:\n• Rzucenie innego czaru wymagającego koncentracji.\n• Otrzymanie obrażeń → rzut obronny na Kondycję ST = max(10, połowa obrażeń).\n• Obezwładnienie lub śmierć.\n• MP może wymagać rzutu w ekstremalnych okolicznościach (np. sztorm, ST 10).\n\nNie przerywa: ruch, atak, większość akcji.\nMożesz zakończyć koncentrację dobrowolnie w dowolnym momencie (bez akcji).',
      },
    },
    {
      id: 'spell-components',
      title: { en: 'Spell Components', pl: 'Komponenty czarów' },
      tables: [
        {
          headers: [
            { en: 'Component', pl: 'Komponent' },
            { en: 'Description', pl: 'Opis' },
            { en: 'Blocked when...', pl: 'Blokuje gdy...' },
          ],
          rows: [
            [
              { en: 'V (Verbal)', pl: 'W (Werbalny)' },
              { en: 'Loud incantation', pl: 'Głośna inkantacja' },
              { en: 'Gagged, silence spell', pl: 'Zakneblowany, cisza (czar silence)' },
            ],
            [
              { en: 'S (Somatic)', pl: 'S (Somatyczny)' },
              { en: 'Gestures', pl: 'Gesty' },
              { en: 'No free hand', pl: 'Brak wolnej ręki' },
            ],
            [
              { en: 'M (Material)', pl: 'M (Materialny)' },
              { en: 'Specific item', pl: 'Konkretny przedmiot' },
              { en: 'No material or focus (if cost specified – only specific material)', pl: 'Brak materiału lub fokusu (jeśli jest koszt – tylko konkretny materiał)' },
            ],
          ],
        },
      ],
    },
    {
      id: 'spell-areas',
      title: { en: 'Spell Areas of Effect', pl: 'Obszary działania czarów' },
      content: {
        en: 'Spell effect spreads in straight lines from origin. Total cover blocks the line of effect.',
        pl: 'Efekt czaru rozchodzi się po prostych od punktu wyjścia. Całkowita osłona blokuje linię efektu.',
      },
      tables: [
        {
          headers: [
            { en: 'Shape', pl: 'Kształt' },
            { en: 'Origin Point', pl: 'Punkt wyjścia' },
            { en: 'Characteristic', pl: 'Charakterystyka' },
          ],
          rows: [
            [
              { en: 'Sphere', pl: 'Sfera' },
              { en: 'Center of sphere', pl: 'Środek sfery' },
              { en: 'Origin is included in the area', pl: 'Punkt wyjścia wchodzi w obszar' },
            ],
            [
              { en: 'Cone', pl: 'Stożek' },
              { en: 'Apex of cone', pl: 'Wierzchołek stożka' },
              { en: 'Width at any point = distance from apex', pl: 'Szerokość w danym punkcie = odległość od wierzchołka' },
            ],
            [
              { en: 'Line', pl: 'Prosta / Linia' },
              { en: 'One end', pl: 'Jeden koniec' },
              { en: 'Has specified width; target must be within the line', pl: 'Ma podaną szerokość; cel musi być w obrębie linii' },
            ],
            [
              { en: 'Cube', pl: 'Sześcian' },
              { en: 'On one face', pl: 'Na jednej ścianie' },
              { en: 'Side = cube edge', pl: 'Bok = krawędź sześcianu' },
            ],
            [
              { en: 'Cylinder', pl: 'Walec' },
              { en: 'Center of base circle', pl: 'Środek koła u podstawy' },
              { en: 'Effect spreads up or down', pl: 'Efekt rozchodzi się w górę lub w dół' },
            ],
          ],
        },
      ],
    },
    {
      id: 'multiclass-spell-slots',
      title: { en: 'Multiclass Spell Slots', pl: 'Komórki czarów – wieloklasowość' },
      content: {
        en: 'Spell slot level = sum of:\n• Full levels: Bard, Cleric, Druid, Wizard, Warlock\n• ½ levels (round down): Paladin, Ranger\n• ⅓ levels (round down): Fighter (Eldritch Knight), Rogue (Arcane Trickster)\n\nCheck result in the Multiclassing – Spell Slots table from PHB (p. 165).',
        pl: 'Poziom komórek = suma:\n• pełnych poziomów: Bard, Kleryk, Druid, Mag, Zaklinacz\n• ½ poziomów (zaokrąglaj w dół): Paladyn, Łowca\n• ⅓ poziomów (zaokrąglaj w dół): Wojownik (Mistyczny Rycerz), Łotr (Mistyczny Oszust)\n\nSprawdź wynik w tabeli Wieloklasowość – komórki czarów z Podręcznika Gracza (str. 165).',
      },
    },
    {
      id: 'cantrips-rituals',
      title: { en: 'Cantrips & Rituals', pl: 'Sztuczki i rytuały' },
      content: {
        en: 'Cantrip (0th level): no slots, no preparation, at will.\nRitual: spell with "ritual" tag; casting time +10 minutes; no slot expended; cannot be upcast.\n• Cleric, Druid: must have prepared.\n• Bard: must have on known list.\n• Wizard: can cast from spellbook without preparing.',
        pl: 'Sztuczka (0 krąg): bez komórek, bez przygotowania, do woli.\nRytuał: czar z tagiem „rytuał"; czas +10 minut; bez zużycia komórki; nie można na wyższym kręgu.\n• Kleryk, Druid: musi mieć przygotowany.\n• Bard: musi mieć na liście znanych.\n• Mag: może rzucać z księgi bez przygotowania.',
      },
    },
  ],
};
