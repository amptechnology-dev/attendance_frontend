"use client";

import { Button, Modal, Table, Tooltip } from "flowbite-react";
import { useState } from "react";
import { RiTimeLine } from "react-icons/ri";

export default function ViewButton({
  name = "",
  month = "",
  presentLogs = {},
  leaveLogs = {},
}) {
  const [openModal, setOpenModal] = useState(false); // Modal visibility state

  return (
    <div>
      <Tooltip content="Attendance Summary" placement="left">
        <Button onClick={() => setOpenModal(true)} color="info" size="xs">
          <RiTimeLine className="w-4 h-4" />
        </Button>
      </Tooltip>

      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Staff Duty Logs</Modal.Header>
        <Modal.Body>
          <div className="mb-2">
            <p>Name: {name}</p>
            <p>Month: {month}</p>
          </div>
          <div className="overflow-x-auto">
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Type</Table.HeadCell>
                <Table.HeadCell>Count</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">
                    Total Full Days
                  </Table.Cell>
                  <Table.Cell>{presentLogs.totalFullDays} days</Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">
                    Total Half Days
                  </Table.Cell>
                  <Table.Cell>{presentLogs.totalHalfDays} days</Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">
                    Total Paid Leaves
                  </Table.Cell>
                  <Table.Cell>{leaveLogs.totalPaidLeaves} days</Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">
                    Total Unpaid Leaves
                  </Table.Cell>
                  <Table.Cell>{leaveLogs.totalUnpaidLeaves} days</Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">
                    Total Hourly Pay
                  </Table.Cell>
                  <Table.Cell>{presentLogs.totalHourPay} hrs.</Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">Total Overtime</Table.Cell>
                  <Table.Cell>{presentLogs.overtimeHours} hrs.</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
