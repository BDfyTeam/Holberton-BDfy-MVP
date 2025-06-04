import UserMenu from "./UserMenu";

export default function Header() {
  const isAuthenticated =
  typeof window !== "undefined" && !!localStorage.getItem("token");


  return (
    <header className="w-full bg-white/20 py-4 px-8 flex items-center justify-between">
      {/* Logo + nombre */}
      <div className="flex items-center space-x-4">
        <span className="text-white text-2xl">🔨</span>
        <h1 className="text-white text-2xl font-bold">BDfy</h1>
      </div>

      {/* Menú de usuario */}
      {isAuthenticated && <UserMenu />}
    </header>
  );
}
