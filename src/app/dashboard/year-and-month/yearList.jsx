"use client";

import { Table, Badge } from "flowbite-react";
import { formatDate } from "date-fns";
import AddYearButton from "./addYear";
import EditYearButton from "./editYear";
import DeleteYearButton from "./deleteYear";

export default function Component({ data = [] }) {
  return (
    <div className="p-2">
      <div className="flex justify-between mb-3">
        <h1 className="text-2xl">Financial Years</h1>
        <AddYearButton />
      </div>
      <Table striped>
        <Table.Head>
          <Table.HeadCell>Label</Table.HeadCell>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>#</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {data.map((item, index) => (
            <Table.Row
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
              key={index}
            >
              <Table.Cell className="flex gap-2">
                {item.yearLabel}
                {item.isActive && (
                  <Badge color="success" size="xs">
                    Current
                  </Badge>
                )}
              </Table.Cell>
              <Table.Cell>
                {formatDate(item.startDate, "dd/MM/yyyy")}
                <br />
                {formatDate(item.endDate, "dd/MM/yyyy")}
              </Table.Cell>
              <Table.Cell>
                {/* <EditYearButton data={item} /> */}
                <DeleteYearButton id={item._id} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
