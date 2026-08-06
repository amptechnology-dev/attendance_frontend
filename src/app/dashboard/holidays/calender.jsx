"use client";

import dynamic from "next/dynamic";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";

// Calendar কে dynamic import করে SSR বন্ধ করছি
const Calendar = dynamic(() => import("react-calendar"), {
  ssr: false,
});

const HolidayCalendar = ({ holidays }) => {
  // date-fns এর ঠিক function হলো `format`, `formatDate` না
  const isHoliday = (date) => {
    return holidays?.some((holiday) => {
      return (
        format(new Date(holiday.date), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
      );
    });
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month" && isHoliday(date)) {
      return "font-bold !bg-red-200 rounded-lg";
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-xl">Holiday Calendar</h1>
      <div className="shadow-lg rounded-lg p-4 bg-white">
        <Calendar
          className=""
          tileClassName={tileClassName}
          calendarType="gregory"
          minDetail="month"
          showNeighboringMonth={false}
          next2Label={null}
          prev2Label={null}
        />
      </div>
    </div>
  );
};

export default HolidayCalendar;