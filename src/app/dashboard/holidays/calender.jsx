"use client";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { formatDate } from "date-fns";

const HolidayCalendar = ({ holidays }) => {
  // Function to determine if a date is a holiday (excluding weekends)
  const isHoliday = (date) => {
    // Check if the date is in the demoHolidays array
    return holidays?.some((holiday) => {
      return (
        formatDate(holiday.date, "yyyy-MM-dd") ===
        formatDate(date, "yyyy-MM-dd")
      );
    });
  };

  // Add a custom class to holiday tiles
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
          showNeighboringMonth={false} // Hide dates from neighboring months
          next2Label={null} // Disable "Next Year" button
          prev2Label={null} // Disable "Previous Year" button
        />
      </div>
    </div>
  );
};

export default HolidayCalendar;
