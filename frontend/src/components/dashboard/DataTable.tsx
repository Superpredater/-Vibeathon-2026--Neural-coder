import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
}

export default function DataTable<T extends { id: string }>({ columns, data, emptyMessage = 'No data found.' }: DataTableProps<T>) {
  return (
    <div className="rounded-2xl bg-white shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {columns.map(col => (
                <th key={col.key} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-slate-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors duration-100">
                  {columns.map(col => (
                    <td key={col.key} className="px-5 py-3.5 text-slate-700">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
