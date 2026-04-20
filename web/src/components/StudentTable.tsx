"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import Link from "next/link";

interface Row {
  slug: string;
  name: string;
  year: string;
  graduation: string;
  totalApproved: number;
}

const col = createColumnHelper<Row>();

const columns = [
  col.accessor("name", {
    header: "Name",
    cell: (info) => (
      <Link href={`/students/${info.row.original.slug}`} className="text-mnsu-maroon hover:underline font-medium">
        {info.getValue() || <span className="text-gray-400 italic">Unknown</span>}
      </Link>
    ),
  }),
  col.accessor("year", { header: "Year" }),
  col.accessor("graduation", { header: "Expected Graduation" }),
  col.accessor("totalApproved", { header: "Approved Experiences" }),
];

interface Props {
  rows: Row[];
  years: string[];
  terms: string[];
}

export default function StudentTable({ rows, years, terms }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [yearFilter, setYearFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("all");

  const filtered = useMemo(() =>
    rows.filter((r) =>
      (yearFilter === "all" || r.year === yearFilter) &&
      (termFilter === "all" || r.graduation === termFilter)
    ),
    [rows, yearFilter, termFilter]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-100 flex gap-3 flex-wrap">
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-mnsu-maroon"
        >
          <option value="all">All years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={termFilter}
          onChange={(e) => setTermFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-mnsu-maroon"
        >
          <option value="all">All graduation terms</option>
          {terms.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="text-xs text-gray-400 self-center">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-gray-100 bg-gray-50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-2 text-left font-semibold text-gray-600 cursor-pointer select-none hover:text-mnsu-maroon"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" ? " ↑" : header.column.getIsSorted() === "desc" ? " ↓" : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">No students match the selected filters.</td></tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
