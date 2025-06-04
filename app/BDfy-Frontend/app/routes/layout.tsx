import Header from "~/components/Header";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[rgb(60,63,96)] to-[rgb(28,148,180)]">
      <Header />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
