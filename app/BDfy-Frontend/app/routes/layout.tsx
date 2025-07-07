import Header from "../components/Header";
import { Outlet } from "react-router";
import Footer from "~/components/Footer";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#D3E3EB]">
      <Header className="fixed top-0 left-0 right-0 z-50 w-full py-4 px-8 justify-between flex h-[120px] text-[#E6EFF2]"/>
      <main className="flex-1 p-6 text-[#D3E3EB]">
        <Outlet />
      </main>
      <Footer className="bg-[#0D4F61] text-[#D3E3EB] py-8" />
    </div>
  );
}

