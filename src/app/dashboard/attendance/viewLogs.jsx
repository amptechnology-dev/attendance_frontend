"use client";

import { Button, Modal, Table, Tooltip } from "flowbite-react";
import { useState } from "react";
import { format } from "date-fns";
import { RiListView } from "react-icons/ri";
import { differenceInMinutes } from "date-fns";
import { minutesToHM } from "@/lib/helpers";

export default function ViewButton({ name, logs = [] }) {
  const [openModal, setOpenModal] = useState(false); // Modal visibility state

  return (
    <div>
      <Tooltip content="View Entry/Exit Logs" placement="left">
        <Button onClick={() => setOpenModal(true)} color="dark" size="xs">
          <RiListView className="w-4 h-4" />
        </Button>
      </Tooltip>

      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Entry & Exit Logs</Modal.Header>
        <Modal.Body>
          <div className="mb-2">
            <p>Name: {name}</p>
            <p>Date: {logs.length && format(logs[0]?.date, "dd-MM-yyyy")}</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <Table.Head>
                <Table.HeadCell>Sl No</Table.HeadCell>
                <Table.HeadCell>Entry</Table.HeadCell>
                <Table.HeadCell>Exit</Table.HeadCell>
                <Table.HeadCell>Work Time</Table.HeadCell>
                <Table.HeadCell>Break Time</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {logs.map((log, i) => (
                  <Table.Row className="bg-white" key={i}>
                    <Table.Cell>{log.slNo}</Table.Cell>
                    <Table.Cell>{format(log.entryTime, "hh:mm a")}</Table.Cell>
                    <Table.Cell>
                      {log.exitTime ? format(log.exitTime, "hh:mm a") : "-"}
                    </Table.Cell>
                    <Table.Cell>
                      {minutesToHM(log.workingTime)}
                    </Table.Cell>
                    <Table.Cell>
                      {i > 0
                        ? (() => {
                            const breakMinutes = differenceInMinutes(
                              log.entryTime,
                              logs[i - 1].exitTime
                            );
                            return minutesToHM(breakMinutes);
                          })()
                        : "-"}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
