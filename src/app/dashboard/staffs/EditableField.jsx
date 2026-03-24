"use client";

import { useState, useEffect } from "react";
import { FloatingLabel, Button } from "flowbite-react";
import { FaPen, FaCheck, FaTimes } from "react-icons/fa";
import { useAuth } from "@/app/context/auth.context";
import { hasPermission } from "@/lib/permissions";
import { permissions } from "@/lib/constants";

export default function EditableField({
  label,
  name,
  type = "text",
  value,
  allowBlank = false,
  onSave,
  isSaving,
}) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);

  useEffect(() => {
    setFieldValue(value || ""); // Update when `staff` data loads
  }, [value]);

  const handleSave = () => {
    if (fieldValue === value) {
      setIsEditing(false);
      return; // No change, so no update needed
    }
    if (!allowBlank && fieldValue.trim() === "") {
      alert("Please enter a value");
      return;
    }
    onSave(name, fieldValue); // Call parent handler
    setIsEditing(false);
  };

  return (
    <div className="relative">
      <FloatingLabel
        variant="outlined"
        label={label}
        type={type}
        name={name}
        value={fieldValue}
        disabled={!isEditing}
        onChange={(e) => setFieldValue(e.target.value)}
      />
      {isEditing ? (
        <div className="absolute right-2 top-2 flex gap-1">
          <Button
            size="xs"
            color="green"
            onClick={handleSave}
            disabled={isSaving}
            isProcessing={isSaving}
          >
            <FaCheck />
          </Button>
          <Button
            size="xs"
            color="red"
            onClick={() => [setIsEditing(false), setFieldValue(value)]}
          >
            <FaTimes />
          </Button>
        </div>
      ) : (
        hasPermission(user, permissions.MANAGE_STAFFS) && (
          <Button
            size="xs"
            className="absolute top-2 right-2"
            color="light"
            onClick={() => setIsEditing(true)}
            disabled={isSaving}
          >
            <FaPen />
          </Button>
        )
      )}
    </div>
  );
}
