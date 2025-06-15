import { jwtDecode } from "jwt-decode";

let tokenCache  : string | null = null;

export const getUserIdFromToken = (): string | null => {
  const token = getToken();
  if (!token) {
      console.error("No se encontró el token de autenticación.");
      return null;
  }

  try {
    const decodedToken = jwtDecode<{ Id: string }>(token);
    return decodedToken.Id;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};

// ESTABLECE EL TOKEN EN CACHÉ Y EN LOCALSTORAGE
export const setToken = (token: string): void => {
  tokenCache = token;
  localStorage.setItem("token", token);
};

// OBTIENE EL TOKEN DESDE EL CACHÉ O LOCALSTORAGE
export const getToken = (): string | null => {
  if (tokenCache) {
    return tokenCache;
  }
  const storedToken = localStorage.getItem("token");
  tokenCache = storedToken;
  return storedToken;
};

// LIMPIAMOS EL TOKEN DEL CACHE Y DE LOCALSTORAGE
export const clearToken = (): void => {
  tokenCache = null;
  localStorage.removeItem("token");
};