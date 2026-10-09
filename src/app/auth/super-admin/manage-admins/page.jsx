"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URI || "http://localhost:5000/api";
const LIMIT = 10;
const emptyForm = { office: "", username: "", password: "", mobile: "" };

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export default function ManageAdminsPage() {
  const router = useRouter();

  const [admins, setAdmins] = useState([]);
  const [offices, setOffices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const [modal, setModal] = useState({ open: false, mode: "create", id: null });
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) qs.set("search", search);

      const { res, data } = await request(`/super-admin/admins?${qs.toString()}`);

      if (res.status === 401 || res.status === 403) {
        router.push("/super-admin");
        return;
      }

      if (res.ok && data.success) {
        setAdmins(data.data.admins);
        setPagination(data.data.pagination);
      } else {
        setPageError(data.message || "Failed to load admins.");
      }
    } catch {
      setPageError("Failed to load admins. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, router]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Offices (create/edit dropdown er jonno)
  useEffect(() => {
    (async () => {
      try {
        const { res, data } = await request("/auth/admin/offices");
        if (res.ok && data.success && Array.isArray(data.data)) {
          setOffices(data.data);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const openCreate = () => {
    setForm({ ...emptyForm, office: offices[0]?._id || "" });
    setFormError(null);
    setShowPassword(false);
    setModal({ open: true, mode: "create", id: null });
  };

  const openEdit = (admin) => {
    setForm({
      office: admin.office?._id || "",
      username: admin.username || "",
      password: "",
      mobile: admin.mobile || "",
    });
    setFormError(null);
    setShowPassword(false);
    setModal({ open: true, mode: "edit", id: admin._id });
  };

  const closeModal = () => {
    if (saving) return;
    setModal({ open: false, mode: "create", id: null });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError(null);

    const isEditMode = modal.mode === "edit";

    if (!form.office || !form.username.trim() || !form.mobile.trim()) {
      setFormError("Office, username and mobile are required.");
      return;
    }
    if (!isEditMode && !form.password) {
      setFormError("Password is required.");
      return;
    }

    const payload = {
      office: form.office,
      username: form.username.trim(),
      mobile: form.mobile.trim(),
    };
    if (form.password) payload.password = form.password;

    setSaving(true);
    try {
      const { res, data } = await request(
        isEditMode ? `/super-admin/admins/${modal.id}` : "/super-admin/admins",
        {
          method: isEditMode ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      if (res.ok && data.success) {
        setModal({ open: false, mode: "create", id: null });
        if (!isEditMode && page !== 1) setPage(1);
        else fetchAdmins();
      } else {
        setFormError(data.message || "Something went wrong.");
      }
    } catch {
      setFormError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { res, data } = await request(`/super-admin/admins/${deleteTarget._id}`, {
        method: "DELETE",
      });

      if (res.ok && data.success) {
        setDeleteTarget(null);
        if (admins.length === 1 && page > 1) setPage(page - 1);
        else fetchAdmins();
      } else {
        setPageError(data.message || "Failed to delete admin.");
        setDeleteTarget(null);
      }
    } catch {
      setPageError("Failed to delete admin. Please try again.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await request("/auth/super-admin/logout", { method: "POST" });
    } finally {
      router.push("/auth/super-admin");
    }
  };

  const isEdit = modal.mode === "edit";
  const inputClass =
    "mt-1 p-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/amp-logo.webp"
              alt="AMP Technology"
              height={36}
              width={36}
              className="rounded-lg"
            />
            <span className="text-lg font-semibold text-gray-800">Super Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Admins</h1>
            <p className="text-sm text-gray-500">
              {pagination.total} admin{pagination.total === 1 ? "" : "s"} in total
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <HiPlus size={18} /> Add Admin
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by username or mobile..."
          className="mb-4 p-2.5 w-full sm:max-w-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
        />

        {pageError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-lg">
            {pageError}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-200">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Office</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No admins found.
                  </td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr key={admin._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{(page - 1) * LIMIT + index + 1}</td>
                    <td className="px-4 py-3 font-medium">{admin.username}</td>
                    <td className="px-4 py-3">{admin.office?.name || "-"}</td>
                    <td className="px-4 py-3">{admin.mobile}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(admin)}
                          title="Edit"
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                        >
                          <HiPencil size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(admin)}
                          title="Delete"
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                        >
                          <HiTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loading}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white disabled:opacity-50 hover:bg-gray-100"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={page >= pagination.totalPages || loading}
                className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white disabled:opacity-50 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Create / Edit modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isEdit ? "Edit Admin" : "Add Admin"}
            </h2>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="office" className="block text-sm font-medium text-gray-700">
                  Office
                </label>
                <select
                  id="office"
                  name="office"
                  value={form.office}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="" disabled>
                    Select office
                  </option>
                  {offices.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  autoComplete="off"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password{" "}
                  {isEdit && <span className="text-gray-400">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={`${inputClass} pr-10`}
                    required={!isEdit}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-3 mt-1 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60"
                >
                  {saving ? "Saving..." : isEdit ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete admin?</h2>
            <p className="text-sm text-gray-600 mb-5">
              <span className="font-semibold">{deleteTarget.username}</span> will be permanently
              deleted. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}