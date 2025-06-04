import { NavBar } from "~/components/navBar";
import type { Route } from "./+types/home";
import DynamicButton from "~/components/dynamicButton";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "BDfy Simple y seguro" },
    { name: "description", content: "HomePage de la casa de subastas papu" },
  ];
}

export default function Home() {
  return (
    <main className="bg-primaryDark">
      <div>
        <nav  className="flex flex-row justify-end space-x-4 p-4 bg-slate-800">
          <NavBar to="/login">Iniciar seción</NavBar>
          <NavBar to="/register">Registrarse</NavBar>
        </nav>
        <div className="flex flex-col items-center p-5">
          <h1 className="font-bold p-5">BDfy</h1>
          <h3>Fácil y seguro</h3>
        </div>
      </div>
    </main>
  );
}

