import type { Route } from "./+types/home";
import RegisterButton from "~/components/registerButton";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "BDfy Simple y seguro" },
    { name: "description", content: "HomePage de la casa de subastas papu" },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="font-bold p-5">BDfy</h1>
      <h3>Facil y seguro</h3>
      <br />
      <br />
      <RegisterButton />
    </div>
  );
}
