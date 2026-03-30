"use client";

import { Sidebar } from "flowbite-react";
import Link from "next/link";
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

function NavItem({ href, icon, active, children }) {
  return (
    <Sidebar.Item as={Link} href={href} icon={icon} active={active}>
      {children}
    </Sidebar.Item>
  );
}

export function AdminSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isActive = (href) => pathname.endsWith(href);

  const isAnyChildActive = (childPaths) =>
    childPaths.some((childPath) => pathname.startsWith(childPath));

  return (
    <Sidebar theme={customTheme} id="main_sidebar" className="hidden lg:block">
      <div className="px-3 py-4 text-lg font-semibold text-gray-800 dark:text-white">
        Admin Dashboard
      </div>
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <NavItem
            href="/dashboard"
            icon={HiChartPie}
            active={pathname === "/dashboard"}
          >
            Dashboard
          </NavItem>
          {hasPermission(user, permissions.VIEW_DEPARTMENTS) && (
            <NavItem
              href="/dashboard/departments"
              icon={HiOutlineBriefcase}
              active={isActive("/dashboard/departments")}
            >
              Departments
            </NavItem>
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
            <NavItem
              href="/dashboard/duty-timings"
              icon={HiOutlineClock}
              active={isActive("/dashboard/duty-timings")}
            >
              Duty Timing
            </NavItem>
            <NavItem
              href="/dashboard/week-offs"
              icon={HiOutlineClipboardList}
              active={isActive("/dashboard/week-offs")}
            >
              Week-Offs
            </NavItem>
            <NavItem
              href="/dashboard/holidays"
              icon={HiOutlineCalendar}
              active={isActive("/dashboard/holidays")}
            >
              Holidays
            </NavItem>
            {hasPermission(user, permissions.VIEW_YEAR_MONTHS) && (
              <NavItem
                href="/dashboard/year-and-month"
                icon={HiCalendar}
                active={isActive("/dashboard/year-and-month")}
              >
                Year & Month
              </NavItem>
            )}
          </Sidebar.Collapse>
          {hasPermission(user, permissions.VIEW_STAFFS) && (
            <NavItem
              href="/dashboard/staffs"
              icon={HiUser}
              active={isActive("/dashboard/staffs")}
            >
              Manage Staffs
            </NavItem>
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
              <NavItem
                href="/dashboard/attendance/entry-exit-logs"
                icon={HiFingerPrint}
                active={isActive("/dashboard/attendance/entry-exit-logs")}
              >
                Entry-Exit Logs
              </NavItem>
            )}
            {hasPermission(user, permissions.VIEW_ATTENDANCE) && (
              <NavItem
                href="/dashboard/attendance"
                icon={BsPersonFillCheck}
                active={isActive("/dashboard/attendance")}
              >
                Attendance
              </NavItem>
            )}
            {hasPermission(user, permissions.VIEW_ATTENDANCE) && (
              <NavItem
                href="/dashboard/attendance/today"
                icon={FaUserClock}
                active={isActive("/dashboard/attendance/today")}
              >
                Daily Tracker
              </NavItem>
            )}
            {hasPermission(user, permissions.VIEW_LEAVES) && (
              <NavItem
                href="/dashboard/attendance/leaves"
                icon={BsCalendarX}
                active={isActive("/dashboard/attendance/leaves")}
              >
                Leaves
              </NavItem>
            )}
            {hasPermission(user, permissions.VIEW_HOLIDAY_FUND) && (
              <NavItem
                href="/dashboard/attendance/holiday-fund"
                icon={HiArchive}
                active={isActive("/dashboard/attendance/holiday-fund")}
              >
                Holiday Fund
              </NavItem>
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
              <NavItem
                href="/dashboard/salary/structure"
                icon={HiViewList}
                active={isActive("/dashboard/salary/structure")}
              >
                Salary Structure
              </NavItem>
              <NavItem
                href="/dashboard/salary"
                icon={FaWallet}
                active={isActive("/dashboard/salary")}
              >
                Staff Salary
              </NavItem>
              <NavItem
                href="/dashboard/salary/advance"
                icon={TbMoneybag}
                active={isActive("/dashboard/salary/advance")}
              >
                Advance
              </NavItem>
              <NavItem
                href="/dashboard/salary/pay-slip"
                icon={HiDocumentText}
                active={isActive("/dashboard/salary/pay-slip")}
              >
                Pay Slip
              </NavItem>
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
              <NavItem
                href="/dashboard/reports/attendance"
                icon={HiClipboardList}
                active={isActive("/dashboard/reports/attendance")}
              >
                Attendance Report
              </NavItem>
              <NavItem
                href="/dashboard/reports/monthly-attendance"
                icon={HiCalendar}
                active={isActive("/dashboard/reports/monthly-attendance")}
              >
                Monthly Attendance
              </NavItem>
              <NavItem
                href="/dashboard/reports/yearly-attendance"
                icon={HiCalendar}
                active={isActive("/dashboard/reports/yearly-attendance")}
              >
                Yearly Attendance
              </NavItem>
              <NavItem
                href="/dashboard/reports/salary"
                icon={HiClipboardCheck}
                active={isActive("/dashboard/reports/salary")}
              >
                Salary Report
              </NavItem>
              <NavItem
                href="/dashboard/reports/monthly-salary"
                icon={TbReport}
                active={isActive("/dashboard/reports/monthly-salary")}
              >
                Monthly Salary
              </NavItem>
              <NavItem
                href="/dashboard/reports/leaves"
                icon={BsCalendarX}
                active={isActive("/dashboard/reports/leaves")}
              >
                Leaves Report
              </NavItem>
              <NavItem
                href="/dashboard/reports/attendance-advance"
                icon={HiClipboardList}
                active={isActive("/dashboard/reports/attendance-advance")}
              >
                Adv Attendance
              </NavItem>
              <NavItem
                href="/dashboard/reports/performance"
                icon={FaChartPie}
                active={isActive("/dashboard/reports/performance")}
              >
                Performance
              </NavItem>
              <NavItem
                href="/dashboard/reports/pf-ecr"
                icon={TbCreditCardPay}
                active={isActive("/dashboard/reports/pf-ecr")}
              >
                PF ECR
              </NavItem>
              <NavItem
                href="/dashboard/reports/esi-ecr"
                icon={TbCreditCardPay}
                active={isActive("/dashboard/reports/esi-ecr")}
              >
                ESI ECR
              </NavItem>
              <NavItem
                href="/dashboard/reports/holiday-fund"
                icon={HiArchive}
                active={isActive("/dashboard/reports/holiday-fund")}
              >
                Holiday Fund
              </NavItem>
            </Sidebar.Collapse>
          )}
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
