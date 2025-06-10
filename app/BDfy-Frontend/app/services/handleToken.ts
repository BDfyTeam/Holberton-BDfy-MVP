import { jwtDecode } from "jwt-decode";

export const getUserIdFromToken = (): string | null => {
    const token = localStorage.getItem("token");

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