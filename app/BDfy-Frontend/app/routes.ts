import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Rutas públicas
  route("/", "routes/layout.tsx", [
    index("routes/home.tsx"),            // / (home público)
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
  ]),

  // Rutas protegidas
  route("/", "routes/protectedlayout.tsx", [
    route("profile", "routes/profile.tsx"),
    route("auctions/specific/:id", "routes/auction.tsx"),
    route("my-auctions", "routes/myAuctions.tsx"),
  ]),
] satisfies RouteConfig;
