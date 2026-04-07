import { AlertCircle } from 'lucide-react';
import type { RulesSection } from './types';

export const conditionsSection: RulesSection = {
  id: 'conditions',
  number: 5,
  title: { en: 'Conditions (Statuses)', pl: 'Stany (statusy)' },
  icon: AlertCircle,
  linkedDataType: 'conditions',
  subsections: [
    {
      id: 'conditions-hierarchy',
      title: { en: 'Condition Hierarchy', pl: 'Stany „zawierające się"' },
      content: {
        en: 'PETRIFIED ⊃ INCAPACITATED\nPARALYZED ⊃ INCAPACITATED\nSTUNNED ⊃ INCAPACITATED\nUNCONSCIOUS ⊃ INCAPACITATED',
        pl: 'SKAMIENIAŁY ⊃ OBEZWŁADNIONY\nSPARALIŻOWANY ⊃ OBEZWŁADNIONY\nOGŁUSZONY ⊃ OBEZWŁADNIONY\nNIEPRZYTOMNY ⊃ OBEZWŁADNIONY',
      },
    },
  ],
};
