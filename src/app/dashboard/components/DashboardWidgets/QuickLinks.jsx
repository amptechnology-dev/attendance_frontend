import { Button, Card } from "flowbite-react";
import {
  FaAngleRight,
  FaUsers,
  FaFingerprint,
  FaUserCheck,
  FaCalendarTimes,
  FaCalendarDay,
  FaWallet,
  FaMoneyBillWave,
} from "react-icons/fa";

export default function QuickLinks() {
  return (
    <Card>
      <h4 className="text-xl font-bold text-gray-800 ">Quick Links</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Button
          as="a"
          href="/dashboard/staffs"
          className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white hover:bg-gradient-to-br focus:ring-blue-300 p-3 font-medium text-2xl"
          size="xl"
        >
          <FaUsers className="text-2xl mr-3" />
          Manage Staffs
          <FaAngleRight className="text-2xl ml-2" />
        </Button>
        <Button
          as="a"
          href="/dashboard/attendance/entry-exit-logs"
          className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white hover:bg-gradient-to-br focus:ring-purple-300 p-3 font-medium text-2xl"
          size="xl"
        >
          <FaFingerprint className="text-2xl mr-3" />
          Entry-Exit Logs
          <FaAngleRight className="text-2xl ml-2" />
        </Button>
        <Button
          as="a"
          href="/dashboard/attendance"
          className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white hover:bg-gradient-to-br focus:ring-green-300 p-3 font-medium text-2xl"
          size="xl"
        >
          <FaUserCheck className="text-2xl mr-3" />
          Attendance Logs
          <FaAngleRight className="text-2xl ml-2" />
        </Button>
        <Button
          as="a"
          href="/dashboard/attendance/leaves"
          className="bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 text-white hover:bg-gradient-to-br focus:ring-teal-300 p-3 font-medium text-2xl"
          size="xl"
        >
          <FaCalendarTimes className="text-2xl mr-3" />
          Leave Applications
          <FaAngleRight className="text-2xl ml-2" />
        </Button>
        <Button
          as="a"
          href="/dashboard/week-offs"
          className="bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 text-gray-900 hover:bg-gradient-to-br focus:ring-lime-300 p-3 font-medium text-2xl"
          size="xl"
        >
          <FaCalendarDay className="text-2xl mr-3" />
          Manage Week-Off
          <FaAngleRight className="text-2xl ml-2" />
        </Button>
        <Button
          as="a"
          href="/dashboard/departments"
          className="bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 text-white hover:bg-gradient-to-br focus:ring-cyan-300 p-3 font-medium text-2xl"
          size="xl"
        >
          <FaUsers className="text-2xl mr-3" />
          Depratments
          <FaAngleRight className="text-2xl ml-2" />
        </Button>
        <Button
          as="a"
          href="/dashboard/salary"
          className="bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 text-white hover:bg-gradient-to-br focus:ring-pink-300 p-3 font-medium text-2xl"
          size="xl"
        >
          <FaWallet className="text-2xl mr-3" />
          Genarate Salary
          <FaAngleRight className="text-2xl ml-2" />
        </Button>
        <Button
          as="a"
          href="/dashboard/salary/advance"
          className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white hover:bg-gradient-to-br focus:ring-amber-300 p-3 font-medium text-2xl"
          size="xl"
        >
          <FaMoneyBillWave className="text-2xl mr-3" />
          Add Advance
          <FaAngleRight className="text-2xl ml-2" />
        </Button>
      </div>
    </Card>
  );
}
