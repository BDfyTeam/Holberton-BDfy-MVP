export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(60,63,96)]">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
        <h1 className="text-[rgb(60,63,96)] text-2xl font-semibold text-center mb-6">Login</h1>

        <form className="bg-[rgb(168,175,234)] p-6 rounded-lg space-y-4 shadow-inner">
          <label className="block">
            <span className="block text-[rgb(60,63,96)] font-medium mb-1">Email</span>
            <input
              type="email"
              name="username"
              placeholder="tu@email.com"
              className="w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(28,148,180)]"
            />
          </label>

          <label className="block">
            <span className="block text-[rgb(60,63,96)] font-medium mb-1">Password</span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(28,148,180)]"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-[rgb(28,148,180)] text-white py-2 rounded-md font-bold hover:bg-opacity-90 transition"
          >
            Iniciar Sesión
          </button>

          <div className="text-center">
            <a href="#" className="text-sm text-[rgb(60,63,96)] underline hover:text-[rgb(28,148,180)] transition">¿Olvidaste tu contraseña?</a>
          </div>
        </form>
      </div>
    </div>
  );
}
