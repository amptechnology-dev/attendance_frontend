"use client";
import ViewButton from "./view";
import { Avatar } from "flowbite-react";
// import DeleteButton from "./delete";
// import EditButton from "./edit";
import v from "voca";

export const columns = [
  {
    accessorKey: "staffId",
    header: "Staff ID",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: (info) => (
      <div className="flex gap-2 items-center">
        <Avatar
          img={info.row.original.photo}
          placeholderInitials={info
            .getValue()
            .match(/(\b\S)?/g)
            .join("")}
          status={info.row.original.status == "active" ? "online" : "busy"}
          statusPosition="bottom-right"
          rounded
        />
        {info.getValue()}
      </div>
    ),
  },
  {
    accessorKey: "department.name",
    header: "Department",
    cell: (info) => info.getValue(),
  },
  // {
  //   accessorKey: "designation",
  //   header: "Designation",
  //   enableSorting: false,
  //   cell: (info) => v.capitalize(info.getValue()) || "-",
  // },
  {
    accessorKey: "mobile",
    header: "Mobile",
    enableSorting: false,
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: (info) => v.slice(info.getValue(), 0, 1).toUpperCase(),
  },
  {
    accessorKey: "dateOfBirth",
    header: "DOB",
    cell: (info) => new Date(info.getValue())?.toLocaleDateString("en-GB"),
  },
  {
    accessorKey: "monthlySalary",
    header: "Salary",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "_id",
    header: "Manage",
    enableSorting: false,
    cell: (info) => (
      <div className="flex gap-2">
        <ViewButton id={info.getValue()} />
        {/* <EditButton id={info.getValue()} name={info.row.original.name} /> */}
        {/* <DeleteButton id={info.getValue()} /> */}
      </div>
    ),
  },
];
