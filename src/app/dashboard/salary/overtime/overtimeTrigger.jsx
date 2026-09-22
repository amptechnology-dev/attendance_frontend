"use client";

import { useState } from "react";
import { Button, Modal, Select, Label } from "flowbite-react";
import { RiTimeLine } from "react-icons/ri";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function currentYearRange() {
  const y = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => y - i);
}

export default function OvertimeTrigger({ onSelect }) {
  const now = new Date();
  const [showModal, setShowModal] = useState(false);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  function handleGo() {
    setShowModal(false);
    onSelect({ month, year });
  }

  return (
    <>
      <Button color="light" onClick={() => setShowModal(true)}>
        <RiTimeLine className="mr-2 h-5 w-5" />
        Overtime
      </Button>

      <Modal show={showModal} size="md" onClose={() => setShowModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <h3 className="mb-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
            View Overtime
          </h3>
          <div className="mb-5 flex gap-3">
            <div className="flex-1">
              <Label htmlFor="otMonth" value="Month" />
              <Select id="otMonth" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i + 1}>{name}</option>
                ))}
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="otYear" value="Year" />
              <Select id="otYear" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {currentYearRange().map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex justify-center">
            <Button color="success" onClick={handleGo}>
              View Overtime
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}