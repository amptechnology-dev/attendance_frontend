"use client";
import { Navbar } from "flowbite-react";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import UserMenu from "./UserMenu";
export function AdminNavbar({ user = {} }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    const sidebar = document.getElementById("main_sidebar");
    if (!sidebar) return;
    sidebar.classList.toggle("hidden");
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Navbar fluid>
      <button onClick={toggleSidebar} type="button" className="bg-transparent">
        <FiMenu className="text-2xl" />
      </button>
      <UserMenu user={user} />
    </Navbar>
  );
}
