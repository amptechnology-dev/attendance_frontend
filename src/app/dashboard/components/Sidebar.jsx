"use client";

import { Sidebar } from "flowbite-react";
import {
  HiChartPie,
  HiOutlineBriefcase,
  HiOutlineAdjustments,
  HiCalendar,
  HiClipboardCheck,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiClipboardList,
  HiFingerPrint,
  HiUser,
  HiCash,
  HiViewList,
  HiDocumentReport,
  HiDocumentText,
  HiArchive,
} from "react-icons/hi";
import { BsCalendarX, BsPersonFillCheck } from "react-icons/bs";
import { FaWallet, FaChartPie, FaUserClock } from "react-icons/fa";
import { TbMoneybag, TbCreditCardPay, TbReport } from "react-icons/tb";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/auth.context";
import { hasPermission } from "@/lib/permissions";
import { permissions } from "@/lib/constants";

const customTheme = {
  item: {
    active: "bg-blue-100 text-blue-900 dark:bg-blue-700 dark:text-white", // Updated active styles
  },
};

export function AdminSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isActive = (href) => pathname.endsWith(href);

  const isAnyChildActive = (childPaths) =>
    childPaths.some((childPath) => pathname.startsWith(childPath));

  return (
    <Sidebar theme={customTheme} id="main_sidebar" className="hidden lg:block">
      <Sidebar.Logo>Admin Dashboard</Sidebar.Logo>
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Sidebar.Item
            href="/dashboard"
            icon={HiChartPie}
            active={pathname === "/dashboard"}
          >
            Dashboard
          </Sidebar.Item>
          {hasPermission(user, permissions.VIEW_DEPARTMENTS) && (
            <Sidebar.Item
              href="/dashboard/departments"
              icon={HiOutlineBriefcase}
              active={isActive("/dashboard/departments")}
            >
              Departments
            </Sidebar.Item>
          )}
          <Sidebar.Collapse
            icon={HiOutlineAdjustments}
            label="Date and Time"
            open={isAnyChildActive([
              "/dashboard/year-and-month",
              "/dashboard/duty-timings",
              "/dashboard/holidays",
              "/dashboard/week-offs",
            ])}
          >
            <Sidebar.Item
              href="/dashboard/duty-timings"
              icon={HiOutlineClock}
              active={isActive("/dashboard/duty-timings")}
            >
              Duty Timing
            </Sidebar.Item>
            <Sidebar.Item
              href="/dashboard/week-offs"
              icon={HiOutlineClipboardList}
              active={isActive("/dashboard/week-offs")}
            >
              Week-Offs
            </Sidebar.Item>
            <Sidebar.Item
              href="/dashboard/holidays"
              icon={HiOutlineCalendar}
              active={isActive("/dashboard/holidays")}
            >
              Holidays
            </Sidebar.Item>
            {hasPermission(user, permissions.VIEW_YEAR_MONTHS) && (
              <Sidebar.Item
                href="/dashboard/year-and-month"
                icon={HiCalendar}
                active={isActive("/dashboard/year-and-month")}
              >
                Year & Month
              </Sidebar.Item>
            )}
          </Sidebar.Collapse>
          {hasPermission(user, permissions.VIEW_STAFFS) && (
            <Sidebar.Item
              href="/dashboard/staffs"
              icon={HiUser}
              active={isActive("/dashboard/staffs")}
            >
              Manage Staffs
            </Sidebar.Item>
          )}
          <Sidebar.Collapse
            icon={HiClipboardList}
            label="Attendence"
            open={isAnyChildActive([
              "/dashboard/attendance/entry-exit-logs",
              "/dashboard/attendance",
              "/dashboard/attendance/today",
              "/dashboard/attendance/leaves",
              "/dashboard/attendance/holiday-fund",
            ])}
          >
            {hasPermission(user, permissions.VIEW_ENTRY_LOGS) && (
              <Sidebar.Item
                href="/dashboard/attendance/entry-exit-logs"
                icon={HiFingerPrint}
                active={isActive("/dashboard/attendance/entry-exit-logs")}
              >
                Entry-Exit Logs
              </Sidebar.Item>
            )}
            {hasPermission(user, permissions.VIEW_ATTENDANCE) && (
              <Sidebar.Item
                href="/dashboard/attendance"
                icon={BsPersonFillCheck}
                active={isActive("/dashboard/attendance")}
              >
                Attendance
              </Sidebar.Item>
            )}
            {hasPermission(user, permissions.VIEW_ATTENDANCE) && (
              <Sidebar.Item
                href="/dashboard/attendance/today"
                icon={FaUserClock}
                active={isActive("/dashboard/attendance/today")}
              >
                Daily Tracker
              </Sidebar.Item>
            )}
            {hasPermission(user, permissions.VIEW_LEAVES) && (
              <Sidebar.Item
                href="/dashboard/attendance/leaves"
                icon={BsCalendarX}
                active={isActive("/dashboard/attendance/leaves")}
              >
                Leaves
              </Sidebar.Item>
            )}
            {hasPermission(user, permissions.VIEW_HOLIDAY_FUND) && (
              <Sidebar.Item
                href="/dashboard/attendance/holiday-fund"
                icon={HiArchive}
                active={isActive("/dashboard/attendance/holiday-fund")}
              >
                Holiday Fund
              </Sidebar.Item>
            )}
          </Sidebar.Collapse>

          {hasPermission(user, permissions.VIEW_SALARY_SECTION) && (
            <Sidebar.Collapse
              icon={HiCash}
              label="Salary"
              open={isAnyChildActive([
                "/dashboard/salary/structure",
                "/dashboard/salary",
                "/dashboard/salary/advance",
                "/dashboard/salary/pay-slip",
              ])}
            >
              <Sidebar.Item
                href="/dashboard/salary/structure"
                icon={HiViewList}
                active={isActive("/dashboard/salary/structure")}
              >
                Salary Structure
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/salary"
                icon={FaWallet}
                active={isActive("/dashboard/salary")}
              >
                Staff Salary
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/salary/advance"
                icon={TbMoneybag}
                active={isActive("/dashboard/salary/advance")}
              >
                Advance
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/salary/pay-slip"
                icon={HiDocumentText}
                active={isActive("/dashboard/salary/pay-slip")}
              >
                Pay Slip
              </Sidebar.Item>
            </Sidebar.Collapse>
          )}

          {hasPermission(user, permissions.VIEW_REPORTS) && (
            <Sidebar.Collapse
              icon={HiDocumentReport}
              label="Reports"
              open={isAnyChildActive([
                "/dashboard/reports/attendance",
                "/dashboard/reports/monthly-attendance",
                "/dashboard/reports/yearly-attendance",
                "/dashboard/reports/salary",
                "/dashboard/reports/monthly-salary",
                "/dashboard/reports/leaves",
                "/dashboard/reports/attendance-advance",
                "/dashboard/reports/performance",
                "/dashboard/reports/pf-ecr",
                "/dashboard/reports/esi-ecr",
                "/dashboard/reports/holiday-fund",
              ])}
            >
              <Sidebar.Item
                href="/dashboard/reports/attendance"
                icon={HiClipboardList}
                active={isActive("/dashboard/reports/attendance")}
              >
                Attendance Report
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/reports/monthly-attendance"
                icon={HiCalendar}
                active={isActive("/dashboard/reports/monthly-attendance")}
              >
                Monthly Attendance
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/reports/yearly-attendance"
                icon={HiCalendar}
                active={isActive("/dashboard/reports/yearly-attendance")}
              >
                Yearly Attendance
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/reports/salary"
                icon={HiClipboardCheck}
                active={isActive("/dashboard/reports/salary")}
              >
                Salary Report
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/reports/monthly-salary"
                icon={TbReport}
                active={isActive("/dashboard/reports/monthly-salary")}
              >
                Monthly Salary
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/reports/leaves"
                icon={BsCalendarX}
                active={isActive("/dashboard/reports/leaves")}
              >
                Leaves Report
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/reports/attendance-advance"
                icon={HiClipboardList}
                active={isActive("/dashboard/reports/attendance-advance")}
              >
                Adv Attendance
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/reports/performance"
                icon={FaChartPie}
                active={isActive("/dashboard/reports/performance")}
              >
                Performance
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/reports/pf-ecr"
                icon={TbCreditCardPay}
                active={isActive("/dashboard/reports/pf-ecr")}
              >
                PF ECR
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/reports/esi-ecr"
                icon={TbCreditCardPay}
                active={isActive("/dashboard/reports/esi-ecr")}
              >
                ESI ECR
              </Sidebar.Item>
              <Sidebar.Item
                href="/dashboard/reports/holiday-fund"
                icon={HiArchive}
                active={isActive("/dashboard/reports/holiday-fund")}
              >
                Holiday Fund
              </Sidebar.Item>
            </Sidebar.Collapse>
          )}
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
