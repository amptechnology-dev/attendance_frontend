import { AdminSidebar } from "./components/Sidebar";
import { AdminNavbar } from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import { fetchWithCookies } from "@/lib/fetchWithCookies";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "@/app/context/auth.context";
export default async function AdminLayout({ children }) {
  const userProfile = await fetchWithCookies(
    `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/profile/info`,
    "GET",
    { next: { revalidate: 120 } }
  ).catch((error) => {
    console.log(error);
  });
  const user = userProfile?.data;

  return (
    <AuthProvider initialUser={user}>
      <div className="flex h-screen">
        <ToastContainer />
        <AdminSidebar />
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminNavbar user={user} />
          {/* Page Content */}
          <main className="flex-1 p-5 overflow-y-auto">{children}</main>
          {/* Footer */}
          <footer className="bg-gray-50 text-center p-2">
            <p className="text-sm text-gray-700">
              Maintained by{" "}
              <a href="http://amptechnology.in" target="_blank">
                AMP Technology
              </a>
            </p>
          </footer>
        </div>
      </div>
    </AuthProvider>
  );
}
