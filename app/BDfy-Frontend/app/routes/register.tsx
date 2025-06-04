import type { Route } from "./+types/home";
import { NavBar } from "~/components/navBar";
import MyForm from "~/components/registerForms";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Registro de usuarios" },
    { name: "description", content: "Se registran Subastadores y usuarios" },
  ];
}



export default function Register() {
  return (
    <main>
      <div>
        <nav className="flex flex-row justify-end space-x-4 p-4 bg-slate-800">
          <NavBar to="/">Inicio</NavBar>
        </nav>
        <div className="flex flex-col items-center p-5">
          <h1 className="font-bold p-5">Subastador</h1>
          <MyForm />
        </div>
      </div>
    </main>
  );
}
