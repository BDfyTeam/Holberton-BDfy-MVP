import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Rutas públicas
  route("/", "routes/layout.tsx", [
    index("routes/home.tsx"),            // / (home público)
    route("login", "routes/login.tsx"),  // /login
  ]),

  // Rutas protegidas
  route("/", "routes/protectedlayout.tsx", [
    route("profile", "routes/profile.tsx"),
  ]),
] satisfies RouteConfig;
