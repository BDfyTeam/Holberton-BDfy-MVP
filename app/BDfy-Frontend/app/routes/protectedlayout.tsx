import Header from "../components/Header";
import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";

export default function ProtectedLayout() {
  // const navigate = useNavigate();

  // useEffect(() => {
  //   const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  //   if (!token) {
  //     navigate("/login");
  //   }
  // }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#DDE9F0]">
      <Header />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
