'use client';

import type { Language } from '@/stores/languageStore';
import type { RulesTable as RulesTableType } from '@/data/rules/types';

interface RulesTableProps {
  table: RulesTableType;
  language: Language;
}

export function RulesTable({ table, language }: RulesTableProps) {
  return (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border/50">
            {table.headers.map((header, i) => (
              <th
                key={i}
                className="text-left px-3 py-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider"
              >
                {header[language]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-border/30 hover:bg-slate-800/30 transition-colors"
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className={`px-3 py-2 text-slate-300 ${cellIdx === 0 ? 'font-medium text-slate-200' : ''}`}
                >
                  {cell[language]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
