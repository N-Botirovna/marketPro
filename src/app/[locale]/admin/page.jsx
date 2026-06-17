import AdminDashboard from "@/components/admin/AdminDashboard";

// Internal staff tool — never index, never follow.
export const metadata = {
  title: "Boshqaruv paneli — Kitobzor",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
