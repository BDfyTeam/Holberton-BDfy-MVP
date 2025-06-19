import Header from "~/components/Header";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="bg-[#DDE9F0]">
      <Header />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
