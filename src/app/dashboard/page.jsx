import { fetchWithCookies } from "@/lib/fetchWithCookies";
import { redirect } from "next/navigation";
import { Card } from "flowbite-react";
import {
  FaUsers,
  FaChartLine,
  FaUserMinus,
  FaCalendarWeek,
} from "react-icons/fa";
import HolidayCalender from "./holidays/calender";
import LeaveTable from "./components/DashboardWidgets/LatestLeaves";
import AttendanceTable from "./components/DashboardWidgets/LatestAttendance";
import QuickLinks from "./components/DashboardWidgets/QuickLinks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard",
  description: "",
};

export default async function Dashboard() {
  const fetchHolidays = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/holiday/get`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });

  const fetchCounts = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/dashboard-counter`
  ).catch((error) => {
    if (error.message === "Unauthorized") {
      redirect("/auth/admin");
    }
    console.log(error);
  });
  const counts = fetchCounts?.data;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium opacity-80">Present Staffs</p>
              <h3 className="text-2xl font-bold mt-1">
                {counts?.totalPresentStaffs} of {counts?.totalStaffs}
              </h3>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <FaUsers className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium opacity-80">Staffs on Leave</p>
              <h3 className="text-2xl font-bold mt-1">
                {counts?.totalStaffsOnLeave}
              </h3>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <FaUserMinus className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium opacity-80">Conversion Rate</p>
              <h3 className="text-2xl font-bold mt-1">3.42%</h3>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <FaChartLine className="w-6 h-6" />
            </div>
          </div>
        </Card> */}

        <Card className="bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 text-white rounded-xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium opacity-80">Pending Leaves</p>
              <h3 className="text-2xl font-bold mt-1">
                {counts?.totalPendingLeaves}
              </h3>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <FaCalendarWeek className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>
      <QuickLinks />
      <div className="my-5 flex gap-5">
        <HolidayCalender holidays={fetchHolidays?.data} />
        <LeaveTable />
      </div>

      <div className="p-5">
        <AttendanceTable />
      </div>
    </>
  );
}
