"use client";

import { useEffect, useState } from "react";
import { Card } from "flowbite-react";
import { format, addSeconds } from "date-fns";

export default function DateTimeWidgets({ serverTime }) {
  const [currentTime, setCurrentTime] = useState(
    new Date(serverTime.serverTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prev) => addSeconds(prev, 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedItems = [
    {
      label: "Current Time",
      value: format(currentTime, "dd-MM-yyyy, hh:mm:ss a"),
    },
    {
      label: "Month",
      value: format(currentTime, "MMMM"),
    },
    {
      label: "Year",
      value: format(currentTime, "yyyy"),
    },
    {
      label: "Financial Year",
      value: serverTime.currentFinancialYear.financialYear,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {formattedItems.map((item, index) => (
        <Card
          key={index}
          className="shadow-sm hover:shadow-md transition rounded-lg border border-gray-200"
        >
          <h2>{item.label}</h2>
          <p className="font-semibold truncate">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
