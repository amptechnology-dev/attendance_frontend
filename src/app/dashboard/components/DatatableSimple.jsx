"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, Pagination, TextInput } from "flowbite-react";

/**
 * DatatableSimple - A React component that renders a table with sorting, pagination, and global search.
 * @param {string} tableHeading - The heading of the table.
 * @param {Array} data - The data to be displayed in the table.
 * @param {Array} columns - The columns to be displayed in the table.
 * @param {Button} [Button] - The Button component from Flowbite-React. (Use for adding new records)
 * @returns JSX Element representing the table.
 */
export default function Datatable({
  tableHeading = "Table",
  data = [],
  columns = [],
  Button = null,
}) {
  // State hooks for sorting, pagination, and global filter
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [globalFilter, setGlobalFilter] = useState("");

  // Initialize the table instance with necessary configurations
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div>
      {/* Header Section with Title and Global Search */}
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <h1 className="text-lg lg:text-xl">{tableHeading}</h1>
        <div className="flex w-full sm:w-auto gap-2 justify-between sm:justify-center items-center">
          <TextInput
            value={globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="flex-1 sm:flex-none"
          />
          {Button}
        </div>
      </div>

      {/* Table Render */}
      <div className="overflow-x-auto">
        <Table striped>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Head key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.HeadCell
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{
                    asc: " 🔼",
                    desc: " 🔽",
                  }[header.column.getIsSorted()] ?? null}
                </Table.HeadCell>
              ))}
            </Table.Head>
          ))}

          {/* Table Body */}
          <Table.Body className="divide-y">
            {table.getRowModel().rows.map((row) => (
              <Table.Row
                key={row.id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Footer Section with Row Count and Pagination Controls */}
      <div className="flex justify-between">
        <div className="mt-2">
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Showing <b>{pagination.pageIndex * pagination.pageSize + 1}</b> -
            <b>
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                table.getRowCount()
              )}
            </b>{" "}
            of <b>{table.getRowCount().toLocaleString()}</b> Entries
          </p>
        </div>
        <div className="flex overflow-x-auto sm:justify-end">
          <Pagination
            currentPage={table.getState().pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            onPageChange={(page) => table.setPageIndex(page - 1)}
          />
        </div>
      </div>
    </div>
  );
}
