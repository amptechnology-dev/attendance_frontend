"use client";

import { Button, Modal, Table, Tooltip } from "flowbite-react";
import { useState } from "react";
import { format, differenceInSeconds } from "date-fns";
import { RiListView } from "react-icons/ri";

// সেকেন্ড থেকে "Xh Ym Zs" ফরম্যাটে দেখানোর জন্য নতুন helper
// (আগের minutesToHM মিনিট-precision-এ কাজ করতো, সেকেন্ড হারিয়ে যেত)
const formatHMS = (totalSeconds) => {
  if (totalSeconds == null || totalSeconds < 0) return "-";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`); // সেকেন্ড সবসময় দেখানো হবে, transparency-এর জন্য
  return parts.join(" ");
};

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
                    {/* FIX: এখন সেকেন্ড সহ দেখাবে, যাতে exact punch time বোঝা যায় */}
                    <Table.Cell>{format(log.entryTime, "hh:mm:ss a")}</Table.Cell>
                    <Table.Cell>
                      {log.exitTime ? format(log.exitTime, "hh:mm:ss a") : "-"}
                    </Table.Cell>
                    <Table.Cell>
                      {/* FIX: stored (rounded) workingTime-এর বদলে সরাসরি entry/exit
                          থেকে সেকেন্ড-precision এ হিসাব করা হচ্ছে */}
                      {log.exitTime
                        ? formatHMS(differenceInSeconds(log.exitTime, log.entryTime))
                        : "-"}
                    </Table.Cell>
                    <Table.Cell>
                      {i > 0 && logs[i - 1].exitTime
                        ? formatHMS(differenceInSeconds(log.entryTime, logs[i - 1].exitTime))
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