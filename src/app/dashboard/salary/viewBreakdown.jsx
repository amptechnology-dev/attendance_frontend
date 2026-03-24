"use client";

import { Button, Modal, Table, Tooltip } from "flowbite-react";
import { useState, useEffect } from "react";
import { RiFileList3Line } from "react-icons/ri";

export default function ViewButton({
  name = "",
  month = "",
  salaryStructure = {},
  presentLogs = {},
}) {
  const [openModal, setOpenModal] = useState(false); // Modal visibility state
  const [dutyTiming, setDutyTiming] = useState(null);

  useEffect(() => {
    if (openModal) {
      (async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/duty-timing/get`,
            {
              method: "GET",
              credentials: "include", // this makes cookies/session work
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!res.ok) {
            throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
          }

          const data = await res.json();
          setDutyTiming(data?.data);
        } catch (error) {
          console.error("Error fetching duty timing:", error);
        }
      })();
    }
  }, [openModal]);

  return (
    <div>
      <Tooltip content="Salary Breakdown" placement="left">
        <Button onClick={() => setOpenModal(true)} color="dark" size="xs">
          <RiFileList3Line className="w-4 h-4" />
        </Button>
      </Tooltip>

      <Modal show={openModal} size="3xl" onClose={() => setOpenModal(false)}>
        <Modal.Header>Salary Breakdown</Modal.Header>
        <Modal.Body>
          <div className="mb-2">
            <p>Name: {name}</p>
            <p>Month: {month}</p>
          </div>
          <div className="flex flex-col md:flex-row justify-evenly overflow-x-auto">
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Component</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">Basic Salary</Table.Cell>
                  <Table.Cell>{Math.round(salaryStructure?.basic)}</Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">Hourly Pay</Table.Cell>
                  <Table.Cell>
                    {Math.round(Math.round(salaryStructure?.hourlyPay))}
                  </Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">Bonus</Table.Cell>
                  <Table.Cell>{Math.round(salaryStructure?.bonus)}</Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">
                    House Rent Allowance
                  </Table.Cell>
                  <Table.Cell>{Math.round(salaryStructure?.hra)}</Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">
                    Conveyance Allowance
                  </Table.Cell>
                  <Table.Cell>
                    {Math.round(salaryStructure?.conveyance)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">
                    Special Allowance
                  </Table.Cell>
                  <Table.Cell>
                    {Math.round(salaryStructure?.specialAllowance)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">
                    Others Allowance
                  </Table.Cell>
                  <Table.Cell>
                    {Math.round(salaryStructure?.otherAllowance)}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
            <Table striped>
              <Table.Head>
                <Table.HeadCell>Deductions</Table.HeadCell>
                <Table.HeadCell>Amount</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">ESI</Table.Cell>
                  <Table.Cell>{Math.round(salaryStructure?.esi)}</Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">PF </Table.Cell>
                  <Table.Cell>{Math.round(salaryStructure?.pf)}</Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">
                    Profesional Tax
                  </Table.Cell>
                  <Table.Cell>{Math.round(salaryStructure?.pTax)}</Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>
                    Leave
                    <div>
                      <p className="text-xs font-extralight">
                        Paid: {salaryStructure.totalPaidLeaves}, Unpaid:{" "}
                        {salaryStructure.totalUnpaidLeaves}, Spc:{" "}
                        {salaryStructure.totalHolidayLeaves}
                      </p>
                      <p className="text-xs font-extralight">
                        Half Days: {presentLogs.totalHalfDays} (Adjusted:{" "}
                        {presentLogs.totalHalfDays - dutyTiming?.halfDayAllowed}
                        )
                      </p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {Math.round(salaryStructure?.leaveDeduction)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="flex gap-2">Advance</Table.Cell>
                  <Table.Cell>
                    {Math.round(salaryStructure?.advanceDeduction)}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
