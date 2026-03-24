"use client";
import { Avatar, Dropdown } from "flowbite-react";
import { FaCircleUser } from "react-icons/fa6";
import { redirect } from "next/navigation";

export default function UserMenu({ user = {} }) {
  const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/auth/admin/logout`, {
      method: "POST",
      credentials: "include",
    }).then((res) => {
      if (res.ok) {
        redirect("/auth/admin");
      }
    });
  };

  return (
    <div className="flex md:order-2">
      <Dropdown
        inline
        label={<Avatar alt="User settings" icon={<FaCircleUser />} rounded />}
      >
        <Dropdown.Header>
          <span className="block text-sm">
            Welcome, {user?.username || user?.fullName}
          </span>
          <span className="block truncate text-sm font-medium">
            {user?.office?.name}
          </span>
        </Dropdown.Header>
        <Dropdown.Item href="/dashboard">Dashboard</Dropdown.Item>
        <Dropdown.Item href="/dashboard/logs/login">Login Logs</Dropdown.Item>
        <Dropdown.Item href="/dashboard/change-password">
          Change password
        </Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={logout}>Sign out</Dropdown.Item>
      </Dropdown>
    </div>
  );
}
