import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

// listar subastas falsas y probar el flujo de enrar a la subasta
const mockAuctions = [
  {
    id: 1,
    title: "Subasta de autos de lujo",
    description: "Ferrari, Lamborghini y más...",
  },
  {
    id: 2,
    title: "Tecnología premium",
    description: "MacBooks, iPhones, y dispositivos top",
  },
  {
    id: 3,
    title: "Obras de arte",
    description: "Pinturas originales y esculturas únicas",
  },
];

export default function Home() {
  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Subastas disponibles</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {mockAuctions.map((auction) => (
          <div key={auction.id} className="bg-white text-black p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{auction.title}</h2>
            <p className="text-sm text-gray-700 mb-3">{auction.description}</p>
            <Link
              to={`/auction/${auction.id}`}
              className="text-blue-600 hover:underline"
            >
              Ver subasta
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
