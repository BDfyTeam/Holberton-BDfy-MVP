import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Rutas públicas
  route("/", "routes/layout.tsx", [
    index("routes/home.tsx"),            // / (home público)
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    route("auction/specific/:id", "routes/auction.tsx"),
  ]),

  // Rutas protegidas
  route("/", "routes/protectedlayout.tsx", [
    route("profile", "routes/profile.tsx"),
    route("my-auctions", "routes/myAuctions.tsx"),
    route("my-lots", "routes/myLots.tsx")
  ]),
] satisfies RouteConfig;
