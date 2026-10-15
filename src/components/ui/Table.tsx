import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({ columns, data, emptyMessage = 'Sin registros' }: DataTableProps<T>) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={col.className}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-slate-500 py-10">{emptyMessage}</td>
            </tr>
          ) : (
            data.map(row => (
              <tr key={row.id}>
                {columns.map(col => (
                  <td key={col.key} className={col.className}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md';
  color?: string;
}

const AVATAR_COLORS = [
  'from-brand-500 to-brand-700',
  'from-violet-500 to-violet-700',
  'from-emerald-500 to-emerald-700',
  'from-cyan-500 to-cyan-700',
  'from-pink-500 to-pink-700',
  'from-amber-500 to-amber-700',
];

function getAvatarColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + hash * 31;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({ initials, size = 'md' }: AvatarProps) {
  const color = getAvatarColor(initials);
  const sizeClass = size === 'sm'
    ? 'w-7 h-7 text-[10px]'
    : 'w-9 h-9 text-xs';
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
}
